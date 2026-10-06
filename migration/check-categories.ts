import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
const curatorEmail = process.env.CURATOR_EMAIL!
const curatorPassword = process.env.CURATOR_PASSWORD!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables!')
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCategories() {
  console.log('Authenticating...')

  // Sign in as curator to bypass RLS
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: curatorEmail,
    password: curatorPassword,
  })

  if (authError) {
    console.error('Auth error:', authError.message)
    console.log('\nTrying without auth (will get empty results if RLS blocks)...\n')
  } else {
    console.log('✓ Authenticated successfully\n')
  }

  console.log('Fetching categories from database...\n')

  // First, check if we can connect and count books
  const { count, error: countError } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error counting books:', countError)
    return
  }

  console.log(`Total books in database: ${count}\n`)

  if (count === 0) {
    console.log('No books found! This could mean:')
    console.log('  1. Migration not completed')
    console.log('  2. RLS policies blocking access (need authentication)')
    console.log('  3. Wrong database')
    return
  }

  const { data, error } = await supabase
    .from('books')
    .select('primary_category')
    .order('primary_category')

  if (error) {
    console.error('Error:', error)
    return
  }

  // Get unique categories
  const categories = new Map<string, number>()
  data.forEach(book => {
    const cat = book.primary_category || '(null)'
    categories.set(cat, (categories.get(cat) || 0) + 1)
  })

  console.log('Categories in database:')
  console.log('=' .repeat(60))
  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .forEach(([category, count]) => {
      console.log(`  ${category.padEnd(40)} ${count} books`)
    })

  console.log('\n' + '='.repeat(60))
  console.log(`Total unique categories: ${categories.size}`)
  console.log(`Total books: ${data.length}`)

  // Compare with constants
  console.log('\n\nExpected categories from constants:')
  console.log('=' .repeat(60))
  const expectedCategories = [
    'Novel',
    'Play / Drama',
    'Poetry',
    'Philosophy',
    'History',
    'Religion / Theology',
    'Politics / Political Theory',
    'Science',
    'Essay / Non-fiction',
    'Biography / Memoir',
    'Anthology / Collection',
  ]

  expectedCategories.forEach(cat => {
    const count = categories.get(cat) || 0
    const status = count > 0 ? '✓' : '✗'
    console.log(`  ${status} ${cat.padEnd(40)} ${count} books`)
  })

  await supabase.auth.signOut()
}

checkCategories().catch(console.error)
