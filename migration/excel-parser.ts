import XLSX from 'xlsx'
import type { Database } from '../src/types/database'

// Type aliases for cleaner code
type BookInsert = Database['public']['Tables']['books']['Insert']
type UserReadingStatusInsert = Database['public']['Tables']['user_reading_status']['Insert']

interface ExcelRow {
  Author?: string
  'Last Name'?: string
  'First Name'?: string
  'Title (EN)': string
  'Original Title'?: string
  Year?: string
  'Sort Time'?: number
  Category?: string
  Genre?: string
  Subject?: string
  'Original Language'?: string
  Source?: string
  Comment?: string
  'Author Lifespan'?: string
  'External Links'?: string
  Lib?: string
  Prio?: string
  Read?: string
}

interface ParsedData {
  books: BookInsert[]
  userReadingStatuses: UserReadingStatusInsert[]
  validationErrors: string[]
  validationWarnings: string[]
  skippedRows: string[]
}

/**
 * Helper to safely convert Excel cell values to trimmed strings.
 * Excel may store values as strings or numbers, so we need to convert.
 */
function toTrimmedString(value: any): string {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  return String(value).trim()
}

/**
 * Parses an Excel file containing book data and returns structured data
 * ready for database insertion.
 *
 * @param filePath Path to the Excel file
 * @returns Parsed books, user reading statuses, and validation messages
 */
export function parseExcelFile(filePath: string): ParsedData {
  const books: BookInsert[] = []
  const userReadingStatuses: UserReadingStatusInsert[] = []
  const validationErrors: string[] = []
  const validationWarnings: string[] = []
  const skippedRows: string[] = []

  // Read Excel file
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // Excel rows are 1-indexed, +1 for header

    // Validate required fields - skip rows with missing required data
    const title = toTrimmedString(row['Title (EN)'])
    if (!title) {
      skippedRows.push(`Row ${rowNumber}: Missing required field "Title (EN)"`)
      return
    }

    // Parse author information
    const authorResult = parseAuthor(row)
    if (!authorResult.author_display_name) {
      skippedRows.push(`Row ${rowNumber}: Missing required field "Author" or "Last Name"`)
      return
    }

    // Build book record
    const book: BookInsert = {
      title,
      author_display_name: authorResult.author_display_name,
    }

    // Optional author fields
    if (authorResult.family_name) {
      book.family_name = authorResult.family_name
    }
    if (authorResult.given_name) {
      book.given_name = authorResult.given_name
    }

    // Optional book fields
    const originalTitle = toTrimmedString(row['Original Title'])
    if (originalTitle) {
      book.title_original = originalTitle
    }

    const year = toTrimmedString(row.Year)
    if (year) {
      book.year_published = year
    }

    if (row['Sort Time'] !== undefined && row['Sort Time'] !== null) {
      book.year_sort = Number(row['Sort Time'])
    }

    const originalLanguage = toTrimmedString(row['Original Language'])
    if (originalLanguage) {
      book.original_language = originalLanguage
    }

    const source = toTrimmedString(row.Source)
    if (source) {
      book.source = source
    }

    const comment = toTrimmedString(row.Comment)
    if (comment) {
      book.inclusion_rationale = comment
    }

    const authorLifespan = toTrimmedString(row['Author Lifespan'])
    if (authorLifespan) {
      book.author_lifespan = authorLifespan
    }

    // Parse category and tags
    const categoryTagsResult = parseCategoryAndTags(row)
    if (categoryTagsResult.primary_category) {
      book.primary_category = categoryTagsResult.primary_category
    }
    if (categoryTagsResult.tags && categoryTagsResult.tags.length > 0) {
      book.tags = categoryTagsResult.tags
    }

    books.push(book)

    // Parse user reading status (personal data)
    const statusResult = parseUserReadingStatus(row, rowNumber, validationWarnings)
    userReadingStatuses.push(statusResult)
  })

  return {
    books,
    userReadingStatuses,
    validationErrors,
    validationWarnings,
    skippedRows,
  }
}

/**
 * Parses author information from Excel row.
 * Handles various author formats: Author column, Last Name + First Name, etc.
 */
function parseAuthor(row: ExcelRow): {
  author_display_name: string
  family_name?: string
  given_name?: string
} {
  const author = toTrimmedString(row.Author)
  const lastName = toTrimmedString(row['Last Name'])
  const firstName = toTrimmedString(row['First Name'])

  // Prefer Author column if present
  if (author) {
    // If Last Name and First Name are also present, capture them for sorting
    if (lastName || firstName) {
      return {
        author_display_name: author,
        family_name: lastName || undefined,
        given_name: firstName || undefined,
      }
    }
    return { author_display_name: author }
  }

  // Construct from Last Name + First Name
  if (lastName && firstName) {
    return {
      author_display_name: `${lastName}, ${firstName}`,
      family_name: lastName,
      given_name: firstName,
    }
  }

  // Last Name only
  if (lastName) {
    return {
      author_display_name: lastName,
      family_name: lastName,
    }
  }

  return { author_display_name: '' }
}

/**
 * Parses Category, Genre, and Subject columns.
 * Category → primary_category
 * Genre + Subject → tags array
 */
function parseCategoryAndTags(row: ExcelRow): {
  primary_category?: string
  tags?: string[]
} {
  const result: { primary_category?: string; tags?: string[] } = {}

  const category = toTrimmedString(row.Category)
  if (category) {
    result.primary_category = category
  }

  const tags: string[] = []
  const genre = toTrimmedString(row.Genre)
  const subject = toTrimmedString(row.Subject)

  if (genre) tags.push(genre)
  if (subject) tags.push(subject)

  if (tags.length > 0) {
    result.tags = tags
  }

  return result
}

/**
 * Parses user reading status from Lib, Prio, and Read columns.
 * Handles complex Prio column logic (x → priority, 1-5 → rating, - → reading status)
 */
function parseUserReadingStatus(
  row: ExcelRow,
  rowNumber: number,
  validationWarnings: string[]
): UserReadingStatusInsert {
  // Note: book_id and user_id will be set during migration
  // These are placeholders and will be replaced
  const status: UserReadingStatusInsert = {
    book_id: '', // Will be set during migration
    user_id: '', // Will be set during migration
  }

  // Parse Lib column (ownership_status)
  // Convert to string to handle both string and numeric values
  const libValue = row.Lib !== undefined && row.Lib !== null ? String(row.Lib).trim().toLowerCase() : ''
  if (libValue === 'x') {
    status.ownership_status = 'owned_physical'
  } else {
    status.ownership_status = 'not_owned'
  }

  // Parse Prio column (complex: rating or reading status)
  // Convert to string to handle both string and numeric values
  const prioValue = row.Prio !== undefined && row.Prio !== null ? String(row.Prio).trim().toLowerCase() : ''
  if (prioValue) {
    if (prioValue === 'x') {
      // 'x' in Prio means "want to read"
      status.reading_status = 'want_to_read'
    } else if (/^[1-5]$/.test(prioValue)) {
      // German school grading system: 1 = best, 5 = worst
      // Invert to star rating: 1 = 5 stars, 5 = 1 star
      const germanGrade = parseInt(prioValue, 10)
      status.personal_rating = 6 - germanGrade
    } else if (prioValue !== '-') {
      // Ignore '-' in Prio (was old reading status marker, now handled by Read column)
      validationWarnings.push(
        `Row ${rowNumber}: Unrecognized Prio value "${row.Prio}". Expected: x, 1-5`
      )
    }
  }

  // Parse Read column (reading_status)
  // Only apply if Prio didn't already set reading_status (e.g., want_to_read)
  if (!status.reading_status) {
    if (row.Read !== undefined && row.Read !== null) {
      const readValue = String(row.Read).trim().toLowerCase()
      if (readValue === 'x') {
        status.reading_status = 'finished'
      } else if (readValue === '-') {
        // '-' in Read means currently reading
        status.reading_status = 'reading'
      } else {
        // Explicit blank in Excel means not started
        status.reading_status = 'not_started'
      }
    } else {
      // Read column missing entirely - default to not_started
      status.reading_status = 'not_started'
    }
  }

  return status
}
