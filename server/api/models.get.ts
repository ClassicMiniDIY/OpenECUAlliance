import { serverSupabaseClient } from '#supabase/server';
import type { UserModel, ModelCategory } from '~/types/model';

export default defineEventHandler(async (event): Promise<UserModel[]> => {
  const supabase = await serverSupabaseClient(event);

  const query = getQuery(event);
  const category = query.category as ModelCategory | undefined;
  const vendor = query.vendor as string | undefined;
  const search = query.search as string | undefined;
  const featured = query.featured === 'true';
  const authorId = query.author as string | undefined;
  const limit = query.limit ? parseInt(query.limit as string, 10) : undefined;
  const linked = query.linked as string | undefined;

  let dbQuery = supabase
    .from('models')
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
      model_images (
        storage_path,
        thumbnail_path,
        is_primary
      ),
      model_files (
        format
      ),
      printing,
      is_linked,
      external_platform,
      external_url
    `
    )
    .eq('is_published', true)
    .eq('status', 'approved');

  // Apply filters
  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  if (vendor) {
    dbQuery = dbQuery.eq('vendor', vendor);
  }

  if (featured) {
    dbQuery = dbQuery.eq('featured', true);
  }

  if (authorId) {
    dbQuery = dbQuery.eq('author_id', authorId);
  }

  if (search) {
    dbQuery = dbQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,vendor.ilike.%${search}%`);
  }

  if (linked === 'true') {
    dbQuery = dbQuery.eq('is_linked', true);
  } else if (linked === 'false') {
    dbQuery = dbQuery.eq('is_linked', false);
  }

  // Default ordering
  dbQuery = dbQuery.order('featured', { ascending: false }).order('published_at', { ascending: false });

  if (limit) {
    dbQuery = dbQuery.limit(limit);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Failed to fetch models:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch models',
    });
  }

  // Transform to UserModel shape
  return (data || []).map((item: any): UserModel => {
    const author = item.profiles;
    const primaryImage = item.model_images?.find((img: any) => img.is_primary);
    const firstImage = item.model_images?.[0];
    const imageToUse = primaryImage || firstImage;
    const printing = item.printing as any;

    // Get unique file formats
    const fileFormats = [...new Set((item.model_files || []).map((f: any) => f.format.toUpperCase()))];

    // Get image URLs from Supabase storage
    let primaryImageUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (imageToUse?.storage_path) {
      const { data: urlData } = supabase.storage.from('model-images').getPublicUrl(imageToUse.storage_path);
      primaryImageUrl = urlData.publicUrl;
    }

    if (imageToUse?.thumbnail_path) {
      const { data: thumbData } = supabase.storage.from('model-images').getPublicUrl(imageToUse.thumbnail_path);
      thumbnailUrl = thumbData.publicUrl;
    }

    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      version: item.version,
      description: item.description,
      category: item.category,
      vendor: item.vendor,
      author: {
        id: author?.id,
        username: author?.username,
        displayName: author?.display_name,
        avatarUrl: author?.avatar_url,
      },
      primaryImage: primaryImageUrl,
      primaryImageThumbnail: thumbnailUrl,
      recommendedMaterial: printing?.recommended_material || 'PLA',
      estimatedTimeHours: printing?.estimated_time_hours || null,
      fileFormats,
      license: item.license,
      likesCount: item.likes_count,
      commentsCount: item.comments_count,
      downloadsCount: item.downloads_count,
      averageRating: item.average_rating,
      ratingsCount: item.ratings_count,
      status: item.status,
      isPublished: item.is_published,
      featured: item.featured,
      createdAt: item.created_at,
      publishedAt: item.published_at,
      isLinked: item.is_linked || false,
      externalPlatform: item.external_platform || null,
      externalUrl: item.external_url || null,
    };
  });
});
