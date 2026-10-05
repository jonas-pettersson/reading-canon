# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reading Canon is a curated reading companion application for tracking and exploring significant literary works. This project demonstrates an AI-native development lifecycle with clear requirements, traceable decisions, and documented architecture.

**See STATUS.md for current phase and next task.**

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

## Development Workflow

### Session Start

When starting a session, check `STATUS.md` for the next task, then read task details in `plan-mvp0.md`. Before implementing, search `spec.md` for relevant requirements (UX-*, FR-*), check ADRs for architectural patterns, and review existing code for consistency. Follow the task's TDD approach and verify against "Done Criteria" before completion.

### Task Completion

After completing a major task (implementation tasks from plan-mvp0.md with passing tests):

1. Update STATUS.md (mark task ✅, update test counts, move to completed section)
2. Stage all changes: `git add <files> STATUS.md`
3. Commit with descriptive message
4. Push: `git push origin master`
5. **Verify CI** (for code/config changes only - skip for docs):
   ```bash
   sleep 30
   curl -s "https://api.github.com/repos/jonas-pettersson/reading-canon/actions/runs?per_page=1" | head -100
   ```
   Both jobs must pass (Test & Lint, Build). If CI fails, stop and fix immediately.
6. Report: commit hash, files changed, test status, CI status

**Skip CI verification for:** Documentation only (*.md, artifacts/, adr/)  
**Always verify CI for:** Code (src/), tests, configs, migrations

**Don't auto-commit:** WIP, experimental changes, or when user says "don't commit yet"

### Git Workflow

- Default to one implementation task at a time
- Do not create branches, worktrees, sub-agents, or parallel implementation streams unless explicitly instructed
- Always inspect existing repository state before making changes
- Preserve unrelated user modifications
- Never overwrite changes not associated with the current task
- Parallel work is only allowed for clearly independent tasks and with explicit approval

## Dependency Management

- Do not introduce dependencies unless required by the specification, ADRs, or implementation plan.
- Before adding a new package:
  1. Verify it solves a documented requirement
  2. Check if existing dependencies can fulfill the need
  3. Evaluate package maintenance, security, and bundle size
  4. Document the decision if ambiguous
- Use exact versions specified in authoritative documents.
- Do not upgrade dependencies during feature implementation unless explicitly instructed.

## Meta: Document Maintenance

**Purpose:** Operational guidance for AI-assisted development - things that affect *how Claude works*, not *what the code does*.

**What belongs in CLAUDE.md:**
- Decision-making rules and document hierarchy
- Workflows (task boundaries, git, CI verification)
- Key architectural concepts not obvious from reading other docs

**What does NOT belong:**
- Project status, phase tracking, installation steps (→ README.md for humans)
- Data constants, enums, type definitions (→ code + spec.md)
- Feature documentation or implementation details already in code
- Anything already in authoritative docs (reference them instead)

**Best practices when updating:**
- Update when workflows or rules change, not when features are added
- Reference authoritative sources (spec.md, ADRs) rather than duplicating content
- Keep it concise - every section should serve a clear operational purpose
- Test the guidance - verify Claude follows instructions correctly after changes

## References

- Architecture summary: `adr/README.md`
- Complete requirements: `artifacts/spec.md`
- Implementation plan: `artifacts/plan-mvp0.md`
- Testing strategy: `adr/ADR-007-testing-strategy.md`

---

**Last Updated:** 2026-10-05 (Removed redundancies - content now in authoritative docs)
