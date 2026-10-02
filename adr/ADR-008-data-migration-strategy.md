# ADR-008: Data Migration Strategy (Excel Import)

## Status

**ACCEPTED** - 2026-10-02

## Context

The Reading Canon application requires a one-time migration of existing book collection data from Excel to the PostgreSQL database (UC-004, Section 2.2 of specification).

### Requirements from Specification v1.4:

**Migration Requirements:**
- Import existing Excel collection (~100-1000 books) into database
- Map Excel columns to database schema (see spec section 2.2)
- Preserve original Excel values for audit/traceability (NFR-030, UC-004)
- Generate migration report with validation summary
- Handle unusual values and data quality issues
- Create canonical book records and curator's personal reading data
- Migrate external references if present
- Handle Genre + Subject → tags consolidation
- MVP 0 scope: one-time import for initial curator

### Excel Column Mapping:

| Excel Column | Database Mapping |
|--------------|------------------|
| Author, Last Name, First Name | books.author_display_name, family_name, given_name |
| Title (EN) | books.title |
| Original Title | books.title_original |
| Year | books.year_published |
| Sort Time | books.year_sort |
| Category | books.primary_category |
| Genre + Subject | books.tags (TEXT[] array) |
| Original Language | books.original_language |
| Source | books.source |
| Comment | books.inclusion_rationale |
| Author Lifespan | books.author_lifespan |
| External Links | external_references table (parse multiple if needed) |
| Lib | user_reading_status.ownership_status |
| Prio | Complex: maps to priority, rating, and status |
| Read | user_reading_status.reading_status |

## Decision

**Migration Implementation: Secure Local Node.js Script**

Execute migration as a trusted, one-time Node.js script run locally by the curator, using the Supabase service role key for privileged database access.

## Rationale

1. **One-Time Operation**: This is not a recurring workflow requiring production infrastructure
2. **Privileged Access Required**: Migration creates records on behalf of the curator user, requiring service-role permissions
3. **Local Execution is Secure**: Service role key stays in local environment, not exposed to browser or deployed code
4. **Validation and Reporting**: Script can validate data, report issues, and provide detailed logging
5. **Idempotency**: Script can be designed to be safely re-run if migration fails partway
6. **Developer Control**: Curator (who is also the developer) has full control over migration execution

## Implementation Architecture

### Migration Script Location

```
scripts/
└── migrate-excel/
    ├── migrate.ts              # Main migration logic
    ├── excel-parser.ts         # Parse Excel to typed objects
    ├── data-mapper.ts          # Map Excel data to database schema
    ├── validation.ts           # Pre-migration validation
    ├── report.ts               # Generate migration report
    ├── .env.local             # Service role key (gitignored)
    └── original-data-backup/  # Preserved original Excel for audit
```

### Execution Flow

1. **Pre-Migration:**
   - Copy original Excel file to `scripts/migrate-excel/original-data-backup/` for audit
   - Parse Excel into typed TypeScript objects
   - Run validation checks (required fields, data format, duplicate detection)
   - Generate pre-migration report with warnings

2. **Migration Transaction:**
   - Start PostgreSQL transaction
   - For each Excel row:
     - Create book record in `books` table
     - Parse and create external references in `external_references` table
     - Create curator's personal reading status in `user_reading_status` table
   - Commit transaction (or rollback on error)

3. **Post-Migration:**
   - Generate migration report:
     - Count of books imported
     - Count of external references created
     - Count of personal reading records created
     - List of validation warnings or unusual values
     - List of any skipped or failed records
   - Store report as `migration-report-YYYY-MM-DD.md`

### Security Model

**Service Role Key Handling:**
- Stored in `scripts/migrate-excel/.env.local` (gitignored)
- Loaded via `dotenv` for script execution only
- Never committed to source control
- Never deployed to Vercel or any public environment
- Only exists on curator's local machine during migration

**Script Access:**
```typescript
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Privileged key
  { auth: { persistSession: false } }
)
```

### Data Transformation Examples

**Author Name Consolidation:**
```typescript
function buildAuthorDisplayName(row: ExcelRow): string {
  if (row.Author) return row.Author
  if (row.LastName && row.FirstName) return `${row.LastName}, ${row.FirstName}`
  if (row.LastName) return row.LastName
  return 'Unknown'
}
```

**Tags Consolidation:**
```typescript
function buildTags(row: ExcelRow): string[] {
  const tags: string[] = []
  if (row.Genre) tags.push(...row.Genre.split(',').map(t => t.trim()))
  if (row.Subject) tags.push(...row.Subject.split(',').map(t => t.trim()))
  return [...new Set(tags)]  // Deduplicate
}
```

**Prio Column Parsing:**
```typescript
function parsePrioColumn(value: string | null): {
  priority?: 'high' | 'medium' | 'low'
  rating?: number
  status?: 'reading' | 'want_to_read'
} {
  if (!value) return {}
  if (value === 'x') return { priority: 'high' }
  if (value === '-') return { status: 'reading' }
  const rating = parseInt(value, 10)
  if (rating >= 1 && rating <= 5) return { rating }
  return {}
}
```

### Validation Checks

**Pre-Migration Validation:**
- Required fields present (title, author)
- year_sort is numeric where present
- primary_category matches controlled vocabulary (or tagged for curator review)
- URL format validation for external links
- Duplicate detection (warn, don't block)

**Runtime Validation:**
- Database constraints enforce data integrity
- Foreign key constraints ensure referential integrity
- Transaction rollback on any critical error

### Idempotency and Re-run Safety

**Approach:** Check for existing data before starting migration

```typescript
async function canRunMigration() {
  const { count } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
  
  if (count > 0) {
    console.error('Migration aborted: books table already contains data')
    console.error('Clear database manually before re-running migration')
    process.exit(1)
  }
}
```

Alternative: Use a migration_log table to track execution.

### Preserving Original Values

**Audit Preservation:**
- Original Excel file stored in `scripts/migrate-excel/original-data-backup/`
- Migration report documents transformation decisions
- Git commit of migration script, backup file, and report provides full audit trail

**No Runtime Audit Log:** The specification defers detailed change-tracking and audit logs. Migration traceability (preserving original Excel, migration report) is distinct from runtime audit logging. Standard `created_at`, `updated_at`, and `created_by_user_id` timestamps satisfy the specification's audit requirements. Detailed per-field change history is out of scope.

## Alternatives Considered

### Alternative 1: Web UI Upload (Rejected)

**Pros:**
- User-friendly interface
- No local script execution required

**Cons:**
- Requires implementing file upload UI
- Requires implementing server-side parsing and validation
- Requires Edge Function or backend endpoint with service role key
- More complex for one-time operation
- Risk of exposing service role key if implemented incorrectly

**Verdict:** Overkill for MVP 0 one-time migration

### Alternative 2: Manual SQL Script (Rejected)

**Pros:**
- Direct database control
- No additional code required

**Cons:**
- Tedious for 100-1000 records
- Error-prone manual data entry
- No validation or reporting
- No preservation of original Excel structure
- Complex transformations (Prio column, tags) difficult in SQL

**Verdict:** Not practical for this data volume

### Alternative 3: Database COPY Command (Rejected)

**Pros:**
- Fast bulk import

**Cons:**
- Requires CSV transformation of Excel
- Limited validation and transformation capabilities
- Cannot create related records in multiple tables
- No migration report generation
- Less idempotent

**Verdict:** Too rigid for complex data transformations required

## Consequences

### Positive

- One-time migration is simple, secure, and auditable
- Service role key never exposed outside local environment
- Full control over validation and error handling
- Detailed migration report for verification
- Original data preserved for audit
- Can be re-run if database is reset during development
- TypeScript provides type safety during transformation

### Negative

- Requires Node.js execution environment
- Not suitable for recurring imports (acceptable: this is one-time)
- Service role key must be managed carefully (but only needed once)
- Manual process (but only executed once)

### Implementation Steps

1. Create migration script directory structure
2. Install dependencies: `@supabase/supabase-js`, `xlsx` (Excel parser), `dotenv`
3. Obtain Supabase service role key from dashboard
4. Store service role key in `.env.local` (gitignored)
5. Implement Excel parsing logic
6. Implement data transformation and validation
7. Implement migration logic with transaction
8. Test migration on development database
9. Run migration on production database
10. Verify data integrity and generate report
11. Commit migration script, backup, and report to Git
12. Delete `.env.local` or rotate service role key if compromised

## References

- [Requirements Specification v1.4](../artifacts/spec.md) - Section 2.2 (Data Migration Mapping), UC-004
- [ADR-002: Backend Architecture Approach](./ADR-002-backend-architecture-approach.md)
- [ADR-003: Database Selection](./ADR-003-database-selection.md)
- [Supabase Service Role Key Documentation](https://supabase.com/docs/guides/auth/service-role-key)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)
