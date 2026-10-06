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

  // Read Excel file
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // Excel rows are 1-indexed, +1 for header

    // Validate required fields
    const title = row['Title (EN)']?.trim()
    if (!title) {
      validationErrors.push(`Row ${rowNumber}: Missing required field "Title (EN)"`)
      return
    }

    // Parse author information
    const authorResult = parseAuthor(row)
    if (!authorResult.author_display_name) {
      validationErrors.push(`Row ${rowNumber}: Missing required field "Author" or "Last Name"`)
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
    if (row['Original Title']?.trim()) {
      book.title_original = row['Original Title'].trim()
    }

    if (row.Year?.trim()) {
      book.year_published = row.Year.trim()
    }

    if (row['Sort Time'] !== undefined && row['Sort Time'] !== null) {
      book.year_sort = Number(row['Sort Time'])
    }

    if (row['Original Language']?.trim()) {
      book.original_language = row['Original Language'].trim()
    }

    if (row.Source?.trim()) {
      book.source = row.Source.trim()
    }

    if (row.Comment?.trim()) {
      book.inclusion_rationale = row.Comment.trim()
    }

    if (row['Author Lifespan']?.trim()) {
      book.author_lifespan = row['Author Lifespan'].trim()
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
  const author = row.Author?.trim()
  const lastName = row['Last Name']?.trim()
  const firstName = row['First Name']?.trim()

  // Prefer Author column if present
  if (author) {
    // If Last Name and First Name are also present, capture them for sorting
    if (lastName || firstName) {
      return {
        author_display_name: author,
        family_name: lastName,
        given_name: firstName,
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

  const category = row.Category?.trim()
  if (category) {
    result.primary_category = category
  }

  const tags: string[] = []
  const genre = row.Genre?.trim()
  const subject = row.Subject?.trim()

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
  const lib = row.Lib?.trim().toLowerCase()
  if (lib === 'x') {
    status.ownership_status = 'owned_physical'
  } else {
    status.ownership_status = 'not_owned'
  }

  // Parse Prio column (complex: priority, rating, or reading status)
  const prio = row.Prio?.trim().toLowerCase()
  if (prio) {
    if (prio === 'x') {
      status.personal_priority = 'high'
    } else if (prio === '-') {
      status.reading_status = 'reading'
    } else if (/^[1-5]$/.test(prio)) {
      status.personal_rating = parseInt(prio, 10)
    } else {
      validationWarnings.push(
        `Row ${rowNumber}: Unrecognized Prio value "${row.Prio}". Expected: x, 1-5, or -`
      )
    }
  }

  // Parse Read column (reading_status)
  // Only apply if Prio didn't already set reading_status
  if (!status.reading_status) {
    if (row.Read !== undefined) {
      const read = row.Read.trim().toLowerCase()
      if (read === 'x') {
        status.reading_status = 'finished'
      } else {
        // Explicit blank in Excel means not started
        status.reading_status = 'not_started'
      }
    }
    // If Read column is missing entirely (undefined), leave reading_status undefined
  }

  return status
}
