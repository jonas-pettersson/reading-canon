/**
 * Category Normalization Mapping
 *
 * Maps free-form categories from Excel to canonical PRIMARY_CATEGORIES from spec.md
 *
 * Spec categories (from spec.md v1.4 Section 2.1):
 * - Novel
 * - Play / Drama
 * - Poetry
 * - Philosophy
 * - History
 * - Religion / Theology
 * - Politics / Political Theory
 * - Science
 * - Essay / Non-fiction
 * - Biography / Memoir
 * - Anthology / Collection
 */

export const CATEGORY_MAPPING: Record<string, string> = {
  // Novel variations
  'novel': 'Novel',
  'novella': 'Novel',
  'short story': 'Novel',
  'bildungsroman': 'Novel',
  'thriller': 'Novel',
  'fantasy': 'Novel',
  'historical fiction': 'Novel',
  'roman': 'Novel',
  'trilogy': 'Novel',
  'youth': 'Novel',

  // Play / Drama variations
  'play': 'Play / Drama',
  'drama': 'Play / Drama',
  'comedy': 'Play / Drama',
  'tragedy': 'Play / Drama',
  'tragicomedy': 'Play / Drama',

  // Poetry variations
  'poetry': 'Poetry',
  'poem': 'Poetry',
  'epic poem': 'Poetry',
  'hymn': 'Poetry',

  // Philosophy
  'philosophy': 'Philosophy',
  'treatise': 'Philosophy',

  // History
  'history': 'History',

  // Religion / Theology
  'religion': 'Religion / Theology',

  // Politics / Political Theory
  'politics': 'Politics / Political Theory',
  'rhetoric': 'Politics / Political Theory',

  // Science (not in current data but included for completeness)
  'science': 'Science',

  // Essay / Non-fiction
  'essay': 'Essay / Non-fiction',
  'journalism': 'Essay / Non-fiction',
  'text': 'Essay / Non-fiction',

  // Biography / Memoir
  'autobiography': 'Biography / Memoir',
  'biography': 'Biography / Memoir',
  'memoir': 'Biography / Memoir',

  // Anthology / Collection
  'anthology': 'Anthology / Collection',
  'fables': 'Anthology / Collection',
  'satire': 'Anthology / Collection', // Can be anthology of satirical works
}

/**
 * Normalize a category value from Excel to canonical category
 */
export function normalizeCategory(rawCategory: string | null | undefined): string | undefined {
  if (!rawCategory) return undefined

  const normalized = rawCategory.trim().toLowerCase()
  const mapped = CATEGORY_MAPPING[normalized]

  if (!mapped) {
    console.warn(`Unknown category: "${rawCategory}" - will be set to null`)
    return undefined
  }

  return mapped
}

/**
 * Get statistics on unmapped categories (for validation)
 */
export function getCategoryMappingCoverage(categories: string[]): {
  mapped: number
  unmapped: number
  unmappedValues: string[]
} {
  const unmappedValues: string[] = []
  let mapped = 0
  let unmapped = 0

  categories.forEach(cat => {
    const normalized = cat.trim().toLowerCase()
    if (CATEGORY_MAPPING[normalized]) {
      mapped++
    } else {
      unmapped++
      if (!unmappedValues.includes(cat)) {
        unmappedValues.push(cat)
      }
    }
  })

  return { mapped, unmapped, unmappedValues }
}
