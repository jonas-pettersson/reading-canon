# Requirements Specification Review: Reading Canon v1.0

**Review Date:** 2026-10-01  
**Reviewer Role:** Independent senior product manager, requirements engineer, UX lead, solution architect  
**Document Under Review:** spec.md v1.0  
**Review Status:** Complete - Rework Required

---

## Executive Summary

The specification (spec.md v1.0) represents significant work translating the vision and intent into detailed requirements. However, it suffers from **scope creep**, **premature implementation decisions**, and **unclear MVP boundaries** that risk derailing a disciplined development process.

The specification conflates requirements with implementation, introduces features not justified by the source documents, and does not sufficiently clarify the user experience before prescribing technical solutions.

**Primary concerns:**
- Multi-user features drive significant complexity but may not belong in MVP
- Three overlapping concepts (priority, rating, recommendation score) create confusion
- Technology-specific implementation details pervade what should be a technology-neutral requirements document
- UX requirements are underspecified relative to the emphasis on excellent usability
- MVP scope is ambiguous with many "Should Have" items blurring boundaries

**Recommendation:** Rework required. The specification needs significant revision to clarify MVP scope, remove implementation prescriptions, strengthen UX requirements, and simplify the conceptual model.

---

## Overall Assessment

### Strengths
- Comprehensive coverage of the problem domain
- Good traceability effort with explicit source references
- Thoughtful separation of canonical vs. personal data
- Recognition of progressive enrichment principle
- Detailed data migration considerations

### Weaknesses
- Unclear what constitutes the true minimum viable product
- Heavy implementation prescription (database schemas, specific technologies, algorithms)
- Insufficient UX specification for an application emphasizing "excellent usability"
- Conceptual confusion around priority/rating/recommendation scoring
- Multi-user complexity may be premature for first release

**Scope Clarity:** Poor. The line between MVP, "Should Have," and future enhancements is inconsistent.

**Technical Neutrality:** Poor. The specification prescribes databases, frameworks, authentication approaches, and implementation patterns.

**UX Readiness:** Poor. Insufficient detail to begin user experience design work.

**Internal Consistency:** Fair. Some terminology drift and conflicting requirements exist.

---

## What Is Already Strong and Should Be Retained

### Core Concept Clarity
- Clear articulation of curated canon as differentiator (FR-001 to FR-005)
- Strong separation of canonical book data from personal user data (Section 2.1)
- Explicit curator control model (FR-043, NFR-022)

### Progressive Enrichment Principle
- Recognition that metadata can be incomplete (Section 2.3)
- Optional fields properly identified in data model
- Migration approach considers data quality preservation (NFR-030)

### Reading Status Model
- FR-020 reading status lifecycle (Want to Read, Reading, Paused, Finished, Abandoned) correctly implements design-decisions.md #4
- Multiple concurrent "Reading" books supported (FR-020 acceptance criteria)
- Timestamp tracking for started_at and completed_at (FR-026)

### Ownership Tracking
- FR-023 ownership model (Not Owned, Ordered, Owned Physical/Digital, Borrowed) correctly implements design-decisions.md #6
- Ownership is personal, not shared (correct separation)

### Search and Filter
- FR-002 to FR-004 cover fundamental discovery operations
- Filter criteria align with data model

### Data Migration Awareness
- Recognition that migration quality matters (NFR-030)
- Acknowledgment of edge cases (year formats, BC dates, unusual values)
- Migration mapping table (Section 2.2) useful reference

### Traceability Effort
- Section 9 traceability matrix demonstrates intent to connect requirements to sources
- Functional requirements include source references
- Recognition of AI-native SDLC goal (NFR-041, NFR-042)

---

## Major Issues That Must Be Resolved

### Issue 1: Ambiguous MVP Scope

**Problem:** The specification does not clearly define what constitutes the minimum viable product. Features marked "Must Have," "Should Have (MVP scope)," and "Should Have" create confusion. Multi-user support with invitations, role-based access, and recommendation workflows may be premature.

**Why it matters:** Unclear MVP scope leads to over-engineering, extended timelines, and potential failure to deliver a working system. The first release should prove the core value proposition (better than Excel for curator's personal use) before adding social features.

**Affected sections:**
- FR-013, FR-014: Recommendation review/approval (marked "Should Have (MVP scope)")
- FR-033: Algorithmic next-book suggestions (marked "Should Have")
- FR-040, FR-041: Invitation tokens and registration
- FR-042: Email/password authentication
- FR-043: Role-based permissions
- Entire "Invitation Tokens" entity (Section 2.1)
- Entire "Book Recommendations" entity (Section 2.1)
- UC-005, UC-006: Invitation workflows

**Recommendation:** Explicitly define two MVPs:
- **MVP 0 (Curator-only):** Single authenticated user (curator), collection management, personal reading tracking, statistics, Excel migration. No multi-user, no invitations, no recommendation workflow. This proves core value: "better than Excel for me."
  
- **MVP 1 (Shared Canon):** Add multi-user (2-5 users), invitation workflow, role-based access, readers can view and track. Defer recommendation submission/approval to post-MVP.

**Release placement:**
- FR-040 to FR-043, UC-005, UC-006, Invitation Tokens entity, Book Recommendations entity → MVP 1 or later
- FR-013, FR-014 → Post-MVP 1
- FR-033 algorithmic suggestions → Post-MVP 1

---

### Issue 2: Three Overlapping Concepts (Priority, Rating, Recommendation)

**Problem:** The specification includes three separate user-assigned values per book:
1. **Personal Priority** (FR-021): "How soon I want to read this" (High/Medium/Low)
2. **Personal Rating** (FR-025): "Personal enjoyment/value" (1-5 stars)
3. **Recommendation Score** (FR-022): "How strongly would I recommend to others" (1-5)

The distinction between rating and recommendation score is unclear. Most readers would say "I'd give it 4 stars" and "I'd recommend it strongly" as equivalent statements. The spec does not justify why both are needed or explain what decision each supports.

**Why it matters:** Three overlapping concepts confuse users and complicate the interface. If the curator cannot articulate a clear difference between rating and recommendation, users certainly won't understand it.

**Affected sections:**
- FR-021, FR-022, FR-025
- User Reading Status entity fields (Section 2.1)
- Design-decisions.md #5 (which proposes separating priority from recommendation but doesn't mention rating)
- User stories US-002, US-009

**Recommendation:** Simplify to two concepts for MVP:
1. **Personal Priority** (Next / Soon / Someday / None): Answers "When do I want to read this?"
2. **Personal Rating** (1-5 stars or None): Answers "How much did I enjoy/value this?" and by implication, "Would I recommend it?"

Defer separate recommendation score. If social features develop later and users want to recommend books they didn't personally enjoy highly (e.g., "I found it challenging but it's important"), add recommendation score then.

**Release placement:**
- FR-022 (Recommendation Score) → Defer post-MVP or remove
- Retain FR-021 (Priority) and FR-025 (Rating) for MVP

---

### Issue 3: Premature Implementation and Technology Prescription

**Problem:** The specification prescribes implementation details throughout:
- Database technology: UUIDs, foreign keys, UNIQUE constraints, JSONB (PostgreSQL-specific), row-level security
- Pagination ("over 100 books" triggers pagination - FR-001)
- Password hashing algorithms ("bcrypt or argon2" - NFR-023, Users entity line 377)
- TypeScript (NFR-043)
- Specific authentication patterns (JWT in Q1, invitation tokens)
- Completeness score formula (Section 2.3, lines 458-471)
- "Three-tier validation" in migration script (UC-004, line 836)

These are architecture and implementation decisions, not requirements.

**Why it matters:** Prescribing implementation prevents the architecture phase from evaluating alternatives. Technology choices should follow from requirements and UX design, not precede them. This violates the stated principle (design-decisions.md #12) that "technology selection should be deferred until requirements, UX concept, architecture have been completed."

**Affected sections:**
- Entire Section 2.1 (data model with database-specific syntax)
- FR-001 acceptance criteria ("paginated for collections over 100 books")
- NFR-021 ("Row-level security or application-level authorization")
- NFR-023 ("bcrypt or argon2")
- NFR-043 (TypeScript requirement)
- Section 2.3 (completeness score formula)
- UC-004 (migration script implementation details)
- Q1 (JWT mentioned)

**Recommendation:** Rewrite data model requirements as entity and relationship descriptions without database syntax. Move all implementation patterns to architecture phase (ADRs). Rewrite requirements as technology-neutral needs.

**Examples:**

| Current (Prescriptive) | Revised (Requirement) |
|------------------------|----------------------|
| `id` (UUID, primary key) | Each book must be uniquely identifiable |
| System validates required fields before saving | System must not persist incomplete book records (title and author required) |
| Passwords must be securely hashed using bcrypt or argon2 | Passwords must not be stored in recoverable form |
| List is paginated for collections over 100 books | System must remain responsive when displaying large collections |
| TypeScript for all application code | Codebase must support compile-time type checking |

**Release placement:**
- Move all implementation details to ADRs (post-spec, pre-implementation)
- Rewrite affected requirements as technology-neutral

---

### Issue 4: Insufficient UX Specification

**Problem:** For an application whose core principle is "excellent usability" (vision.md, intent.md, design-decisions.md #11) and whose primary success criterion is "curator prefers using the application over the spreadsheet" (SC-001), the specification provides minimal UX requirements.

**Missing UX requirements:**
- Information architecture: How is the application organized? What are the main views/screens?
- Navigation structure: How does the user move between collection view, book details, statistics, settings?
- Primary interaction patterns: How does the user mark a book as "Reading"? Inline button? Modal dialog? Contextual menu?
- Empty states: What does the user see with zero books currently reading? Zero finished books?
- Error states: What happens when search returns no results? When filter produces empty set?
- Feedback and confirmation: Does status change provide immediate feedback? Does delete require confirmation?
- Keyboard navigation: Can the user navigate the collection without a mouse?
- Accessibility: Screen reader support? Color contrast? Focus management?
- Responsive behavior: What happens on narrow screens? (Marked "nice to have" but not specified)
- Default sort order: How are books initially ordered when user opens collection?
- Bulk operations: Can curator update multiple books at once?

**Why it matters:** Without UX specification, the architecture and implementation phases cannot make informed decisions about component structure, state management, or interaction design. "Easier than Excel" (NFR-010) is not a specification—it's an aspiration without actionable detail.

**Affected sections:**
- NFR-010 ("Easier Than Excel" - vague)
- NFR-012 ("Intuitive Interface" - vague)
- User stories provide scenarios but not interaction details
- Use cases describe data flows but not user experience

**Recommendation:** Before finalizing spec, add Section 1.6 "User Experience Requirements" covering:
- UX-001: Information architecture (main views: Collection, Book Detail, Reading Dashboard, Statistics, Settings)
- UX-002: Navigation and wayfinding (persistent nav, breadcrumbs, back button behavior)
- UX-003: Primary interactions (inline editing, modal patterns, confirmation dialogs)
- UX-004: Empty and error states (every list view, every filter result)
- UX-005: Feedback and state changes (toasts, inline updates, optimistic UI)
- UX-006: Keyboard accessibility (tab navigation, keyboard shortcuts for common actions)
- UX-007: Screen reader accessibility (semantic HTML, ARIA labels, focus management)
- UX-008: Responsive behavior (breakpoints, mobile considerations)
- UX-009: Performance perception (loading states, skeleton screens, progress indicators)

Alternatively, create a separate UX brief document before finalizing spec.md.

**Release placement:**
- UX requirements are not deferrable - they define the MVP experience
- Add to spec.md v1.1 or create ux-requirements.md as companion document

---

### Issue 5: Data Model Rigidity and Gaps

**Problem:** The Books entity data model has structural issues:

1. **Author Model Too Rigid:**
   - Only `author_first_name` and `author_last_name` cannot represent:
     - Single-name authors (Homer, Virgil, Dante)
     - Collective authors (Unknown, Anonymous, Various)
     - Complex authorship (Edited by, Translated by, Multiple authors)
     - Non-Western naming conventions where "first" and "last" don't apply

   The curator's existing spreadsheet includes ancient works and multilingual content - the model must not assume conventional Western author names.

2. **Category/Genre/Subject Redundancy:**
   - Three separate string fields: `category`, `genre`, `subject`
   - Not clear how these differ or when to use each
   - Single-value strings cannot represent books spanning multiple categories (e.g., "Philosophy" + "History")
   - Design-decisions.md #7 mentions "tags" but tags are absent from data model

3. **Tags Missing:**
   - Design-decisions.md #7: "Single collection with categories, genres, subjects, tags"
   - Tags entity/relationship not in spec.md

4. **Curator Comment vs. Inclusion Rationale:**
   - `books.curator_comment` (text field): "shared notes about the book"
   - But intent.md asks "Why is a book included in the canon?"
   - Are curator comments about why it's included, or are they reading notes? Distinction unclear.

**Why it matters:**
- Rigid author model will fail during Excel migration when encountering "Homer" or "Unknown"
- Category/genre/subject confusion leads to inconsistent data entry
- Missing tags limits discoverability
- Curator comment ambiguity affects what information readers see

**Affected sections:**
- Books entity (Section 2.1)
- FR-010 acceptance criteria
- FR-005 acceptance criteria
- Migration mapping table (Section 2.2)
- Design-decisions.md #7 expectation of tags

**Recommendation:**

1. **Flexible Author Model:**
   - Replace `author_first_name` + `author_last_name` with:
     - `author_display_name` (string, required): "Homer", "Tolstoy, Leo", "Unknown"
     - `author_sort_name` (string, optional): For sorting - "Homer", "Tolstoy, Leo"
     - `author_first_name` + `author_last_name` (optional): Parse if available, but don't require

2. **Simplify Category/Genre/Subject:**
   - Use single multi-valued "tags" or "categories" field
   - Or keep `category` (primary classification: Novel, Play, Poetry, Philosophy, History) and replace genre/subject with multi-valued `tags`
   - Define controlled vocabulary for primary categories

3. **Clarify Curator Comment:**
   - Rename `curator_comment` to `inclusion_rationale` or `curator_notes`
   - Acceptance criteria should clarify: "Why this book belongs in the canon"

4. **Add Tags Support:**
   - If tags are desired for MVP (design-decisions.md #7 suggests yes), model them
   - If deferred, explicitly state "tags deferred post-MVP"

**Release placement:**
- Author model fix: MVP (required for migration)
- Category/genre/subject simplification: MVP (affects UX and data entry)
- Curator comment clarification: MVP (documentation fix)
- Tags: Decide if MVP or defer (explicitly document decision)

---

### Issue 6: Hard-Coded Data Migration Assumptions

**Problem:** The specification hard-codes assumptions about the current Excel workbook that may not hold true:

- UC-004 line 835: "Script reads Excel file, loads 648 rows"
- Q2: Specific counts for priority values ('x' = 88 occurrences, '-' = 1 occurrence, blank = 405)
- Migration mapping table (Section 2.2) assumes specific column names and formats

The specification treats the current workbook's structure as if it were a universal standard.

**Why it matters:**
- Hard-coded row counts will break when the workbook changes (curator adds books before migration)
- Specific value counts ('x' = 88) are point-in-time data, not requirements
- Migration script must be flexible enough to handle variations

**Affected sections:**
- UC-004 line 835
- Q2 (Priority mapping)
- Section 2.2 (Migration mapping table)
- NFR-030 ("Preserve original Excel data")

**Recommendation:**
- Remove hard-coded counts from requirements
- Rewrite migration requirements as capabilities, not specific mappings:
  - "Migration script shall detect workbook structure automatically"
  - "Migration script shall report unexpected values without failing"
  - "Migration script shall generate mapping report for curator review before import"
- Move specific Excel column mappings to migration script documentation (not requirements spec)
- Parameterize workbook filename, sheet name, expected columns

**Release placement:**
- Migration requirements refinement: MVP (migration is MVP-critical)
- Remove hard-coded data from spec immediately

---

### Issue 7: Recommendation Workflow Complexity for MVP

**Problem:** FR-013 and FR-014 (Review and Approve/Reject Recommendations) plus the entire Book Recommendations entity (Section 2.1) introduce significant complexity:
- New entity with 11 fields
- Approval workflow with state machine (pending → approved/rejected)
- Notification mechanism ("Submitter is notified")
- Rejection reasons
- Linking approved recommendations to created books

This is marked "Should Have (MVP scope)" but adds substantial implementation burden.

**Why it matters:**
- Recommendation workflow requires UI for submission, review queue, approval actions, notifications
- Intent.md lists "recommendation workflow" under "Future Enhancements"
- Design-decisions.md #8 says social features are "interesting but NOT MVP-critical"
- For MVP, curator can manually add books readers suggest via informal channels (email, conversation)

**Affected sections:**
- FR-013, FR-014
- Book Recommendations entity (Section 2.1)
- US-008 (Reader story: recommend addition)
- No use case for recommendation workflow (not in UC-001 to UC-006)

**Recommendation:** Defer entire recommendation workflow to post-MVP.

**Rationale:**
- Intent.md "Future Enhancements" lists "recommendation workflow for new books"
- Design-decisions.md #8: Social features NOT MVP-critical
- MVP curator can add books suggested by readers without formal workflow
- Reduces MVP scope significantly

**Release placement:**
- FR-013, FR-014 → Post-MVP 1
- Book Recommendations entity → Post-MVP 1
- US-008 → Post-MVP 1

---

### Issue 8: Data Completeness Scoring Premature for MVP

**Problem:** Section 2.3 prescribes a detailed data completeness scoring system:
- `data_completeness_score` field on Books entity
- Specific formula with weights (0.7 for optional fields, 0.3 for required)
- NFR-031 "Track Quality Scores"
- NFR-032 "Flag Incomplete Records"
- US-005 "Identify Gaps" - curator dashboard showing books needing enrichment

While progressive enrichment is a core principle, detailed scoring and enrichment dashboards may be premature.

**Why it matters:**
- Completeness scoring adds complexity to book CRUD operations
- Curator dashboard for enrichment is additional UI to build
- Vision and intent documents mention progressive enrichment as a principle (collection works with incomplete data) but don't specify scoring
- For MVP, curator can enrich books opportunistically without algorithmic guidance

**Affected sections:**
- Books entity `data_completeness_score` field
- Section 2.3 (entire progressive enrichment design with formula)
- NFR-031, NFR-032
- US-005 (Curator story: identify gaps)
- FR-010 acceptance criteria: "System calculates data completeness score"
- UC-003 step 7: "System calculates data completeness score"

**Recommendation:**
- **Keep principle:** Books work with incomplete metadata (mandatory fields vs. optional fields)
- **Defer scoring:** Remove `data_completeness_score` field and formula from MVP
- **Defer dashboard:** Remove enrichment dashboard (US-005, NFR-032) from MVP
- **Simplify:** Curator enriches books opportunistically (while viewing, when information becomes available)

**Release placement:**
- Data completeness principle: MVP (retained)
- Data completeness scoring: Post-MVP 1
- Enrichment dashboard: Post-MVP 1
- US-005: Post-MVP 1

---

## Minor Issues and Editorial Improvements

### Terminology Inconsistencies

| Issue | Occurrences | Recommendation |
|-------|-------------|----------------|
| "Completed" vs. "Finished" | Intent.md uses "Completed", spec FR-020 uses "Finished" | Choose one: **"Finished"** (matches reading status enum) |
| "Currently Reading" vs. "Reading" | Mixed usage | Choose one: **"Reading"** (database enum value: `reading`) |
| "canon" vs. "collection" | Sometimes interchangeable | Use consistently: "canonical collection" or "canon" for the curated set |
| "comments" vs. "notes" vs. "reflections" | FR-024 "personal notes", curator_comment, US-002 "thoughts" | Clarify: "curator comments" (shared), "personal notes" (private), "reflections" (synonym for personal notes) |

### Requirement ID Gaps

Section 1 jumps from FR-005 → FR-010, FR-014 → FR-020, FR-026 → FR-030, FR-033 → FR-040. While this allows for insertion, it creates apparent gaps. Consider renumbering sequentially in v1.1.

### Duplicate Content

- **User Stories (Section 4) vs. Use Cases (Section 5):** Significant overlap. US-001 "Discover Next Book" and UC-001 "Decide What to Read Next" cover the same scenario. Consider consolidating or clarifying when to use each format.

- **Acceptance Criteria duplication:** Functional requirements (Section 1) have acceptance criteria, user stories (Section 4) have acceptance criteria, use cases (Section 5) have flows. This creates three places to maintain similar information.

- **Success Criteria (Section 7):** Duplicates intent.md success criteria. Consider referencing intent.md rather than repeating.

**Recommendation:** For v1.1, consider:
- Consolidate user stories and use cases (pick one format for each scenario, or clarify when each is appropriate)
- Move acceptance criteria to a single location (probably functional requirements)
- Reference intent.md success criteria rather than duplicating

### Vague Requirements

- **NFR-010:** "Common actions must be easier than Excel" - too vague without specific actions and measurable criteria
- **NFR-012:** "Intuitive interface" - subjective without concrete criteria
- **FR-033:** "Consider user's preferred genres (if pattern exists)" - how is pattern detected? What constitutes "preferred"?
- **FR-012:** "Significant personal data from multiple users" - what is "significant"?

**Recommendation:** Add specific measurements:
- NFR-010: List specific actions with time targets (e.g., "Marking book as finished: < 10 seconds vs. ~1-2 minutes in Excel")
- NFR-012: Define concrete usability criteria (e.g., "New user can mark first book as reading within 60 seconds without instruction")
- FR-033: Specify algorithm or defer (or remove from MVP)
- FR-012: Define "significant" (e.g., "3+ users with personal_notes or reading status not 'Not Started'")

### Arbitrary Limits

- **FR-001:** "Paginated for collections over 100 books" - why 100? The collection already has 648 books. This is implementation detail.
- **FR-002:** "within 1 second" - belongs in NFR, not FR acceptance criteria
- **NFR-003:** "10 concurrent users" - intent.md says 5-10 anticipated users; 10 concurrent seems high. Clarify assumption.

**Recommendation:**
- Remove pagination threshold from requirement (becomes implementation decision)
- Move response time to NFR-002 (already exists)
- Justify concurrent user count or make it data-driven ("support 2x anticipated active users")

---

## Cross-Artifact Inconsistencies

### Multi-User Emphasis

**Inconsistency:** Design-decisions.md #3 says "Design the domain model with multi-user support in mind, even if the first MVP may only have one user." But spec.md treats multi-user (invitation, registration, roles, authentication) as "Must Have" in MVP.

**Resolution:** Clarify whether multi-user is MVP or post-MVP. Recommend MVP 0 (curator-only) and MVP 1 (shared) as distinct releases.

### Social Features

**Inconsistency:** Design-decisions.md #8: "Social Features - Interesting but NOT MVP-critical." Intent.md "Future Enhancements" includes "recommendation workflow for new books" and "discussions." But spec.md includes Book Recommendations entity and FR-013/014 marked "Should Have (MVP scope)."

**Resolution:** Align with design-decisions.md #8 - defer social features (recommendation workflow, shared comments, discussions) to post-MVP.

### Technology Deferral

**Inconsistency:** Design-decisions.md #12: "Technology selection should be deferred until requirements, UX concept, architecture have been completed." But spec.md prescribes TypeScript (NFR-043), database schemas (Section 2.1), bcrypt/argon2 (NFR-023), row-level security (NFR-021).

**Resolution:** Remove all technology prescriptions from spec.md. Move to architecture phase (ADRs).

### Tags

**Inconsistency:** Design-decisions.md #7 mentions "categories, genres, subjects, tags" but spec.md Books entity has category/genre/subject fields without tags.

**Resolution:** Decide if tags are MVP. If yes, add to data model. If no, remove from design-decisions.md or mark as future.

### Recommendation Score Source

**Inconsistency:** Design-decisions.md #5 discusses separating "Personal Priority" from "Recommendation Score." Intent.md mentions "recommendation score" as something users maintain. But the spec adds BOTH "recommendation score" AND "personal rating" - three concepts total.

**Resolution:** See Issue 2 above. Simplify to Priority + Rating for MVP.

---

## Missing or Insufficiently Specified Requirements

### Editorial Process

**Missing:** The vision emphasizes the curated canon as a key differentiator, but there are no requirements describing HOW the curator decides what belongs in the canon. What are the curation criteria? How does the curator evaluate candidate books?

**Why it matters:** If the application is meant to support the curator's editorial process, understanding that process informs UX and feature design.

**Recommendation:** Add requirement (or accept that this is out of scope - the application is a tool, not an editorial guide).

### Default Ordering

**Missing:** When the user opens the collection view, how are books ordered? Alphabetically by title? By author? By year? By date added?

**Why it matters:** Default sort affects perceived usefulness. Curator and readers may have different preferences.

**Recommendation:** Add UX requirement specifying default sort order for different views.

### Keyboard Shortcuts and Accessibility

**Missing:** No requirements for keyboard navigation, keyboard shortcuts, screen reader support, ARIA labels, color contrast, focus management.

**Why it matters:** Accessibility is both a usability concern and (in many jurisdictions) a legal requirement. Even for a private application, keyboard navigation improves efficiency for power users.

**Recommendation:** Add accessibility requirements (screen reader compatibility, keyboard navigation, WCAG 2.1 AA color contrast minimum) to NFR section or new UX requirements section.

### Concurrent Editing

**Missing:** What happens if curator updates a book's metadata while another user is viewing it? What if two users update the same book simultaneously?

**Why it matters:** Multi-user applications must handle concurrent access.

**Recommendation:** Add requirement: "System shall handle concurrent edits gracefully" or defer multi-user and avoid the problem in MVP 0.

### Data Export

**Missing:** Can the curator export the collection back to Excel or CSV? What if the web application fails or the curator wants to migrate to a different system?

**Why it matters:** Data portability is a hedge against vendor lock-in (even when vendor = self). Reversibility reduces risk of adopting the new system.

**Recommendation:** Add requirement for data export (CSV or Excel format) or explicitly defer to post-MVP with justification.

### Session Timeout

**Missing:** How long does a user session last? Does "remember me" keep user logged in indefinitely? What if user closes browser?

**Why it matters:** Session management affects both security and user experience.

**Recommendation:** Add security requirement specifying session duration, remember-me behavior, and logout.

### Backup and Recovery

**Missing:** How is the data backed up? What if the database is corrupted or lost? How does the curator recover?

**Why it matters:** The collection represents "years of accumulated information" (intent.md). Data loss would be catastrophic.

**Recommendation:** Add NFR for data backup and recovery strategy (frequency, retention, restoration process).

### Error Logging and Observability

**Missing:** How are errors logged? How does the curator know if something is broken? What if a user reports a bug?

**Why it matters:** Observability is essential for maintaining a production system.

**Recommendation:** Add NFR for error logging, monitoring, and observability appropriate to scale.

### Browser Back Button

**Missing:** How does the application behave when user clicks browser back button? Does it return to previous view with preserved state?

**Why it matters:** Users expect browser back button to work. Breaking this expectation frustrates users.

**Recommendation:** Add UX requirement: "Application shall support browser back/forward navigation, preserving view state."

### Bulk Operations

**Missing:** Can curator update multiple books at once? E.g., bulk tag assignment, bulk category change?

**Why it matters:** With 648 books, one-at-a-time editing is tedious for certain operations.

**Recommendation:** Clarify whether bulk operations are MVP or defer to post-MVP. If MVP, add requirements. If deferred, document decision.

---

## Premature Implementation and Architecture Decisions

See Issue 3 (Major Issues) for primary analysis. The specification prescribes:

- Database schemas with specific syntax (UUIDs, foreign keys, constraints)
- Specific algorithms (completeness score formula, "three-tier validation")
- Technology choices (TypeScript, bcrypt/argon2, PostgreSQL features)
- UI implementation patterns (pagination thresholds)

**Recommendation:** Rewrite all such requirements as technology-neutral needs. Move implementation decisions to Architecture Decision Records (ADRs) to be created after requirements approval.

---

## Recommended MVP Scope

Redefine MVP boundaries clearly:

### MVP 0: Curator-Only Baseline (Recommended First Release)

**Goal:** Prove core value - "better than Excel for curator's personal use"

**In Scope:**
- ✅ Single authenticated user (curator) - simple login, no invitation workflow
- ✅ Collection management (FR-001 to FR-005: display, search, filter, sort, view details)
- ✅ Curation operations (FR-010 to FR-012: add, edit, delete books)
- ✅ Personal reading management (FR-020 to FR-026: status, priority, ownership, notes, rating, timestamps) - EXCEPT recommendation score (defer)
- ✅ Basic statistics (FR-030, FR-031: counts by status, ownership counts)
- ✅ Excel data migration (Section 2.2, UC-004)
- ✅ Data model with canonical vs. personal separation

**Out of Scope (Defer to MVP 1 or Later):**
- ❌ Multi-user (invitation tokens, registration, role-based access) - FR-040 to FR-043
- ❌ Recommendation workflow (FR-013, FR-014, Book Recommendations entity)
- ❌ Recommendation score (FR-022) - simplify to priority + rating
- ❌ Algorithmic next-book suggestions (FR-033) - curator can sort by priority manually
- ❌ Completed books with time-based filtering (FR-032) - simple list is sufficient
- ❌ Data completeness scoring and enrichment dashboard (Section 2.3, US-005)
- ❌ User stories US-006 to US-010 (reader stories)
- ❌ Use cases UC-005, UC-006 (invitation workflows)

**Success Criteria for MVP 0:**
- SC-001: Curator prefers application over Excel (primary criterion)
- SC-002: Deciding what to read next is easier
- SC-003: Updating reading progress is easier
- SC-007: Performance remains acceptable

**Estimated Scope Reduction:** ~40% fewer features than current spec

---

### MVP 1: Shared Canon (Recommended Second Release)

**Goal:** Enable 2-5 invited readers to use the application

**Adds to MVP 0:**
- ✅ Multi-user with simple authentication (email/password)
- ✅ Invitation workflow (FR-040, FR-041, Invitation Tokens entity)
- ✅ Role-based access (FR-043: curator vs. reader)
- ✅ Reader personal data separation (readers track own status, ratings, notes)
- ✅ User stories US-006, US-007, US-009 (browse canon, track personal progress, view statistics)

**Still Deferred to Post-MVP 1:**
- ❌ Recommendation submission/approval workflow (FR-013, FR-014)
- ❌ Recommendation score separate from rating
- ❌ Algorithmic next-book suggestions
- ❌ Data completeness scoring and enrichment dashboard
- ❌ Social features (discussions, shared comments, reading groups)

**Success Criteria for MVP 1:**
- SC-004: Collection can be shared with selected users
- SC-005: Users maintain independent reading states
- SC-006: Curator control is preserved

---

### Post-MVP 1: Social and Intelligence Features

**Deferred Features:**
- Recommendation submission/approval workflow
- Discussions and shared comments
- Enhanced statistics with visualizations
- Algorithmic reading recommendations
- Data completeness scoring and enrichment tools
- Reading groups
- Enhanced search (faceted, relevance ranking)
- Bulk operations
- Data export

---

## Recommended Domain Model Changes

### Author Model

**Current:** `author_first_name`, `author_last_name`

**Revised:**
- `author_display_name` (required): How author name is shown (e.g., "Homer", "Tolstoy, Leo", "Unknown")
- `author_sort_name` (optional): Normalized for sorting (e.g., "Homer", "Tolstoy Leo")
- `author_given_name`, `author_family_name` (optional): Parsed components if applicable

**Rationale:** Handles single-name authors, unknown authors, non-Western naming conventions.

### Category/Genre/Subject/Tags

**Current:** `category`, `genre`, `subject` as separate string fields

**Revised Option A (Simpler):**
- `primary_category` (single value from controlled vocabulary: Novel, Play, Poetry, Philosophy, History, etc.)
- `tags` (multi-valued: additional classification, flexible)

**Revised Option B (Keep Existing):**
- Keep `category` (primary type)
- Rename `genre` to `genre_tags` (multi-valued)
- Remove `subject` (redundant with tags)
- Add `tags` (multi-valued, flexible)

**Rationale:** Controlled primary category + flexible tags supports both structure and flexibility. Multi-valued fields handle books spanning multiple domains.

### Curator Comment

**Current:** `curator_comment` (text)

**Revised:** Rename to `inclusion_rationale` or `curator_notes`

**Rationale:** Clarifies purpose - explains why book belongs in canon, not personal reading notes.

### Recommendation Score

**Current:** Separate from rating (FR-022, FR-025)

**Revised:** Remove recommendation score from MVP. Retain `personal_rating` (1-5 stars).

**Rationale:** Rating and recommendation are nearly identical concepts for most users.

### Data Completeness Score

**Current:** `data_completeness_score` field with specific formula

**Revised:** Remove from MVP. Calculate on-demand if needed, don't persist.

**Rationale:** Premature for MVP.

---

## Recommended UX Additions

Add new Section 1.6 "User Experience Requirements":

### UX-001: Information Architecture

**Requirement:** Application shall organize functionality into distinct views:
- **Collection View:** Browse, search, filter, sort books
- **Book Detail View:** Full book metadata and personal data for one book
- **Reading Dashboard:** "Currently Reading" books and quick-add for new reading
- **Statistics View:** Personal reading statistics (counts, completed books)
- **Settings View:** User preferences, logout (curator: user management)

**Priority:** Must Have

### UX-002: Navigation

**Requirement:** Application shall provide persistent navigation allowing user to move between views without losing context. Browser back button shall return to previous view with preserved state (filters, scroll position, selected book).

**Priority:** Must Have

### UX-003: Primary Interactions

**Requirement:** Application shall support quick status changes:
- From collection view: Inline button to change reading status without leaving view
- From book detail view: Status dropdown with immediate save
- Confirmation required only for destructive actions (delete book)

**Priority:** Must Have

### UX-004: Empty States

**Requirement:** Application shall display helpful empty states:
- Zero books in collection: "Add your first book" with prominent button
- Zero books matching filter: "No books match these criteria" with option to clear filters
- Zero books currently reading: "Start reading a book from your collection" with link to filtered view

**Priority:** Must Have

### UX-005: Feedback and Confirmation

**Requirement:** Application shall provide immediate feedback for state changes:
- Status change: Inline success indicator (checkmark, toast, or visual state change)
- Destructive actions (delete book): Confirmation dialog with clear consequences
- Long operations (migration): Progress indicator

**Priority:** Must Have

### UX-006: Keyboard Navigation

**Requirement:** Application shall support keyboard navigation:
- Tab key navigates through interactive elements
- Enter key activates buttons and links
- Escape key closes dialogs
- Focus indicators visible on all interactive elements

**Priority:** Should Have (accessibility concern)

### UX-007: Screen Reader Accessibility

**Requirement:** Application shall support screen readers:
- Semantic HTML elements (headings, lists, forms, buttons)
- ARIA labels for interactive elements
- Focus management (modals trap focus, closing returns focus to trigger)
- Status messages announced to screen readers

**Priority:** Should Have (accessibility and potentially legal requirement)

### UX-008: Responsive Behavior

**Requirement:** Application shall remain usable on narrow screens (tablet, large phone):
- Navigation collapses to hamburger menu below 768px
- Tables reflow to card layout on narrow screens
- Touch targets minimum 44x44px

**Priority:** Nice to Have for MVP 0, Should Have for MVP 1

### UX-009: Performance Perception

**Requirement:** Application shall indicate loading state:
- Search: Results appear progressively or with loading spinner
- Navigation: Skeleton screens or spinners during view transitions
- Long operations (migration): Progress bar with percentage or step indicator

**Priority:** Should Have

---

## Open Decisions Requiring Product-Owner Input

The following questions require the curator (product owner) to decide before finalizing spec v1.1:

### Decision 1: MVP Scope - Single User or Multi-User?

**Question:** Should MVP 0 support only the curator (single user), or should it include multi-user from the start (MVP 1)?

**Options:**
- **A. MVP 0 = Curator-only:** Simpler, faster to build, proves core value first. Multi-user added in MVP 1.
- **B. Skip MVP 0, start with MVP 1:** Multi-user from the beginning, longer initial development.

**Recommendation:** Option A (curator-only MVP 0). Rationale: Intent.md success criterion #1 is "curator prefers using the application over the spreadsheet." Validate this first before investing in multi-user complexity.

---

### Decision 2: Priority, Rating, Recommendation - Two or Three Concepts?

**Question:** Should the application support three separate user-assigned values (priority, rating, recommendation score), or simplify to two (priority, rating)?

**Current Spec:** Three values:
1. Personal Priority (High/Medium/Low) - "when I want to read this"
2. Personal Rating (1-5 stars) - "how much did I enjoy/value this"
3. Recommendation Score (1-5) - "how strongly would I recommend to others"

**Recommendation:** Two concepts (priority + rating). Rationale: For MVP, simplify. Rating and recommendation are nearly identical for most users. Add separate recommendation later if evidence emerges that users need to recommend books they didn't personally enjoy.

**Input needed:** Does curator have examples of books they would rate low but recommend high (or vice versa)?

---

### Decision 3: Excel Priority Mapping - What Does 'x' Mean?

**Question:** The Excel workbook has 88 occurrences of 'x' in the Prio column. What does 'x' mean?

**Options:**
- 'x' means "read" (not a priority, already completed)
- 'x' means "don't want to read" or "low priority"
- 'x' means "data missing"
- 'x' means something else

**Input needed:** Curator must clarify semantic meaning of 'x' in Prio column.

---

### Decision 4: Personal Notes in Search Scope?

**Question:** Should personal notes be included in full-text search (FR-002)?

**Recommendation:** Exclude personal notes from search (privacy concern). If user wants to search own notes, add dedicated "search my notes" feature later.

**Input needed:** Confirm this approach with curator.

---

### Decision 5: Tags in MVP?

**Question:** Design-decisions.md #7 mentions tags but spec.md doesn't include them. Should tags be in MVP?

**Recommendation:** Defer tags to post-MVP. Category + genre fields sufficient for MVP.

**Input needed:** Confirm with curator whether lack of tags in MVP is acceptable.

---

### Decision 6: Default Sort Order?

**Question:** When user opens collection view, how should books be sorted by default?

**Options:**
- Author surname (A-Z)
- Title (A-Z)
- Year published (chronological)
- Date added (newest first)
- User's last-used sort

**Recommendation:** Author surname for collection view.

**Input needed:** Curator's preference.

---

### Decision 7: Authentication Strategy?

**Question:** Should authentication be custom-built or use a managed service?

**Recommendation:** Defer to architecture phase (ADR-004), but if MVP 0 is curator-only, authentication is simpler (single user, simple login, no invitation workflow).

**Input needed:** Is learning authentication implementation a goal of this project?

---

### Decision 8: Should MVP 0 be Deployed or Local?

**Question:** Should MVP 0 be deployed to a web host, or can it run locally during validation?

**Recommendation:** Local for fastest validation. Deploy in MVP 1 when multi-user arrives.

**Input needed:** Curator's preference.

---

## Proposed Structure for spec.md v1.1

Recommended structure to reduce duplication and improve clarity:

### Section 1: Introduction
- 1.1 Document Purpose and Status
- 1.2 Scope and Objectives
- 1.3 Definitions and Terminology
- 1.4 Traceability to Source Documents

### Section 2: Product Overview
- 2.1 Product Vision (reference vision.md)
- 2.2 Target Users
- 2.3 Core Principles
- 2.4 Success Criteria (reference intent.md)

### Section 3: MVP Scope Definition
- 3.1 MVP 0 Scope (Curator-Only Baseline) - IN / OUT
- 3.2 MVP 1 Scope (Shared Canon) - IN / OUT
- 3.3 Post-MVP Features
- 3.4 Explicitly Out of Scope

### Section 4: User Scenarios and Journeys
- Primary User Journeys (curator)
- Secondary User Journeys (readers - MVP 1)

### Section 5: Functional Requirements
- 5.1 Collection Management
- 5.2 Collection Curation
- 5.3 Personal Reading Management
- 5.4 Statistics and Insights
- 5.5 Data Migration
- 5.6 User Management and Authentication (MVP 1)

### Section 6: User Experience Requirements
- 6.1 Information Architecture
- 6.2 Interaction Patterns
- 6.3 Empty States and Error Handling
- 6.4 Accessibility
- 6.5 Responsive Behavior
- 6.6 Performance Perception

### Section 7: Domain Model (Conceptual)
- 7.1 Core Entities
- 7.2 Entity Relationships
- 7.3 Key Attributes
- 7.4 Business Rules and Constraints
- 7.5 Data Migration Mapping

### Section 8: Non-Functional Requirements
- 8.1 Performance
- 8.2 Usability
- 8.3 Security
- 8.4 Data Integrity
- 8.5 Maintainability
- 8.6 Operational

### Section 9: Open Questions and Decisions
- List of decisions requiring product owner input

### Section 10: Traceability Matrix
- Requirement ID → Source Document/Section

---

## Approval Recommendation

**Status: Rework Required**

**Required Actions Before Approval (Priority 1 - Blocking):**

1. **Clarify MVP scope:** Define MVP 0 (curator-only) vs. MVP 1 (multi-user) with clear IN/OUT lists
2. **Remove implementation prescriptions:** Rewrite Section 2.1 (data model) as technology-neutral entity descriptions
3. **Remove or justify third concept:** Resolve priority vs. rating vs. recommendation score (recommend simplify to two)
4. **Add UX requirements:** Add Section 6 (User Experience Requirements) or create separate UX brief document
5. **Fix author model:** Revise to handle single-name authors, unknown authors, non-Western naming conventions
6. **Resolve MVP deferrals:** Move FR-013, FR-014 (recommendation workflow), FR-022 (recommendation score), FR-033 (algorithmic suggestions), US-005 (enrichment dashboard), completeness scoring to post-MVP

---

## Prioritized Revision Checklist for spec.md v1.1

### Phase 1: Scope and Structure Decisions (Product Owner Input Required)

- [ ] Decision 1: Choose MVP 0 (curator-only) or start with MVP 1 (multi-user)
- [ ] Decision 2: Choose two concepts (priority + rating) or three (+ recommendation score)
- [ ] Decision 3: Obtain curator input on Excel 'x' value meaning
- [ ] Decision 4: Decide personal notes in search scope (yes/no)
- [ ] Decision 5: Decide tags in MVP (yes/no)
- [ ] Decision 6: Choose default sort order
- [ ] Decision 7: Note authentication strategy deferred to ADR-004
- [ ] Decision 8: Decide MVP 0 deployment (local vs. hosted)

### Phase 2: MVP Scope Clarification

- [ ] Create Section 3 "MVP Scope Definition" with explicit IN/OUT lists
- [ ] Move multi-user features to MVP 1
- [ ] Move recommendation workflow to Post-MVP 1
- [ ] Move recommendation score to removed/Post-MVP 1
- [ ] Move algorithmic suggestions to Post-MVP 1
- [ ] Move completeness scoring to Post-MVP 1
- [ ] Mark each requirement with release target

### Phase 3: Remove Implementation Prescriptions

- [ ] Rewrite Section 2.1 as entity-relationship descriptions without database syntax
- [ ] Remove pagination threshold from FR-001
- [ ] Rewrite NFR-021, NFR-023 as technology-neutral
- [ ] Remove or move NFR-043 (TypeScript) to ADR
- [ ] Remove completeness score formula
- [ ] Remove implementation details from UC-004

### Phase 4: Domain Model Improvements

- [ ] Revise author model (add display_name, sort_name)
- [ ] Revise category/genre/subject model
- [ ] Rename curator_comment or clarify purpose
- [ ] Remove recommendation_score field if Decision 2 = Two Concepts
- [ ] Add tags support if Decision 5 = Yes
- [ ] Remove or defer data_completeness_score field

### Phase 5: Add UX Requirements

- [ ] Create Section 6 "User Experience Requirements"
- [ ] Add UX-001 through UX-009

### Phase 6: Add Missing Requirements

- [ ] Add FR-006: Default Sort Order
- [ ] Add FR-007: Data Export
- [ ] Add FR-050, FR-051: Keyboard and screen reader
- [ ] Add NFR-050, NFR-051, NFR-052, NFR-053: Backup, logging, session, browser nav

### Phase 7: Fix Data Migration Requirements

- [ ] Remove hard-coded "648 rows"
- [ ] Remove specific priority value counts
- [ ] Rewrite migration as requirements, not mappings

### Phase 8: Improve Requirement Quality

- [ ] Standardize terminology
- [ ] Strengthen vague requirements
- [ ] Renumber requirement IDs sequentially

### Phase 9: Consolidate Duplicate Content

- [ ] Consolidate user stories and use cases
- [ ] Remove duplicate acceptance criteria
- [ ] Reference intent.md for success criteria

### Phase 10: Traceability and Structure

- [ ] Update traceability matrix
- [ ] Ensure all requirements trace to sources
- [ ] Update document status to v1.1

### Phase 11: Final Review

- [ ] Completeness check
- [ ] Consistency check
- [ ] Terminology check
- [ ] Technology-neutrality check
- [ ] MVP-scope check
- [ ] UX check
- [ ] Obtain curator approval

---

**End of Review**

This comprehensive review identifies major blocking issues, cross-artifact inconsistencies, missing requirements, and premature implementation decisions. The specification requires significant rework before proceeding to architecture and implementation.

**Primary recommendation:** Simplify MVP scope to curator-only baseline (MVP 0), remove implementation prescriptions, add UX requirements, fix domain model gaps, and obtain product owner decisions on open questions before creating spec.md v1.1.
