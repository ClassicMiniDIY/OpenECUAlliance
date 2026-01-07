/**
 * Composable for safely decoding HTML entities in text content.
 * Used primarily for external model descriptions from Printables, Thingiverse, etc.
 * that may contain HTML entities like &nbsp;, &amp;, etc.
 */

// Common HTML entities mapping
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&bull;': '•',
  '&middot;': '·',
};

/**
 * Decode numeric HTML entities (&#123; or &#x7B;)
 */
function decodeNumericEntity(match: string): string {
  const code =
    match.startsWith('&#x') || match.startsWith('&#X')
      ? parseInt(match.slice(3, -1), 16)
      : parseInt(match.slice(2, -1), 10);

  if (isNaN(code) || code < 0 || code > 0x10ffff) {
    return match; // Invalid code point, return original
  }

  return String.fromCodePoint(code);
}

/**
 * Decode HTML entities in a string to their character equivalents.
 * This is safe for text display as it converts entities to plain characters.
 */
function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text) return '';

  let result = text;

  // Decode named entities
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replaceAll(entity, char);
  }

  // Decode numeric entities (decimal: &#123; and hex: &#x7B;)
  result = result.replace(/&#x?[0-9a-fA-F]+;/g, decodeNumericEntity);

  return result;
}

/**
 * Strip HTML tags from a string, leaving only text content.
 * Useful for cleaning up rich text before display.
 */
function stripHtmlTags(text: string | null | undefined): string {
  if (!text) return '';

  // Remove HTML tags
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Decode HTML entities and optionally strip HTML tags.
 * Safe for display in text contexts.
 */
function cleanHtmlText(text: string | null | undefined, options?: { stripTags?: boolean }): string {
  if (!text) return '';

  let result = text;

  if (options?.stripTags) {
    result = stripHtmlTags(result);
  }

  result = decodeHtmlEntities(result);

  // Normalize whitespace (multiple spaces/newlines to single space)
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Decode HTML entities while preserving line breaks.
 * Useful for multi-line descriptions.
 */
function cleanHtmlTextPreserveBreaks(text: string | null | undefined, options?: { stripTags?: boolean }): string {
  if (!text) return '';

  let result = text;

  if (options?.stripTags) {
    // Convert <br>, <p>, </p> to newlines before stripping
    result = result.replace(/<br\s*\/?>/gi, '\n');
    result = result.replace(/<\/p>\s*<p>/gi, '\n\n');
    result = result.replace(/<\/?p>/gi, '\n');
    result = stripHtmlTags(result);
  }

  result = decodeHtmlEntities(result);

  // Normalize multiple newlines to max 2, and trim each line
  result = result
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return result;
}

export function useHtmlDecode() {
  return {
    decodeHtmlEntities,
    stripHtmlTags,
    cleanHtmlText,
    cleanHtmlTextPreserveBreaks,
  };
}
