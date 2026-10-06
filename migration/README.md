# Migration Scripts

This directory contains scripts for migrating Excel data to the Supabase database.

## Files

- **`excel-parser.ts`** - Parses Excel files and maps columns to database schema
- **`migrate.ts`** - Core migration logic (can be imported and tested)
- **`run-migration.ts`** - CLI script to execute migrations
- **`create-test-data.ts`** - Utility to generate test Excel data
- **`verify-migration.test.ts`** - Integration tests for migration validation (ONE-TIME, not in regression suite)

## Usage

### 1. Test Migration (Task 5.2.1)

Create test data and run migration verification:

```bash
# Create test Excel file
npm run create-test-data

# Run automated verification tests (requires authentication)
npm run test:migration

# Or manually run migration with test data
npm run migrate migration/test-data.xlsx
```

**Prerequisites:**
- You must be logged into the application (have a valid session)
- `.env.local` must contain valid Supabase credentials

### 2. Production Migration (Task 5.2.2)

After test migration succeeds and manual validation passes:

```bash
# Run production migration
npm run migrate path/to/your/production-file.xlsx
```

## Migration Process

The migration script:

1. **Parses** the Excel file using `excel-parser.ts`
2. **Validates** required fields and reports errors/warnings
3. **Checks** for existing books (idempotent - safe to re-run)
4. **Inserts** new books in batch
5. **Maps** reading statuses to created book IDs
6. **Inserts** user reading status records
7. **Reports** final counts and any issues

## Excel Format

See `spec.md` Section 2.2 for complete column mappings.

### Required Columns
- `Title (EN)` - Book title (required)
- `Author` OR `Last Name` - Author information (required)

### Optional Columns
- `First Name` - Combined with Last Name for author_display_name
- `Original Title` - Title in original language
- `Year` - Publication year (flexible format: "1869", "8th century BC", "ca. 1200-1500")
- `Sort Time` - Numeric year for sorting
- `Category` - Primary category
- `Genre`, `Subject` - Combined into tags array
- `Original Language` - Original language of the work
- `Source` - Where you learned about this book
- `Comment` - Why this book is in the canon (→ inclusion_rationale)
- `Author Lifespan` - Author's life dates
- `Lib` - Ownership status (`X` = owned_physical, blank = not_owned)
- `Prio` - Complex mapping:
  - `x` → personal_priority = high
  - `1-5` → personal_rating = 1-5 stars
  - `-` → reading_status = reading
  - blank → NULL
- `Read` - Reading status (`X` = finished, blank = not_started)

## Verification Tests

The `verify-migration.test.ts` file contains integration tests that:

- ✅ Create test Excel data with edge cases
- ✅ Execute migration against real database
- ✅ Query database to verify results
- ✅ Clean up test data afterward
- ❌ **NOT included in regular test suite** (only run when explicitly requested)

Run with: `npm run test:migration`

**⚠️ Warning:** These tests modify the actual database! Only run when:
1. You're authenticated
2. You're ready to test the migration
3. You understand test data will be temporarily added then removed

## Idempotent Behavior

The migration is **idempotent** - you can safely run it multiple times:

- Books are matched by `(title + author_display_name)` (case-insensitive)
- Existing books are skipped (not duplicated)
- Only new books are inserted
- Migration report shows "N books already exist"

## Error Handling

If migration fails:
- Pre-migration validation errors → Aborts before database changes
- Book insertion errors → Transaction fails, no partial data
- Status insertion errors → Books inserted but statuses missing (can be fixed manually or by re-running)

Check the console output for detailed error messages.
