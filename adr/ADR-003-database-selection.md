# ADR-003: Database Selection

## Status

**ACCEPTED** - 2026-10-02

Determined by ADR-002 (Backend Architecture Approach).

## Context

The Reading Canon application requires a database to store the relational data model defined in specification v1.4, section 2.1:

- Books (canonical collection)
- Users (authentication and roles)
- UserReadingStatus (personal reading data)
- ExternalReferences (links per book)
- InvitationTokens (user invitations - MVP 1)
- BookRecommendations (user suggestions - Post-MVP)

The data model has:
- Complex relationships (one-to-many, foreign keys)
- Data integrity constraints (unique emails, unique user-book pairs)
- Full-text search requirements (FR-002)
- Filtering and sorting requirements (FR-003, FR-004)
- Progressive enrichment (optional/nullable fields)

## Decision

**PostgreSQL (via Supabase)**

As determined in ADR-002, the database will be PostgreSQL provided through Supabase.

## Rationale

PostgreSQL is the ideal choice for this application because:

1. **Relational Model Perfect Fit**: The specification defines a relational data model with foreign keys, constraints, and joins. PostgreSQL excels at relational data.

2. **Full-Text Search Capability**: PostgreSQL has built-in full-text search capabilities (`tsvector`, `tsquery`) available when needed. For MVP 0 (up to 1,000 books, single user), indexed `ILIKE` queries meet the <1 second search requirement (NFR-002). PostgreSQL's full-text search provides a clear migration path if search quality or performance needs improve.

3. **Data Integrity**: Strong support for constraints, foreign keys, unique indexes, and transactions ensures data integrity.

4. **Array and JSON Support**: PostgreSQL arrays for simple multi-value fields (e.g., tags), JSONB for structured optional data if needed, while maintaining relational structure.

5. **Mature and Stable**: PostgreSQL is battle-tested, well-documented, and has a large community.

6. **Performance**: Excellent performance with proper indexing for the expected scale (<1000 books, <10 concurrent users).

7. **Standard SQL**: Using standard SQL makes the schema portable if migration is ever needed.

8. **Migration Support**: PostgreSQL migration tools make Excel data import (UC-004) straightforward.

## Alternatives Considered

Since this decision was made as part of ADR-002 (Supabase), alternatives were evaluated at the backend architecture level. See ADR-002 for full analysis.

Brief comparison:
- **MongoDB**: Not suitable - relational model with joins doesn't map well to document structure
- **SQLite**: Possible for MVP 0 (single user) but wouldn't scale to MVP 1 (multi-user, concurrent access)
- **MySQL**: Viable alternative but PostgreSQL has better full-text search and JSON support

## Consequences

### Positive

- Perfect match for relational data model in specification
- Built-in full-text search capabilities
- Strong data integrity guarantees
- Excellent performance for expected scale
- Standard SQL is portable and well-understood
- Large ecosystem of tools and libraries
- Managed by Supabase (no operational overhead)

### Negative

- Requires learning SQL and relational database concepts (if unfamiliar)
- Schema changes require migrations (but this is good practice)
- More structured than NoSQL (but specification requires this structure)

### Implementation Details

**Schema will include:**
- Tables matching specification section 2.1 entities
- Foreign key constraints for relationships
- Unique constraints (email, user+book pairs)
- **Tags storage:** PostgreSQL text array (`TEXT[]`)
  - Simple, native PostgreSQL type
  - Supports multi-value tags per book
  - Filterable with `&&` (overlap) operator: `tags && ARRAY['philosophy', 'ancient']`
  - Indexable with GIN index for efficient tag-based filtering
  - No need for normalized tags table at expected scale (<1,000 books, limited tag vocabulary)
  - Migration-ready: Excel Genre + Subject columns combine into tags array
- Timestamps (created_at, updated_at) for managed records

**Database Indexes:**

The following indexes are required for meeting performance requirements (NFR-001: book list load <2s, NFR-002: search <1s):

```sql
-- Books table: Core sorting and filtering
CREATE INDEX idx_books_year_sort ON books (year_sort);
CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author_display_name ON books (author_display_name);
CREATE INDEX idx_books_primary_category ON books (primary_category);

-- Books table: Tags filtering (array overlap queries)
CREATE INDEX idx_books_tags ON books USING gin (tags);

-- Books table: Search performance (ILIKE for MVP 0)
-- Option 1: B-tree pattern indexes (supports prefix LIKE queries)
CREATE INDEX idx_books_title_pattern ON books (title text_pattern_ops);
CREATE INDEX idx_books_author_pattern ON books (author_display_name text_pattern_ops);

-- Option 2: Trigram indexes (better for arbitrary substring search, recommended)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING gin (author_display_name gin_trgm_ops);
CREATE INDEX idx_books_rationale_trgm ON books USING gin (inclusion_rationale gin_trgm_ops);

-- User reading status: Core queries
CREATE INDEX idx_user_reading_status_user_id ON user_reading_status (user_id);
CREATE INDEX idx_user_reading_status_book_id ON user_reading_status (book_id);
CREATE INDEX idx_user_reading_status_reading_status ON user_reading_status (reading_status);
CREATE INDEX idx_user_reading_status_ownership_status ON user_reading_status (ownership_status);
-- CREATE INDEX idx_user_reading_status_personal_priority ON user_reading_status (personal_priority); -- REMOVED 2026-10-06

-- User reading status: Composite index for common filter pattern
CREATE INDEX idx_user_reading_status_user_status 
  ON user_reading_status (user_id, reading_status);

-- External references: Foreign key lookup
CREATE INDEX idx_external_references_book_id ON external_references (book_id);

-- Profiles: Role checks (if using MVP 1 role-based RLS)
CREATE INDEX idx_profiles_role ON profiles (role);
```

**Search Strategy Notes:**
- MVP 0 uses ILIKE-based search with trigram indexes (gin_trgm_ops recommended)
- If search performance is insufficient, migrate to full-text search (tsvector/tsquery)
- See ADR-006 for search implementation and migration path

**When to Migrate from ILIKE to Full-Text Search:**

Trigger migration when any of these conditions occur:

1. **Performance Violation**: Search response time exceeds 1 second (NFR-002 violation)
   - Measure via Supabase performance monitoring
   - Measure via browser performance timing (Navigation Timing API)
   - Track user feedback on search speed

2. **Scale Threshold**: Collection size approaches 2,000-5,000 books
   - ILIKE with trigram indexes typically degrades at this scale
   - Full-text search scales better to larger collections

3. **Quality Issues**: Search quality complaints from users
   - ILIKE doesn't handle typos or fuzzy matching
   - No relevance ranking (all matches equal weight)
   - Full-text search provides ranking and better match quality

**Testing During MVP 0:**
Measure search performance at collection size milestones:
- 100 books (initial)
- 500 books (mid-scale)
- 1,000 books (MVP 0 target)

If performance meets NFR-002 at 1,000 books, ILIKE is sufficient for MVP 0 and MVP 1.

**Migration Effort Estimate**: 4-8 hours
- Add tsvector generated column combining search fields
- Create GIN index on tsvector column
- Update queries to use `@@` operator instead of ILIKE
- Add ranking with `ts_rank` for relevance sorting
- Test performance and quality

**Tags Implementation Decision:**

Use PostgreSQL `TEXT[]` array for tags rather than:
- **Normalized tags table:** Unnecessary complexity for <1,000 books. Array queries with GIN index perform well at this scale.
- **JSONB:** Arrays are simpler and better supported by PostgreSQL array operators.

This supports:
- Multiple tag assignment per book
- Filtering books matching any selected tag (FR-003: "show books matching any selected tag")
- Combining Genre and Subject from Excel into unified tags (spec section 2.2)
- Future tag management (autocomplete, tag cloud) without schema changes

**Migration Example:**
```sql
-- Excel Genre="Novel", Subject="Gothic" → tags=['Novel', 'Gothic']
UPDATE books SET tags = ARRAY['Novel', 'Gothic'] WHERE ...;

-- Filter books with tag "philosophy" or "politics"
SELECT * FROM books WHERE tags && ARRAY['philosophy', 'politics'];
```

**Row-Level Security (RLS) policies will enforce:**

For comprehensive examples, see ADR-004. Key security principles:

1. **Separate policies by operation**: Use distinct policies for SELECT, INSERT, UPDATE, DELETE
2. **Include WITH CHECK clauses**: Prevent users from inserting/updating records they cannot select
3. **Prevent cross-user data modification**: Ensure `user_reading_status.user_id = auth.uid()` in both USING and WITH CHECK
4. **Protect canonical data**: Only curator can INSERT/UPDATE/DELETE books and external_references
5. **Avoid metadata-based authorization**: Roles queried from `public.profiles` table, not user-editable metadata

**MVP 0 vs MVP 1 RLS:**
- MVP 0: Simplified policies (single user, auth check sufficient)
- MVP 1: Role-aware policies querying `profiles.role` for curator vs reader distinction

**Critical Security Notes:**
- RLS policies apply to ALL access, including direct SQL queries
- Test policies thoroughly to prevent data leakage or unauthorized modification
- Use `SECURITY DEFINER` functions carefully (they bypass RLS)
- Never expose Supabase service role key to browser code

See ADR-002 and ADR-004 for implementation details and complete policy examples.

## Duplicate Book Handling Strategy

**Context:** The specification states books are uniquely identifiable, but only `title` and `author_display_name` are required. The application does not model editions separately.

**Decision for MVP 0:** Soft duplicate detection without rigid database constraints

**Rationale:**
- A strict unique constraint on (title, author) would reject legitimate cases (same title by different authors, author name variants, translation variations)
- The curator is the sole data entry point for MVP 0 and can make informed judgment calls
- A manually curated collection of ~1,000 books is manageable without automated enforcement

**Implementation:**
1. **No database unique constraint** on (title, author_display_name)
2. **Optional curator-side duplicate warning** (can be deferred):
   - Check for similar title+author when adding books
   - Show warning with existing book details
   - Curator confirms or cancels addition
3. **Curator judgment** determines whether entries are duplicates or distinct works

**Example Legitimate Non-Duplicates:**
- Same title, different authors
- Author name variants ("Tolstoy" vs "Tolstoy, Leo")
- Original vs translated title representations

For MVP 0, explicit duplicate detection can be deferred entirely. The curator manually checks before adding. Add optional warning system if duplicates become problematic in practice.

## References

- [ADR-002: Backend Architecture Approach](./ADR-002-backend-architecture-approach.md) - Primary decision document
- [Requirements Specification v1.4](../artifacts/spec.md) - Section 2.1 (Data Model)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)
