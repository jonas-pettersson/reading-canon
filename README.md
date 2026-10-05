# Reading Canon

A curated reading companion application for tracking and exploring significant literary and intellectual works.

[![CI Status](https://github.com/jonas-pettersson/reading-canon/actions/workflows/ci.yml/badge.svg)](https://github.com/jonas-pettersson/reading-canon/actions)

## Overview

Reading Canon transforms a carefully curated collection of books into a personal reading companion that helps readers discover, prioritize, read, and reflect on significant works. This project is also a learning exercise in practicing an AI-native software development lifecycle with clear requirements, traceable decisions, and documented architecture.

**Current Status:** MVP 0 in progress  
📊 **Detailed Progress:** See [STATUS.md](STATUS.md) for current phase, tasks, and test metrics

## Core Concepts

- **Canonical Collection**: Curated set of books (metadata shared by all users)
- **Personal Reading Data**: Each user's status, ratings, notes (private to them)
- **Curator**: Collection owner with editorial control
- **Readers**: Invited users who can browse and track their own reading

## Technology Stack

**Frontend:**
- React 18 + TypeScript (strict mode)
- Vite for build tooling
- TanStack Query for server state management
- Vitest + React Testing Library

**Backend:**
- Supabase (Backend-as-a-Service)
  - PostgreSQL database with Row-Level Security
  - Supabase Auth for authentication
  - Auto-generated REST API

**Development:**
- GitHub Actions for CI/CD
- Pre-commit hooks (husky + lint-staged)
- oxlint for linting
- Coverage reporting (≥70% threshold)

See [adr/README.md](adr/README.md) for complete architecture documentation.

## Getting Started

### Prerequisites
- Node.js 20.x or later
- Git
- Supabase account (free tier)

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/jonas-pettersson/reading-canon.git
   cd reading-canon
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Create curator account:**
   ```bash
   npm run create-curator
   # Follow prompts - requires SUPABASE_SERVICE_ROLE_KEY in .env.local
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # Open http://localhost:5173/login
   ```

### Development Commands

```bash
npm run dev              # Start dev server
npm test                 # Run tests (watch mode)
npm test -- --run        # Run tests once
npm run test:coverage    # Run tests with coverage
npm run lint             # Run linter
npx tsc --noEmit        # Type check
```

### Database Schema

Migrations are in `supabase/migrations/`. To regenerate TypeScript types after schema changes:

```bash
export SUPABASE_ACCESS_TOKEN=<your-token>
supabase gen types typescript --linked > src/types/database.ts
```

## Project Structure

```
reading-canon/
├── artifacts/           # Project documentation
│   ├── vision.md        # Product vision and principles
│   ├── intent.md        # Problem statement and scope
│   ├── spec.md          # Requirements specification (v1.4)
│   └── plan-mvp0.md     # Implementation plan (6 phases, 46 tasks)
├── adr/                 # Architecture Decision Records
│   ├── README.md        # Architecture summary
│   └── ADR-*.md         # Individual decisions
├── src/
│   ├── components/      # Shared UI components
│   ├── features/        # Feature-specific code
│   ├── lib/             # Core utilities and configuration
│   ├── pages/           # Top-level page components
│   └── types/           # TypeScript types
├── supabase/
│   └── migrations/      # Database migrations
├── CLAUDE.md            # AI development guidance
├── STATUS.md            # Detailed progress tracking
└── README.md            # This file
```

## Product Principles

- **Curated, Not Comprehensive** - The canon remains editorially controlled
- **Quality Over Quantity** - Encourage thoughtful reading, not consumption metrics
- **Excellent Usability** - Must be better than spreadsheet for primary use cases
- **Progressive Enrichment** - Works with incomplete metadata, improves over time

## Development Principles

- **AI-Native SDLC** - Clear requirements, traceable decisions, documented architecture
- **Test-Driven Development** - Business logic test-first, components test-alongside
- **Type Safety** - TypeScript strict mode, generated types from database schema
- **Accessibility First** - WCAG 2.1 AA compliance required, automated testing with jest-axe
- **Quality Gates** - Pre-commit hooks, CI/CD pipeline, ≥70% coverage threshold

## Documentation

**Project Planning:**
- [STATUS.md](STATUS.md) - Detailed progress and test metrics
- [artifacts/plan-mvp0.md](artifacts/plan-mvp0.md) - Complete implementation plan
- [artifacts/spec.md](artifacts/spec.md) - Requirements specification

**Architecture:**
- [adr/README.md](adr/README.md) - Architecture summary
- [adr/](adr/) - Individual architecture decision records

**Development:**
- [CLAUDE.md](CLAUDE.md) - AI-assisted development guidance

## Contributing

This is a personal project developed as a learning exercise. The codebase demonstrates:
- AI-native development workflow with clear documentation
- Test-driven development practices
- Type-safe, accessible React applications
- Modern full-stack architecture with Supabase

## License

Private project for personal use.

---

**Last Updated:** 2026-10-05  
**Project Phase:** MVP 0 Implementation - Phase 3 Book Curation  
**For detailed status:** See [STATUS.md](STATUS.md)
