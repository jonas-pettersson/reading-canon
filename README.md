# Reading Canon

A curated reading companion application for tracking and exploring significant literary and intellectual works.

## Project Purpose

Reading Canon transforms a carefully curated collection of books into a personal reading companion that helps readers discover, prioritize, read, and reflect on significant works.

This project is also a learning exercise in practicing an AI-native software development lifecycle with clear requirements, traceable decisions, and documented architecture.

## Project Status

**Phase:** MVP 0 Implementation In Progress  
**Current Activity:** Phase 2 (Book Collection Display) - In Progress

**Phase 0 Completed (2026-10-03):**
- ✅ Supabase project created and configured
- ✅ Frontend initialized (React 18 + TypeScript + Vite)
- ✅ Database schema implemented (3 tables: books, user_reading_status, external_references)
- ✅ Row-Level Security (RLS) policies enforced
- ✅ TypeScript types generated from schema
- ✅ CI/CD pipeline with GitHub Actions (lint, type check, tests, build)
- ✅ Pre-commit hooks with husky + lint-staged
- ✅ Test infrastructure (18 tests passing, 27 tests ready for auth)
- ✅ Coverage reporting configured (current: 55%, goal: 70%+)

**Phase 1 Completed (2026-10-03):**
- ✅ Task 1.1.1: Auth Context Provider - User/session state management (10 tests)
- ✅ Task 1.1.2: Protected Route Component - Route guards (6 tests)
- ✅ Task 1.2.1: Login Form Component - Email/password form with validation (16 tests)
- ✅ Task 1.2.2: Login Page - Page wrapper with routing (8 tests)
- ✅ Task 1.3.1: Create Curator Account - Admin script for bootstrapping

**Phase 2 Progress (2026-10-04):**
- ✅ Task 2.1.1: Book Query Hooks (useBooks) - Multi-book query with search/filter/sort (13 tests)
- ✅ Task 2.1.2: Single Book Query Hook (useBook) - Single book with external references (4 tests)
- ✅ Task 2.2.1: BookListItem Component - Reusable book card with accessibility (24 tests)
- ✅ Task 2.2.2: BookList Component - Container with loading/empty/error states (18 tests)
- ✅ Task 2.2.3: BookFilters Component - Search, 5 filters, sort controls (18 tests)

**Test Status:** 135 tests passing | 27 skipped (162 total) | Coverage: 89% statements, 100% functions

**Previously Completed:**
- ✅ Requirements Specification v1.4 (stable)
- ✅ Architecture Decision Records (ADR-001 through ADR-008)
- ✅ Architecture Review and Enhancement
- ✅ MVP 0 Implementation Plan (6 phases, 46 tasks)

**Next:** Phase 2.3 - Collection View Page (wire together BookList + BookFilters + useBooks)

## Document Hierarchy

Documents are organized by authority - later documents must align with earlier ones:

1. **`artifacts/vision.md`** - Stable product vision and guiding principles
2. **`artifacts/intent.md`** - Problem statement, desired outcomes, scope, and constraints
3. **`artifacts/design-decisions.md`** - Preliminary product and design decisions from visioning
4. **`artifacts/spec.md`** - Requirements specification v1.4 (Release Candidate)
5. **`adr/`** - Architecture Decision Records (ADR-001 through ADR-008)
6. **`artifacts/plan-mvp0.md`** - MVP 0 implementation plan (6 phases, 46 tasks with TDD integration)

### Architecture Documents

- **`adr/README.md`** - Complete architecture summary and technology stack
- **`adr/ADR-001-frontend-framework-selection.md`** - React + TypeScript + Vite
- **`adr/ADR-002-backend-architecture-approach.md`** - Supabase (BaaS)
- **`adr/ADR-003-database-selection.md`** - PostgreSQL (via Supabase)
- **`adr/ADR-004-authentication-strategy.md`** - Supabase Auth
- **`adr/ADR-005-hosting-and-deployment.md`** - Vercel
- **`adr/ADR-006-data-access-layer.md`** - Supabase Client + TypeScript
- **`adr/ADR-007-testing-strategy.md`** - Vitest + React Testing Library
- **`adr/ADR-008-data-migration-strategy.md`** - Local Node.js Script

### Supporting Documents

- **`examples/`** - Source data (Excel workbook) - excluded from version control

## Development Workflow

The development process follows this artifact chain:

```
vision.md 
  → intent.md 
    → design-decisions.md 
      → spec.md (v1.4) ✅
        → architecture (ADRs) ✅
          → implementation plan ✅
            → code (next)
```

### Architecture Summary

**Technology Stack:**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Backend-as-a-Service)
  - PostgreSQL database with Row-Level Security
  - Supabase Auth for authentication
  - Edge Functions for privileged operations (MVP 1)
- **Deployment**: Vercel (frontend) + Supabase Cloud (backend)
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **Data Migration**: Local Node.js script (one-time Excel import)

**Key Architectural Decisions:**
- Minimal backend code (SQL + RLS policies for MVP 0)
- Type-safe data access (generated types from database schema)
- Database-enforced authorization (Row-Level Security)
- Single-page application with responsive design
- Desktop-first for curation, mobile-essential for reading workflows

See `adr/README.md` for complete architecture documentation.

## Key Principles

### Product Principles

- **Curated, Not Comprehensive**: The canon remains editorially controlled
- **Quality Over Quantity**: Encourage thoughtful reading, not consumption metrics
- **Excellent Usability**: Must be better than spreadsheet for primary use cases
- **Progressive Enrichment**: Works with incomplete metadata, improves over time

### Development Principles

- **AI-Native SDLC**: Clear requirements, traceable decisions, documented architecture
- **Technology Follows Requirements**: Don't choose stack until requirements and UX are clear
- **Incremental Delivery**: Small, coherent releases proving value at each stage
- **Maintainability**: Code quality and documentation matter

## Core Concepts

- **Canonical Collection**: Curated set of books (metadata shared by all users)
- **Personal Reading Data**: Each user's status, ratings, notes (private)
- **Curator**: Collection owner with editorial control
- **Readers**: Invited users who can browse and track their own reading

## MVP Scope

### MVP 0: Single-User Validation
**Goal:** Prove core value - "better than Excel for curator's personal use"

**In Scope:**
- Single authenticated curator
- Collection management (display, search, filter, sort, CRUD operations)
- Personal reading tracking (status, priority, ownership, notes, rating)
- Basic statistics (counts by status and ownership)
- Excel data migration
- Localhost deployment acceptable for validation

**Success Criteria:**
- Curator prefers application over Excel spreadsheet
- Deciding what to read next is easier
- Updating reading progress is easier

### MVP 1: Shared Canon
**Goal:** Enable 2-5 invited readers to use the application

**Adds to MVP 0:**
- Multi-user authentication (email/password)
- Invitation workflow (curator-generated tokens)
- Role-based access control (curator vs. reader)
- User profiles with roles
- Production deployment on Vercel with HTTPS

**Deferred to Post-MVP:**
- Recommendation submission/approval workflow
- Social features (discussions, shared comments)
- Advanced statistics with visualizations
- Algorithmic reading suggestions
- Data export capabilities

## Next Steps

### Immediate: Phase 1 - Authentication & User Management

**See `artifacts/plan-mvp0.md` for the complete detailed plan.**

The implementation plan breaks MVP 0 into 6 phases with 46 specific tasks:

**Phase 0: Project Foundation** (3-4 days) ✅ COMPLETE
- ✅ Environment setup (Supabase + Vite + React + TypeScript)
- ✅ Database schema with RLS policies
- ✅ CI/CD pipeline and pre-commit hooks
- ✅ TypeScript type generation

**Phase 1: Authentication & User Management** (2-3 days) ✅ COMPLETE
- ✅ Auth context and hooks (Task 1.1.1)
- ✅ Protected routes (Task 1.1.2)
- ✅ Login UI form component (Task 1.2.1)
- ✅ Login page with routing (Task 1.2.2)
- ✅ Curator account bootstrap script (Task 1.3.1)

**Phase 2: Book Collection Display** (3-4 days)
- Book query hooks with search/filter/sort
- Book list and detail views
- Collection page with all features integrated

**Phase 3: Book Curation (CRUD)** (2-3 days)
- Add/edit/delete books
- External references management
- Form validation and error handling

**Phase 4: Personal Reading Management** (3-4 days)
- Reading status tracking
- Personal data panel (priority, rating, notes, ownership)
- Statistics dashboard

**Phase 5: Excel Data Migration** (2-3 days)
- Migration script with validation
- Test and production migration execution

**Phase 6: Polish & Validation** (2-3 days)
- UX polish (empty states, loading states, feedback)
- Accessibility audit
- Performance testing
- Curator acceptance testing

**Estimated Total Effort:** 20-25 days (160-200 hours)

**TDD Integration:** Every task specifies test approach (test-first, test-alongside, or security-first)

**Quality Gates:** Pre-commit hooks, CI/CD with coverage thresholds (≥70%), zero "TODO: test later" debt

**First Task:** Phase 0, Task 0.1.1 - Create Supabase Project

### Future (MVP 1 - Multi-User)
After MVP 0 validation, add multi-user capabilities:
- Invitation tokens table and generation logic
- User profiles with roles (curator vs. reader)
- Registration flow with invitation validation
- Role-based RLS policies
- Production deployment to Vercel

## Getting Started

### Prerequisites
- Node.js 20.x or later
- Git
- Supabase account (free tier)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jonas-pettersson/reading-canon.git
   cd reading-canon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Supabase credentials
   ```

4. **Create curator account:**
   ```bash
   npm run create-curator
   ```
   Follow the prompts to create your curator account. You'll need the `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173/login and sign in with your curator credentials.

6. **Run tests:**
   ```bash
   npm test              # Watch mode
   npm test -- --run     # Run once
   npm run test:coverage # With coverage
   ```

### Database Setup

The database schema is already deployed to Supabase. Migrations are in `supabase/migrations/`.

To regenerate TypeScript types after schema changes:
```bash
export SUPABASE_ACCESS_TOKEN=<your-token>
supabase gen types typescript --linked > src/types/database.ts
```

## Development Environment

**Frontend:**
- React 18 with TypeScript (strict mode)
- Vite for build tooling
- @supabase/supabase-js for data access
- @tanstack/react-query (TanStack Query) for server state
- Vitest + React Testing Library for testing
- oxlint for linting

**Backend:**
- Supabase (managed PostgreSQL + Auth + API)
- Row-Level Security for authorization
- Auto-generated TypeScript types from schema

**CI/CD:**
- GitHub Actions (lint, type check, tests, build)
- Pre-commit hooks (husky + lint-staged)
- Coverage reporting (vitest)

**Tools:**
- Supabase CLI for migrations and type generation
- Node.js 20.x
- Git for version control

**Deployment:**
- Vercel for frontend hosting (planned for MVP 1)
- Supabase Cloud for backend (currently active)

## Source Data

The project includes an existing Excel workbook with ~650 curated books accumulated over many years. This data will be migrated into the application with high fidelity to preserve accumulated editorial work.

## License

Private project for personal use.

---

**Last Updated**: 2026-10-03  
**Document Version**: 3.3 (Phase 1 Complete)  
**Project Phase**: MVP 0 Implementation - Phase 2 Book Collection Display (Ready)
