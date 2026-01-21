import { z } from 'zod';
import { fetchExternalModel, isValidExternalUrl, normalizeExternalUrl } from '../../../utils/external-platforms';
import { PlatformFetchError } from '../../../utils/external-platforms/types';

const bodySchema = z.object({
  url: z.string().url('Invalid URL format'),
});

export default defineEventHandler(async (event) => {
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

  try {
    const metadata = await fetchExternalModel(normalizedUrl);

    return {
      success: true,
      data: {
        platform: metadata.platform,
        externalId: metadata.externalId,
        title: metadata.title,
        description: metadata.description,
        authorName: metadata.authorName,
        authorUrl: metadata.authorUrl,
        images: metadata.images,
        license: metadata.license,
        tags: metadata.tags,
        remixesAllowed: metadata.remixesAllowed,
        commercialUseAllowed: metadata.commercialUseAllowed,
        normalizedUrl,
        printSettings: metadata.printSettings,
      },
    };
  } catch (error) {
    if (error instanceof PlatformFetchError) {
      throw createError({
        statusCode: error.statusCode || 502,
        message: error.message,
      });
    }

    console.error('External fetch error:', error);
    throw createError({
      statusCode: 502,
      message: 'Failed to fetch model information from external platform',
    });
  }
});
