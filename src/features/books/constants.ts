/**
 * Book-related constants used across the application
 */

// Primary categories from spec.md v1.4 Section 2.1
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
] as const

// Reading status values from spec.md v1.4
export const READING_STATUSES = [
  'Not Started',
  'Want to Read',
  'Reading',
  'Paused',
  'Finished',
  'Abandoned',
] as const

// Ownership status values
export const OWNERSHIP_STATUSES = [
  'Not Owned',
  'Ordered',
  'Owned Physical',
  'Owned Digital',
  'Borrowed',
] as const
