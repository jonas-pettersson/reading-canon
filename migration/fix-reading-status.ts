#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { parseExcelFile } from './excel-parser'
import type { Database } from '../src/types/database'

/**
 * Fix reading statuses that were migrated incorrectly.
 *
 * Issues:
 * - Prio 'x' was mapped to priority=high, should be status=want_to_read
 * - Read '-' was mapped to status=not_started, should be status=reading
 */

async function fixReadingStatus() {
  console.log('\n=== Fix Reading Statuses ===\n')

  // Get Supabase credentials
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Authenticate as curator
  const curatorEmail = process.env.CURATOR_EMAIL
  const curatorPassword = process.env.CURATOR_PASSWORD

  if (!curatorEmail || !curatorPassword) {
    console.error('Error: CURATOR_EMAIL and CURATOR_PASSWORD required')
    process.exit(1)
  }

  console.log(`Authenticating as curator: ${curatorEmail}`)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: curatorEmail,
    password: curatorPassword,
  })

  if (authError || !authData.user) {
    console.error('Failed to authenticate:', authError?.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`✅ Authenticated (user_id: ${userId})`)

  // Re-parse Excel file with corrected logic
  console.log('\nRe-parsing Excel file with corrected logic...')
  const excelPath = 'examples/Leseliste.xlsx'
  const parsed = parseExcelFile(excelPath)

  console.log(`Parsed ${parsed.books.length} books from Excel`)

  // Get all books from database
  console.log('\nFetching books from database...')
  const { data: dbBooks, error: booksError } = await supabase
    .from('books')
    .select('id, title, author_display_name')

  if (booksError) {
    console.error('Error fetching books:', booksError.message)
    process.exit(1)
  }

  // Create map: title+author -> book_id
  const bookMap = new Map<string, string>()
  dbBooks?.forEach(book => {
    const signature = `${book.title.toLowerCase().trim()}|${book.author_display_name.toLowerCase().trim()}`
    bookMap.set(signature, book.id)
  })

  // Match parsed statuses to database book IDs
  console.log('\nMatching parsed statuses to database books...')
  const updates: Array<{ id: string; status: string }> = []

  for (let i = 0; i < parsed.books.length; i++) {
    const book = parsed.books[i]
    const signature = `${book.title.toLowerCase().trim()}|${book.author_display_name.toLowerCase().trim()}`
    const bookId = bookMap.get(signature)

    if (!bookId) continue

    const correctStatus = parsed.userReadingStatuses[i]

    // Get current status from database
    const { data: currentStatus, error: statusError } = await supabase
      .from('user_reading_status')
      .select('id, reading_status')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single()

    if (statusError || !currentStatus) continue

    // Check if status needs updating
    if (currentStatus.reading_status !== correctStatus.reading_status) {
      updates.push({
        id: currentStatus.id,
        status: correctStatus.reading_status || 'not_started'
      })
    }
  }

  console.log(`Found ${updates.length} reading statuses to update`)

  if (updates.length === 0) {
    console.log('✅ All reading statuses are correct')
    return
  }

  // Group updates by status for reporting
  const statusCounts: Record<string, number> = {}
  updates.forEach(u => {
    statusCounts[u.status] = (statusCounts[u.status] || 0) + 1
  })

  console.log('\nStatus changes:')
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  → ${status}: ${count}`)
  })

  // Apply updates
  console.log('\nUpdating reading statuses...')
  for (const update of updates) {
    const { error } = await supabase
      .from('user_reading_status')
      .update({ reading_status: update.status })
      .eq('id', update.id)

    if (error) {
      console.error(`Error updating ${update.id}:`, error.message)
    }
  }

  console.log(`✅ Updated ${updates.length} reading statuses`)
}

fixReadingStatus()
