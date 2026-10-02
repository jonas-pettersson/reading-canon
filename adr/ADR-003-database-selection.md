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

2. **Full-Text Search**: PostgreSQL has built-in full-text search capabilities (`tsvector`, `tsquery`) that satisfy FR-002 requirements (search across title, author, inclusion_rationale).

3. **Data Integrity**: Strong support for constraints, foreign keys, unique indexes, and transactions ensures data integrity.

4. **JSON Support**: Optional JSON columns (for flexible tags, external references) if needed, while maintaining relational structure.

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
- Indexes for performance:
  - Full-text search indexes on title, author_display_name, inclusion_rationale
  - Indexes on sort fields (year_sort, title, author)
  - Indexes on filter fields (primary_category, reading_status)
- Timestamps (created_at, updated_at) for audit trail

**Row-Level Security (RLS) policies will enforce:**
- Books: readable by all authenticated users, writable by curator only
- UserReadingStatus: users see only their own records
- InvitationTokens: curator only

See ADR-002 for full implementation approach.

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
