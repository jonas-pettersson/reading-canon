# Reading Canon

A curated reading companion application for tracking and exploring significant literary and intellectual works.

## Project Purpose

Reading Canon transforms a carefully curated collection of books into a personal reading companion that helps readers discover, prioritize, read, and reflect on significant works.

This project is also a learning exercise in practicing an AI-native software development lifecycle with clear requirements, traceable decisions, and documented architecture.

## Project Status

**Phase:** Requirements Review and Revision  
**Current Activity:** Revising requirements specification based on independent review

## Document Hierarchy

Documents are organized by authority - later documents must align with earlier ones:

1. **`artifacts/vision.md`** - Stable product vision and guiding principles
2. **`artifacts/intent.md`** - Problem statement, desired outcomes, scope, and constraints
3. **`artifacts/design-decisions.md`** - Preliminary product and design decisions from visioning
4. **`artifacts/spec.md`** - Requirements specification (currently v1.0, under revision to v1.1)

### Supporting Documents

- **`artifacts/spec-review-v1.0.md`** - Independent review of spec v1.0 identifying issues and recommendations
- **`examples/`** - Source data (Excel workbook) - excluded from version control

## Current Workflow

The development process follows this artifact chain:

```
vision.md 
  → intent.md 
    → design-decisions.md 
      → spec.md 
        → architecture (ADRs, coming next)
          → implementation plan
            → code
```

### Current Step

**Requirements Revision**: Addressing review findings from spec-review-v1.0.md:
- Clarifying MVP scope (curator-only baseline vs. multi-user)
- Removing implementation prescriptions from requirements
- Strengthening UX requirements
- Simplifying conceptual model (priority/rating/recommendation)
- Making requirements technology-neutral

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

## Next Steps

1. Complete spec.md v1.1 revision
2. Product owner review and decision on open questions
3. Create Architecture Decision Records (ADRs)
4. Design user experience
5. Create implementation plan
6. Begin development

## Development Environment

- **Language**: TBD (deferred to architecture phase)
- **Database**: TBD (deferred to architecture phase)
- **Deployment**: TBD (deferred to architecture phase)

Technology choices will be made during architecture design based on requirements and UX needs.

## Source Data

The project includes an existing Excel workbook with ~650 curated books accumulated over many years. This data will be migrated into the application with high fidelity to preserve accumulated editorial work.

## License

Private project for personal use.

---

**Last Updated**: 2026-10-01  
**Document Version**: 1.0
