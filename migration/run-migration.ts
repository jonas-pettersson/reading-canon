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
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('Error: SUPABASE_URL not found in environment')
    process.exit(1)
  }

  // Prefer service role key for migrations (bypasses RLS, admin access)
  const supabaseKey = serviceRoleKey || anonKey

  if (!supabaseKey) {
    console.error('Error: Supabase key not found in environment')
    console.error('Set either SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY')
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
    // Authenticate as curator to get user_id
    const curatorEmail = process.env.CURATOR_EMAIL
    const curatorPassword = process.env.CURATOR_PASSWORD

    if (!curatorEmail || !curatorPassword) {
      console.error('Error: Curator credentials not found')
      console.error('Set CURATOR_EMAIL and CURATOR_PASSWORD in .env.local')
      process.exit(1)
    }

    console.log(`Authenticating as curator: ${curatorEmail}`)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: curatorEmail,
      password: curatorPassword,
    })

    if (authError || !authData.user) {
      console.error('\n❌ Failed to authenticate as curator')
      console.error(authError?.message || 'No user data returned')
      console.error('\nMake sure:')
      console.error('  1. CURATOR_EMAIL and CURATOR_PASSWORD are correct in .env.local')
      console.error('  2. The curator account exists (run: npm run create-curator)')
      process.exit(1)
    }

    const curatorUserId = authData.user.id
    console.log(`✅ Authenticated successfully (user_id: ${curatorUserId})`)

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
