import { serverSupabaseClient } from "#supabase/server";
import type {
  UserModelDetail,
  UserModelFile,
  UserModelImage,
} from "~/types/model";

export default defineEventHandler(async (event): Promise<UserModelDetail> => {
  const supabase = await serverSupabaseClient(event);

  // Get user from the Supabase client directly (more reliable than serverSupabaseUser)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[Model API] User:", user?.id || "not authenticated");

  const category = getRouterParam(event, "category");
  const slug = getRouterParam(event, "slug");

  if (!category || !slug) {
    throw createError({
      statusCode: 400,
      message: "Missing category or slug parameter",
    });
  }

  // Fetch the model with all related data
  const { data: model, error } = await supabase
    .from("models")
    .select(
      `
      id,
      slug,
      name,
      version,
      description,
      category,
      vendor,
      license,
      compatibility,
      printing,
      hardware,
      assembly,
      source_url,
      remix_of,
      remixes_allowed,
      commercial_use_allowed,
      likes_count,
      comments_count,
      downloads_count,
      average_rating,
      ratings_count,
      status,
      is_published,
      featured,
      created_at,
      published_at,
      profiles:author_id (
        id,
        username,
        display_name,
        avatar_url
      ),
      model_files (
        id,
        filename,
        original_filename,
        format,
        storage_path,
        size_bytes,
        is_primary
      ),
      model_images (
        id,
        filename,
        type,
        storage_path,
        thumbnail_path,
        is_primary,
        sort_order
      )
    `,
    )
    .eq("category", category)
    .eq("slug", slug)
    .single();

  if (error || !model) {
    console.error(
      `[Model API] Failed to fetch model ${category}/${slug}:`,
      error,
    );
    console.error(`[Model API] Query returned:`, {
      hasError: !!error,
      hasModel: !!model,
    });
    throw createError({
      statusCode: 404,
      message: `Model not found: ${category}/${slug}`,
    });
  }

  console.log(
    `[Model API] Found model:`,
    model.id,
    "status:",
    model.status,
    "is_published:",
    model.is_published,
  );

  // Check access: model must be published OR user must be the author
  const author = model.profiles as any;
  const isAuthor = user && author?.id === user.id;
  const isPublished = model.is_published && model.status === "approved";

  if (!isPublished && !isAuthor) {
    throw createError({
      statusCode: 404,
      message: `Model not found: ${category}/${slug}`,
    });
  }

  const printing = model.printing as any;
  const hardware = model.hardware as any[] | null;
  const assembly = model.assembly as any;
  const compatibility = model.compatibility as any;

  // Transform files with download URLs
  const files: UserModelFile[] = ((model.model_files as any[]) || []).map(
    (f) => {
      const { data: urlData } = supabase.storage
        .from("model-files")
        .getPublicUrl(f.storage_path);

      return {
        id: f.id,
        filename: f.filename,
        originalFilename: f.original_filename,
        format: f.format,
        downloadUrl: urlData.publicUrl,
        sizeBytes: f.size_bytes,
        isPrimary: f.is_primary,
      };
    },
  );

  // Transform images with URLs
  const images: UserModelImage[] = ((model.model_images as any[]) || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((img) => {
      const { data: urlData } = supabase.storage
        .from("model-images")
        .getPublicUrl(img.storage_path);

      let thumbnailUrl: string | null = null;
      if (img.thumbnail_path) {
        const { data: thumbData } = supabase.storage
          .from("model-images")
          .getPublicUrl(img.thumbnail_path);
        thumbnailUrl = thumbData.publicUrl;
      }

      return {
        id: img.id,
        filename: img.filename,
        type: img.type,
        url: urlData.publicUrl,
        thumbnailUrl,
        isPrimary: img.is_primary,
        sortOrder: img.sort_order || 0,
      };
    });

  // Check if user has liked/rated this model
  let isLikedByUser = false;
  let userRating: number | null = null;

  if (user) {
    const [likeResult, ratingResult] = await Promise.all([
      supabase
        .from("model_likes")
        .select("user_id")
        .eq("model_id", model.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("model_ratings")
        .select("rating")
        .eq("model_id", model.id)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    isLikedByUser = !!likeResult.data;
    userRating = ratingResult.data?.rating || null;
  }

  return {
    id: model.id,
    slug: model.slug,
    name: model.name,
    version: model.version,
    description: model.description,
    category: model.category,
    vendor: model.vendor,
    author: {
      id: author?.id,
      username: author?.username,
      displayName: author?.display_name,
      avatarUrl: author?.avatar_url,
    },
    license: model.license,
    compatibility: compatibility || null,
    files,
    images,
    printing: printing
      ? {
          recommendedMaterial: printing.recommended_material || "PLA",
          alternativeMaterials: printing.alternative_materials,
          notRecommendedMaterials: printing.not_recommended_materials,
          layerHeight: printing.layer_height,
          infillPercent: printing.infill_percent,
          infillPattern: printing.infill_pattern,
          wallCount: printing.wall_count,
          supportsRequired: printing.supports_required,
          supportType: printing.support_type,
          orientation: printing.orientation,
          bedAdhesion: printing.bed_adhesion,
          estimatedTimeHours: printing.estimated_time_hours,
          estimatedFilamentGrams: printing.estimated_filament_grams,
          nozzleSize: printing.nozzle_size,
          bedTempCelsius: printing.bed_temp_celsius,
          hotendTempCelsius: printing.hotend_temp_celsius,
          notes: printing.notes,
        }
      : {
          recommendedMaterial: "PLA",
        },
    hardware: (hardware || []).map((h: any) => ({
      item: h.item,
      quantity: h.quantity,
      optional: h.optional,
      notes: h.notes,
      purchaseUrl: h.purchase_url,
    })),
    assembly: assembly
      ? {
          difficulty: assembly.difficulty,
          estimatedTimeMinutes: assembly.estimated_time_minutes,
          toolsRequired: assembly.tools_required,
          steps: assembly.steps,
          warnings: assembly.warnings,
        }
      : null,
    sourceUrl: model.source_url,
    remixOf: model.remix_of,
    remixesAllowed: model.remixes_allowed,
    commercialUseAllowed: model.commercial_use_allowed,
    likesCount: model.likes_count,
    commentsCount: model.comments_count,
    downloadsCount: model.downloads_count,
    averageRating: model.average_rating,
    ratingsCount: model.ratings_count,
    status: model.status,
    isPublished: model.is_published,
    featured: model.featured,
    createdAt: model.created_at,
    publishedAt: model.published_at,
    isLikedByUser,
    userRating,
  };
});
