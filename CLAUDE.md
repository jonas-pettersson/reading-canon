# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reading Canon is a curated reading companion application for tracking and exploring significant literary works. The project demonstrates an AI-native development lifecycle with clear requirements, traceable decisions, and documented architecture.

**Current Status:** Phase 0 (Project Foundation) ✅ COMPLETE. Ready for Phase 1 (Authentication & User Management).

**Phase 0 Completed (2026-10-03):**
- ✅ Supabase project created and configured
- ✅ Frontend initialized (React 18 + TypeScript + Vite)
- ✅ Database schema implemented (books, user_reading_status, external_references)
- ✅ Row-Level Security (RLS) policies enforced
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Pre-commit hooks (husky + lint-staged)
- ✅ Test infrastructure (18 tests passing, 27 ready for auth)

**Next Target:** Phase 1, Task 1.1.1 - Setup Authentication UI

## Document Hierarchy and Authority

This project follows a strict document hierarchy. Later documents must align with earlier ones. When making decisions or implementing features, follow this chain of authority:

1. **`artifacts/vision.md`** - Product vision and guiding principles (highest authority)
2. **`artifacts/intent.md`** - Problem statement, desired outcomes, scope, constraints
3. **`artifacts/design-decisions.md`** - Preliminary product and design decisions
4. **`artifacts/spec.md`** (v1.4) - Detailed requirements specification
5. **`adr/`** - Architecture Decision Records (ADR-001 through ADR-008)
6. **`artifacts/plan-mvp0.md`** - MVP 0 implementation plan (6 phases, 46 tasks)

**Important:** Always verify decisions against the specification and ADRs. If there's a conflict between documents, higher-authority documents take precedence. See `adr/README.md` for the complete architecture stack summary.

**Implementation Plan Authority:** `plan-mvp0.md` governs implementation sequencing and task-level done criteria. It does not override the specification or ADRs. Tasks may not be reordered, merged, skipped, expanded, or altered without explicit approval.

## Change Control

- Do not silently deviate from the specification, ADRs, implementation plan, or other authoritative artifacts.
- If implementation reveals a conflict, missing decision, inconsistency, or technically impractical requirement, stop and report it.
- Explain:
  1. The conflicting requirements
  2. Implementation impact
  3. Available options
  4. Recommended resolution
- Do not modify `vision.md`, `intent.md`, `design-decisions.md`, `spec.md`, ADRs, or `plan-mvp0.md` unless explicitly instructed.
- When a decision changes, update the authoritative artifact before implementing the change.

## Technology Stack

**Frontend:**
- React 18 + TypeScript (strict mode) + Vite
- @supabase/supabase-js for data access
- @tanstack/react-query (TanStack Query) for server state management
- React Hook Form for forms
- Radix UI for accessible component primitives
- Vitest + React Testing Library for testing

**Backend:**
- Supabase (Backend-as-a-Service)
  - PostgreSQL 15+ with Row-Level Security (RLS)
  - Supabase Auth (email/password, JWT sessions)
  - Auto-generated REST API from database schema
  - Generated TypeScript types from schema

**Infrastructure:**
- Vercel for frontend hosting (production - MVP 1)
- Supabase Cloud for backend
- Localhost deployment acceptable for MVP 0 validation

## Development Commands

**Phase 0 Complete:** All infrastructure is configured and ready.

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)

# Testing
npm run test             # Run Vitest tests (watch mode)
npm test -- --run        # Run tests once
npm run test:ui          # Run Vitest with UI
npm run test:coverage    # Generate coverage report

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Linting
npm run lint             # Run oxlint

# Type generation (after Supabase schema changes)
export SUPABASE_ACCESS_TOKEN=<your-token>
supabase gen types typescript --linked > src/types/database.ts

# Database migrations
supabase migration new <migration-name>  # Create new migration
supabase db push                         # Apply migrations to Supabase
```

## Core Architecture Concepts

### Data Model: Canonical vs. Personal

The application separates **canonical book data** (shared by all users) from **personal reading data** (private to each user):

**Canonical Data (books table):**
- Book metadata: title, author, publication year, category, tags
- Curator-controlled: inclusion_rationale, curator_notes
- Shared across all users

**Personal Data (user_reading_status table):**
- Per-user reading state: reading_status, priority, ownership_status
- Personal notes, rating, started_at, finished_at timestamps
- Private to each user

This separation is fundamental to the multi-user model and RLS policies.

### Authorization Architecture

Authorization is **database-enforced** via PostgreSQL Row-Level Security (RLS), not application logic:

- RLS policies control who can read/write which rows
- MVP 0: Simple authenticated access (single curator)
- MVP 1: Role-based policies (curator can edit books, readers cannot)
- Application code uses Supabase client; RLS enforcement is automatic

### Client-Side Data Patterns

For MVP 0 with <1,000 books, the recommended pattern for enriching books with user-specific reading data:

1. Fetch books with database-driven search, filtering, and sorting (canonical book data)
2. Fetch user_reading_status separately (personal reading data)
3. Join the results client-side using `useMemo` to create enriched view

**Important:** Canonical book search, filtering, and sorting must follow the specification and ADRs (database-driven). User-specific enrichment (joining reading status, priority, notes) uses client-side joins. Do not replace approved database search behavior with a client-only implementation.

This pattern is simpler than complex SQL joins for small datasets. See Task 2.1.1 in plan-mvp0.md.

## Testing Strategy

**Testing is mandatory for every task.** Each task specifies its testing approach:

1. **Business Logic** → Test-first (strict TDD): Write test → Red → Green → Refactor
2. **React Components** → Implemented and tested within the same task (test alongside)
3. **RLS Policies** → Security-tested immediately after writing policy
4. **User Flows** → Integration tests added after required components exist

**Completion Requirements:**
- Do not consider a task complete until all required tests pass.
- Do not report success based only on code inspection.
- Zero "TODO: test later" debt is allowed.

**Coverage Target:** ≥70% (enforced in CI)

**Accessibility:** Use jest-axe for automated accessibility testing. WCAG 2.1 AA compliance is required (UX-007).

See `adr/ADR-007-testing-strategy.md` for complete testing philosophy and examples.

## Task Boundaries

- Work on one explicitly assigned task at a time.
- Do not automatically begin the next task.
- Do not implement adjacent or future features merely because they are convenient.
- Restrict changes to the scope required by the current task and its tests.
- At task completion provide:
  - Files changed
  - Tests added or updated
  - Commands executed
  - Verification results
  - Unresolved questions
  - Done-criteria status

## MVP Scope Understanding

### MVP 0 (Current Target)
**Goal:** Prove it's better than Excel for curator's personal use

**In Scope:**
- Single curator authentication
- Collection management (display, search, filter, sort, CRUD)
- Personal reading tracking (status, priority, ownership, notes, rating)
- Basic statistics (counts by status and ownership)
- Excel data migration (one-time)
- Localhost deployment acceptable

**Success Criteria:**
- Curator prefers application over Excel
- Deciding what to read next is easier
- Updating reading progress is easier

### MVP 1 (Future)
**Adds:** Multi-user support, invitation workflow, role-based access, production deployment

### Deferred to Post-MVP
- Recommendation submission/approval workflow
- Social features (discussions, shared comments)
- Advanced statistics with visualizations
- Algorithmic reading suggestions

**Important:** Do not implement features marked as MVP 1 or Post-MVP when working on MVP 0 tasks.

## Key Data Model Details

### Reading Status Values
Use these exact values (normalized in spec v1.4):
- "Not Started" (default for new books with no user_reading_status)
- "Want to Read"
- "Reading"
- "Paused"
- "Finished"
- "Abandoned"

### Primary Categories
Use these exact values (from spec.md v1.4 Section 2.1):
- Novel
- Play / Drama
- Poetry
- Philosophy
- History
- Religion / Theology
- Politics / Political Theory
- Science
- Essay / Non-fiction
- Biography / Memoir
- Anthology / Collection

### Search Implementation
MVP 0 uses trigram indexes (pg_trgm) with ILIKE-based search, not full-text search. This provides simple fuzzy matching with a migration path to to_tsvector if needed. See Task 0.2.1 in plan-mvp0.md and ADR-003.

## Development Workflow

### Starting a New Task

1. Read the task details in `artifacts/plan-mvp0.md`
2. Verify dependencies are complete
3. Follow the specified TDD approach for that task
4. Check "Done Criteria" before considering task complete

### Database Changes

1. Write SQL migration in `supabase/migrations/`
2. Apply migration: `supabase db push`
3. Regenerate TypeScript types: `npx supabase gen types typescript`
4. Update RLS policies if needed
5. Test RLS policies immediately (security-first)

## Git and Concurrent Work

- Default to one implementation task at a time.
- Do not create branches, worktrees, sub-agents, or parallel implementation streams unless explicitly instructed.
- Do not commit, push, merge, rebase, reset, or discard changes unless explicitly instructed.
- Always inspect existing repository state before making changes.
- Preserve unrelated user modifications.
- Never overwrite changes not associated with the current task.
- Parallel work is only allowed for clearly independent tasks and with explicit approval.

### Code Quality Standards

- TypeScript strict mode (no `any` types without justification)
- Accessibility is required, not optional (WCAG 2.1 AA)
- Empty states and loading states for all data displays (UX-004)
- Error messages must be user-friendly (UX-005)
- Responsive design: desktop-first, mobile-essential for reading workflows

## Dependency Management

- Do not introduce dependencies unless required by the specification, ADRs, or implementation plan.
- Before adding a new package:
  1. Verify it solves a documented requirement
  2. Check if existing dependencies can fulfill the need
  3. Evaluate package maintenance, security, and bundle size
  4. Document the decision if ambiguous
- Use exact versions specified in authoritative documents.
- Do not upgrade dependencies during feature implementation unless explicitly instructed.

## Product Principles (Guide Decision-Making)

- **Curated, Not Comprehensive**: The canon remains editorially controlled
- **Quality Over Quantity**: Encourage thoughtful reading, not consumption metrics
- **Excellent Usability**: Must be better than spreadsheet for primary use cases
- **Progressive Enrichment**: Works with incomplete metadata, improves over time

## Common Patterns

### Supabase Query Pattern (ADR-006)
```typescript
// With TanStack Query
const { data, error, isLoading } = useQuery({
  queryKey: ['books'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title')
    if (error) throw error
    return data
  }
})
```

### Client-Side User Reading Status Join
```typescript
// Fetch books and user_reading_status separately
const books = useBooks()
const readingStatus = useUserReadingStatus()

// Join in client
const booksWithStatus = useMemo(() => {
  return books.map(book => ({
    ...book,
    reading_status: readingStatus[book.id]?.reading_status ?? 'Not Started',
    // ... other personal fields
  }))
}, [books, readingStatus])
```

## Important Constraints

- **Single Developer:** Architecture optimized for solo development
- **Minimal Backend Code:** Leverage Supabase auto-generated APIs; write SQL + RLS, not application auth logic
- **Type Safety End-to-End:** Generate types from database schema, use strict TypeScript
- **Cost Efficiency:** Design cost-efficiently. Do not introduce paid services or recurring costs without explicit approval.

## References

- Architecture summary: `adr/README.md`
- Complete requirements: `artifacts/spec.md`
- Implementation plan: `artifacts/plan-mvp0.md`
- Testing strategy: `adr/ADR-007-testing-strategy.md`

---

**Last Updated:** 2026-10-03
