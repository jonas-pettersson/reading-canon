# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reading Canon is a curated reading companion application for tracking and exploring significant literary works. This project demonstrates an AI-native development lifecycle with clear requirements, traceable decisions, and documented architecture.

**Current Status:** Phase 3 (Book Curation - CRUD) - Task 3.2.2 (Edit Book Page) next  
**See README.md for detailed phase tracking and test status.**

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

**Core Stack:**
- React 18 + TypeScript (strict mode) + Vite
- Supabase (PostgreSQL + Auth + RLS)
- @tanstack/react-query for server state
- Vitest + React Testing Library

**See README.md and adr/README.md for complete technology details.**

## Essential Development Commands

```bash
# Testing (mandatory for every task)
npm run test             # Watch mode
npm test -- --run        # Run once
npm run test:coverage    # With coverage

# Type generation (after database schema changes)
npx supabase gen types typescript --linked > src/types/database.ts

# Linting
npm run lint             # Run oxlint
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

**MVP 0 (Current):** Single curator, CRUD, personal tracking, Excel migration, localhost OK  
**MVP 1 (Future):** Multi-user, invitations, roles, production deployment  
**Post-MVP:** Recommendations, social features, advanced stats, algorithmic suggestions

**Critical Rule:** Do not implement features marked as MVP 1 or Post-MVP when working on MVP 0 tasks.

**See README.md Section "MVP Scope" for complete details.**

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
- Always inspect existing repository state before making changes.
- Preserve unrelated user modifications.
- Never overwrite changes not associated with the current task.
- Parallel work is only allowed for clearly independent tasks and with explicit approval.

### Task Completion Workflow

**After completing a major task** (e.g., a task from plan-mvp0.md with passing tests):

1. **Stage changes:** `git add <files>`
2. **Commit:** Create a descriptive commit message following the project conventions
3. **Push:** `git push origin master`
4. **Verify CI (MANDATORY):** Check GitHub Actions status automatically:
   ```bash
   # Wait 30 seconds for CI to start, then check status
   sleep 30
   gh run list --limit 1 --repo jonas-pettersson/reading-canon
   
   # If in_progress, wait another 30 seconds and check again
   sleep 30
   gh run list --limit 1 --repo jonas-pettersson/reading-canon
   
   # If completed, get full details (shows both jobs)
   gh run view <run-id> --repo jonas-pettersson/reading-canon
   ```
5. **Report to user:**
   - Commit hash and summary
   - Files changed
   - Test status
   - **CI pipeline status** - Both jobs MUST pass:
     - ✓ Test & Lint (20.x)
     - ✓ Build (20.x)
   - If CI fails: **STOP immediately, diagnose error, fix, and push again**
   - Do NOT proceed to next task if CI is red

**What constitutes a "major task":**
- Implementation tasks from plan-mvp0.md (e.g., Task 3.1.1, Task 3.1.2)
- New features with tests
- Significant refactorings
- Bug fixes with tests

**When NOT to auto-commit:**
- User explicitly says "don't commit yet"
- Work in progress / incomplete implementation
- Experimental changes
- Minor documentation updates (wait for user instruction)

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

## Product Principles

- **Curated, Not Comprehensive**: Canon is editorially controlled
- **Quality Over Quantity**: Thoughtful reading, not consumption metrics
- **Excellent Usability**: Better than spreadsheet for primary use cases
- **Progressive Enrichment**: Works with incomplete metadata

**See artifacts/vision.md for complete product vision.**

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

## Meta: Document Maintenance

**CLAUDE.md Purpose:** Operational guidance for AI-assisted development (workflows, rules, patterns, constraints)  
**README.md Purpose:** Human onboarding and project overview (status, getting started, installation, context)

**Rules for maintaining this document:**
- Do NOT duplicate project status, phase tracking, or detailed progress in CLAUDE.md
- Do NOT duplicate installation steps, prerequisites, or getting started instructions
- Reference README.md for human-oriented context when needed
- Keep CLAUDE.md focused on: decision-making rules, workflows, testing requirements, code patterns, and constraints
- When updating project status, update README.md only (unless workflow rules change)

## References

- Architecture summary: `adr/README.md`
- Complete requirements: `artifacts/spec.md`
- Implementation plan: `artifacts/plan-mvp0.md`
- Testing strategy: `adr/ADR-007-testing-strategy.md`

---

**Last Updated:** 2026-10-05 (Reorganized - operational guidance first, meta-instructions near end)
