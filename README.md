# Reading Canon

A curated reading companion application for tracking and exploring significant literary and intellectual works.

## Project Purpose

Reading Canon transforms a carefully curated collection of books into a personal reading companion that helps readers discover, prioritize, read, and reflect on significant works.

This project is also a learning exercise in practicing an AI-native software development lifecycle with clear requirements, traceable decisions, and documented architecture.

## Project Status

**Phase:** Architecture Complete - Ready for Implementation  
**Current Activity:** Preparing for MVP 0 development

**Completed:**
- ✅ Requirements Specification v1.4 (stable)
- ✅ Architecture Decision Records (ADR-001 through ADR-008)
- ✅ Architecture Review and Enhancement

**Next:** MVP 0 Implementation (single-user validation)

## Document Hierarchy

Documents are organized by authority - later documents must align with earlier ones:

1. **`artifacts/vision.md`** - Stable product vision and guiding principles
2. **`artifacts/intent.md`** - Problem statement, desired outcomes, scope, and constraints
3. **`artifacts/design-decisions.md`** - Preliminary product and design decisions from visioning
4. **`artifacts/spec.md`** - Requirements specification v1.4 (Release Candidate)
5. **`adr/`** - Architecture Decision Records (ADR-001 through ADR-008)

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
          → implementation plan (next)
            → code
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

### Immediate (MVP 0 Implementation)
1. **Environment Setup**
   - Create Supabase project
   - Initialize Vite + React + TypeScript project
   - Configure TypeScript strict mode
   - Set up project structure

2. **Database Schema**
   - Write SQL migrations for core tables (books, user_reading_status, external_references)
   - Implement Row-Level Security policies
   - Create indexes for performance
   - Generate TypeScript types from schema

3. **Authentication Setup**
   - Configure Supabase Auth
   - Implement login/logout UI
   - Bootstrap initial curator account

4. **Core Features (MVP 0)**
   - Book list view (display, search, filter, sort)
   - Book detail view
   - Add/edit book forms (curator only)
   - Reading status management
   - Personal notes and ratings
   - Basic statistics

5. **Data Migration**
   - Implement Excel migration script
   - Test migration with sample data
   - Execute production migration

6. **Testing & Validation**
   - Implement component tests
   - Test RLS policies
   - Manual acceptance testing
   - MVP 0 validation with curator

### Future (MVP 1 - Multi-User)
- Implement `invitation_tokens` table
- Implement `profiles` table for user roles
- Create Edge Function for invitation generation
- Build registration flow
- Implement role-based UI variations
- Deploy to Vercel for production access

## Development Environment

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- React Hook Form for form handling
- Radix UI for accessible components
- Tailwind CSS for styling (recommended)
- TanStack Query for server state management
- Vitest + React Testing Library for testing

**Backend:**
- Supabase (managed PostgreSQL + Auth + API)
- Row-Level Security for authorization
- Edge Functions (Deno) for privileged operations

**Tools:**
- Supabase CLI for migrations and type generation
- Node.js for migration script
- Git for version control
- VS Code (recommended IDE)

**Deployment:**
- Vercel for frontend hosting (automatic HTTPS, Git integration)
- Supabase Cloud for backend (free tier sufficient for MVP)

## Source Data

The project includes an existing Excel workbook with ~650 curated books accumulated over many years. This data will be migrated into the application with high fidelity to preserve accumulated editorial work.

## License

Private project for personal use.

---

**Last Updated**: 2026-10-02  
**Document Version**: 2.0 (Architecture Complete)  
**Project Phase**: Ready for Implementation
