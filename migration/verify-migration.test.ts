/**
 * Migration Verification Tests
 *
 * These are ONE-TIME integration tests that verify the migration process
 * against the actual Supabase database. They are NOT part of the regular
 * test suite and should only be run when validating the migration.
 *
 * Run with: npm run test:migration
 *
 * These tests:
 * 1. Create test Excel data
 * 2. Run the migration against the real database
 * 3. Verify results by querying the database
 * 4. Clean up test data afterward
 *
 * ⚠️ WARNING: These tests modify the actual database!
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { runMigration } from './migrate'
import { createTestExcelFile } from './create-test-data'
import type { Database } from '../src/types/database'
import * as fs from 'fs'

// Only run these tests when explicitly requested
const SKIP_MIGRATION_TESTS = !process.env.RUN_MIGRATION_TESTS

describe.skipIf(SKIP_MIGRATION_TESTS)('Migration Verification (Integration)', () => {
  let supabase: ReturnType<typeof createClient<Database>>
  let testFilePath: string
  let testBookIds: string[] = []
  let userId: string

  beforeAll(async () => {
    // Verify environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }

    // Create Supabase client
    supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error('Not authenticated. Please log in first.')
    }
    userId = userData.user.id

    // Create test data file
    testFilePath = createTestExcelFile()
    console.log(`\nTest data created: ${testFilePath}`)
  })

  afterAll(async () => {
    // Clean up test data from database
    if (testBookIds.length > 0) {
      console.log(`\nCleaning up ${testBookIds.length} test books...`)

      // Delete reading statuses first (foreign key constraint)
      const { error: statusError } = await supabase
        .from('user_reading_status')
        .delete()
        .in('book_id', testBookIds)

      if (statusError) {
        console.error('Warning: Failed to delete test reading statuses:', statusError)
      }

      // Delete books
      const { error: booksError } = await supabase
        .from('books')
        .delete()
        .in('id', testBookIds)

      if (booksError) {
        console.error('Warning: Failed to delete test books:', booksError)
      } else {
        console.log('✅ Test data cleaned up')
      }
    }

    // Clean up test file
    if (testFilePath && fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
      console.log('✅ Test file removed')
    }
  })

  it('should successfully execute migration with test data', async () => {
    const result = await runMigration(testFilePath, supabase)

    expect(result.success).toBe(true)
    expect(result.booksImported).toBeGreaterThan(0)
    expect(result.statusesCreated).toBeGreaterThan(0)
    expect(result.error).toBeUndefined()

    console.log(`\n✅ Migration completed: ${result.booksImported} books, ${result.statusesCreated} statuses`)
  }, 30000) // 30 second timeout

  it('should import all books with correct data', async () => {
    // Query all books imported by current user (recent books)
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    expect(error).toBeNull()
    expect(books).toBeDefined()
    expect(books!.length).toBeGreaterThan(0)

    // Store IDs for cleanup
    testBookIds = books!.map(book => book.id)

    // Verify specific books with edge cases
    const odyssey = books!.find(b => b.title === 'The Odyssey')
    expect(odyssey).toBeDefined()
    expect(odyssey!.author_display_name).toBe('Homer')
    expect(odyssey!.year_published).toBe('8th century BC')
    expect(odyssey!.year_sort).toBe(-750)
    expect(odyssey!.original_language).toBe('Ancient Greek')
    expect(odyssey!.primary_category).toBe('Epic')
    expect(odyssey!.tags).toContain('Poetry')
    expect(odyssey!.tags).toContain('Mythology')

    // Verify Last Name + First Name construction
    const warAndPeace = books!.find(b => b.title === 'War and Peace')
    expect(warAndPeace).toBeDefined()
    expect(warAndPeace!.author_display_name).toBe('Tolstoy, Leo')
    expect(warAndPeace!.family_name).toBe('Tolstoy')
    expect(warAndPeace!.given_name).toBe('Leo')

    // Verify unknown author
    const beowulf = books!.find(b => b.title === 'Beowulf')
    expect(beowulf).toBeDefined()
    expect(beowulf!.author_display_name).toBe('Unknown')

    // Verify collective authors
    const grimm = books!.find(b => b.title === "Grimms' Fairy Tales")
    expect(grimm).toBeDefined()
    expect(grimm!.author_display_name).toBe('Brothers Grimm')

    // Verify minimal data (only required fields)
    const republic = books!.find(b => b.title === 'The Republic')
    expect(republic).toBeDefined()
    expect(republic!.author_display_name).toBe('Plato')
    expect(republic!.year_published).toBeNull()

    console.log(`\n✅ Verified ${books!.length} books with correct data`)
  })

  it('should import reading statuses with correct mappings', async () => {
    // Query reading statuses for current user
    const { data: statuses, error } = await supabase
      .from('user_reading_status')
      .select('*, books(*)')
      .eq('user_id', userId)
      .in('book_id', testBookIds)

    expect(error).toBeNull()
    expect(statuses).toBeDefined()
    expect(statuses!.length).toBeGreaterThan(0)

    // Verify Prio = 'x' → high priority
    const warAndPeaceStatus = statuses!.find(s => s.books?.title === 'War and Peace')
    expect(warAndPeaceStatus).toBeDefined()
    expect(warAndPeaceStatus!.personal_priority).toBe('high')
    expect(warAndPeaceStatus!.ownership_status).toBe('owned_physical')

    // Verify Prio = '5' → rating
    const odysseyStatus = statuses!.find(s => s.books?.title === 'The Odyssey')
    expect(odysseyStatus).toBeDefined()
    expect(odysseyStatus!.personal_rating).toBe(5)
    expect(odysseyStatus!.reading_status).toBe('finished')
    expect(odysseyStatus!.ownership_status).toBe('owned_physical')

    // Verify Prio = '-' → reading status
    const crimeStatus = statuses!.find(s => s.books?.title === 'Crime and Punishment')
    expect(crimeStatus).toBeDefined()
    expect(crimeStatus!.reading_status).toBe('reading')
    expect(crimeStatus!.ownership_status).toBe('owned_physical')

    // Verify blank Prio/Read/Lib
    const beowulfStatus = statuses!.find(s => s.books?.title === 'Beowulf')
    expect(beowulfStatus).toBeDefined()
    expect(beowulfStatus!.ownership_status).toBe('not_owned')

    console.log(`\n✅ Verified ${statuses!.length} reading statuses with correct mappings`)
  })

  it('should handle duplicate prevention (idempotent)', async () => {
    // Run migration again with same data
    const result = await runMigration(testFilePath, supabase)

    // Should succeed but import 0 new books (all duplicates)
    expect(result.success).toBe(true)
    expect(result.booksImported).toBe(0) // All books already exist

    console.log('\n✅ Duplicate prevention working (idempotent)')
  }, 30000)

  it('should preserve all required data fields', async () => {
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .in('id', testBookIds)

    expect(error).toBeNull()
    expect(books).toBeDefined()

    // Every book must have required fields
    books!.forEach(book => {
      expect(book.title).toBeTruthy()
      expect(book.author_display_name).toBeTruthy()
      expect(book.id).toBeTruthy()
      expect(book.created_at).toBeTruthy()
    })

    console.log('\n✅ All required fields preserved')
  })

  it('should correctly map various date formats', async () => {
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .in('id', testBookIds)

    expect(error).toBeNull()

    // Check ancient date
    const odyssey = books!.find(b => b.title === 'The Odyssey')
    expect(odyssey!.year_published).toBe('8th century BC')
    expect(odyssey!.year_sort).toBe(-750)

    // Check approximate date
    const beowulf = books!.find(b => b.title === 'Beowulf')
    expect(beowulf!.year_published).toBe('ca. 1000')
    expect(beowulf!.year_sort).toBe(1000)

    // Check range date
    const nights = books!.find(b => b.title === 'One Thousand and One Nights')
    expect(nights!.year_published).toBe('ca. 1200-1500')
    expect(nights!.year_sort).toBe(1350)

    // Check modern date
    const marquez = books!.find(b => b.title === 'One Hundred Years of Solitude')
    expect(marquez!.year_published).toBe('1967')
    expect(marquez!.year_sort).toBe(1967)

    console.log('\n✅ Various date formats correctly mapped')
  })

  it('should map categories and tags correctly', async () => {
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .in('id', testBookIds)

    expect(error).toBeNull()

    // Verify category mapping
    const odyssey = books!.find(b => b.title === 'The Odyssey')
    expect(odyssey!.primary_category).toBe('Epic')

    // Verify tags from Genre + Subject
    expect(odyssey!.tags).toEqual(expect.arrayContaining(['Poetry', 'Mythology']))

    // Verify books with no category/tags
    const republic = books!.find(b => b.title === 'The Republic')
    expect(republic!.primary_category).toBeNull()
    expect(republic!.tags).toBeNull()

    console.log('\n✅ Categories and tags correctly mapped')
  })
})
