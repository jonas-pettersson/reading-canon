# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Reading Canon application.

## Overview

These ADRs document the key architectural decisions made during the design phase, following the completion of the Requirements Specification v1.4.

## Decision Summary

| ADR | Title | Status | Date | Decision |
|-----|-------|--------|------|----------|
| [ADR-001](./ADR-001-frontend-framework-selection.md) | Frontend Framework Selection | ACCEPTED | 2026-10-02 | React + TypeScript + Vite |
| [ADR-002](./ADR-002-backend-architecture-approach.md) | Backend Architecture Approach | ACCEPTED | 2026-10-02 | Supabase (BaaS) |
| [ADR-003](./ADR-003-database-selection.md) | Database Selection | ACCEPTED | 2026-10-02 | PostgreSQL (via Supabase) |
| [ADR-004](./ADR-004-authentication-strategy.md) | Authentication Strategy | ACCEPTED | 2026-10-02 | Supabase Auth |
| [ADR-005](./ADR-005-hosting-and-deployment.md) | Hosting and Deployment | ACCEPTED | 2026-10-02 | Vercel |
| [ADR-006](./ADR-006-data-access-layer.md) | Data Access Layer | ACCEPTED | 2026-10-02 | Supabase Client + TypeScript |
| [ADR-007](./ADR-007-testing-strategy.md) | Testing Strategy | ACCEPTED | 2026-10-02 | Vitest + React Testing Library |
| [ADR-008](./ADR-008-data-migration-strategy.md) | Data Migration Strategy | ACCEPTED | 2026-10-02 | Local Node.js Script |

## Complete Architecture Stack

Based on the decisions above, the Reading Canon application architecture is:

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│  React 18 + TypeScript + Vite                                   │
│  - Supabase JavaScript Client (@supabase/supabase-js)           │
│  - TanStack Query (optional but recommended for server state)   │
│  - Vitest + React Testing Library (testing)                     │
│  - Form/UI libraries selected during implementation             │
│                                                                 │
│  Hosted on: Vercel (production target for MVP 1)                │
│              Localhost (acceptable for MVP 0 validation)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS API calls
                              │ (@supabase/supabase-js)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                │
│  Supabase (Backend-as-a-Service)                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                       │  │
│  │ - Books, Users, UserReadingStatus, ExternalReferences    │  │
│  │ - Row-Level Security for authorization                   │  │
│  │ - Full-text search, indexes                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Supabase Auth                                            │  │
│  │ - Email/password authentication                          │  │
│  │ - Session management (JWT)                               │  │
│  │ - Password hashing (bcrypt)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Auto-generated REST API                                  │  │
│  │ - CRUD operations                                        │  │
│  │ - Filtering, sorting, full-text search                   │  │
│  │ - RLS-enforced authorization                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Hosted on: Supabase Cloud (free tier)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

1. **Separation of Concerns**: Frontend (React) handles presentation, backend (Supabase) handles data and business logic
2. **Type Safety**: End-to-end TypeScript with generated types from database schema
3. **Security**: Database-level authorization via Row-Level Security (RLS)
4. **Simplicity**: Minimal backend code for MVP 0 (SQL migrations + RLS policies), leveraging Supabase's auto-generated APIs
5. **Performance**: Global CDN (Vercel) + PostgreSQL indexing + client-side caching (React Query)
6. **Developer Experience**: Modern tooling, automatic deployments, fast feedback loops
7. **Cost Efficiency**: Free tiers of hosting providers typically sufficient for 1-10 users at expected usage (verify current limits)

## Technology Choices Summary

### Frontend

**Accepted Architectural Decisions:**
- **Framework**: React 18 (mature ecosystem, accessibility tooling)
- **Language**: TypeScript (type safety per NFR-043)
- **Build Tool**: Vite (fast dev server, optimized builds)
- **Testing**: Vitest + React Testing Library (see ADR-007)

**Recommended for MVP 0 Implementation:**
- **Forms**: React Hook Form (low re-renders, good validation)
- **UI Components**: Radix UI or similar for accessible primitives
- **Styling**: Tailwind CSS or CSS Modules (team preference)
- **Server State**: TanStack Query (recommended, see ADR-006) or direct Supabase client
- **Client State**: React Context + hooks (sufficient for MVP 0)
- **Accessibility Testing**: jest-axe for automated checks, manual testing for WCAG 2.1 AA compliance

**Minimal Dependency Principle for MVP 0:**
Add libraries when they solve a demonstrated need. Defer Zustand/Jotai unless React Context proves insufficient. Routing library only needed when multi-page navigation is implemented.

### Backend
- **Architecture**: Backend-as-a-Service (Supabase)
- **Database**: PostgreSQL 15+ (relational, full-text search, JSON support)
- **Authentication**: Supabase Auth (email/password, JWT sessions)
- **Authorization**: Row-Level Security (database-enforced)
- **API**: Auto-generated REST API from database schema
- **Data Access**: @supabase/supabase-js with generated TypeScript types

### Infrastructure
- **Frontend Hosting**: Vercel (CDN, automatic HTTPS, Git deployments)
- **Backend Hosting**: Supabase Cloud (managed PostgreSQL + Auth + API)
- **Deployment**: Automatic on Git push (Vercel for frontend)
- **SSL/TLS**: Automatic (Let's Encrypt via Vercel and Supabase)

## Cost Estimate

**MVP 0 & MVP 1 (1-10 users) as of 2026-10-02:**
- Vercel: Free tier sufficient for expected traffic
- Supabase: Free tier sufficient for database size and user count
- Domain (optional): ~$12/year

**Total:** Likely $0-1/month for expected usage, not including optional domain

**Important:** Free tier limits and pricing change over time. Verify current Vercel and Supabase pricing before deployment. For 1-10 users with a collection of <1,000 books, free tiers of reputable BaaS providers are typically sufficient, but the specific quotas and limits should be confirmed.

## Extensibility

The chosen architecture allows for future enhancements:

- **Real-time features**: Supabase real-time subscriptions available
- **Server-side rendering**: Migrate to Next.js on Vercel if needed
- **Complex backend logic**: Add Supabase Edge Functions (serverless)
- **File uploads**: Supabase Storage available
- **Advanced analytics**: Integrate analytics service (PostHog, Plausible)
- **Native mobile**: Same Supabase backend, add React Native frontend

## Migration Paths

If architectural changes are needed:

**Frontend Migration:**
- Vite-built static site can be deployed to alternative hosts (Netlify, Cloudflare Pages, any static host)
- React components themselves are portable
- Supabase client calls would need replacement if changing backend provider
- No Vercel-specific dependencies in code

**Backend Migration:**
- PostgreSQL schema and data are portable via `pg_dump` or Supabase export
- Can migrate to self-hosted Supabase (open-source)
- Migrating to a traditional backend (Express, tRPC) requires:
  - Exporting PostgreSQL schema and data
  - Rewriting RLS policies as application authorization logic
  - Replacing Supabase Auth with custom auth or alternative service
  - Replacing Supabase client queries with new data access layer
  - Significant development effort, not a trivial change
- **Vendor lock-in considerations:**
  - RLS policies are PostgreSQL-specific but not Supabase-specific
  - Supabase Auth user export is possible but password migration requires user password resets
  - Real-time subscriptions (if used) would need replacement
  - Generated types and query patterns are Supabase-specific

**Realistic Assessment:** The application has meaningful Supabase dependency. Migration to another provider is feasible (PostgreSQL and data are portable) but not trivial. It requires rewriting the data access layer and authentication integration. This is a deliberate trade-off: Supabase provides rapid MVP development in exchange for platform-specific integration patterns.

## Trade-offs Summary

**Accepted Trade-offs:**

1. **Less Backend Learning** → But gains: weeks of development time, secure auth, modern BaaS patterns
2. **Vendor Dependency** → But mitigated: open-source, PostgreSQL portable, static frontend portable
3. **React Complexity** → But gains: mature ecosystem, accessibility tooling, form libraries
4. **Supabase-Specific APIs** → But gains: minimal backend code (SQL + RLS), type-safe client, database-enforced authorization

**Rejected Alternatives:**
- Custom backend (Express, Go, Python) - too much code for single developer
- Vanilla JS or Svelte - smaller ecosystem, less accessibility tooling
- MongoDB - poor fit for relational data model
- GitHub Pages or VPS - less automation, more operational overhead

## References

- [Requirements Specification v1.4](../artifacts/spec.md)
- [Design Decisions](../artifacts/design-decisions.md)
- [Vision](../artifacts/vision.md)
- [Intent](../artifacts/intent.md)

## ADR Process

These ADRs follow the standard ADR template:

- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: The situation requiring a decision
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Consequences**: Impact of the decision (positive, negative, neutral)
- **Alternatives Considered**: Other options evaluated

New ADRs should be added to this directory and numbered sequentially.
