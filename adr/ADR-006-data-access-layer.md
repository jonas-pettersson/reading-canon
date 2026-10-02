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

**Full-text search:**
```typescript
const { data: results, error } = await supabase
  .from('books')
  .select('*')
  .or(`title.ilike.%${query}%,author_display_name.ilike.%${query}%,inclusion_rationale.ilike.%${query}%`)
```

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

### Custom React Hooks

Create reusable hooks for common operations:

```typescript
// src/hooks/useBooks.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('year_sort', { ascending: true })
      
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

Recommended approach:
- **React Query** (`@tanstack/react-query`) for server state (books, user data)
- **React Context** or **Zustand** for client state (UI state, filters)
- Supabase client for data fetching and mutations

React Query provides:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states
- Request deduplication

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

**Recommended Additions:**

1. **React Query** (`@tanstack/react-query`)
   - Server state management
   - Automatic caching and refetching
   - Optimistic updates

2. **Supabase Auth Helpers for React** (`@supabase/auth-helpers-react`)
   - React hooks for auth state
   - Session management

3. **Type Regeneration Script**
   ```json
   {
     "scripts": {
       "types:gen": "supabase gen types typescript --project-id <id> > src/types/database.types.ts"
     }
   }
   ```

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
