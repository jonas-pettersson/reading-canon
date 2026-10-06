#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { runMigration } from './migrate'
import type { Database } from '../src/types/database'
import * as path from 'path'

/**
 * CLI script to execute Excel data migration.
 *
 * Usage:
 *   npm run migrate:test    # Run with test data
 *   npm run migrate:prod    # Run with production data (requires file path)
 *
 * Or directly:
 *   npx tsx migration/run-migration.ts <path-to-excel-file>
 */

async function main() {
  // Get Excel file path from command line
  const excelFilePath = process.argv[2]

  if (!excelFilePath) {
    console.error('Error: Excel file path is required')
    console.error('Usage: npx tsx migration/run-migration.ts <path-to-excel-file>')
    process.exit(1)
  }

  // Resolve absolute path
  const absolutePath = path.resolve(excelFilePath)
  console.log(`Excel file: ${absolutePath}`)

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('Error: VITE_SUPABASE_URL not found in environment')
    process.exit(1)
  }

  // Prefer service role key for migrations (bypasses RLS, admin access)
  const supabaseKey = serviceRoleKey || anonKey

  if (!supabaseKey) {
    console.error('Error: Supabase key not found in environment')
    console.error('Set either VITE_SUPABASE_SERVICE_ROLE_KEY (recommended) or VITE_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  if (serviceRoleKey) {
    console.log('Using service role key (admin access)')
  } else {
    console.log('Using anon key (requires authentication)')
  }

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('\n=== Starting Migration ===\n')

  try {
    // Get curator user_id (needed for reading status records)
    let curatorUserId: string | undefined

    if (serviceRoleKey) {
      // Using service role key - need to find curator user_id
      const curatorEmail = process.env.CURATOR_EMAIL

      if (curatorEmail) {
        // Query by email if provided
        console.log(`Looking up curator by email: ${curatorEmail}`)
        const { data: users, error } = await supabase
          .from('books')
          .select('created_by_user_id')
          .limit(1)
          .single()

        if (!error && users?.created_by_user_id) {
          curatorUserId = users.created_by_user_id
          console.log(`Found curator user_id: ${curatorUserId}`)
        }
      }

      if (!curatorUserId) {
        // Fallback: use the first user who created a book (assumes single curator)
        console.log('Searching for curator user_id from existing books...')
        const { data: books, error } = await supabase
          .from('books')
          .select('created_by_user_id')
          .not('created_by_user_id', 'is', null)
          .limit(1)

        if (!error && books && books.length > 0 && books[0].created_by_user_id) {
          curatorUserId = books[0].created_by_user_id
          console.log(`Found curator user_id from books: ${curatorUserId}`)
        }
      }

      if (!curatorUserId) {
        console.error('\n⚠️  Warning: Could not determine curator user_id')
        console.error('Please set CURATOR_EMAIL in .env.local or create a book first')
        console.error('Migration will proceed but reading statuses may not be assigned correctly')
        process.exit(1)
      }
    }

    // Run migration
    const result = await runMigration(absolutePath, supabase, curatorUserId)

    if (result.success) {
      console.log('\n✅ Migration completed successfully!')
      process.exit(0)
    } else {
      console.error('\n❌ Migration failed:', result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    process.exit(1)
  }
}

main()
