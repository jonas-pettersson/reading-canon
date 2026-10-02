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

## Complete Architecture Stack

Based on the decisions above, the Reading Canon application architecture is:

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│  React 18 + TypeScript + Vite                                   │
│  - React Hook Form (forms)                                      │
│  - Radix UI + Tailwind CSS (UI components)                      │
│  - React Query (state management)                               │
│  - Vitest + React Testing Library (testing)                     │
│                                                                 │
│  Hosted on: Vercel (global CDN, automatic HTTPS)                │
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
4. **Simplicity**: Zero backend code for MVP, leveraging Supabase's auto-generated APIs
5. **Performance**: Global CDN (Vercel) + PostgreSQL indexing + client-side caching (React Query)
6. **Developer Experience**: Modern tooling, automatic deployments, fast feedback loops
7. **Cost Efficiency**: Free tiers sufficient for 1-10 users (Vercel 100GB bandwidth, Supabase 500MB DB)

## Technology Choices Summary

### Frontend
- **Framework**: React 18 (mature, large ecosystem)
- **Language**: TypeScript (type safety, NFR-043)
- **Build Tool**: Vite (fast dev server, optimized builds)
- **Forms**: React Hook Form (best-in-class, low re-renders)
- **UI Components**: Radix UI (accessible primitives) + Tailwind CSS (utility-first styling)
- **State**: React Query (server state) + Context/Zustand (client state)
- **Testing**: Vitest (fast) + React Testing Library (user-centric)
- **Accessibility**: jest-axe (automated) + manual testing (WCAG 2.1 AA)

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

**MVP 0 & MVP 1 (1-10 users):**
- Vercel: **$0/month** (free tier: 100GB bandwidth)
- Supabase: **$0/month** (free tier: 500MB DB, 50K MAU)
- Domain (optional): **~$12/year**

**Total: $0-1/month** for expected usage

Free tiers are sufficient for years at the expected scale.

## MVP 0 vs MVP 1 Considerations

**MVP 0 (Single User Validation):**
- All architecture decisions apply
- Simplified authentication (single curator user)
- Local development acceptable initially
- Deploy to Vercel when remote access needed

**MVP 1 (Multi-User):**
- Invitation workflow implementation (FR-040, FR-041)
- Role-based access (curator vs reader)
- Production deployment with custom domain
- Full RLS policies for multi-user authorization

Architecture supports both MVP 0 and MVP 1 without changes.

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
- Static site is portable (HTML/CSS/JS)
- Can deploy to Netlify, Cloudflare, or any static host
- React code is framework-agnostic (no Vercel lock-in)

**Backend Migration:**
- PostgreSQL schema is portable (standard SQL)
- Can export to self-hosted Supabase
- Can migrate to traditional backend (Express, tRPC) with schema export
- Data is exportable (pg_dump or Supabase dashboard)

## Trade-offs Summary

**Accepted Trade-offs:**

1. **Less Backend Learning** → But gains: weeks of development time, secure auth, modern BaaS patterns
2. **Vendor Dependency** → But mitigated: open-source, PostgreSQL portable, static frontend portable
3. **React Complexity** → But gains: mature ecosystem, accessibility tooling, form libraries
4. **Supabase-Specific APIs** → But gains: zero backend code, type-safe, RLS authorization

**Rejected Alternatives:**
- Custom backend (Express, Go, Python) - too much code for single developer
- Vanilla JS or Svelte - smaller ecosystem, less accessibility tooling
- MongoDB - poor fit for relational data model
- GitHub Pages or VPS - less automation, more operational overhead

## Next Steps

With architecture complete, proceed to:

1. **Environment Setup**
   - Create Supabase project
   - Initialize Vite + React + TypeScript project
   - Configure TypeScript strict mode
   - Install dependencies

2. **Database Schema**
   - Write SQL migrations for entities (Books, Users, UserReadingStatus, etc.)
   - Set up Row-Level Security policies
   - Generate TypeScript types

3. **Authentication Setup**
   - Configure Supabase Auth
   - Implement login/logout UI
   - Create protected routes

4. **Core Features Implementation**
   - Book list view (FR-001)
   - Book detail view (FR-005)
   - Add/edit book forms (FR-010, FR-011)
   - Reading status management (FR-020)
   - Search and filtering (FR-002, FR-003)

5. **Testing Setup**
   - Configure Vitest + React Testing Library
   - Write tests for core components
   - Set up jest-axe for accessibility

6. **Deployment**
   - Connect GitHub repo to Vercel
   - Configure environment variables
   - Deploy MVP 0

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

---

**Architecture Status:** ✅ COMPLETE - Ready for implementation

**Last Updated:** 2026-10-02
