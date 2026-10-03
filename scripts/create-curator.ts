/**
 * Create Curator Account Script
 *
 * This script creates the initial curator account using Supabase Admin API.
 * It requires the SERVICE_ROLE_KEY which has admin privileges.
 *
 * Usage:
 *   npm run create-curator
 *
 * Environment Variables Required:
 *   VITE_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (from Supabase dashboard)
 *   CURATOR_EMAIL - Email for curator account (optional, will prompt if not set)
 *   CURATOR_PASSWORD - Password for curator account (optional, will prompt if not set)
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_URL is not set')
  console.error('Please add it to your .env.local file')
  process.exit(1)
}

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set')
  console.error('Please add it to your .env.local file')
  console.error('You can find it in: Supabase Dashboard → Settings → API → service_role key')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to prompt for input
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function createCurator() {
  console.log('🚀 Reading Canon - Curator Account Setup\n')

  // Get email (from env or prompt)
  let email = process.env.CURATOR_EMAIL
  if (!email) {
    email = await prompt('Enter curator email: ')
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }
  }

  // Get password (from env or prompt)
  let password = process.env.CURATOR_PASSWORD
  if (!password) {
    password = await prompt('Enter curator password (min 6 characters): ')
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters')
      process.exit(1)
    }
  }

  console.log(`\n📝 Creating curator account for: ${email}`)

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error checking existing users:', listError.message)
      process.exit(1)
    }

    const existingUser = existingUsers.users.find((u) => u.email === email)
    if (existingUser) {
      console.log('⚠️  User already exists!')
      console.log('   User ID:', existingUser.id)
      console.log('   Email:', existingUser.email)
      console.log('   Created:', existingUser.created_at)
      console.log('\n✅ You can use this account to log in.')
      return
    }

    // Create the curator account
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification for MVP 0
      user_metadata: {
        role: 'curator',
        created_by: 'admin_script',
      },
    })

    if (error) {
      console.error('❌ Error creating curator:', error.message)
      process.exit(1)
    }

    console.log('\n✅ Curator account created successfully!')
    console.log('   User ID:', data.user.id)
    console.log('   Email:', data.user.email)
    console.log('\n📋 Next steps:')
    console.log('   1. Start the dev server: npm run dev')
    console.log('   2. Visit: http://localhost:5173/login')
    console.log(`   3. Log in with: ${email}`)
    console.log('\n🎉 You\'re ready to use Reading Canon!')
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

// Run the script
createCurator()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
