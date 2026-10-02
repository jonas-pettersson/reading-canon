# ADR-006: Data Access Layer

## Status

**ACCEPTED** - 2026-10-02

Determined by ADR-002 (Backend Architecture Approach).

## Context

The Reading Canon application needs a data access layer to interact with the PostgreSQL database from the React frontend. The backend is Supabase (ADR-002), which provides multiple options for data access.

### Requirements from Specification v1.4:

**Data Operations:**
- CRUD operations on Books, UserReadingStatus, ExternalReferences
- Full-text search (FR-002)
- Filtering and sorting (FR-003, FR-004)
- Complex queries (joins across entities)
- Real-time updates not required for MVP

**Non-Functional Requirements:**
- **NFR-043**: Type safety with compile-time type checking (Should Have)
- **NFR-001**: Book list load < 2 seconds
- **NFR-002**: Search results < 1 second

## Decision

**Supabase JavaScript Client (`@supabase/supabase-js`) with Generated TypeScript Types**

As determined in ADR-002, the data access layer will use Supabase's official JavaScript client library with TypeScript types generated from the database schema.

## Rationale

The Supabase client is the recommended choice because:

1. **Integrated Solution**: Official client designed specifically for Supabase, providing optimized access to PostgreSQL, Auth, and Storage.

2. **Type Safety**: Supabase CLI can generate TypeScript types directly from database schema, ensuring type safety across frontend-backend boundary (NFR-043).

3. **Automatic Type Inference**: Client methods use generated types for compile-time checking of queries, inserts, updates.

4. **Row-Level Security**: Client respects RLS policies automatically, enforcing authorization at database level (NFR-021, NFR-022).

5. **Simple API**: Intuitive, chainable API for queries:
   ```typescript
   const { data, error } = await supabase
     .from('books')
     .select('*')
     .order('year_sort', { ascending: true })
     .limit(100)
   ```

6. **Real-time Ready**: If real-time features are needed later (e.g., collaborative editing), client supports subscriptions without code changes.

7. **Authentication Integration**: Client handles auth tokens automatically, attaching JWT to all requests.

8. **No Backend Code**: All queries run directly from frontend to database, leveraging PostgreSQL's query planner and RLS.

## Implementation Details

### Type Generation

Generate TypeScript types from database schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

This creates a `Database` type with all tables, columns, and relationships.

### Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Example Queries

**Fetch all books:**
```typescript
const { data: books, error } = await supabase
  .from('books')
  .select('*')
  .order('year_sort', { ascending: true })

// books is typed as Database['public']['Tables']['books']['Row'][]
```

**Search (MVP 0 - ILIKE-based):**
```typescript
const { data: results, error } = await supabase
  .from('books')
  .select('*')
  .or(`title.ilike.%${query}%,title_original.ilike.%${query}%,author_display_name.ilike.%${query}%,inclusion_rationale.ilike.%${query}%`)
```

**Note on Search Strategy:** 

For MVP 0, search uses PostgreSQL's `ILIKE` operator (case-insensitive pattern matching) across four fields:
- `title` (required by FR-002)
- `title_original` (included per specification Q6)
- `author_display_name` (required by FR-002)
- `inclusion_rationale` (required by FR-002)

This approach is deliberately simplified for rapid MVP 0 validation with up to 1,000 books. With appropriate indexes on these columns (e.g., `CREATE INDEX idx_books_title_trgm ON books USING gin (title gin_trgm_ops)`), this strategy meets the <1 second search requirement (NFR-002) at expected scale.

**Migration Path:** If search quality or performance becomes inadequate, migrate to PostgreSQL full-text search using `tsvector` columns and `ts_query`. ADR-003 selected PostgreSQL partly for its full-text search capabilities, which remain available when needed. The migration would involve:
1. Add a generated `tsvector` column combining search fields
2. Create a GIN index on the search vector
3. Update queries to use `@@` operator instead of `ILIKE`
4. Optionally add ranking and relevance scoring

For MVP 0, the simpler approach avoids premature optimization while preserving a clear upgrade path.

**Fetch book with external references (join):**
```typescript
const { data: book, error } = await supabase
  .from('books')
  .select(`
    *,
    external_references (*)
  `)
  .eq('id', bookId)
  .single()

// book.external_references is typed automatically
```

**Insert new book (curator only, enforced by RLS):**
```typescript
const { data: newBook, error } = await supabase
  .from('books')
  .insert({
    title: 'The Iliad',
    author_display_name: 'Homer',
    year_published: '8th century BC',
    year_sort: -750
  })
  .select()
  .single()
```

**Update user reading status:**
```typescript
const { data, error } = await supabase
  .from('user_reading_status')
  .upsert({
    user_id: userId,
    book_id: bookId,
    reading_status: 'reading',
    started_at: new Date().toISOString()
  })
```

### Search, Filter, and Sort Responsibility

**Decision for MVP 0:** Perform all search, filter, and sort operations in PostgreSQL via Supabase queries

**Rationale:**
- Performance requirements (NFR-002: search <1 second) are achievable with indexed database queries
- Maintains single source of truth in database
- Leverages PostgreSQL's query optimization
- Reduces data transfer (send filtered results, not full collection)
- Supports future multi-user scenarios without client-side data exposure risks
- Collection size (<1,000 books) is well within PostgreSQL's efficient range

**Operations in Database:**
- **Search:** `ILIKE` queries across indexed text fields (see search strategy above)
- **Filter:** `WHERE` clauses on category, tags (array overlap), language, status, ownership
- **Sort:** `ORDER BY` with indexed columns (year_sort, title, author_display_name, priority, rating)
- **Pagination:** `LIMIT` and `OFFSET` if needed (likely unnecessary for <1,000 books)

**Operations in Browser:**
- **Filter/sort state management:** Track active filters and sort order in React state
- **Data presentation:** Transform database results for display
- **Optimistic updates:** TanStack Query provides client-side caching for perceived performance

**Example Query with Filters:**
```typescript
const { data: books, error } = await supabase
  .from('books')
  .select('*')
  .eq('primary_category', 'Philosophy')
  .overlaps('tags', ['ancient'])
  .order('year_sort', { ascending: true })
```

**Why Not Client-Side Filtering:**
- Would require fetching all books on every page load (wasteful for mobile users)
- Browser filtering would duplicate database filtering logic
- Database indexes provide better performance
- Filter state preserved in URL query params or React state, not through client-side data manipulation

For MVP 0, all query operations go through Supabase API to database. Client-side filtering is not needed and would add unnecessary complexity.

### Custom React Hooks

Create reusable hooks for common operations:

```typescript
// src/hooks/useBooks.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useBooks(filters?: {
  category?: string
  tags?: string[]
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: async () => {
      let query = supabase.from('books').select('*')
      
      // Apply filters in database
      if (filters?.category) {
        query = query.eq('primary_category', filters.category)
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,title_original.ilike.%${filters.search}%,author_display_name.ilike.%${filters.search}%,inclusion_rationale.ilike.%${filters.search}%`
        )
      }
      
      // Apply sorting in database
      const sortField = filters?.sortBy || 'year_sort'
      const ascending = filters?.sortOrder === 'asc'
      query = query.order(sortField, { ascending })
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useBook(bookId: string) {
  return useQuery({
    queryKey: ['books', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          external_references (*)
        `)
        .eq('id', bookId)
        .single()
      
      if (error) throw error
      return data
    }
  })
}
```

### State Management

**Recommended Implementation for MVP 0:**

Server state (books, reading status, user data) management can use one of:

1. **TanStack Query (React Query)** - *Recommended for MVP 0*
   - Automatic caching and background refetching
   - Built-in loading and error states
   - Request deduplication
   - Optimistic updates
   - Proven patterns for Supabase integration
   - Well-suited for this application's data-fetching patterns

2. **Direct Supabase client with React hooks** - *Alternative*
   - Manual state management using `useState`/`useEffect`
   - Simpler dependency tree but more boilerplate
   - Suitable if minimizing dependencies is a priority

**Client State (UI filters, form state, navigation):**
- React's built-in `useState` and `Context` for MVP 0
- Zustand or similar only if shared client state becomes complex

**Recommendation Rationale:** TanStack Query is recommended because it solves concrete problems at this application's scale (caching 1,000 book records, handling loading states, managing mutations) without requiring a learning curve disproportionate to its benefits. However, it is an *implementation choice*, not an architectural dependency — the Supabase client could be used directly if preferred.

For MVP 0, start with TanStack Query. If its abstraction proves unnecessary, it can be removed in favor of direct Supabase calls without changing the underlying architecture.

## Alternatives Considered

### Direct PostgreSQL Access (Rejected)

Not possible with Supabase architecture. Database is behind Supabase API.

### GraphQL via Supabase (Considered)

Supabase supports GraphQL, but REST API is simpler and sufficient for MVP. GraphQL could be considered if complex nested queries become common.

### Custom REST API (Rejected)

Would require building custom backend (see ADR-002 Express/tRPC options). Supabase auto-generated API is sufficient and eliminates backend code.

## Consequences

### Positive

- Type-safe database access (NFR-043)
- No backend data layer code to write or maintain
- Automatic authentication and authorization (RLS)
- Simple, intuitive API
- Generated types stay in sync with database schema
- Real-time capabilities available if needed
- React Query integration for optimal caching and UX

### Negative

- Must regenerate types when schema changes (can be automated in CI)
- Query API is Supabase-specific (migration would require rewriting queries)
- Complex joins may require multiple queries or SQL functions
- No compile-time query validation (only type checking of results)

### Neutral

- Learning Supabase query API (well-documented, similar to ORMs)
- Must understand RLS for proper authorization (secure by default)

## Related Tools

**Supporting Tools:**

1. **TanStack Query** (`@tanstack/react-query`) - *Recommended for MVP 0*
   - Server state management with caching
   - See State Management section above for rationale and alternatives

2. **Supabase Auth Helpers for React** (`@supabase/auth-helpers-react`) - *Optional*
   - React hooks for auth state
   - Convenience wrapper for session management
   - Can be replaced with direct `supabase.auth` calls if preferred

3. **Type Regeneration** - *Required*
   ```json
   {
     "scripts": {
       "types:gen": "supabase gen types typescript --project-id <id> > src/types/database.types.ts"
     }
   }
   ```
   Run after schema changes to keep TypeScript types synchronized with database.

## References

- [ADR-002: Backend Architecture Approach](./ADR-002-backend-architecture-approach.md)
- [ADR-003: Database Selection](./ADR-003-database-selection.md)
- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase CLI Type Generation](https://supabase.com/docs/guides/api/generating-types)
- [React Query Documentation](https://tanstack.com/query/latest)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)
