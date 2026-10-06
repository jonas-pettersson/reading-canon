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
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found in environment')
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  console.log('\n=== Starting Migration ===\n')

  try {
    // Run migration
    const result = await runMigration(absolutePath, supabase)

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
