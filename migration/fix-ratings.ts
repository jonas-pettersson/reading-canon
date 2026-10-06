#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

/**
 * Fix ratings in database - invert from German grading system (1=best)
 * to star rating system (5=best).
 *
 * Transformation: newRating = 6 - oldRating
 */

async function fixRatings() {
  console.log('\n=== Fix Ratings (German Grading → Stars) ===\n')

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

  // Get all reading statuses with ratings
  console.log('\nFetching reading statuses with ratings...')
  const { data: statuses, error: fetchError } = await supabase
    .from('user_reading_status')
    .select('id, personal_rating')
    .eq('user_id', userId)
    .not('personal_rating', 'is', null)

  if (fetchError) {
    console.error('Error fetching statuses:', fetchError.message)
    process.exit(1)
  }

  if (!statuses || statuses.length === 0) {
    console.log('✅ No ratings to fix')
    process.exit(0)
  }

  console.log(`Found ${statuses.length} reading statuses with ratings`)
  console.log('\nCurrent rating distribution:')
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  statuses.forEach(s => {
    if (s.personal_rating) {
      distribution[s.personal_rating as keyof typeof distribution]++
    }
  })
  console.log(`  1 star: ${distribution[1]}`)
  console.log(`  2 stars: ${distribution[2]}`)
  console.log(`  3 stars: ${distribution[3]}`)
  console.log(`  4 stars: ${distribution[4]}`)
  console.log(`  5 stars: ${distribution[5]}`)

  // Update each rating (invert: 1→5, 2→4, 3→3, 4→2, 5→1)
  console.log('\nInverting ratings (German grading → stars)...')

  for (const status of statuses) {
    if (status.personal_rating) {
      const newRating = 6 - status.personal_rating

      const { error: updateError } = await supabase
        .from('user_reading_status')
        .update({ personal_rating: newRating })
        .eq('id', status.id)

      if (updateError) {
        console.error(`Error updating status ${status.id}:`, updateError.message)
        process.exit(1)
      }
    }
  }

  console.log(`✅ Updated ${statuses.length} ratings`)

  // Show new distribution
  const { data: updatedStatuses } = await supabase
    .from('user_reading_status')
    .select('personal_rating')
    .eq('user_id', userId)
    .not('personal_rating', 'is', null)

  const newDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  updatedStatuses?.forEach(s => {
    if (s.personal_rating) {
      newDistribution[s.personal_rating as keyof typeof newDistribution]++
    }
  })

  console.log('\nNew rating distribution:')
  console.log(`  1 star: ${newDistribution[1]} (was ${distribution[5]})`)
  console.log(`  2 stars: ${newDistribution[2]} (was ${distribution[4]})`)
  console.log(`  3 stars: ${newDistribution[3]} (was ${distribution[3]})`)
  console.log(`  4 stars: ${newDistribution[4]} (was ${distribution[2]})`)
  console.log(`  5 stars: ${newDistribution[5]} (was ${distribution[1]})`)

  console.log('\n✅ Ratings fixed successfully!')
}

fixRatings()
