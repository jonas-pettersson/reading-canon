# MVP 0 Implementation Plan

**Project:** Reading Canon  
**Phase:** MVP 0 - Single User Validation  
**Goal:** Prove it's better than Excel for curator's personal use  
**Target:** Working localhost application with Excel data migrated  
**Date Created:** 2026-10-02  
**Version:** 1.1  
**Last Updated:** 2026-10-07 (Phase 6 restructure: Integrated critical styling fixes)

---

## Recent Changes (2026-10-07) - Version 1.1

**Phase 6 Restructure:** Integrated critical styling bug fixes discovered during UX investigation.

**Key Changes:**

1. **New Task 6.0.1 (Critical):** Fix double/triple padding bugs in EditBookPage, BookDetailPage, and BookDetail component. These bugs create excessive whitespace (4rem instead of 2rem).

2. **New Task 6.0.2 (Critical):** Convert 7 pages from broken Tailwind classes to working scoped CSS. Tailwind CSS is not installed, so all Tailwind classes are non-functional. Converts to CSS variables approach (already used successfully in 13+ files).

3. **Task Reordering:** Moved Task 6.1.4 (Responsive Design Testing) earlier in sequence - must test responsive behavior AFTER styling is fixed, not before.

4. **Optional Tasks:** Marked Tasks 6.1.1 (Empty States) and 6.1.5 (Settings Page) as optional/deferrable. Core validation can proceed without them. Saves 5 hours if time-constrained.

5. **Effort Adjustment:** Phase 6 increased from 2-3 days to 3-4 days (adds 6-8 hours for styling fixes, reduces 5 hours for optional tasks = net +1-3 hours).

**Rationale:**
- Critical styling bugs block proper validation of responsive design and accessibility
- Must fix bugs before testing can validate correct behavior
- No changes to requirements (UX was always in spec.md UX-001 through UX-011)
- Styling approach (CSS variables + scoped CSS) already proven in 13+ existing files

**Impact on Timeline:**
- Minimal: Adds 1 day to Phase 6 (critical work that must be done)
- Optional tasks provide flexibility to maintain original timeline if needed

---

## Recent Changes (2026-10-02)

**Alignment Update:** Resolved final inconsistencies with spec.md v1.4 and ADRs.

**Key Changes:**
1. **Category Vocabulary (Task 0.2.6):** Updated PRIMARY_CATEGORIES to match spec.md v1.4 Section 2.1 exactly (Novel, Play / Drama, Poetry, Philosophy, History, Religion / Theology, Politics / Political Theory, Science, Essay / Non-fiction, Biography / Memoir, Anthology / Collection)

2. **Search Indexing (Task 0.2.1):** Replaced to_tsvector full-text search with pg_trgm trigram indexes per ADR-003 recommendation for MVP0 (ILIKE-based search with migration path to full-text if needed)

3. **Reading Status Filtering (Task 2.1.1):** Clarified that reading_status/ownership_status filtering uses client-side approach (fetch books + fetch user_reading_status separately, join/filter in client with useMemo) - simpler for MVP0, works well for <1000 books

4. **Duplicate Detection (Task 3.1.2):** Simplified to case-insensitive exact match (removed fuzzy matching complexity) - goal is preventing accidental duplicates, not sophisticated record matching. Reduced effort from M (4h) to S (2h).

5. **Priority Sorting Scope (Tasks 2.2.3, 4.2.4):** Clarified that priority sorting does NOT apply to general Collection View (most books don't have priority). Priority sorting is PRIMARY use case in Reading Dashboard (Want to Read section sorted by priority High→Medium→Low→None).

6. **Settings Page (Task 6.1.5):** Confirmed minimal scope for MVP0 per UX-001 (user profile display, logout button only - no preferences/editing). Effort S (2h).

**Consistency Improvements:**
- All query examples follow ADR-006 patterns (Supabase JavaScript client, React Query, generated TypeScript types)
- Client-side filtering approach consistently applied for user_reading_status joins
- Sort options scoped appropriately (Collection View: title/author/year; Reading Dashboard: priority)
- Test descriptions updated to reflect implementation approach

---

## Success Criteria Reminder

Before considering MVP 0 complete, these must be validated:
- ✅ SC-001: Curator prefers application over Excel
- ✅ SC-002: Deciding what to read next is easier
- ✅ SC-003: Updating reading progress is easier
- ✅ SC-007: Performance remains acceptable

---

## Testing Strategy Integration

**TDD Approach per Task Type:**
1. **Business Logic** → Test-first (strict TDD): Write test → Red → Green → Refactor
2. **React Components** → Test alongside (same session): Component + tests before moving on
3. **RLS Policies** → Security-first testing: Test immediately after writing policy
4. **User Flows** → Integration tests after components exist
5. **Enforcement** → Pre-commit hooks, CI pipeline, coverage thresholds (70%+)

**Rule:** No code merged without tests. Zero "TODO: test later" debt.

---

## Task Tracking Approach

**Recommended Tools:**
- **GitHub Issues** with labels (phase-0, phase-1, testing, database, etc.)
- **GitHub Projects** (Kanban board): Backlog → In Progress → In Review → Done
- **This Document** as the master plan reference

**Task States:**
- 🟦 **Not Started** - Task defined but not begun
- 🟨 **In Progress** - Active work happening
- 🟩 **Done** - Tests passing, code reviewed, merged
- 🟥 **Blocked** - Waiting on dependency or external factor

---

## Effort Estimation Guide

- **XS (0.5-1 hour)**: Simple config, single test case
- **S (2-4 hours)**: Small component, simple business logic
- **M (1 day)**: Complex component, multiple related tests
- **L (2-3 days)**: Feature with multiple components and integration
- **XL (1 week)**: Major feature with backend + frontend + comprehensive testing

**Notes:**
- Estimates include test writing time
- First-time setup tasks may take longer
- Buffer 20% for learning and unexpected issues

---

## Phase 0: Project Foundation (3-4 days)

**Goal:** Working development environment with basic infrastructure

### 0.1: Environment Setup

#### Task 0.1.1: Create Supabase Project
**Effort:** XS (1 hour)  
**Dependencies:** None  
**TDD:** N/A (configuration)

**Steps:**
1. Sign up for Supabase account (if needed)
2. Create new project: "reading-canon"
3. Note project URL and anon key
4. Save database connection string
5. Configure project settings (timezone, JWT expiry)

**Done Criteria:**
- [ ] Supabase project created and accessible
- [ ] Project credentials saved securely (not in git)
- [ ] Database dashboard accessible

---

#### Task 0.1.2: Initialize Frontend Project
**Effort:** S (2 hours)  
**Dependencies:** None  
**TDD:** N/A (setup), but configure test infrastructure

**Note:** Working within existing git repository at `C:\dev\reading-canon`

**Steps:**
1. Run `npm create vite@latest . -- --template react-ts` (in repository root, or create a subdirectory if preferred)
2. Update `.gitignore` to add frontend-specific entries:
   ```
   # Frontend
   node_modules/
   .env.local
   dist/
   .DS_Store
   ```
3. Configure TypeScript (strict mode, paths in `tsconfig.json`)
4. Install base dependencies:
   ```bash
   npm install @supabase/supabase-js
   npm install react-router-dom
   npm install @tanstack/react-query
   ```
5. Install dev dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   npm install -D @testing-library/user-event jsdom
   npm install -D @vitest/ui
   ```
6. Configure Vitest (`vitest.config.ts`)
7. Create basic folder structure:
   ```
   src/
     components/
     features/
     hooks/
     lib/
     types/
     utils/
     App.tsx
     main.tsx
   ```

**Done Criteria:**
- [ ] Vite project created and running (`npm run dev`)
- [ ] TypeScript strict mode enabled
- [ ] `.gitignore` updated with frontend entries
- [ ] Test infrastructure configured (can run `npm test`)
- [ ] Sample test passing (Hello World component test)

---

#### Task 0.1.3: Configure Supabase Client
**Effort:** XS (1 hour)  
**Dependencies:** 0.1.1, 0.1.2  
**TDD:** N/A (configuration, but test connection)

**Steps:**
1. Create `.env.local` with Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Create `src/lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```
3. Create connection test script
4. Verify connection works

**Done Criteria:**
- [ ] Supabase client configured
- [ ] Environment variables working
- [ ] Test connection successful
- [ ] `.env.local` in `.gitignore`

---

#### Task 0.1.4: Setup CI/CD Pipeline
**Effort:** M (4 hours)  
**Dependencies:** 0.1.2  
**TDD:** N/A (infrastructure)

**Steps:**
1. Create `.github/workflows/ci.yml`:
   - Run on pull request and push to main
   - Install dependencies
   - Run linter (ESLint)
   - Run type check
   - Run tests with coverage
   - Fail if coverage < 70%
2. Configure pre-commit hooks (husky + lint-staged):
   - Run ESLint on staged files
   - Run TypeScript type check
   - Run tests for changed files
3. Test pipeline with dummy commit

**Done Criteria:**
- [ ] GitHub Actions workflow running
- [ ] Pre-commit hooks preventing bad commits
- [ ] Coverage threshold enforced
- [ ] All checks passing on main branch

---

### 0.2: Database Schema (MVP 0 Subset)

#### Task 0.2.1: Create Books Table Migration
**Effort:** M (4 hours)  
**Dependencies:** 0.1.1  
**TDD:** Write test cases for schema constraints

**Steps:**
1. Install Supabase CLI locally
2. Initialize Supabase migrations: `supabase init`
3. Create migration file: `supabase migration new create_books_table`
4. Write SQL migration for `books` table:
   ```sql
   create table public.books (
     id uuid default gen_random_uuid() primary key,
     title text not null,
     author_display_name text not null,
     given_name text,
     family_name text,
     title_original text,
     year_published text,
     year_sort integer,
     primary_category text,
     tags text[],
     original_language text,
     source text,
     inclusion_rationale text,
     author_lifespan text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
     created_by_user_id uuid references auth.users(id)
   );
   
   -- Enable pg_trgm extension for trigram-based search (ADR-003)
   create extension if not exists pg_trgm;
   
   -- Trigram indexes for ILIKE pattern matching (recommended by ADR-003 for MVP0)
   create index books_title_trgm_idx on public.books using gin (title gin_trgm_ops);
   create index books_title_original_trgm_idx on public.books using gin (title_original gin_trgm_ops);
   create index books_author_trgm_idx on public.books using gin (author_display_name gin_trgm_ops);
   create index books_rationale_trgm_idx on public.books using gin (inclusion_rationale gin_trgm_ops);
   
   -- Standard indexes for sorting/filtering
   create index books_year_sort_idx on public.books(year_sort);
   create index books_primary_category_idx on public.books(primary_category);
   
   -- Note: Full-text search (to_tsvector) can be added later if ILIKE performance
   -- becomes inadequate per ADR-003 migration guidance.
   
   -- Updated_at trigger
   create trigger set_books_updated_at before update on public.books
     for each row execute function moddatetime(updated_at);
   ```
5. Test migration locally: `supabase db reset`
6. Write schema validation tests (check constraints, indexes exist)

**Done Criteria:**
- [ ] Migration file created and tested
- [ ] All required columns present
- [ ] Indexes created for search/sort performance
- [ ] Updated_at trigger working
- [ ] Schema constraints validated with tests
- [ ] Migration applied to Supabase project

---

#### Task 0.2.2: Create User Reading Status Table Migration
**Effort:** M (4 hours)  
**Dependencies:** 0.2.1  
**TDD:** Write constraint tests

**Steps:**
1. Create migration: `supabase migration new create_user_reading_status_table`
2. Write SQL migration for `user_reading_status` table:
   ```sql
   create type reading_status_enum as enum (
     'not_started', 'want_to_read', 'reading', 'paused', 'finished', 'abandoned'
   );
   
   create type ownership_status_enum as enum (
     'not_owned', 'ordered', 'owned_physical', 'owned_digital', 'borrowed'
   );
   
   create type priority_enum as enum ('high', 'medium', 'low');
   
   create table public.user_reading_status (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id) on delete cascade not null,
     book_id uuid references public.books(id) on delete cascade not null,
     reading_status reading_status_enum default 'not_started' not null,
     personal_priority priority_enum,
     ownership_status ownership_status_enum default 'not_owned' not null,
     personal_notes text,
     personal_rating integer check (personal_rating >= 1 and personal_rating <= 5),
     started_at timestamp with time zone,
     completed_at timestamp with time zone,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
     
     -- Ensure one record per user per book
     unique(user_id, book_id)
   );
   
   -- Indexes
   create index user_reading_status_user_id_idx on public.user_reading_status(user_id);
   create index user_reading_status_book_id_idx on public.user_reading_status(book_id);
   create index user_reading_status_reading_status_idx on public.user_reading_status(reading_status);
   
   -- Updated_at trigger
   create trigger set_user_reading_status_updated_at before update on public.user_reading_status
     for each row execute function moddatetime(updated_at);
   ```
3. Test migration locally
4. Write validation tests (check constraints, unique constraint)

**Done Criteria:**
- [ ] Migration created and applied
- [ ] Enums created for controlled values
- [ ] Unique constraint enforced (user + book)
- [ ] Rating constraint validated (1-5)
- [ ] Foreign keys working
- [ ] Tests validate constraints

---

#### Task 0.2.3: Create External References Table Migration
**Effort:** S (2 hours)  
**Dependencies:** 0.2.1  
**TDD:** Test cascade deletes and unique constraints

**Steps:**
1. Create migration: `supabase migration new create_external_references_table`
2. Write SQL migration:
   ```sql
   create table public.external_references (
     id uuid default gen_random_uuid() primary key,
     book_id uuid references public.books(id) on delete cascade not null,
     url text not null,
     link_text text,
     reference_type text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     created_by_user_id uuid references auth.users(id),
     
     -- Prevent duplicate URLs for same book
     unique(book_id, url)
   );
   
   -- Index
   create index external_references_book_id_idx on public.external_references(book_id);
   ```
3. Test cascade delete (deleting book deletes references)
4. Test unique constraint (duplicate URL per book fails)

**Done Criteria:**
- [ ] Migration created and applied
- [ ] Cascade delete working
- [ ] Unique constraint enforced
- [ ] Tests validate behavior

---

#### Task 0.2.4: Create Row-Level Security (RLS) Policies - MVP 0
**Effort:** L (6 hours)  
**Dependencies:** 0.2.1, 0.2.2, 0.2.3  
**TDD:** Security-first testing (test immediately)

**Steps:**
1. Enable RLS on all tables:
   ```sql
   alter table public.books enable row level security;
   alter table public.user_reading_status enable row level security;
   alter table public.external_references enable row level security;
   ```
2. Create policies for MVP 0 (single authenticated user):
   ```sql
   -- Books: Authenticated users can read, insert, update, delete
   create policy "Authenticated users can view books"
     on public.books for select
     to authenticated
     using (true);
   
   create policy "Authenticated users can insert books"
     on public.books for insert
     to authenticated
     with check (true);
   
   create policy "Authenticated users can update books"
     on public.books for update
     to authenticated
     using (true);
   
   create policy "Authenticated users can delete books"
     on public.books for delete
     to authenticated
     using (true);
   
   -- User Reading Status: Users can only access their own data
   create policy "Users can view their own reading status"
     on public.user_reading_status for select
     to authenticated
     using (auth.uid() = user_id);
   
   create policy "Users can insert their own reading status"
     on public.user_reading_status for insert
     to authenticated
     with check (auth.uid() = user_id);
   
   create policy "Users can update their own reading status"
     on public.user_reading_status for update
     to authenticated
     using (auth.uid() = user_id);
   
   create policy "Users can delete their own reading status"
     on public.user_reading_status for delete
     to authenticated
     using (auth.uid() = user_id);
   
   -- External References: Same as books for MVP 0
   create policy "Authenticated users can view external references"
     on public.external_references for select
     to authenticated
     using (true);
   
   create policy "Authenticated users can manage external references"
     on public.external_references for all
     to authenticated
     using (true);
   ```
3. Write comprehensive RLS tests using Supabase test users:
   
   **Required Test Scenarios:**
   
   a. **Books Table Tests:**
   - ✅ Authenticated user can read books
   - ✅ Authenticated user can insert books (MVP 0)
   - ✅ Authenticated user can update books (MVP 0)
   - ✅ Authenticated user can delete books (MVP 0)
   - ✅ Anonymous (unauthenticated) user CANNOT read books
   - ✅ Anonymous user CANNOT insert/update/delete books
   
   b. **User Reading Status Tests:**
   - ✅ User A can read their own reading_status records
   - ✅ User A CANNOT read User B's reading_status records
   - ✅ User A can insert reading_status for themselves
   - ✅ User A CANNOT insert reading_status for User B
   - ✅ User A can update their own reading_status
   - ✅ User A CANNOT update User B's reading_status
   - ✅ User A can delete their own reading_status
   - ✅ User A CANNOT delete User B's reading_status
   - ✅ Anonymous user CANNOT access any reading_status
   
   c. **External References Tests:**
   - ✅ Authenticated user can read external_references
   - ✅ Authenticated user can manage external_references (MVP 0)
   - ✅ Anonymous user CANNOT access external_references
   
   **Test Implementation Example:**
   ```typescript
   // Create two test users
   const userA = await createTestUser('user-a@test.com')
   const userB = await createTestUser('user-b@test.com')
   
   // Test: User A cannot read User B's reading status
   const statusForUserB = await insertReadingStatus(userB.id, bookId, 'reading')
   const resultAsUserA = await supabaseClientA
     .from('user_reading_status')
     .select('*')
     .eq('id', statusForUserB.id)
   
   expect(resultAsUserA.data).toHaveLength(0) // Should not see User B's data
   ```

**Done Criteria:**
- [ ] RLS enabled on all tables
- [ ] Policies created and applied
- [ ] Comprehensive RLS test suite written with mock users
- [ ] All books table policies tested (authenticated + anonymous)
- [ ] All user_reading_status isolation tests passing (User A vs User B)
- [ ] All external_references policies tested
- [ ] Anonymous requests blocked for ALL tables
- [ ] Security verified: users can only see their own personal data
- [ ] Test coverage includes both positive (allowed) and negative (blocked) cases

---

#### Task 0.2.5: Generate TypeScript Types
**Effort:** XS (1 hour)  
**Dependencies:** 0.2.4  
**TDD:** N/A (code generation)

**Steps:**
1. Run Supabase type generation:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
   ```
2. Create helper types in `src/types/database.ts`:
   ```typescript
   import { Database } from './supabase'
   
   export type Book = Database['public']['Tables']['books']['Row']
   export type BookInsert = Database['public']['Tables']['books']['Insert']
   export type BookUpdate = Database['public']['Tables']['books']['Update']
   
   export type UserReadingStatus = Database['public']['Tables']['user_reading_status']['Row']
   export type UserReadingStatusInsert = Database['public']['Tables']['user_reading_status']['Insert']
   export type UserReadingStatusUpdate = Database['public']['Tables']['user_reading_status']['Update']
   
   export type ExternalReference = Database['public']['Tables']['external_references']['Row']
   ```
3. Verify types compile

**Done Criteria:**
- [ ] Types generated successfully
- [ ] Helper types created
- [ ] TypeScript compilation succeeds
- [ ] Types match database schema

---

#### Task 0.2.6: Create Shared Constants
**Effort:** S (2 hours)  
**Dependencies:** 0.2.5  
**TDD:** Test alongside

**Steps:**
1. Create `src/constants/categories.ts` with controlled vocabulary from spec:
   ```typescript
   /**
    * Controlled vocabulary for primary_category field
    * Based on Specification v1.4 Section 2.1
    * 
    * Note: Additional values may be added by curator as needed per spec.
    */
   export const PRIMARY_CATEGORIES = [
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
     'Anthology / Collection'
   ] as const
   
   export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number]
   ```
2. Create `src/constants/index.ts` for other shared constants:
   ```typescript
   export * from './categories'
   
   // Reading status values (matching database enum)
   export const READING_STATUSES = [
     'not_started',
     'want_to_read',
     'reading',
     'paused',
     'finished',
     'abandoned'
   ] as const
   
   // Ownership status values (matching database enum)
   export const OWNERSHIP_STATUSES = [
     'not_owned',
     'ordered',
     'owned_physical',
     'owned_digital',
     'borrowed'
   ] as const
   
   // Priority values (matching database enum)
   export const PRIORITIES = ['high', 'medium', 'low'] as const
   ```
3. Write tests to verify constants match database enums
4. Tests → Green

**Done Criteria:**
- [ ] Constants file created with primary categories from spec
- [ ] Type-safe exports using `as const`
- [ ] Constants match database enums
- [ ] Tests validate consistency
- [ ] Ready for use in forms, filters, validation

---

### Phase 0 Done Criteria
- [ ] Development environment fully configured
- [ ] Database schema deployed (books, user_reading_status, external_references)
- [ ] RLS policies tested and enforced
- [ ] TypeScript types generated
- [ ] Shared constants created with controlled vocabulary
- [ ] CI/CD pipeline running
- [ ] Pre-commit hooks preventing bad commits

---

## Phase 1: Authentication (2-3 days)

**Goal:** Single curator can log in/out securely

### 1.1: Authentication Context and Hooks

#### Task 1.1.1: Create Auth Context Provider
**Effort:** M (4 hours)  
**Dependencies:** 0.1.3  
**TDD:** Test-first for auth state management

**Steps:**
1. **Write tests first** (`src/lib/auth.test.tsx`):
   - Test initial state is loading
   - Test successful login updates user state
   - Test logout clears user state
   - Test session persistence on page reload
   - Test auth state change listeners work
2. Create `src/lib/auth-context.tsx`:
   ```typescript
   import { createContext, useContext, useEffect, useState } from 'react'
   import { User, Session } from '@supabase/supabase-js'
   import { supabase } from './supabase'
   
   interface AuthContextType {
     user: User | null
     session: Session | null
     loading: boolean
     signIn: (email: string, password: string) => Promise<void>
     signOut: () => Promise<void>
   }
   
   const AuthContext = createContext<AuthContextType>(undefined!)
   
   export function AuthProvider({ children }: { children: React.ReactNode }) {
     // Implementation
   }
   
   export function useAuth() {
     const context = useContext(AuthContext)
     if (!context) throw new Error('useAuth must be used within AuthProvider')
     return context
   }
   ```
3. Implement provider logic
4. Run tests → Green
5. Refactor if needed

**Done Criteria:**
- [ ] Tests written and passing
- [ ] Auth context provides user, session, loading state
- [ ] signIn/signOut methods working
- [ ] Session persistence tested
- [ ] Error handling tested

---

#### Task 1.1.2: Create Protected Route Component
**Effort:** S (3 hours)  
**Dependencies:** 1.1.1  
**TDD:** Test alongside component

**Steps:**
1. Write tests (`src/components/ProtectedRoute.test.tsx`):
   - Test redirects to login if not authenticated
   - Test renders children if authenticated
   - Test shows loading state while checking auth
2. Create `src/components/ProtectedRoute.tsx`:
   ```typescript
   import { Navigate } from 'react-router-dom'
   import { useAuth } from '../lib/auth-context'
   
   export function ProtectedRoute({ children }: { children: React.ReactNode }) {
     const { user, loading } = useAuth()
     
     if (loading) return <div>Loading...</div>
     if (!user) return <Navigate to="/login" replace />
     
     return <>{children}</>
   }
   ```
3. Run tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Protected routes redirect unauthenticated users
- [ ] Loading state handled
- [ ] Component renders children when authenticated

---

### 1.2: Login UI

#### Task 1.2.1: Create Login Form Component
**Effort:** M (5 hours)  
**Dependencies:** 1.1.1  
**TDD:** Test alongside component

**Steps:**
1. Write component tests (`src/features/auth/LoginForm.test.tsx`):
   - Test form renders with email and password fields
   - Test validation (required fields, email format)
   - Test successful login calls signIn method
   - Test error handling (wrong credentials)
   - Test loading state during login
   - Test accessibility (labels, ARIA attributes)
2. Create `src/features/auth/LoginForm.tsx`:
   - Email input (type=email, required)
   - Password input (type=password, required)
   - Submit button
   - Error display
   - Loading state
   - Basic validation
3. Style component (basic styling acceptable)
4. Run tests → Green

**Done Criteria:**
- [ ] Tests passing (including accessibility checks with jest-axe)
- [ ] Form validation working
- [ ] Error messages display correctly
- [ ] Loading state prevents double-submit
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

---

#### Task 1.2.2: Create Login Page
**Effort:** S (2 hours)  
**Dependencies:** 1.2.1  
**TDD:** Test alongside

**Steps:**
1. Write page tests
2. Create `src/pages/LoginPage.tsx`:
   - Page layout
   - Login form
   - Redirect to home on successful login
3. Add route to router

**Done Criteria:**
- [ ] Tests passing
- [ ] Login page accessible at `/login`
- [ ] Successful login redirects to home
- [ ] Page is responsive

---

### 1.3: Bootstrap Curator Account

#### Task 1.3.1: Create Admin Signup Script
**Effort:** S (2 hours)  
**Dependencies:** 0.2.4  
**TDD:** N/A (one-time script)

**Steps:**
1. Create `scripts/create-curator.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.SUPABASE_URL!
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY! // Service role key
   
   const supabase = createClient(supabaseUrl, supabaseServiceKey)
   
   async function createCurator() {
     const { data, error } = await supabase.auth.admin.createUser({
       email: 'curator@example.com',
       password: 'secure-password-here',
       email_confirm: true
     })
     
     if (error) {
       console.error('Error creating curator:', error)
       return
     }
     
     console.log('Curator created:', data.user.email)
     console.log('User ID:', data.user.id)
   }
   
   createCurator()
   ```
2. Run script to create initial curator account
3. Test login with curator credentials

**Done Criteria:**
- [ ] Script creates curator account
- [ ] Curator can log in via UI
- [ ] Credentials saved securely (not in code)

---

### Phase 1 Done Criteria
- [ ] Login/logout working
- [ ] Session persistence working
- [ ] Protected routes enforcing authentication
- [ ] Curator account created and functional
- [ ] All auth tests passing
- [ ] Coverage ≥70% for auth code

---

## Phase 2: Book Collection Display (3-4 days)

**Goal:** Display, search, filter, sort book collection

### 2.1: Book Data Access Layer

#### Task 2.1.1: Create Book Query Hooks
**Effort:** M (5 hours)  
**Dependencies:** 0.2.6, 1.1.1  
**TDD:** Test-first for business logic

**Steps:**
1. **Write tests first** (`src/features/books/hooks/useBooks.test.ts`):
   - Test fetches all books
   - Test search by title
   - Test search by title_original (NEW)
   - Test search by author
   - Test search by inclusion_rationale (NEW)
   - Test search matches across all search fields
   - Test filter by category
   - Test filter by tags
   - Test filter by original_language
   - Test filter by reading_status (client-side)
   - Test filter by ownership_status (client-side)
   - Test sort by title, author, year (NOT priority - that's in Reading Dashboard)
   - Test handles empty results
   - Test handles errors
2. Create `src/features/books/hooks/useBooks.ts`:
   ```typescript
   import { useQuery, useMemo } from '@tanstack/react-query'
   import { supabase } from '@/lib/supabase'
   import { Book } from '@/types/database'
   
   interface BooksQueryParams {
     search?: string
     category?: string
     tags?: string[]
     originalLanguage?: string
     readingStatus?: string  // Client-side filter
     ownershipStatus?: string  // Client-side filter
     sortBy?: 'title' | 'author' | 'year'  // Note: priority sorting in Reading Dashboard only
     sortOrder?: 'asc' | 'desc'
   }
   
   export function useBooks(params: BooksQueryParams = {}) {
     // Fetch books from database (with filters that apply to books table)
     const booksQuery = useQuery({
       queryKey: ['books', { 
         search: params.search,
         category: params.category,
         tags: params.tags,
         originalLanguage: params.originalLanguage,
         sortBy: params.sortBy,
         sortOrder: params.sortOrder
       }],
       queryFn: async () => {
         let query = supabase.from('books').select('*')
         
         // Apply search across multiple fields (FR-002)
         if (params.search) {
           // Search in: title, title_original, author_display_name, inclusion_rationale
           query = query.or(
             `title.ilike.%${params.search}%,` +
             `title_original.ilike.%${params.search}%,` +
             `author_display_name.ilike.%${params.search}%,` +
             `inclusion_rationale.ilike.%${params.search}%`
           )
         }
         
         // Apply filters that exist on books table (FR-003)
         if (params.category) {
           query = query.eq('primary_category', params.category)
         }
         
         if (params.tags && params.tags.length > 0) {
           query = query.contains('tags', params.tags)
         }
         
         if (params.originalLanguage) {
           query = query.eq('original_language', params.originalLanguage)
         }
         
         // Apply sorting (FR-004)
         if (params.sortBy) {
           const column = params.sortBy === 'year' ? 'year_sort' : params.sortBy
           query = query.order(column, { ascending: params.sortOrder === 'asc' })
         } else {
           // Default sort: year (oldest first) per UX-010
           query = query.order('year_sort', { ascending: true })
         }
         
         const { data, error } = await query
         if (error) throw error
         return data as Book[]
       }
     })
     
     // Fetch user reading status (for client-side filtering)
     const statusQuery = useQuery({
       queryKey: ['user-reading-status'],
       queryFn: async () => {
         const { data, error } = await supabase
           .from('user_reading_status')
           .select('*')
         if (error) throw error
         return data
       },
       // Only fetch if we need status filtering
       enabled: Boolean(params.readingStatus || params.ownershipStatus)
     })
     
     // Combine and filter client-side (for reading_status/ownership_status)
     const filteredBooks = useMemo(() => {
       if (!booksQuery.data) return []
       
       let books = booksQuery.data
       
       // Apply client-side filters if status data available
       if (statusQuery.data && (params.readingStatus || params.ownershipStatus)) {
         const statusMap = new Map(statusQuery.data.map(s => [s.book_id, s]))
         
         books = books.filter(book => {
           const status = statusMap.get(book.id)
           
           if (params.readingStatus && status?.reading_status !== params.readingStatus) {
             return false
           }
           
           if (params.ownershipStatus && status?.ownership_status !== params.ownershipStatus) {
             return false
           }
           
           return true
         })
       }
       
       return books
     }, [booksQuery.data, statusQuery.data, params.readingStatus, params.ownershipStatus])
     
     return {
       data: filteredBooks,
       isLoading: booksQuery.isLoading || (statusQuery.enabled && statusQuery.isLoading),
       error: booksQuery.error || statusQuery.error
     }
   }
   ```
   
   **Note on Client-Side Filtering:**
   The above implementation uses client-side filtering for reading_status and ownership_status since those fields are in the user_reading_status table, not the books table. This approach:
   - Fetches all books matching search/category/tags/language filters from database
   - Fetches user's reading status records separately
   - Joins and filters in client using useMemo
   - Works well for collections <1000 books (MVP0 target)
   
   **Future Optimization:**
   If collection size or user count grows significantly, consider replacing client-side filtering with:
   - Database view joining books + user_reading_status
   - PostgreSQL materialized view (refreshed periodically)
   - Server-side RPC function performing the join
   - More complex RLS policies on a joined view
   
   For MVP0, client-side approach is simpler and performs adequately.

3. Implement query function with expanded search scope
4. Run tests → Green
5. Refactor

**Done Criteria:**
- [ ] Tests written and passing
- [ ] Search works across title, title_original, author_display_name, inclusion_rationale (FR-002 ✅)
- [ ] All filter combinations tested (category, tags, language)
- [ ] Reading status and ownership status filtering implemented (client-side with useMemo)
- [ ] Sort options tested (title, author, year) - priority sorting NOT in this hook
- [ ] Error handling tested
- [ ] React Query integration working
- [ ] Type-safe query parameters
- [ ] Client-side filtering approach documented and tested
- [ ] useMemo optimization for filtered results

---

#### Task 2.1.2: Create Single Book Query Hook
**Effort:** S (2 hours)  
**Dependencies:** 2.1.1  
**TDD:** Test-first

**Steps:**
1. Write tests for `useBook(id)`:
   - Test fetches book by ID
   - Test includes external references
   - Test handles not found
   - Test handles errors
2. Implement `src/features/books/hooks/useBook.ts`
3. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Single book query working
- [ ] Joins external references
- [ ] Error handling tested

---

### 2.2: Book List UI

#### Task 2.2.1: Create BookListItem Component
**Effort:** M (4 hours)  
**Dependencies:** 2.1.1  
**TDD:** Test alongside

**Steps:**
1. Write component tests:
   - Test displays title, author, year
   - Test displays category and tags
   - Test click navigates to detail view
   - Test handles missing optional fields gracefully
   - Test accessibility
2. Create `src/features/books/components/BookListItem.tsx`:
   - Display title, author, year
   - Display category badge
   - Display tags
   - Click to view details
   - Responsive layout
3. Run tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Component displays all required fields
- [ ] Gracefully handles missing optional fields
- [ ] Responsive design
- [ ] Accessible (semantic HTML, keyboard nav)

---

#### Task 2.2.2: Create BookList Component
**Effort:** M (4 hours)  
**Dependencies:** 2.2.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test renders list of books
   - Test empty state when no books
   - Test loading state
   - Test error state
   - Test pagination (if implementing)
2. Create `src/features/books/components/BookList.tsx`:
   - Map books to BookListItem components
   - Loading spinner
   - Empty state message
   - Error display
3. Run tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Renders books correctly
- [ ] All states handled (loading, empty, error)
- [ ] Accessible list markup (ul/li)

---

#### Task 2.2.3: Create Search/Filter Controls
**Effort:** XL (8 hours)  
**Dependencies:** 2.1.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test search input updates query
   - Test category filter updates query (dropdown)
   - Test tag filter updates query (multi-select)
   - Test original language filter updates query (dropdown or text)
   - Test reading status filter updates query (dropdown)
   - Test ownership status filter updates query (dropdown)
   - Test multiple filters work together
   - Test sort controls update query
   - Test clear filters resets state
   - Test debounced search input
2. Create `src/features/books/components/BookFilters.tsx`:
   
   **Search Component:**
   - Search input (debounced, searches: title, title_original, author, inclusion_rationale)
   
   **Filter Components (FR-003 - ALL filters):**
   - Primary Category dropdown (use PRIMARY_CATEGORIES from constants)
   - Tags multi-select (allow selecting multiple tags)
   - Original Language dropdown or text input (flexible)
   - Reading Status dropdown (Not Started, Want to Read, Reading, Paused, Finished, Abandoned)
   - Ownership Status dropdown (Not Owned, Ordered, Owned Physical, Owned Digital, Borrowed)
   
   **Sort Controls (FR-004):**
   
   **MVP 0 Sort Options for Collection View:**
   - Title (alphabetically)
   - Author (alphabetically)
   - Year (chronologically) - default per UX-010
   - Sort order toggle (asc/desc)
   
   **Note on Priority Sorting:**
   - Priority is in user_reading_status table, not books table
   - Priority sorting does NOT apply to general Collection View (most books don't have priority)
   - Priority sorting IS available in:
     * Reading Dashboard (Task 4.2.4) - PRIMARY USE CASE
     * Collection View when filtered by reading status (Want to Read, Reading)
   
   **Explicitly Deferred to Post-MVP:**
   - Primary Category sort (not critical for MVP 0 validation)
   - Rating sort (not critical for MVP 0 validation)
   - Date Added sort (not critical for MVP 0 validation)
   
   **Note:** Deferred sort options are not essential for validating core workflows (UC-001, UC-002, UC-003). They can be added post-MVP 0 if curator feedback indicates they're needed.
   
   **Other Controls:**
   - Clear all filters button
   
3. Implement each filter with proper state management
4. Wire up to useBooks hook
5. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Search working with debounce across all fields
- [ ] ALL filters from FR-003 implemented explicitly:
  - [ ] Primary category filter (dropdown with controlled vocabulary)
  - [ ] Tags filter (multi-select)
  - [ ] Original language filter (dropdown or text)
  - [ ] Reading status filter (dropdown)
  - [ ] Ownership status filter (dropdown)
- [ ] Collection View sort options working (title, author, year)
- [ ] Priority sorting confirmed as Reading Dashboard feature (not in general Collection View)
- [ ] Deferred sort options documented (category, rating, date_added)
- [ ] Multiple filters work together correctly
- [ ] Clear filters resets all state
- [ ] Accessible form controls (labels, ARIA)
- [ ] FR-003 complete ✅
- [ ] FR-004 MVP subset complete ✅

---

#### Task 2.2.4: Create Application Layout and Navigation
**Effort:** M (5 hours)  
**Dependencies:** 1.1.1 (auth context)  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test AppLayout renders navigation menu
   - Test active route highlighting works
   - Test navigation links work
   - Test mobile hamburger menu toggles
   - Test logout button works
   - Test page titles update per route
2. Create `src/components/AppLayout.tsx`:
   - Persistent navigation header/sidebar
   - Navigation menu with links:
     * Collection (/)
     * Reading Dashboard (/reading)
     * Statistics (/stats)
     * Settings (/settings)
   - Active route highlighting
   - Mobile: Hamburger menu that opens/closes
   - Page title/breadcrumbs display
   - User info display (email or name)
   - Logout button
   - Main content area (children)
3. Setup React Router with layout:
   ```typescript
   <Route path="/" element={<AppLayout />}>
     <Route index element={<CollectionPage />} />
     <Route path="collection" element={<CollectionPage />} />
     <Route path="reading" element={<ReadingDashboardPage />} />
     <Route path="stats" element={<StatsPage />} />
     <Route path="settings" element={<SettingsPage />} />
     <Route path="books/:id" element={<BookDetailPage />} />
     <Route path="books/new" element={<AddBookPage />} />
     <Route path="books/:id/edit" element={<EditBookPage />} />
   </Route>
   ```
4. Style navigation (basic styling acceptable for MVP 0)
5. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] AppLayout renders with persistent navigation
- [ ] All navigation links present and working
- [ ] Active route highlighted
- [ ] Mobile hamburger menu functional
- [ ] Page titles/breadcrumbs display
- [ ] Logout button works
- [ ] Responsive navigation (desktop full menu, mobile hamburger)
- [ ] Accessible navigation (semantic nav element, keyboard support)
- [ ] UX-002 navigation foundation ✅

---

#### Task 2.2.5: Create Collection Page (formerly 2.2.4)
**Effort:** M (4 hours)  
**Dependencies:** 2.2.2, 2.2.3, 2.2.4  
**TDD:** Test alongside

**Steps:**
1. Write integration tests:
   - Test page displays books
   - Test filters update displayed books
   - Test search updates displayed books
   - Test sort updates book order
2. Create `src/pages/CollectionPage.tsx`:
   - Page layout (within AppLayout)
   - BookFilters component
   - BookList component
   - Handle query state from useBooks
3. Add route to router (already done in 2.2.4)
4. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Collection page accessible at `/collection` or `/`
- [ ] All features integrated and working
- [ ] Responsive layout
- [ ] Performance acceptable (<2s load time for 1000 books per NFR-001)

---

### 2.3: Book Detail View

#### Task 2.3.1: Create BookDetail Component
**Effort:** L (6 hours)  
**Dependencies:** 2.1.2  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test displays all canonical metadata
   - Test displays external references as links
   - Test handles missing optional fields
   - Test accessibility (headings, links)
   - Test back navigation
2. Create `src/features/books/components/BookDetail.tsx`:
   - Display all book fields (title, original title, author, year, category, tags, language, source, inclusion rationale, author lifespan)
   - External references as clickable links
   - Back to collection button
   - Edit button (for Phase 3)
   - Responsive layout
3. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] All metadata displayed
- [ ] External links working
- [ ] Graceful handling of missing fields
- [ ] Accessible markup
- [ ] Responsive

---

#### Task 2.3.2: Create Book Detail Page
**Effort:** S (2 hours)  
**Dependencies:** 2.3.1  
**TDD:** Test alongside

**Steps:**
1. Write tests
2. Create `src/pages/BookDetailPage.tsx`:
   - Get book ID from route params
   - Fetch book with useBook hook
   - Display BookDetail component
   - Handle loading/error states
   - Handle not found
3. Add route to router (`/books/:id`)

**Done Criteria:**
- [ ] Tests passing
- [ ] Detail page accessible
- [ ] Loading/error/not-found states handled
- [ ] Route parameter working

---

### Phase 2 Done Criteria
- [ ] Application layout with persistent navigation (UX-002 foundation ✅)
- [ ] Book collection displays correctly (FR-001 ✅)
- [ ] Search working across all fields: title, title_original, author, inclusion_rationale (FR-002 ✅)
- [ ] All filters working: category, tags, language, reading_status (client-side), ownership_status (client-side) (FR-003 ✅)
- [ ] Collection View sort options working: title, author, year (FR-004 MVP subset ✅)
- [ ] Priority sorting scoped to Reading Dashboard (not general Collection View)
- [ ] Book details display (FR-005 ✅)
- [ ] Default sort by year (oldest first) per UX-010 ✅
- [ ] All Phase 2 tests passing
- [ ] Coverage ≥70%

---

## Phase 3: Book Curation (CRUD) (2-3 days)

**Goal:** Curator can add, edit, delete books

### 3.1: Create Book (FR-010)

#### Task 3.1.1: Create AddBookForm Component
**Effort:** L (7 hours)  
**Dependencies:** 2.1.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test form validation (required fields: title, author)
   - Test all fields render correctly
   - Test category dropdown has controlled vocabulary
   - Test tags input (multi-entry)
   - Test external references repeatable section
   - Test submission calls insert mutation
   - Test success feedback
   - Test error handling
   - Test accessibility
2. Create `src/features/books/components/AddBookForm.tsx`:
   - Form fields for all book attributes
   - Title (required)
   - Author display name (required)
   - Given name (optional)
   - Family name (optional)
   - Original title (optional)
   - Year published (text input, accept "8th century BC", "ca. 1200", etc.)
   - Primary category (dropdown with controlled vocab from PRIMARY_CATEGORIES constant in src/constants/categories.ts)
   - Tags (multi-entry, flexible)
   - Original language (text input)
   - Source (text)
   - Inclusion rationale (textarea)
   - Author lifespan (text)
   - External references (repeatable: URL + link text + reference type)
   - Add/remove external reference buttons
   - Form validation
   - Submit/cancel buttons
3. Create mutation hook `useCreateBook`
4. Wire up form submission
5. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] All fields present and functional
- [ ] Validation working (required fields)
- [ ] Category dropdown limited to controlled vocabulary (uses PRIMARY_CATEGORIES from constants)
- [ ] Tags input allows flexible entry
- [ ] External references repeatable and validated
- [ ] Form submits and creates book
- [ ] Success feedback shown
- [ ] Accessible form (labels, ARIA, keyboard nav)

---

#### Task 3.1.2: Add Duplicate Detection
**Effort:** S (2 hours)  
**Dependencies:** 3.1.1, 2.1.1  
**TDD:** Test alongside

**Simplified Approach:**
- Case-insensitive exact match on title AND author_display_name
- Display warning if match found
- Allow curator to proceed (soft warning)
- No fuzzy matching or complex similarity logic

**Rationale:** Goal is preventing accidental duplicates (user enters same book twice), not sophisticated record matching. Case-insensitive exact match catches 90% of duplicates with minimal complexity.

**Steps:**
1. Write tests:
   - Test duplicate detection triggers as user types title and author
   - Test displays list of exact matches
   - Test allows curator to proceed anyway (soft warning)
   - Test case-insensitive matching (e.g., "iliad" matches "Iliad")
   - Test no warning for clearly different books
2. Create `src/features/books/hooks/useDuplicateDetection.ts`:
   ```typescript
   export function useDuplicateDetection(title: string, author: string) {
     return useQuery({
       queryKey: ['duplicate-check', title, author],
       queryFn: async () => {
         if (!title || !author) return []
         
         const { data, error } = await supabase
           .from('books')
           .select('id, title, author_display_name, year_published')
           .ilike('title', title)
           .ilike('author_display_name', author)
           .limit(5)
         
         if (error) throw error
         return data || []
       },
       enabled: Boolean(title && author),
       staleTime: 30000 // Cache for 30 seconds
     })
   }
   ```
3. Update AddBookForm component:
   - Call useDuplicateDetection hook with debounce (500ms)
   - Display warning panel if potential duplicates found:
     * "Similar books found in your collection:"
     * List of matching books (title, author, year)
     * Links to view those books
     * "Continue anyway" button to proceed with add
   - Soft warning only (not a blocker)
4. Tests → Green

**Implementation Notes:**
- Lightweight implementation (no strict DB constraints)
- Curator has final say (can add duplicate if intentional)
- Helps prevent accidental duplicates during data entry
- Simple case-insensitive exact match on title + author

**Done Criteria:**
- [ ] Tests passing
- [ ] Duplicate detection working with case-insensitive exact match
- [ ] Warning displays potential duplicates with links
- [ ] Curator can proceed anyway (soft warning)
- [ ] No blocking constraints (curator has control)
- [ ] Debounced to avoid excessive queries
- [ ] Helps prevent accidental duplicates ✅

---

#### Task 3.1.3: Create Add Book Page (formerly 3.1.2)
**Effort:** S (2 hours)  
**Dependencies:** 3.1.2  
**TDD:** Test alongside

**Steps:**
1. Write tests
2. Create `src/pages/AddBookPage.tsx`:
   - Page layout with form
   - Redirect to book detail on success
   - Cancel returns to collection
3. Add route (`/books/new`)
4. Add "Add Book" button to collection page

**Done Criteria:**
- [ ] Tests passing
- [ ] Add book page accessible
- [ ] Success redirects to new book detail
- [ ] Cancel returns to collection

---

### 3.2: Edit Book (FR-011)

#### Task 3.2.1: Create EditBookForm Component
**Effort:** M (5 hours)  
**Dependencies:** 3.1.1, 2.1.2  
**TDD:** Test alongside

**Note:** Edit form does NOT need duplicate detection (book already exists)

**Steps:**
1. Write tests:
   - Test form pre-populates with existing data
   - Test updates save correctly
   - Test validation still enforced
   - Test external references can be added/edited/removed
2. Create `src/features/books/components/EditBookForm.tsx`:
   - Same fields as AddBookForm
   - Pre-populate with book data
   - Update mutation instead of insert
   - Handle external references (existing + new + deleted)
3. Create mutation hook `useUpdateBook`
4. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Form pre-populates correctly
- [ ] Updates save successfully
- [ ] Validation working
- [ ] External references can be managed
- [ ] Timestamps update correctly

---

#### Task 3.2.2: Create Edit Book Page
**Effort:** S (2 hours)  
**Dependencies:** 3.2.1  
**TDD:** Test alongside

**Steps:**
1. Write tests
2. Create `src/pages/EditBookPage.tsx`:
   - Get book ID from route
   - Fetch book
   - Display EditBookForm
   - Handle loading/error/not-found
3. Add route (`/books/:id/edit`)
4. Add "Edit" button to BookDetail component

**Done Criteria:**
- [ ] Tests passing
- [ ] Edit page accessible
- [ ] Success updates book and shows feedback
- [ ] Cancel returns to detail view

---

### 3.3: Delete Book (FR-012)

#### Task 3.3.1: Create Delete Confirmation Dialog
**Effort:** S (3 hours)  
**Dependencies:** None  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test dialog displays consequences
   - Test cancel closes dialog
   - Test confirm calls delete mutation
   - Test accessibility (focus trap, ESC key)
2. Create `src/components/ConfirmDialog.tsx`:
   - Generic confirmation dialog
   - Title, message, confirm/cancel buttons
   - Focus management
3. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Dialog displays and functions correctly
- [ ] Accessible (focus trap, keyboard nav)

---

#### Task 3.3.2: Implement Delete Book Functionality
**Effort:** M (4 hours)  
**Dependencies:** 3.3.1, 2.3.1  
**TDD:** Test-first for mutation logic

**Steps:**
1. Write tests:
   - Test delete mutation removes book
   - Test cascade deletes user_reading_status and external_references
   - Test confirmation required
   - Test redirect after delete
2. Create mutation hook `useDeleteBook`
3. Add "Delete" button to BookDetail
4. Wire up confirmation dialog
5. Handle redirect to collection after delete
6. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Delete requires confirmation
- [ ] Cascade deletes work correctly
- [ ] Redirects after successful delete
- [ ] Error handling if delete fails

---

### Phase 3 Done Criteria
- [ ] Add book working (FR-010 ✅)
- [ ] Duplicate detection helping prevent accidental duplicates ✅
- [ ] Edit book working (FR-011 ✅)
- [ ] Delete book working (FR-012 ✅)
- [ ] External references manageable (FR-012a ✅)
- [ ] Category dropdown uses controlled vocabulary from constants ✅
- [ ] All CRUD operations tested
- [ ] Coverage ≥70%

---

## Phase 4: Personal Reading Management (3-4 days)

**Goal:** Track reading status, priority, notes, rating, ownership

### 4.1: Reading Status Data Layer

#### Task 4.1.1: Create User Reading Status Hooks
**Effort:** M (5 hours)  
**Dependencies:** 0.2.5  
**TDD:** Test-first for business logic

**Steps:**
1. Write tests:
   - Test fetch user's reading status for a book
   - Test create reading status record
   - Test update reading status
   - Test set timestamps when status changes to "reading" or "finished"
   - Test handles no existing record
   - Test error handling
2. Create `src/features/reading/hooks/useReadingStatus.ts`:
   ```typescript
   export function useReadingStatus(bookId: string) {
     // Fetch user's reading status for this book
   }
   
   export function useUpdateReadingStatus() {
     // Update or insert reading status
     // Auto-set started_at when status → "reading"
     // Auto-set completed_at when status → "finished"
   }
   ```
3. Implement hooks
4. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Fetches user's reading status correctly
- [ ] Upsert logic working (insert if not exists, update if exists)
- [ ] Timestamps auto-set correctly
- [ ] Error handling tested

---

#### Task 4.1.2: Create Reading Stats Query Hook
**Effort:** S (3 hours)  
**Dependencies:** 4.1.1  
**TDD:** Test-first

**Steps:**
1. Write tests:
   - Test counts books by reading status
   - Test counts books by ownership status
   - Test handles zero books
2. Create `src/features/reading/hooks/useReadingStats.ts`:
   ```typescript
   export function useReadingStats() {
     // Query to get counts:
     // - want_to_read count
     // - reading count
     // - finished count
     // - owned_physical count
     // - owned_digital count
   }
   ```
3. Implement using Supabase aggregation or fetch + reduce
4. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Stats query returning correct counts
- [ ] Handles edge cases (no data)

---

### 4.2: Reading Status UI

#### Task 4.2.1: Create ReadingStatusSelect Component
**Effort:** M (4 hours)  
**Dependencies:** 4.1.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test renders all status options
   - Test current status selected
   - Test change updates backend
   - Test optimistic UI update
   - Test accessibility
2. Create `src/features/reading/components/ReadingStatusSelect.tsx`:
   - Dropdown with status options (Not Started, Want to Read, Reading, Paused, Finished, Abandoned)
   - Current status selected
   - onChange calls mutation
   - Optimistic update
   - Loading state
3. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Status changes reflected immediately (optimistic UI)
- [ ] Backend updated
- [ ] Accessible select element

---

#### Task 4.2.2: Create PersonalDataPanel Component
**Effort:** L (6 hours)  
**Dependencies:** 4.1.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test displays all personal data fields
   - Test inline editing for status, priority, ownership, rating
   - Test textarea for notes
   - Test changes save automatically
   - Test displays timestamps (started_at, completed_at)
2. Create `src/features/reading/components/PersonalDataPanel.tsx`:
   - Reading status select
   - Priority select (High, Medium, Low, None)
   - Ownership status select
   - Rating (1-5 stars, clickable)
   - Personal notes textarea (auto-save on blur)
   - Display started_at and completed_at (read-only)
   - All updates auto-save
3. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] All personal fields editable
- [ ] Auto-save working
- [ ] Timestamps displayed correctly
- [ ] Accessible form controls

---

#### Task 4.2.3: Integrate Personal Data into Book Detail
**Effort:** S (2 hours)  
**Dependencies:** 4.2.2, 2.3.1  
**TDD:** Integration test

**Steps:**
1. Write test:
   - Test personal data panel displays on book detail page
   - Test changes persist
2. Add PersonalDataPanel to BookDetail component
3. Style integration
4. Test → Green

**Done Criteria:**
- [ ] Personal data panel visible on book detail page
- [ ] Changes save successfully
- [ ] Integration test passing

---

#### Task 4.2.4: Create Reading Dashboard Page
**Effort:** L (6 hours)  
**Dependencies:** 4.1.1, 4.2.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test displays books with status "Reading"
   - Test displays "Want to Read" books with priorities
   - Test quick status update actions work
   - Test filtering by priority works
   - Test empty states display
   - Test mobile-optimized per UX-011
2. Create `src/pages/ReadingDashboardPage.tsx`:
   
   **Currently Reading Section:**
   - List of books with reading_status = "Reading"
   - Display: title, author, year, started_at timestamp
   - Quick actions: Mark as Finished, Mark as Paused
   - Link to full book detail
   
   **Want to Read Section:**
   - List of books with reading_status = "Want to Read"
   - **Sorted by personal_priority (High → Medium → Low → None)** - PRIMARY USE CASE for priority sorting
   - Display: title, author, year, priority badge
   - Quick actions: Mark as Reading, Change Priority
   - Link to full book detail
   
   **Note on Priority Sorting:**
   - This is the PRIMARY use case for priority sorting
   - Query user_reading_status directly, join books for display
   - Priority sort doesn't make sense in general Collection View (most books don't have priority set)
   
   **Mobile Optimization (UX-011):**
   - Cards stack vertically on mobile
   - Touch-friendly action buttons (≥44x44px)
   - Swipe gestures optional (nice-to-have)
   - Essential workflow: view reading list and update status
   
3. Create `src/features/reading/hooks/useReadingDashboard.ts`:
   ```typescript
   export function useReadingBooks() {
     // Query books with status "Reading" for current user
   }
   
   export function useWantToReadBooks() {
     // Query books with status "Want to Read" for current user
     // Sorted by priority
   }
   ```
4. Style dashboard (cards or list layout)
5. Add route to router (`/reading`) - already added in 2.2.4
6. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Reading Dashboard accessible at `/reading`
- [ ] Currently Reading section displays books with status "Reading"
- [ ] Want to Read section displays books with priorities
- [ ] Quick status update actions working
- [ ] Mobile-optimized per UX-011 (essential workflow)
- [ ] Empty states for no books in each section
- [ ] Links to full book details
- [ ] Becomes primary navigation destination for reader workflow
- [ ] UC-001 (Decide what to read next) workflow optimized ✅
- [ ] UC-002 (Complete a book) workflow accessible ✅

---

### 4.3: Statistics Dashboard

#### Task 4.3.1: Create StatsCard Component
**Effort:** S (2 hours)  
**Dependencies:** None  
**TDD:** Test alongside

**Steps:**
1. Write tests
2. Create `src/features/reading/components/StatsCard.tsx`:
   - Display label and count
   - Optional icon
   - Click to filter (optional)
3. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Card displays label and count
- [ ] Styling consistent

---

#### Task 4.3.2: Create Stats Dashboard Page
**Effort:** M (4 hours)  
**Dependencies:** 4.1.2, 4.3.1  
**TDD:** Test alongside

**Steps:**
1. Write tests:
   - Test displays reading status counts (FR-030)
   - Test displays ownership counts (FR-031)
   - Test handles zero counts
2. Create `src/pages/StatsPage.tsx`:
   - Grid of StatsCard components
   - Want to Read count
   - Reading count
   - Paused count
   - Finished count
   - Abandoned count
   - Owned (Physical) count
   - Owned (Digital) count
   - Total owned count
3. Add route (`/stats`)
4. Add nav link to stats page
5. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Stats page displays all counts (FR-030, FR-031 ✅)
- [ ] Responsive layout
- [ ] Accessible

---

### Phase 4 Done Criteria
- [ ] Reading status tracking (FR-020 ✅)
- [ ] Personal priority (FR-021 ✅)
- [ ] Ownership tracking (FR-023 ✅)
- [ ] Personal notes (FR-024 ✅)
- [ ] Personal rating (FR-025 ✅)
- [ ] Timestamps displayed (FR-026 ✅)
- [ ] Reading Dashboard page with "Reading" and "Want to Read" views ✅
- [ ] Quick status update actions on dashboard ✅
- [ ] Mobile-optimized reading dashboard (UX-011 ✅)
- [ ] Reading stats (FR-030, FR-031 ✅)
- [ ] Primary navigation destination for reader workflow ✅
- [ ] All Phase 4 tests passing
- [ ] Coverage ≥70%

---

## Phase 5: Excel Data Migration (2-3 days)

**Goal:** One-time import of existing Excel data

**Phase Ordering Note:** Migration (Phase 5) could potentially be executed before CRUD (Phase 3) if the curator wants to validate the application with real data first. This approach has tradeoffs:
- **Migration First (before Phase 3):** Allows curator to browse/search/filter real data immediately. Good for validation. However, cannot manually fix data issues without CRUD.
- **CRUD First (recommended):** Allows testing CRUD workflows with sample data, and provides tools to fix any migration issues. More flexible.

Choose the order that best fits the curator's validation priorities.

### 5.1: Migration Script

#### Task 5.1.1: Create Excel Parser
**Effort:** L (6 hours)  
**Dependencies:** None  
**TDD:** Test-first for parsing logic

**Steps:**
1. Install dependencies:
   ```bash
   npm install xlsx
   npm install -D @types/node
   ```
2. Write tests (`migration/excel-parser.test.ts`):
   - Test reads Excel file
   - Test parses book rows correctly
   - Test maps columns to database fields
   - Test handles Author model variations (Author, Last Name + First Name, unknown authors, collective authors)
   - Test maps Category/Genre/Subject to primary_category + tags
   - Test parses Prio column (x → high priority, 1-5 → rating, - → reading status, blank → null)
   - Test maps Lib column to ownership_status
   - Test maps Read column to reading_status
   - Test handles missing optional fields
   - Test validates required fields present
3. Create `migration/excel-parser.ts`:
   ```typescript
   import XLSX from 'xlsx'
   import { BookInsert, UserReadingStatusInsert } from '../src/types/database'
   
   interface ExcelRow {
     Author?: string
     'Last Name'?: string
     'First Name'?: string
     'Title (EN)': string
     'Original Title'?: string
     Year?: string
     'Sort Time'?: number
     Category?: string
     Genre?: string
     Subject?: string
     'Original Language'?: string
     Source?: string
     Comment?: string
     'Author Lifespan'?: string
     'External Links'?: string
     Lib?: string
     Prio?: string
     Read?: string
   }
   
   interface ParsedData {
     books: BookInsert[]
     userReadingStatuses: UserReadingStatusInsert[]
     validationErrors: string[]
     validationWarnings: string[]
   }
   
   export function parseExcelFile(filePath: string): ParsedData {
     // Implementation
   }
   ```
4. Implement parser with all mapping logic
5. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Parser reads Excel file correctly
- [ ] All column mappings implemented per spec 2.2
- [ ] Author model handled correctly
- [ ] Prio column parsed correctly (priority + rating + status)
- [ ] Validation errors collected
- [ ] Warnings collected (e.g., unusual values)

---

#### Task 5.1.2: Create Migration Script
**Effort:** M (5 hours)  
**Dependencies:** 5.1.1, 0.2.5  
**TDD:** Test migration logic (not full E2E)

**Steps:**
1. Write tests:
   - Test generates pre-migration report
   - Test inserts books
   - Test inserts user_reading_status records
   - Test handles duplicate prevention (idempotent)
   - Test rollback on error
   - Test generates post-migration report
2. Create `migration/migrate.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   import { parseExcelFile } from './excel-parser'
   
   async function migrate() {
     // 1. Parse Excel file
     const parsed = parseExcelFile('./data/reading-canon.xlsx')
     
     // 2. Generate pre-migration report
     console.log('Pre-migration report:')
     console.log(`Books to import: ${parsed.books.length}`)
     console.log(`Reading status records: ${parsed.userReadingStatuses.length}`)
     console.log(`Validation errors: ${parsed.validationErrors.length}`)
     console.log(`Warnings: ${parsed.validationWarnings.length}`)
     
     if (parsed.validationErrors.length > 0) {
       console.error('Validation errors found. Fix before proceeding.')
       console.error(parsed.validationErrors)
       return
     }
     
     // 3. Confirm to proceed
     // (Manual confirmation for safety)
     
     // 4. Insert books (batch)
     const { data: books, error: booksError } = await supabase
       .from('books')
       .insert(parsed.books)
       .select()
     
     if (booksError) throw booksError
     
     // 5. Map reading statuses to created book IDs
     // (Match by title + author)
     
     // 6. Insert user_reading_status (batch)
     const { error: statusError } = await supabase
       .from('user_reading_status')
       .insert(mappedStatuses)
     
     if (statusError) throw statusError
     
     // 7. Generate post-migration report
     console.log('Migration complete!')
     console.log(`Books imported: ${books.length}`)
     console.log(`Reading statuses created: ${mappedStatuses.length}`)
   }
   
   migrate()
   ```
3. Implement script
4. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Script generates reports
- [ ] Script inserts data correctly
- [ ] Idempotent (safe to re-run on clean DB)
- [ ] Error handling and rollback
- [ ] Post-migration report generated

---

### 5.2: Migration Validation

#### Task 5.2.1: Run Migration on Test Data
**Effort:** S (3 hours)  
**Dependencies:** 5.1.2  
**TDD:** Manual validation

**Steps:**
1. Create test Excel file with 10-20 sample rows
2. Run migration script on test Supabase project
3. Manually verify:
   - All books imported
   - Titles and authors correct
   - Categories and tags mapped correctly
   - Reading statuses correct
   - Ownership statuses correct
   - Timestamps preserved or set correctly
4. Check for data quality issues
5. Iterate on parser/script if needed

**Done Criteria:**
- [ ] Test migration completes successfully
- [ ] Sample data verified correct
- [ ] No data loss
- [ ] All edge cases handled (ancient dates, unknown authors, etc.)

---

#### Task 5.2.2: Run Production Migration
**Effort:** M (4 hours)  
**Dependencies:** 5.2.1  
**TDD:** Manual validation

**Steps:**
1. Backup original Excel file
2. Review pre-migration report carefully
3. Run migration on main Supabase project
4. Review post-migration report
5. Spot-check data in database:
   - Sample 20-30 books manually
   - Verify categories, tags, reading statuses
   - Check author names formatted correctly
   - Verify external references imported (if present in Excel)
6. Load application and browse collection
7. Verify search, filter, sort working
8. Document any data quality issues for future enrichment

**Done Criteria:**
- [ ] Production migration completed
- [ ] All Excel books imported successfully
- [ ] Curator's personal data migrated (reading status, priority, ownership)
- [ ] Data quality acceptable (no major issues)
- [ ] Application displays migrated data correctly
- [ ] UC-004 complete ✅

---

### Phase 5 Done Criteria
- [ ] Excel data migration script complete
- [ ] Test migration validated
- [ ] Production migration executed successfully
- [ ] All data preserved (NFR-030 ✅)
- [ ] Collection accessible in application
- [ ] Migration script and reports saved for reference

---

## Phase 6: Polish & MVP 0 Validation (3-4 days)

**Goal:** Fix critical styling bugs, improve UX, validate with curator

**Structure:** 
- 6.0: Critical Styling Fixes (BLOCKING - must complete first)
- 6.1: UX Polish (reordered to test responsive after styling fixes)
- 6.2: Performance Optimization
- 6.3: MVP 0 Validation

**Core Path:** Tasks 6.0.1, 6.0.2, 6.1.4, 6.1.2, 6.1.3, 6.2.1, 6.3.1, 6.3.2 (21-25 hours)  
**Optional:** Tasks 6.1.1, 6.1.5 (5 hours additional - can defer to post-MVP0)

---

### 6.0: Critical Styling Fixes

#### Task 6.0.1: Fix Double/Triple Padding Bug
**Effort:** XS (1 hour)  
**Dependencies:** None (critical blocking bug)  
**TDD:** Manual verification with DevTools  
**Priority:** CRITICAL - Must fix before responsive testing

**Problem:**
- EditBookPage adds 2rem padding on top of AppLayout's 2rem = 4rem total
- BookDetailPage adds 2rem padding on top of AppLayout's 2rem = 4rem total
- BookDetail component adds another padding layer = triple padding in some cases

**Files to Modify:**

1. **`src/pages/EditBookPage.tsx`** (Lines ~48, 90, 154, 214)
   - Remove `padding: 2rem;` from all 4 style blocks
   - Add comment: `/* Padding provided by AppLayout */`

2. **`src/pages/BookDetailPage.tsx`** (Lines ~69, 111, 176)
   - Remove `padding: 2rem;` from all 3 style blocks
   - Add comment: `/* Padding provided by AppLayout */`

3. **`src/features/books/components/BookDetail.tsx`** (Line ~45)
   - Remove `padding: '2rem'` from inline style
   - Keep `maxWidth: '800px', margin: '0 auto'`

**Verification:**
- Open `/books/:id` - measure padding with DevTools (should be 2rem, not 4rem)
- Open `/books/:id/edit` - measure padding with DevTools (should be 2rem, not 4rem)
- Check on mobile (375px), tablet (768px), desktop (1200px+)

**Done Criteria:**
- [ ] EditBookPage: Only 2rem padding from AppLayout (verified with DevTools)
- [ ] BookDetailPage: Only 2rem padding from AppLayout
- [ ] BookDetail: No extra padding layer
- [ ] Consistent spacing across all viewports
- [ ] No visual regressions

---

#### Task 6.0.2: Fix Broken Tailwind Pages (Convert to Scoped CSS)
**Effort:** M (5-7 hours)  
**Dependencies:** 6.0.1  
**TDD:** Manual verification + test suite regression check  
**Priority:** CRITICAL - Pages currently have non-functional styling

**Problem:**
7 files use Tailwind classes but Tailwind is NOT installed in package.json:
1. `src/pages/StatsPage.tsx`
2. `src/pages/ReadingDashboardPage.tsx`
3. `src/features/reading/components/StatsCard.tsx`
4. `src/features/reading/components/PersonalDataPanel.tsx`
5. `src/features/books/components/AddBookForm.tsx`
6. `src/features/books/components/EditBookForm.tsx`
7. (One more component from investigation)

**Solution:**
Convert all Tailwind classes to scoped CSS using existing CSS variables from `src/index.css`:
- `var(--text)` - Body text
- `var(--text-h)` - Headings
- `var(--bg)` - Background
- `var(--border)` - Borders
- `var(--accent)` - Accent color
- `var(--shadow)` - Box shadows

**Conversion Pattern (Example):**

Before (broken Tailwind):
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
```

After (working scoped CSS):
```tsx
<div className="page-container">
  <h1 className="page-title">Statistics</h1>
  
  <style>{`
    .page-container {
      width: 100%;
      max-width: 1200px; /* Match AppLayout */
      margin: 0 auto;
    }
    
    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-h);
      margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
      .page-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
    }
  `}</style>
</div>
```

**Files to Convert (Priority Order):**

**High Priority (User-Facing Pages):**
1. **`src/pages/StatsPage.tsx`**
   - Convert all Tailwind classes to scoped CSS
   - Change max-width from 1280px to 1200px (match AppLayout)
   - Use CSS variables for colors
   - Ensure dark mode support

2. **`src/pages/ReadingDashboardPage.tsx`**
   - Convert all Tailwind classes to scoped CSS
   - Define consistent button styles (primary, success, warning)
   - Define card styles with CSS variables
   - Change max-width to 1200px

**Medium Priority (Components):**
3. **`src/features/reading/components/StatsCard.tsx`**
4. **`src/features/reading/components/PersonalDataPanel.tsx`**
5. **`src/features/books/components/AddBookForm.tsx`**
6. **`src/features/books/components/EditBookForm.tsx`**

Apply same pattern:
- Remove all Tailwind classes
- Add scoped `<style>` block
- Use CSS variables
- Define consistent spacing (0.5rem, 1rem, 1.5rem, 2rem)
- Ensure responsive behavior with @media queries

**Max-Width Standards:**
- Full-width pages (Collection, Stats, Reading): `1200px` (matches AppLayout)
- Forms (Add, Edit): `800px` (good for readability)
- Detail views: `800px` (consistent with forms)

**Verification:**
- [ ] All 7 pages render correctly with scoped CSS
- [ ] No Tailwind class references remain
- [ ] Dark mode works on all pages (CSS variables)
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1200px+)
- [ ] All 460+ tests still pass (no regressions)
- [ ] No console errors about missing CSS classes

**Done Criteria:**
- [ ] StatsPage converted and functional
- [ ] ReadingDashboardPage converted and functional
- [ ] All 4 components converted and functional
- [ ] All pages use CSS variables for colors
- [ ] Max-width standardized (1200px for pages, 800px for forms)
- [ ] Dark mode works correctly
- [ ] Responsive design verified
- [ ] Test suite passes with no regressions (460+ tests)
- [ ] No horizontal scrolling on any viewport

---

### 6.1: UX Polish

#### Task 6.1.4: Responsive Design Testing
**Effort:** M (5 hours)  
**Dependencies:** 6.0.1, 6.0.2 (MOVED UP - depends on styling fixes)  
**TDD:** Manual testing + automated viewport tests

**Note:** This task was moved earlier in the sequence because responsive design cannot be properly tested with broken styling. Must validate responsive behavior AFTER styling is fixed.
**Effort:** S (3 hours)  
**Dependencies:** All previous phases  
**TDD:** Test alongside

**Steps:**
1. Write tests for empty states (UX-004)
2. Create empty state components/messages:
   - Empty collection: "Add your first book" with prominent add button
   - No search results: "No books match" with clear filters button
   - Zero books with status "Reading": "Start reading a book" with link to collection
   - No books with status "Finished": "You haven't finished any books yet"
3. Add to relevant pages
4. Tests → Green

**Done Criteria:**
- [ ] All empty states implemented (UX-004 ✅)
- [ ] Tests passing
- [ ] Helpful messages guide user to action

---

#### Task 6.1.2: Add Loading States and Feedback
**Effort:** S (3 hours)  
**Dependencies:** 6.0.1, 6.0.2, 6.1.4  
**TDD:** Test alongside

**Note:** This task was kept in its relative position after responsive testing.

**Steps:**
1. Review all user actions for feedback (UX-005, UX-009):
   - Status changes → immediate visual update + toast
   - Book creation → success toast, navigate to detail
   - Book update → success toast
   - Book deletion → success toast, navigate to collection
   - Long operations (migration) → progress indicator
   - Errors → clear error messages with recovery suggestions
2. Implement toast notification system (or use library)
3. Add loading spinners where needed
4. Tests → Green

**Done Criteria:**
- [ ] All state changes have immediate feedback (UX-005 ✅)
- [ ] Loading states display (UX-009 ✅)
- [ ] Toast notifications working
- [ ] Error messages helpful

---

#### Task 6.1.3: Accessibility Audit
**Effort:** M (4 hours)  
**Dependencies:** 6.0.1, 6.0.2, 6.1.4, 6.1.2  
**TDD:** Automated + manual testing

**Note:** This task validates accessibility after styling fixes and responsive testing are complete.

**Steps:**
1. Run automated accessibility tests with jest-axe on all components
2. Fix any violations
3. Manual testing (UX-006, UX-007):
   - Keyboard navigation (tab, enter, escape)
   - Focus indicators visible
   - Screen reader testing (NVDA or JAWS)
   - ARIA labels present where needed
   - Semantic HTML used
   - Color contrast meets WCAG 2.1 AA
4. Document any remaining issues
5. Fix high-priority issues

**Done Criteria:**
- [ ] Zero automated accessibility violations
- [ ] Keyboard navigation works throughout app (UX-006 ✅)
- [ ] Screen reader announces content correctly (UX-007 ✅)
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] High-priority issues fixed

---

#### Task 6.1.1: Implement Empty States (OPTIONAL - Can Defer)
**Effort:** S (3 hours)  
**Dependencies:** All previous phases  
**TDD:** Test alongside  
**Priority:** OPTIONAL - Nice-to-have but app works without them

**Deferral Rationale:**
- App works without empty states
- 643 books already migrated, so empty collection state unlikely to be tested
- Can defer to post-MVP0 if time-constrained
- Saves 3 hours if skipped
- Core validation can proceed without this task

**Steps:**
1. Write tests for empty states (UX-004)
2. Create empty state components/messages:
   - Empty collection: "Add your first book" with prominent add button
   - No search results: "No books match" with clear filters button
   - Zero books with status "Reading": "Start reading a book" with link to collection
   - No books with status "Finished": "You haven't finished any books yet"
3. Add to relevant pages
4. Tests → Green

**Done Criteria:**
- [ ] All empty states implemented (UX-004 ✅)
- [ ] Tests passing
- [ ] Helpful messages guide user to action

---

#### Task 6.1.5: Create Settings Page (OPTIONAL - Can Defer)
**Effort:** S (2 hours)  
**Dependencies:** 1.1.1 (auth context)  
**TDD:** Test alongside  
**Priority:** OPTIONAL - Minimal value in MVP0, expands in MVP1

**Deferral Rationale:**
- Minimal value in MVP0 (just logout button + user info display)
- Logout could live in navigation menu temporarily
- Settings page scope expands significantly in MVP1 (user preferences, profile editing)
- Can defer to MVP1 when user management features are added
- Saves 2 hours if skipped

**Original Rationale for Inclusion:**
- Explicitly in UX-001 specification
- Natural place for logout button (better UX than nav menu)
- Establishes route for MVP1 expansion
- Very low effort (2 hours)

**Steps:**
1. Write tests:
   - Test page displays user profile info
   - Test logout button works
   - Test page is accessible
2. Create `src/pages/SettingsPage.tsx`:
   
   **Minimal MVP0 Implementation (expanded in MVP1):**
   - User profile display (read-only):
     * Email address
     * Name (if available)
     * User ID (for debugging)
   - Logout button
   - Simple layout
   
   **NOT included in MVP0 (defer to MVP1):**
   - User profile editing
   - User preferences (theme, defaults)
   - Data export
   - Account management
   
3. Style settings page (simple layout acceptable)
4. Add route to router (`/settings`) - already added in 2.2.4
5. Tests → Green

**Done Criteria:**
- [ ] Tests passing
- [ ] Settings page accessible at `/settings`
- [ ] User profile info displayed (read-only)
- [ ] Logout button functional
- [ ] Responsive layout
- [ ] Accessible
- [ ] Minimal scope maintained (no user preferences in MVP0)
- [ ] Note in code: "Minimal MVP0 implementation - expanded in MVP1"

---

### 6.2: Performance Optimization

#### Task 6.2.1: Performance Testing
**Effort:** S (3 hours)  
**Dependencies:** Phase 5 (full data loaded)  
**TDD:** Performance tests

**Steps:**
1. Test NFR-001: Book list load time
   - Measure time from page request to interactive book list
   - Target: <2 seconds for 1000 books
   - Use Lighthouse or Chrome DevTools
2. Test NFR-002: Search response time
   - Measure time from keystroke to results displayed
   - Target: <1 second
3. Identify bottlenecks if targets not met
4. Optimize:
   - Indexes on database (already done in 0.2.1)
   - Pagination if needed
   - Query optimization
   - React Query caching
   - Component memoization if needed

**Done Criteria:**
- [ ] Book list loads in <2s (NFR-001 ✅)
- [ ] Search results in <1s (NFR-002 ✅)
- [ ] Performance acceptable per SC-007
- [ ] Optimization notes documented

---

### 6.3: MVP 0 Validation

#### Task 6.3.1: Curator Acceptance Testing
**Effort:** M (session with curator, 2-4 hours)  
**Dependencies:** All previous tasks  
**TDD:** Manual validation against success criteria

**Steps:**
1. Prepare testing checklist based on success criteria:
   - SC-001: Curator prefers app over Excel?
   - SC-002: Deciding what to read next is easier?
   - SC-003: Updating reading progress is easier?
2. Walk curator through key workflows:
   - Browse collection
   - Search for a book
   - Filter by category/tags
   - View book details
   - Decide what to read next (filter by Want to Read + priority)
   - Mark a book as Reading
   - Mark a book as Finished (add rating and notes)
   - Add a new book
   - Edit an existing book
   - View statistics
3. Collect feedback:
   - What works well?
   - What's confusing or frustrating?
   - What's missing?
   - Would you use this over Excel?
4. Document findings

**Done Criteria:**
- [ ] Curator has tested all key workflows
- [ ] Feedback collected and documented
- [ ] Success criteria evaluated
- [ ] Action items for fixes identified (if needed)

---

#### Task 6.3.2: Bug Fixes from Validation
**Effort:** Variable (L, 1-2 days estimated)  
**Dependencies:** 6.3.1  
**TDD:** Fix with tests

**Steps:**
1. Prioritize bugs from curator feedback:
   - Blocking issues (prevents core workflow)
   - High priority (major usability issue)
   - Medium priority (annoyance but workable)
   - Low priority (nice-to-have)
2. Fix blocking and high priority issues
3. Write tests for each bug fix
4. Re-test with curator if needed

**Done Criteria:**
- [ ] All blocking issues fixed
- [ ] High priority issues fixed
- [ ] Tests added for bug fixes
- [ ] Curator confirms fixes work

---

### Phase 6 Done Criteria

**Critical (Must Complete):**
- [ ] Critical styling bugs fixed (double padding, broken Tailwind pages) ✅
- [ ] All pages use CSS variables for consistent styling ✅
- [ ] Responsive design validated (UX-008, UX-011 ✅)
- [ ] Mobile essential workflows checklist completed ✅
- [ ] Feedback and loading states complete (UX-005, UX-009 ✅)
- [ ] Accessibility validated (UX-006, UX-007 ✅)
- [ ] Performance targets met (NFR-001, NFR-002 ✅)
- [ ] Curator acceptance testing complete
- [ ] Critical bugs from validation fixed
- [ ] Success criteria validated (SC-001, SC-002, SC-003 ✅)

**Optional (Can Defer to Post-MVP0):**
- [ ] All empty states implemented (UX-004 ✅)
- [ ] Settings page with user profile and logout ✅

---

## MVP 0 Complete! 🎉

**MVP 0 Validation Checklist:**

### Functional Requirements Complete
- [ ] FR-001: Display book collection ✅
- [ ] FR-002: Full-text search ✅
- [ ] FR-003: Filter books ✅
- [ ] FR-004: Sort books ✅
- [ ] FR-005: View book details ✅
- [ ] FR-010: Add new book ✅
- [ ] FR-011: Edit book metadata ✅
- [ ] FR-012: Remove book ✅
- [ ] FR-012a: Manage external references ✅
- [ ] FR-020: Maintain reading status ✅
- [ ] FR-021: Set personal priority ✅
- [ ] FR-023: Track ownership status ✅
- [ ] FR-024: Write personal notes ✅
- [ ] FR-025: Assign personal rating ✅
- [ ] FR-026: View reading timestamps ✅
- [ ] FR-030: Show reading status counts ✅
- [ ] FR-031: Show ownership count ✅
- [ ] FR-042: Authenticate with email/password ✅

### UX Requirements Complete
- [ ] UX-001: Information architecture ✅
- [ ] UX-002: Navigation and wayfinding ✅
- [ ] UX-003: Primary interactions ✅
- [ ] UX-004: Empty states ✅
- [ ] UX-005: Feedback and confirmation ✅
- [ ] UX-006: Keyboard navigation ✅
- [ ] UX-007: Screen reader accessibility ✅
- [ ] UX-008: Responsive behavior ✅
- [ ] UX-009: Performance perception ✅
- [ ] UX-010: Default sort order (year, oldest first) ✅
- [ ] UX-011: Mobile essential workflows ✅

### Non-Functional Requirements Met
- [ ] NFR-001: Book list loads <2s ✅
- [ ] NFR-002: Search results <1s ✅
- [ ] NFR-010: Easier than Excel (validated by curator) ✅
- [ ] NFR-020: Authentication required ✅
- [ ] NFR-021: Personal data privacy ✅
- [ ] NFR-023: Password security (hashed) ✅
- [ ] NFR-030: Original data preserved (migration) ✅
- [ ] NFR-043: Type safety (TypeScript) ✅

### Use Cases Complete
- [ ] UC-001: Decide what to read next ✅
- [ ] UC-002: Complete a book ✅
- [ ] UC-003: Add book to collection ✅
- [ ] UC-004: Migrate Excel data ✅

### Success Criteria Validated
- [ ] SC-001: Curator prefers app over Excel ✅
- [ ] SC-002: Deciding what to read next is easier ✅
- [ ] SC-003: Updating reading progress is easier ✅
- [ ] SC-007: Performance acceptable ✅

### Technical Quality
- [ ] All tests passing ✅
- [ ] Test coverage ≥70% ✅
- [ ] TypeScript strict mode, no errors ✅
- [ ] ESLint passing ✅
- [ ] Pre-commit hooks enforcing quality ✅
- [ ] CI/CD pipeline passing ✅
- [ ] RLS policies tested and enforced ✅
- [ ] No "TODO: test later" debt ✅

---

## Post-MVP 0: What's Next?

### Immediate Next Steps
1. **Celebrate!** MVP 0 is a significant milestone
2. **Reflect**: Document lessons learned
3. **Decide**: Is MVP 0 valuable enough to proceed to MVP 1?

### If Proceeding to MVP 1 (Multi-User)
1. Add `invitation_tokens` table
2. Add `profiles` table with roles
3. Create Edge Function for invitation generation
4. Build registration flow
5. Enhance RLS policies for role-based access
6. Deploy to Vercel for production access
7. Invite 2-5 readers

### Deferred to Post-MVP
- Recommendation submission/approval workflow (FR-013, FR-014)
- Advanced statistics with visualizations (FR-032)
- Algorithmic reading suggestions (FR-033)
- Social features (discussions, shared comments)
- Data export (CSV/Excel)
- Enhanced search (faceted search, relevance ranking)
- Bulk operations

---

## Appendix A: Effort Summary

**Total Estimated Effort for MVP 0:** ~23-29 days (184-232 hours)

**Breakdown by Phase:**
- Phase 0: Project Foundation → 3.5-4.5 days (added: shared constants, enhanced RLS testing)
- Phase 1: Authentication → 2-3 days
- Phase 2: Book Collection Display → 4-5 days (added: application layout/navigation, expanded search/filters)
- Phase 3: Book Curation (CRUD) → 2.5-3.5 days (added: duplicate detection)
- Phase 4: Personal Reading Management → 4-5 days (added: reading dashboard page)
- Phase 5: Excel Data Migration → 2-3 days
- Phase 6: Polish & Validation → 3-4 days (v1.1: added critical styling fixes, reordered for logical flow, marked 2 tasks as optional)

**Changes from Original Estimate:**
- Added 5 new tasks based on comprehensive review
- Enhanced scope of existing tasks (search, filters, RLS testing)
- Total increase: ~2-3 days

**Note:** Estimates include test writing and assume a single developer familiar with the tech stack. First-time setup and learning may add 20-30% to initial phases.

---

## Appendix B: Task Tracking Template

**Recommended GitHub Issues Labels:**
- `phase-0` through `phase-6`
- `database`
- `frontend`
- `testing`
- `authentication`
- `bug`
- `enhancement`
- `ux`
- `performance`
- `documentation`
- `blocked`

**Example Issue Template:**
```markdown
## Task: [Task Name]

**Phase:** [Phase Number]
**Effort:** [XS/S/M/L/XL]
**Dependencies:** [List of task IDs]
**TDD Approach:** [Test-first / Test alongside / Security-first / N/A]

### Description
[Brief description]

### Steps
1. [Step 1]
2. [Step 2]
...

### Done Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
...

### Related Requirements
- [FR-XXX, UX-XXX, NFR-XXX]
```

---

## Appendix C: Daily Standup Template

**Daily Check-in Questions:**
1. What did I complete yesterday?
2. What am I working on today?
3. Are there any blockers?
4. Are my tests passing?
5. Is my coverage ≥70%?

---

## Appendix D: Testing Checklist Reminder

For every task that produces code:

**Before Starting:**
- [ ] Understand what I'm building (requirements clear)
- [ ] Know how I'll test it (TDD approach selected)

**During Development:**
- [ ] Tests written (before or alongside code per TDD approach)
- [ ] Tests passing (green)
- [ ] Code refactored (if needed)
- [ ] Coverage ≥70% for this code

**Before Merging:**
- [ ] All tests passing
- [ ] ESLint passing
- [ ] TypeScript type check passing
- [ ] Manual testing done (if UI)
- [ ] Accessibility checked (if UI)
- [ ] Responsive design tested (if UI)
- [ ] Pre-commit hooks satisfied
- [ ] CI passing

**Zero "TODO: test later" debt!**

---

**Document Version:** 1.1  
**Created:** 2026-10-02  
**Last Updated:** 2026-10-02  
**Status:** Ready for Phase 0 kickoff - Aligned with spec.md v1.4 and all ADRs
