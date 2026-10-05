/**
 * Primary Categories for Books
 *
 * Source: spec.md v1.4 Section 2.1
 * These are the controlled vocabulary values for book categorization.
 */
export const PRIMARY_CATEGORIES = [
  'Novel',
  'Play / Drama',
  'Poetry',
  'Philosophy',
  'History',
  'Religion / Theology',
  'Politics / Political Theory',
  'Science',
  'Essay / Non-fiction',
  'Biography / Memoir',
  'Anthology / Collection',
] as const;

export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number];
