import { z } from 'zod';
import { serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server';
import {
  fetchExternalModel,
  isValidExternalUrl,
  normalizeExternalUrl,
  PlatformFetchError,
} from '../../../utils/external-platforms';

const bodySchema = z.object({
  url: z.string().url('Invalid URL format'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['mounts', 'enclosures', 'brackets', 'adapters', 'accessories']),
  vendor: z.string().optional(),
  // Note: license, remixesAllowed, commercialUseAllowed, and print settings are NOT accepted from client
  // They are always taken from the fetched metadata to match the source
  compatibility: z.any().optional(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

export default defineEventHandler(async (event) => {
  // Get user via serverSupabaseClient + auth.getUser() (same pattern as client-side)
  const client = await serverSupabaseClient(event);
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    });
  }

  const body = await readBody(event);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.errors[0].message,
    });
  }

  const normalizedUrl = normalizeExternalUrl(parsed.data.url);

  if (!isValidExternalUrl(normalizedUrl)) {
    throw createError({
      statusCode: 400,
      message: 'Unsupported platform. Please use a URL from MakerWorld, Printables, Thingiverse, or Cults3D.',
    });
  }

  // Use service role to bypass RLS - we've already verified the user above
  const supabase = serverSupabaseServiceRole(event);

  // Check for duplicate external URL
  const { data: existingModel } = await supabase
    .from('models')
    .select('id, slug, name')
    .eq('external_url', normalizedUrl)
    .single();

  if (existingModel) {
    throw createError({
      statusCode: 409,
      message: `This model has already been linked: ${existingModel.name}`,
    });
  }

  try {
    // Fetch metadata from external platform
    const metadata = await fetchExternalModel(normalizedUrl);

    const modelId = crypto.randomUUID();
    const slug = generateSlug(parsed.data.name);

    // Download and store images
    const imageRecords: Array<{
      model_id: string;
      filename: string;
      type: 'render';
      storage_path: string;
      is_primary: boolean;
      sort_order: number;
    }> = [];

    for (let i = 0; i < Math.min(metadata.images.length, 10); i++) {
      const img = metadata.images[i];
      try {
        const response = await fetch(img.url);
        if (!response.ok) continue;

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const buffer = await response.arrayBuffer();
        const filename = `${crypto.randomUUID()}.${ext}`;
        const storagePath = `${modelId}/${filename}`;

        const { error: uploadError } = await supabase.storage.from('model-images').upload(storagePath, buffer, {
          contentType,
          upsert: false,
        });

        if (!uploadError) {
          imageRecords.push({
            model_id: modelId,
            filename,
            type: 'render',
            storage_path: storagePath,
            is_primary: img.isPrimary || i === 0,
            sort_order: i,
          });
        }
      } catch (imgError) {
        console.error(`Failed to download image ${i}:`, imgError);
      }
    }

    if (imageRecords.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Could not download any images from the external platform',
      });
    }

    // Create the model record using print settings from source metadata
    const sourcePrintSettings = metadata.printSettings || {};

    const { error: modelError } = await supabase.from('models').insert({
      id: modelId,
      slug,
      author_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      vendor: parsed.data.vendor || null,
      // License and rights always come from source metadata
      // Default to "Unknown" if platform doesn't specify
      license: metadata.license || 'Unknown',
      remixes_allowed: metadata.remixesAllowed,
      commercial_use_allowed: metadata.commercialUseAllowed,
      compatibility: parsed.data.compatibility || null,
      // Print settings from source metadata with sensible defaults
      printing: {
        recommended_material: sourcePrintSettings.recommendedMaterial || 'PLA',
        layer_height: sourcePrintSettings.layerHeight,
        infill_percent: sourcePrintSettings.infillPercent,
        wall_count: sourcePrintSettings.wallCount,
        supports_required: sourcePrintSettings.supportsRequired,
        estimated_time_hours: sourcePrintSettings.estimatedTimeHours,
      },
      status: 'pending',
      is_linked: true,
      external_platform: metadata.platform,
      external_url: normalizedUrl,
      external_id: metadata.externalId,
      external_author_name: metadata.authorName,
      external_author_url: metadata.authorUrl,
      last_synced_at: new Date().toISOString(),
    });

    if (modelError) {
      // Clean up uploaded images on failure
      for (const img of imageRecords) {
        await supabase.storage.from('model-images').remove([img.storage_path]);
      }
      throw createError({
        statusCode: 500,
        message: modelError.message,
      });
    }

    // Create image records
    if (imageRecords.length > 0) {
      const { error: imageError } = await supabase.from('model_images').insert(imageRecords);
      if (imageError) {
        console.error('Failed to create image records:', imageError);
      }
    }

    // Create moderation queue entry
    await supabase.from('moderation_queue').insert({
      model_id: modelId,
      action_type: 'new_submission',
      status: 'pending',
    });

    return {
      success: true,
      data: {
        modelId,
        slug,
        category: parsed.data.category,
      },
    };
  } catch (error) {
    if (error instanceof PlatformFetchError) {
      throw createError({
        statusCode: error.statusCode || 502,
        message: error.message,
      });
    }

    throw error;
  }
});
