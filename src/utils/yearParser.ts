/**
 * Parse year_sort from year_published string
 *
 * Handles various formats:
 * - Simple years: "1984" -> 1984
 * - Circa: "c. 1850" -> 1850
 * - Ranges: "1850-1860" -> 1850 (first year)
 * - BCE/BC: "800 BCE" -> -800
 * - Invalid/missing: "" -> null
 *
 * @param yearPublished - The year_published text field
 * @returns Numeric year for sorting, or null if no valid year found
 */
export function parseYearSort(yearPublished: string | null | undefined): number | null {
  if (!yearPublished || yearPublished.trim() === '') {
    return null
  }

  const trimmed = yearPublished.trim()

  // Check for BCE/BC
  const isBCE = /\b(BCE?|BC)\b/i.test(trimmed)

  // Extract first 4-digit number (or 1-4 digits for older years)
  const match = trimmed.match(/\b(\d{1,4})\b/)

  if (!match) {
    return null
  }

  const year = parseInt(match[1], 10)

  // Return negative for BCE years
  return isBCE ? -year : year
}
