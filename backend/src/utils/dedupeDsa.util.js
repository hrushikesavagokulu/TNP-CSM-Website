/**
 * Normalizes a URL for canonical deduplication:
 * - Lowercase
 * - Strips protocol (http/https), www., trailing slashes, and query params/UTM tracking
 */
function normalizeLink(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const cleaned = url.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\?.*$/, '')
      .replace(/#.*$/, '')
      .replace(/\/+$/, '');
    return cleaned;
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Normalizes title + source for secondary deduplication key
 */
function normalizeTitleSource(title, source) {
  const normTitle = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const normSource = (source || 'leetcode').toLowerCase().trim();
  return `${normSource}:${normTitle}`;
}

/**
 * Deduplicates raw problem list according to Section 6 build specification:
 * 1. Canonical key = normalized link
 * 2. Secondary key = normalized title + source
 * 3. On collision: merge arrays (patterns, sheetRefs, companies) and keep more specific topic/track/difficulty
 */
function dedupeProblems(rawList = []) {
  if (!Array.isArray(rawList)) return [];

  const linkMap = new Map();
  const titleSourceMap = new Map();
  let mergedCount = 0;

  for (const raw of rawList) {
    if (!raw || !raw.link || !raw.title) continue;

    const canonicalLinkKey = normalizeLink(raw.link);
    const secondaryKey     = normalizeTitleSource(raw.title, raw.source);

    // Check existing by link or title+source
    const existing = linkMap.get(canonicalLinkKey) || titleSourceMap.get(secondaryKey);

    if (existing) {
      mergedCount++;

      // Merge arrays
      const mergedPatterns  = Array.from(new Set([...(existing.patterns || []), ...(raw.patterns || [])]));
      const mergedSheetRefs = Array.from(new Set([...(existing.sheetRefs || []), ...(raw.sheetRefs || [])]));
      const mergedCompanies = Array.from(new Set([...(existing.companies || []), ...(raw.companies || [])]));

      // Keep more specific track if one is 'dsa'
      const track = (existing.track === 'dsa' || raw.track === 'dsa') ? 'dsa' : (existing.track || raw.track || 'programming');

      // Keep hard over medium over easy if mismatched
      const diffRank = { hard: 3, medium: 2, easy: 1 };
      const exDiff = diffRank[existing.difficulty] || 1;
      const rawDiff = diffRank[raw.difficulty] || 1;
      const difficulty = exDiff >= rawDiff ? existing.difficulty : raw.difficulty;

      existing.patterns  = mergedPatterns;
      existing.sheetRefs = mergedSheetRefs;
      existing.companies = mergedCompanies;
      existing.track     = track;
      existing.difficulty = difficulty;
    } else {
      const entry = {
        id: raw.id || `${raw.source || 'lc'}-${raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: raw.title.trim(),
        link: raw.link.trim(),
        source: (raw.source || 'leetcode').toLowerCase().trim(),
        track: (raw.track || 'dsa').toLowerCase().trim(),
        difficulty: (raw.difficulty || 'easy').toLowerCase().trim(),
        topic: raw.topic.trim(),
        patterns: Array.isArray(raw.patterns) ? Array.from(new Set(raw.patterns)) : [raw.topic],
        companies: Array.isArray(raw.companies) ? Array.from(new Set(raw.companies)) : [],
        frequency: (raw.frequency || 'medium').toLowerCase().trim(),
        sheetRefs: Array.isArray(raw.sheetRefs) ? Array.from(new Set(raw.sheetRefs)) : ['general'],
        addedAt: raw.addedAt || new Date().toISOString().split('T')[0],
      };

      linkMap.set(canonicalLinkKey, entry);
      titleSourceMap.set(secondaryKey, entry);
    }
  }

  const dedupedList = Array.from(linkMap.values());
  console.log(`[DEDUP ENGINE] Initial: ${rawList.length} | Unique: ${dedupedList.length} | Merged duplicates: ${mergedCount}`);

  return dedupedList;
}

module.exports = { dedupeProblems, normalizeLink, normalizeTitleSource };
