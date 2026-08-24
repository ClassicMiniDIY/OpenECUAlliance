/**
 * Dependency-free fuzzy matching for on-page filtering.
 *
 * Deliberately small: the detail pages filter a few hundred rows that are
 * already in memory, so a scoring pass beats pulling in a search library and
 * building an index on every navigation.
 *
 * Matching is per-token — every whitespace-separated token in the query must
 * hit at least one field, so "rpm engine" narrows instead of widening.
 */

/** No match. Any real match scores above this. */
const NO_MATCH = -1;

/**
 * Scores one needle against one haystack. Higher is better, max 1.
 * Exact > prefix > word-boundary > substring > subsequence.
 */
export function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 1;
  const hay = haystack.toLowerCase();
  const nee = needle.toLowerCase();

  if (hay === nee) return 1;

  const idx = hay.indexOf(nee);
  if (idx === 0) return 0.9;
  if (idx > 0) {
    // A hit right after a separator reads as a word match, not a fragment.
    const prev = hay[idx - 1]!;
    return /[\s_\-./:]/.test(prev) ? 0.8 : 0.7;
  }

  // Subsequence: "clnttmp" should still find "coolant_temp". Two guards keep
  // this from matching prose — without them "coolant" hits the description
  // "Cruise control status and targets" one letter at a time.
  if (nee.length < 3) return NO_MATCH;

  let start = NO_MATCH;
  let hayPos = 0;
  let gaps = 0;
  for (const char of nee) {
    const found = hay.indexOf(char, hayPos);
    if (found === NO_MATCH) return NO_MATCH;
    if (start === NO_MATCH) start = found;
    gaps += found - hayPos;
    hayPos = found + 1;
  }

  // The matched letters must sit close together. An abbreviation is compact;
  // letters scattered across a sentence are a coincidence, not a match.
  const span = hayPos - start;
  if (span > nee.length * 2.5) return NO_MATCH;

  // Longer runs of skipped characters mean a looser match.
  return Math.max(0.1, 0.5 - gaps / (hay.length * 2));
}

/**
 * Scores an item described by several fields. Undefined fields are skipped, so
 * callers can pass optional properties straight through.
 * Returns NO_MATCH unless every query token hits some field.
 */
export function fuzzyScoreFields(fields: Array<string | undefined | null>, query: string): number {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return 1;

  const haystacks = fields.filter((f): f is string => Boolean(f));
  let total = 0;

  for (const token of tokens) {
    let best = NO_MATCH;
    for (const hay of haystacks) {
      const score = fuzzyScore(hay, token);
      if (score > best) best = score;
    }
    if (best === NO_MATCH) return NO_MATCH;
    total += best;
  }

  return total / tokens.length;
}

/** True when the item matches. Convenience wrapper for template filters. */
export function fuzzyMatches(fields: Array<string | undefined | null>, query: string): boolean {
  return fuzzyScoreFields(fields, query) !== NO_MATCH;
}

export function useFuzzySearch() {
  return { fuzzyScore, fuzzyScoreFields, fuzzyMatches };
}
