/**
 * Book-related constants used across the application
 *
 * IMPORTANT: Reading and ownership statuses use database enum values (snake_case).
 * - These constants match the PostgreSQL enum types exactly
 * - Use helper functions (getReadingStatusDisplayName, getOwnershipStatusDisplayName)
 *   to convert to human-readable display names
 * - In UI: <option value={enumValue}>{displayName}</option>
 * - This ensures filters pass correct values to database queries
 */

import type { Database } from '@/types/database'

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

// Reading status values - use database enum values (snake_case)
// Example: 'reading' (DB enum) → 'Reading' (display name)
export const READING_STATUSES: Database['public']['Enums']['reading_status_enum'][] = [
  'not_started',
  'want_to_read',
  'reading',
  'paused',
  'finished',
  'abandoned',
] as const

// Ownership status values - use database enum values (snake_case)
// Example: 'owned_physical' (DB enum) → 'Owned Physical' (display name)
export const OWNERSHIP_STATUSES: Database['public']['Enums']['ownership_status_enum'][] = [
  'not_owned',
  'ordered',
  'owned_physical',
  'owned_digital',
  'borrowed',
] as const

/**
 * Convert reading status enum to display name
 */
export function getReadingStatusDisplayName(status: Database['public']['Enums']['reading_status_enum']): string {
  const displayNames: Record<Database['public']['Enums']['reading_status_enum'], string> = {
    'not_started': 'Not Started',
    'want_to_read': 'Want to Read',
    'reading': 'Reading',
    'paused': 'Paused',
    'finished': 'Finished',
    'abandoned': 'Abandoned',
  }
  return displayNames[status]
}

/**
 * Convert ownership status enum to display name
 */
export function getOwnershipStatusDisplayName(status: Database['public']['Enums']['ownership_status_enum']): string {
  const displayNames: Record<Database['public']['Enums']['ownership_status_enum'], string> = {
    'not_owned': 'Not Owned',
    'ordered': 'Ordered',
    'owned_physical': 'Owned Physical',
    'owned_digital': 'Owned Digital',
    'borrowed': 'Borrowed',
  }
  return displayNames[status]
}

/**
 * Convert language code to display name
 * Language list is fetched dynamically from database via useLanguages hook
 */
export function getLanguageDisplayName(code: string): string {
  const displayNames: Record<string, string> = {
    'CH': 'Chinese',
    'DA': 'Danish',
    'DE': 'German',
    'DK': 'Danish',
    'EN': 'English',
    'ES': 'Spanish',
    'FI': 'Finnish',
    'FR': 'French',
    'GR': 'Greek',
    'IS': 'Icelandic',
    'IT': 'Italian',
    'LA': 'Latin',
    'NO': 'Norwegian',
    'RU': 'Russian',
    'SV': 'Swedish',
    'TU': 'Turkish',
    'ZH': 'Chinese',
  }
  return displayNames[code] || code
}
