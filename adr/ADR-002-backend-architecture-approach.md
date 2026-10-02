# ADR-002: Backend Architecture Approach

## Status

**ACCEPTED** - 2026-10-02

This decision also determines ADR-003 (Database Selection: PostgreSQL via Supabase) and ADR-004 (Authentication Strategy: Supabase Auth).

## Context

The Reading Canon application requires a backend architecture to support the React frontend (ADR-001). The backend must handle data persistence, authentication, authorization, and business logic for a reading collection management system.

### Requirements Summary

**From Specification v1.4:**

**Data Requirements:**
- Relational data model with entities: Books, Users, UserReadingStatus, InvitationTokens, ExternalReferences, BookRecommendations
- Complex relationships (one-to-many, many-to-many implied through status tracking)
- Data integrity constraints (unique emails, unique book-user pairs)
- Progressive enrichment (optional fields, nullable attributes)

**Functional Requirements:**
- **MVP 0**: Single user CRUD operations, full-text search, filtering, sorting
- **MVP 1**: Multi-user authentication, invitation workflow, role-based access control
- Excel data migration (initial one-time import)
- Timestamps (created_at, updated_at) for audit trail

**Non-Functional Requirements:**
- **NFR-001**: Book list load < 2 seconds (1000 books)
- **NFR-002**: Search results < 1 second
- **NFR-003**: Support 10 concurrent users
- **NFR-020 to NFR-024**: Authentication, authorization, password security, HTTPS
- **NFR-040 to NFR-042**: Maintainability, documentation, traceability

**Open Questions:**
- **Q1**: Managed authentication service vs custom JWT implementation
- **Q3**: Single entity (Book) vs separate Work/Edition modeling (answered: single entity MVP)

### Project Context

- **Learning exercise**: AI-native SDLC, modern development practices
- **Single developer initially**: Simple setup preferred for MVP 0
- **Rapid iteration**: Need to validate core value quickly
- **Cost sensitivity**: Small user base (1-10 users), minimal hosting costs preferred
- **Type safety**: TypeScript on frontend suggests TypeScript backend could be beneficial

### Architecture Constraints

- Must integrate with React + TypeScript frontend (ADR-001)
- Must support relational data model (complex joins, foreign keys)
- Must scale to at least 10 concurrent users (NFR-003)
- Must support secure authentication (NFR-020 to NFR-024)
- Deployment must support HTTPS (NFR-024)

## Decision Drivers

1. **Development Speed**: Time to MVP 0 (single user validation)
2. **Type Safety**: Consistency with frontend TypeScript
3. **Authentication Simplicity**: Secure auth without reinventing the wheel
4. **Database Integration**: Support for relational model with migrations
5. **Learning Value**: Modern patterns, transferable skills
6. **Operational Simplicity**: Minimal devops for single developer
7. **Cost**: Low cost for small user base
8. **Scalability**: Can grow to MVP 1 and beyond
9. **Maintainability**: Clear patterns, good documentation
10. **Testing**: Easy to test business logic

## Options Considered

### Option 1: Backend-as-a-Service (Supabase)

**Description:** Supabase (open-source Firebase alternative) providing PostgreSQL database, authentication, real-time subscriptions, storage, and auto-generated REST/GraphQL APIs

**Stack:**
```
Backend: Supabase (Postgres + Auth + APIs)
Client: @supabase/supabase-js
Frontend: React + TypeScript (ADR-001)
Database: PostgreSQL (managed by Supabase)
Auth: Supabase Auth (email/password, magic links, OAuth)
Deployment: Supabase Cloud (free tier) or self-hosted
```

**Pros:**
- ✅ Fastest time to MVP (no backend code to write initially)
- ✅ PostgreSQL included (perfect for relational data model)
- ✅ Authentication built-in (email/password, magic links, OAuth) - solves Q1
- ✅ Row-level security (RLS) for authorization (NFR-021, NFR-022)
- ✅ Auto-generated REST API (or GraphQL) from database schema
- ✅ TypeScript types can be generated from database schema
- ✅ Free tier: 500MB database, 50,000 monthly active users (more than enough)
- ✅ Real-time subscriptions if needed later
- ✅ Migration tooling built-in (SQL migrations)
- ✅ Dashboard for data inspection and management
- ✅ Excellent documentation and community
- ✅ Can add custom backend functions (Edge Functions) when needed
- ✅ Self-hosting option if cloud concerns arise

**Cons:**
- ❌ Learning curve for Supabase-specific patterns (RLS policies, client library)
- ❌ Vendor lock-in (though open-source mitigates this)
- ❌ Less control over backend logic (though Edge Functions help)
- ❌ Complex queries might require custom SQL or functions
- ❌ RLS policies can be tricky to debug
- ❌ May need to drop down to raw SQL for complex operations

**Fit for Project:**
- Development Speed: ⭐⭐⭐⭐⭐ (Fastest - no backend code for MVP 0)
- Type Safety: ⭐⭐⭐⭐ (Good - generated types from schema)
- Auth Simplicity: ⭐⭐⭐⭐⭐ (Excellent - built-in, battle-tested)
- Database: ⭐⭐⭐⭐⭐ (Excellent - PostgreSQL is perfect fit)
- Learning Value: ⭐⭐⭐⭐ (Good - modern BaaS patterns)
- Operational: ⭐⭐⭐⭐⭐ (Excellent - fully managed)
- Cost: ⭐⭐⭐⭐⭐ (Excellent - free tier sufficient)
- Scalability: ⭐⭐⭐⭐⭐ (Excellent - handles growth easily)

**Estimated Setup Time:** 2-4 hours (schema + RLS policies + client integration)

---

### Option 2: Node.js + Express + PostgreSQL (Traditional REST API)

**Description:** Custom Node.js backend with Express framework, PostgreSQL database, custom JWT authentication

**Stack:**
```
Backend: Node.js + Express + TypeScript
Database: PostgreSQL (self-hosted or managed)
ORM: Prisma or Drizzle
Auth: Custom JWT implementation or Passport.js
Deployment: VPS (DigitalOcean, Hetzner) or PaaS (Railway, Render)
```

**Pros:**
- ✅ Full control over backend logic and architecture
- ✅ TypeScript on both frontend and backend (consistent types)
- ✅ Familiar patterns (REST API, middleware, routes)
- ✅ Excellent learning opportunity (build auth, understand JWT)
- ✅ Large ecosystem (npm packages for everything)
- ✅ Flexible - can structure code however desired
- ✅ Good debugging tools (Node inspector)
- ✅ Can use Prisma for type-safe database access
- ✅ Testing is straightforward (jest, supertest)

**Cons:**
- ❌ Must build authentication from scratch (security risk if done wrong)
- ❌ Must implement password hashing, token management, refresh logic
- ❌ Must write all CRUD endpoints manually
- ❌ Must handle database migrations manually
- ❌ Must configure CORS, security headers, rate limiting
- ❌ More code to maintain (auth, API routes, middleware)
- ❌ Deployment complexity (need to manage server/container)
- ❌ Higher operational overhead (monitoring, logs, updates)

**Fit for Project:**
- Development Speed: ⭐⭐⭐ (Moderate - lots of boilerplate)
- Type Safety: ⭐⭐⭐⭐⭐ (Excellent - end-to-end TypeScript)
- Auth Simplicity: ⭐⭐ (Poor - must build from scratch)
- Database: ⭐⭐⭐⭐⭐ (Excellent - PostgreSQL with Prisma)
- Learning Value: ⭐⭐⭐⭐⭐ (Excellent - learn everything)
- Operational: ⭐⭐ (Poor - must manage infrastructure)
- Cost: ⭐⭐⭐ (Moderate - VPS ~$5-12/month or PaaS ~$7-20/month)
- Scalability: ⭐⭐⭐⭐ (Good - can scale but requires work)

**Estimated Setup Time:** 20-40 hours (project structure + auth + CRUD + migrations + deployment)

---

### Option 3: Node.js + tRPC + PostgreSQL (Type-Safe RPC)

**Description:** Node.js backend using tRPC for end-to-end type safety with React frontend, PostgreSQL database

**Stack:**
```
Backend: Node.js + tRPC + TypeScript
Database: PostgreSQL (managed or self-hosted)
ORM: Prisma or Drizzle
Auth: Custom or NextAuth.js
Deployment: Vercel (for Next.js) or traditional hosting
```

**Pros:**
- ✅ End-to-end type safety (frontend knows backend types automatically)
- ✅ No API contract to maintain (types are the contract)
- ✅ Excellent developer experience with TypeScript
- ✅ Less boilerplate than REST (no manual endpoint definitions)
- ✅ Good for rapid iteration (types update automatically)
- ✅ Works well with Prisma for database access
- ✅ Modern, growing ecosystem

**Cons:**
- ❌ Still requires custom authentication implementation
- ❌ Relatively new (less mature than REST)
- ❌ Smaller community than Express
- ❌ Typically used with Next.js (less common with Vite + React)
- ❌ Must still write all procedures manually
- ❌ Deployment complexity similar to traditional backend
- ❌ Not RESTful (harder to integrate with external tools)

**Fit for Project:**
- Development Speed: ⭐⭐⭐ (Moderate - still lots of code)
- Type Safety: ⭐⭐⭐⭐⭐ (Excellent - best end-to-end types)
- Auth Simplicity: ⭐⭐ (Poor - must build from scratch)
- Database: ⭐⭐⭐⭐⭐ (Excellent - Prisma integration)
- Learning Value: ⭐⭐⭐⭐⭐ (Excellent - cutting-edge patterns)
- Operational: ⭐⭐ (Poor - must manage infrastructure)
- Cost: ⭐⭐⭐ (Moderate - similar to Express)
- Scalability: ⭐⭐⭐⭐ (Good - can scale)

**Estimated Setup Time:** 16-30 hours (tRPC setup + auth + procedures + migrations + deployment)

---

### Option 4: Go + Chi/Gin + PostgreSQL

**Description:** Go backend with Chi or Gin framework, PostgreSQL database

**Stack:**
```
Backend: Go + Chi or Gin framework
Database: PostgreSQL
ORM: GORM or sqlc
Auth: Custom JWT with golang-jwt
Deployment: Single binary (VPS or PaaS)
```

**Pros:**
- ✅ Excellent performance (compiled, lightweight)
- ✅ Single binary deployment (easy to deploy)
- ✅ Strong type safety in Go
- ✅ Great for learning systems programming
- ✅ Good standard library (crypto, HTTP, JSON)
- ✅ Fast compile times
- ✅ Lower resource usage than Node.js

**Cons:**
- ❌ No shared types with TypeScript frontend
- ❌ Must build authentication from scratch
- ❌ More verbose than TypeScript/Node
- ❌ Smaller ecosystem than Node for web dev
- ❌ Must write all CRUD endpoints manually
- ❌ Learning curve if unfamiliar with Go
- ❌ Less common for CRUD web apps (more common for APIs/services)

**Fit for Project:**
- Development Speed: ⭐⭐ (Slow - more code, different language)
- Type Safety: ⭐⭐⭐ (Adequate - Go is typed but no shared types)
- Auth Simplicity: ⭐⭐ (Poor - must build from scratch)
- Database: ⭐⭐⭐⭐⭐ (Excellent - PostgreSQL support)
- Learning Value: ⭐⭐⭐⭐⭐ (Excellent - learn different paradigm)
- Operational: ⭐⭐⭐⭐ (Good - single binary is nice)
- Cost: ⭐⭐⭐⭐ (Good - low resource usage)
- Scalability: ⭐⭐⭐⭐⭐ (Excellent - Go excels at scale)

**Estimated Setup Time:** 25-45 hours (especially if learning Go from scratch)

---

### Option 5: Python + FastAPI + PostgreSQL

**Description:** Python backend with FastAPI framework, PostgreSQL database

**Stack:**
```
Backend: Python + FastAPI
Database: PostgreSQL
ORM: SQLAlchemy or Tortoise ORM
Auth: Custom JWT or FastAPI-Users
Deployment: Docker container (VPS or PaaS)
```

**Pros:**
- ✅ Excellent for rapid prototyping
- ✅ FastAPI has automatic OpenAPI/Swagger docs
- ✅ Good type hints in Python 3.10+
- ✅ Large ecosystem of libraries
- ✅ Good for data-heavy applications
- ✅ Async support built-in
- ✅ Can generate TypeScript types from OpenAPI

**Cons:**
- ❌ Not TypeScript (no native type sharing with frontend)
- ❌ Must build authentication from scratch
- ❌ Python type hints less strict than TypeScript
- ❌ Slower than Go or Node for I/O operations
- ❌ Deployment more complex (need Python environment)
- ❌ Less common for CRUD apps (more common for data/ML)

**Fit for Project:**
- Development Speed: ⭐⭐⭐⭐ (Good - FastAPI is quick)
- Type Safety: ⭐⭐⭐ (Adequate - type hints help but not as strict)
- Auth Simplicity: ⭐⭐⭐ (Adequate - FastAPI-Users exists)
- Database: ⭐⭐⭐⭐⭐ (Excellent - SQLAlchemy is mature)
- Learning Value: ⭐⭐⭐⭐ (Good - different ecosystem)
- Operational: ⭐⭐⭐ (Adequate - Docker helps)
- Cost: ⭐⭐⭐ (Moderate - similar to Node)
- Scalability: ⭐⭐⭐⭐ (Good - async helps)

**Estimated Setup Time:** 18-35 hours (FastAPI + auth + CRUD + deployment)

---

## Decision Matrix

| Criteria (Weight)              | Supabase | Express | tRPC | Go | FastAPI |
|--------------------------------|----------|---------|------|----|---------|
| Development Speed (10)         | 10       | 5       | 6    | 3  | 7       |
| Type Safety (9)                | 8        | 10      | 10   | 6  | 6       |
| Auth Simplicity (10)           | 10       | 3       | 3    | 3  | 5       |
| Database Integration (8)       | 10       | 10      | 10   | 10 | 10      |
| Learning Value (7)             | 8        | 9       | 10   | 10 | 8       |
| Operational Simplicity (9)     | 10       | 3       | 3    | 6  | 4       |
| Cost (7)                       | 10       | 6       | 6    | 8  | 6       |
| Scalability (6)                | 10       | 8       | 8    | 10 | 8       |
| Maintainability (8)            | 9        | 7       | 8    | 7  | 7       |
| Testing (6)                    | 7        | 9       | 9    | 9  | 9       |
| **Weighted Total**             | **728**  | **536** | **570** | **528** | **552** |

### Scoring Notes:
- Supabase dominates on development speed, auth simplicity, and operational simplicity
- Express/tRPC score well on type safety but lose points on auth and ops complexity
- Go scores well on scalability and learning but loses on development speed
- FastAPI is balanced but doesn't excel in any area critical for this project

## Decision

**PROPOSED: Supabase (Backend-as-a-Service)**

### Rationale

Supabase is the recommended choice for the Reading Canon application because:

1. **Fastest Path to MVP 0**: No backend code required initially. Define database schema, set up Row-Level Security policies, and connect from React. Can validate core product value in days instead of weeks.

2. **Authentication Built-In**: Supabase Auth solves the security challenge identified in Q1. Email/password, magic links, and OAuth work out of the box. No risk of implementing auth incorrectly.

3. **PostgreSQL Native**: The specification's relational data model (Books, Users, UserReadingStatus, foreign keys, constraints) maps perfectly to PostgreSQL. Supabase provides PostgreSQL with a modern DX.

4. **Row-Level Security (RLS)**: Authorization requirements (NFR-021: users see only their data, NFR-022: only curator modifies collection) are enforced at the database level, not in application code. This is more secure and harder to bypass.

5. **Type Safety**: Supabase can generate TypeScript types from the database schema, maintaining consistency with the React frontend (ADR-001).

6. **Cost**: Free tier provides 500MB database and 50,000 MAU. The application expects 1-10 users. Free tier sufficient for years.

7. **Learning Value**: Modern BaaS patterns, PostgreSQL, RLS, and declarative authorization are valuable transferable skills.

8. **Operational Simplicity**: Single developer doesn't need to manage servers, databases, auth infrastructure, or SSL certificates. Focus on application logic.

9. **Escape Hatch**: If Supabase becomes limiting, can add Edge Functions (serverless) or migrate to self-hosted Supabase or traditional backend. PostgreSQL schema is portable.

10. **Migration Support**: SQL migrations and dashboard make Excel data import straightforward (UC-004).

### Trade-offs Accepted

- **Vendor Lock-In**: Mitigated by open-source nature and PostgreSQL portability. Schema and data can be exported.
- **Less Backend Learning**: Not building auth or REST API from scratch. However, learning RLS and BaaS patterns is valuable.
- **RLS Complexity**: RLS policies can be tricky but enforcing security at DB level is more robust than application-level checks.
- **Limited Backend Logic Initially**: Must use Edge Functions for complex logic. For MVP 0 CRUD operations, this isn't needed.

### When This Choice Might Change

Consider migrating away from Supabase if:
- Complex backend business logic is needed beyond database CRUD
- Real-time requirements exceed Supabase's capabilities
- Cost becomes prohibitive (unlikely at 1-10 users)
- Specific backend framework is a learning goal (can revisit post-MVP 0)

## Consequences

### Positive

- Extremely fast MVP 0 development (days instead of weeks)
- Authentication and authorization solved securely
- PostgreSQL provides robust relational database
- Type-safe database access with generated types
- No devops overhead (managed hosting)
- Free for expected user scale
- Migration tooling and dashboard for development
- Real-time subscriptions available if needed later
- Can add custom backend logic via Edge Functions when needed

### Negative

- Must learn Supabase-specific patterns (RLS, client library)
- RLS policies can be difficult to debug
- Less control over backend architecture initially
- Not learning traditional backend development (Express, auth, JWT)
- Vendor dependency (though mitigated by open-source)

### Neutral

- May need to drop to raw SQL for complex queries (but this is good PostgreSQL learning)
- Edge Functions (Deno-based) for custom logic when needed
- Self-hosting option exists but not needed for MVP

## Implementation Notes

### Recommended Tech Stack

```
Architecture:
├── Frontend: React + TypeScript + Vite (ADR-001)
├── Backend: Supabase
│   ├── Database: PostgreSQL (managed)
│   ├── Auth: Supabase Auth (email/password)
│   ├── API: Auto-generated REST/GraphQL
│   └── Functions: Edge Functions (when needed)
├── Client: @supabase/supabase-js
├── Types: Generated from database schema
└── Deployment: Supabase Cloud (free tier)
```

### Initial Setup Steps

1. Create Supabase project (free tier)
2. Define database schema (migrations):
   - Books table with canonical fields
   - Users table (managed by Supabase Auth)
   - UserReadingStatus table with foreign keys
   - ExternalReferences table
   - InvitationTokens table (MVP 1)
3. Set up Row-Level Security policies:
   - Books: readable by all authenticated users, writable by curator only
   - UserReadingStatus: users can only see/modify their own records
   - InvitationTokens: curator only
4. Generate TypeScript types from schema
5. Integrate Supabase client in React app
6. Implement authentication UI (login, register via invitation)
7. Create data migration script for Excel import (UC-004)

### Database Schema (SQL Migrations)

Will use Supabase migrations to define:
- Tables matching data model in specification section 2.1
- Foreign key constraints
- Unique constraints (user+book for status, email for users)
- Indexes for performance (search fields, sort fields)
- RLS policies for authorization

### Key Architectural Decisions Enabled

- **ADR-003**: Database selection (PostgreSQL via Supabase)
- **ADR-004**: Authentication strategy (Supabase Auth)
- **ADR-005**: Hosting approach (Supabase Cloud for backend, separate decision for frontend hosting)

### Migration Path

If Supabase proves limiting:
1. Export PostgreSQL schema and data
2. Deploy self-hosted Supabase instance, or
3. Migrate to traditional backend (Express/tRPC) with exported schema
4. Frontend changes minimal (just swap Supabase client for REST/GraphQL client)

## References

- [Requirements Specification v1.4](../artifacts/spec.md) - Data model section 2.1, Q1 (authentication)
- [ADR-001: Frontend Framework Selection](./ADR-001-frontend-framework-selection.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Decision Date

2026-10-02

## Decision Makers

- Jonas Pettersson (Curator/Developer)
- Claude Sonnet 4.5 (AI Assistant)

## Review Date

To be reviewed after MVP 0 implementation or if Supabase limitations are encountered that block core features.
