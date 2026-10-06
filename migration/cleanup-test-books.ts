#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { parseExcelFile } from './excel-parser'
import type { Database } from '../src/types/database'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Cleanup script to delete test books from the database.
 * Deletes all books that match titles from the test data file.
 */

async function cleanupTestBooks() {
  console.log('\n=== Cleanup Test Books ===\n')

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('Error: SUPABASE_URL not found in environment')
    process.exit(1)
  }

  const supabaseKey = serviceRoleKey || anonKey

  if (!supabaseKey) {
    console.error('Error: Supabase key not found in environment')
    process.exit(1)
  }

  console.log('Using service role key (admin access)')

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
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

  // Parse test data to get book titles
  const testFilePath = path.join(__dirname, 'test-data.xlsx')
  console.log(`\nReading test data from: ${testFilePath}`)

  const parsed = parseExcelFile(testFilePath)
  const testTitles = parsed.books.map(b => b.title)

  console.log(`Found ${testTitles.length} test book titles`)
  console.log('Test books to delete:')
  testTitles.forEach(title => console.log(`  - ${title}`))

  // Find books matching test titles
  console.log('\nSearching for matching books in database...')
  const { data: booksToDelete, error: searchError } = await supabase
    .from('books')
    .select('id, title, author_display_name')
    .in('title', testTitles)

  if (searchError) {
    console.error('Error searching for books:', searchError.message)
    process.exit(1)
  }

  if (!booksToDelete || booksToDelete.length === 0) {
    console.log('✅ No test books found in database (already clean)')
    process.exit(0)
  }

  console.log(`\nFound ${booksToDelete.length} books to delete:`)
  booksToDelete.forEach(book => console.log(`  - ${book.title} by ${book.author_display_name}`))

  const bookIds = booksToDelete.map(b => b.id)

  // Delete reading statuses first (foreign key constraint)
  console.log('\nDeleting reading statuses...')
  const { error: statusDeleteError } = await supabase
    .from('user_reading_status')
    .delete()
    .in('book_id', bookIds)

  if (statusDeleteError) {
    console.error('Error deleting reading statuses:', statusDeleteError.message)
    process.exit(1)
  }

  console.log('✅ Reading statuses deleted')

  // Delete books
  console.log('\nDeleting books...')
  const { error: booksDeleteError } = await supabase
    .from('books')
    .delete()
    .in('id', bookIds)

  if (booksDeleteError) {
    console.error('Error deleting books:', booksDeleteError.message)
    process.exit(1)
  }

  console.log('✅ Books deleted')
  console.log(`\n✅ Cleanup complete! Deleted ${booksToDelete.length} test books`)
}

cleanupTestBooks()
