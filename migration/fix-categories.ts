import { createClient } from '@supabase/supabase-js'
import { CATEGORY_MAPPING, normalizeCategory } from './category-mapping'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
const curatorEmail = process.env.CURATOR_EMAIL!
const curatorPassword = process.env.CURATOR_PASSWORD!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables!')
  console.error('Requires: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, CURATOR_EMAIL, CURATOR_PASSWORD')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface CategoryUpdate {
  id: string
  title: string
  oldCategory: string | null
  newCategory: string | undefined
}

async function fixCategories() {
  console.log('Authenticating...')

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: curatorEmail,
    password: curatorPassword,
  })

  if (authError) {
    console.error('Auth error:', authError.message)
    process.exit(1)
  }

  console.log('✓ Authenticated successfully\n')

  console.log('Fetching all books with categories...\n')

  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, primary_category')
    .order('title')

  if (error) {
    console.error('Error fetching books:', error)
    return
  }

  console.log(`Total books: ${books.length}\n`)

  // Analyze and prepare updates
  const updates: CategoryUpdate[] = []
  const stats = {
    alreadyCorrect: 0,
    needsUpdate: 0,
    willBeNull: 0,
    unmappedCategories: new Set<string>(),
  }

  books.forEach(book => {
    const oldCategory = book.primary_category
    const newCategory = normalizeCategory(oldCategory)

    // Check if already correct
    if (oldCategory === newCategory) {
      stats.alreadyCorrect++
      return
    }

    // Track unmapped categories
    if (oldCategory && !newCategory) {
      stats.unmappedCategories.add(oldCategory)
      stats.willBeNull++
    } else if (newCategory !== oldCategory) {
      stats.needsUpdate++
    }

    updates.push({
      id: book.id,
      title: book.title,
      oldCategory,
      newCategory,
    })
  })

  // Report
  console.log('='.repeat(80))
  console.log('CATEGORY NORMALIZATION ANALYSIS')
  console.log('='.repeat(80))
  console.log(`Already correct:     ${stats.alreadyCorrect} books`)
  console.log(`Need update:         ${stats.needsUpdate} books`)
  console.log(`Will become null:    ${stats.willBeNull} books`)
  console.log(`Total to update:     ${updates.length} books`)
  console.log()

  if (stats.unmappedCategories.size > 0) {
    console.log('⚠️  Unmapped categories (will be set to null):')
    Array.from(stats.unmappedCategories).sort().forEach(cat => {
      const count = books.filter(b => b.primary_category === cat).length
      console.log(`  - "${cat}" (${count} books)`)
    })
    console.log()
  }

  // Show mapping examples
  console.log('Example mappings:')
  console.log('='.repeat(80))
  const examples = updates.slice(0, 10)
  examples.forEach(({ title, oldCategory, newCategory }) => {
    console.log(`  "${oldCategory || '(null)'}" → "${newCategory || '(null)'}": ${title.substring(0, 50)}`)
  })
  if (updates.length > 10) {
    console.log(`  ... and ${updates.length - 10} more`)
  }
  console.log()

  // Confirm before proceeding
  console.log('='.repeat(80))
  console.log('Ready to update categories in database.')
  console.log('This will modify', updates.length, 'book records.')
  console.log('='.repeat(80))
  console.log()

  // Apply updates
  console.log('Applying updates...\n')

  let successCount = 0
  let errorCount = 0

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('books')
      .update({ primary_category: update.newCategory || null })
      .eq('id', update.id)

    if (updateError) {
      console.error(`✗ Failed to update "${update.title}":`, updateError.message)
      errorCount++
    } else {
      successCount++
      if (successCount % 50 === 0) {
        console.log(`  Progress: ${successCount}/${updates.length}`)
      }
    }
  }

  console.log()
  console.log('='.repeat(80))
  console.log('CATEGORY FIX COMPLETE')
  console.log('='.repeat(80))
  console.log(`✓ Successfully updated: ${successCount} books`)
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount}`)
  }

  // Verify final state
  console.log()
  console.log('Verifying final state...\n')

  const { data: finalBooks } = await supabase
    .from('books')
    .select('primary_category')

  if (finalBooks) {
    const categoryCount = new Map<string, number>()
    finalBooks.forEach(book => {
      const cat = book.primary_category || '(null)'
      categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1)
    })

    console.log('Final category distribution:')
    console.log('='.repeat(80))
    Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat.padEnd(40)} ${count} books`)
      })
  }

  await supabase.auth.signOut()
}

fixCategories().catch(console.error)
