import type { SupabaseClient } from '@supabase/supabase-js'
import { parseExcelFile } from './excel-parser'
import type { Database } from '../src/types/database'

type BookRow = Database['public']['Tables']['books']['Row']
type UserReadingStatusInsert = Database['public']['Tables']['user_reading_status']['Insert']

export interface MigrationResult {
  success: boolean
  booksImported: number
  statusesCreated: number
  error?: string
}

/**
 * Runs the Excel to database migration.
 *
 * @param excelFilePath Path to the Excel file to migrate
 * @param supabase Supabase client instance
 * @returns Migration result with success status and counts
 */
export async function runMigration(
  excelFilePath: string,
  supabase: SupabaseClient<Database>,
  curatorUserId?: string
): Promise<MigrationResult> {
  try {
    // 1. Parse Excel file
    console.log('Parsing Excel file...')
    const parsed = parseExcelFile(excelFilePath)

    // 2. Generate pre-migration report
    console.log('\nPre-migration report:')
    console.log(`Books to import: ${parsed.books.length}`)
    console.log(`Reading status records: ${parsed.userReadingStatuses.length}`)
    console.log(`Validation errors: ${parsed.validationErrors.length}`)
    console.log(`Warnings: ${parsed.validationWarnings.length}`)

    if (parsed.validationWarnings.length > 0) {
      console.log('\nValidation warnings:')
      parsed.validationWarnings.forEach((warning) => console.log(`  - ${warning}`))
    }

    // 3. Check for validation errors
    if (parsed.validationErrors.length > 0) {
      console.error('\nValidation errors found. Migration aborted.')
      console.error(parsed.validationErrors)
      return {
        success: false,
        booksImported: 0,
        statusesCreated: 0,
        error: 'Validation errors found',
      }
    }

    // 4. Get current user (for user_id in reading status)
    let userId: string

    if (curatorUserId) {
      // Service role key migration - user_id provided
      userId = curatorUserId
      console.log(`Using provided user_id: ${userId}`)
    } else {
      // Anon key migration - get from auth session
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw new Error('Failed to get current user. Make sure you are authenticated or provide curatorUserId.')
      }
      userId = userData.user.id
      console.log(`Using authenticated user: ${userId}`)
    }

    // 5. Check for existing books (idempotent operation)
    console.log('\nChecking for existing books...')
    const { data: existingBooks, error: existingError } = await supabase
      .from('books')
      .select('id, title, author_display_name')

    if (existingError) {
      throw new Error(`Failed to query existing books: ${existingError.message}`)
    }

    // Create a set of existing book signatures for duplicate detection
    const existingBookSignatures = new Set(
      (existingBooks || []).map((book) =>
        `${book.title.toLowerCase().trim()}|${book.author_display_name.toLowerCase().trim()}`
      )
    )

    // Filter out books that already exist
    const newBooks = parsed.books.filter((book) => {
      const signature = `${book.title.toLowerCase().trim()}|${book.author_display_name.toLowerCase().trim()}`
      return !existingBookSignatures.has(signature)
    })

    const duplicateCount = parsed.books.length - newBooks.length
    if (duplicateCount > 0) {
      console.log(`  ${duplicateCount} books already exist (will be skipped)`)
    }
    console.log(`  ${newBooks.length} new books to import`)

    // 6. Insert new books (batch)
    let insertedBooks: BookRow[] = []
    if (newBooks.length > 0) {
      console.log('\nInserting books...')
      const { data: books, error: booksError } = await supabase
        .from('books')
        .insert(newBooks)
        .select()

      if (booksError) {
        throw new Error(`Failed to insert books: ${booksError.message}`)
      }

      insertedBooks = books || []
      console.log(`  ${insertedBooks.length} books inserted`)
    }

    // 7. Map reading statuses to book IDs
    // Create a map from (title, author) -> book_id for all books (existing + inserted)
    const allBooks = [...(existingBooks || []), ...insertedBooks]
    const bookIdMap = new Map<string, string>()
    allBooks.forEach((book) => {
      const signature = `${book.title.toLowerCase().trim()}|${book.author_display_name.toLowerCase().trim()}`
      bookIdMap.set(signature, book.id)
    })

    // Map reading statuses to their corresponding book IDs
    const mappedStatuses: UserReadingStatusInsert[] = parsed.userReadingStatuses
      .map((status, index) => {
        const book = parsed.books[index]
        const signature = `${book.title.toLowerCase().trim()}|${book.author_display_name.toLowerCase().trim()}`
        const bookId = bookIdMap.get(signature)

        if (!bookId) {
          console.warn(`  Warning: Could not find book ID for "${book.title}" by ${book.author_display_name}`)
          return null
        }

        return {
          ...status,
          book_id: bookId,
          user_id: userId,
        }
      })
      .filter((status): status is UserReadingStatusInsert => status !== null)

    // 8. Check for existing reading statuses (idempotent)
    console.log('\nChecking for existing reading statuses...')
    const bookIds = mappedStatuses.map(s => s.book_id)
    const { data: existingStatuses, error: existingStatusError } = await supabase
      .from('user_reading_status')
      .select('book_id')
      .eq('user_id', userId)
      .in('book_id', bookIds)

    if (existingStatusError) {
      throw new Error(`Failed to query existing reading statuses: ${existingStatusError.message}`)
    }

    const existingStatusBookIds = new Set((existingStatuses || []).map(s => s.book_id))
    const newStatuses = mappedStatuses.filter(s => !existingStatusBookIds.has(s.book_id))

    if (existingStatuses && existingStatuses.length > 0) {
      console.log(`  ${existingStatuses.length} reading statuses already exist (will be skipped)`)
    }
    console.log(`  ${newStatuses.length} new reading statuses to create`)

    // 9. Insert user_reading_status records (batch)
    let statusesCreated = 0
    if (newStatuses.length > 0) {
      console.log('\nInserting reading statuses...')
      const { error: statusError } = await supabase
        .from('user_reading_status')
        .insert(newStatuses)

      if (statusError) {
        throw new Error(`Failed to insert reading statuses: ${statusError.message}`)
      }

      statusesCreated = newStatuses.length
      console.log(`  ${statusesCreated} reading statuses created`)
    }

    // 10. Generate post-migration report
    console.log('\nMigration complete!')
    console.log(`Books imported: ${insertedBooks.length}`)
    console.log(`Reading statuses created: ${statusesCreated}`)

    return {
      success: true,
      booksImported: insertedBooks.length,
      statusesCreated,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('\nMigration failed:', errorMessage)
    return {
      success: false,
      booksImported: 0,
      statusesCreated: 0,
      error: errorMessage,
    }
  }
}
