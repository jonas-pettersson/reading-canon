# Requirements Specification: Reading Canon

## Document Status

**Version:** 1.4  
**Date:** 2026-10-02  
**Status:** Release Candidate  
**Revision Summary:** v1.4 changes: normalized reading status terminology across entire specification (Not Started, Want to Read, Reading, Paused, Finished, Abandoned), resolved audit log inconsistency (replaced with timestamp-based approach), final consistency review. Previous v1.3 changes: added context-of-use requirements (desktop vs mobile workflows), strengthened mobile-browser support for essential reading workflows, updated responsive design requirements. Previous v1.2 changes: improved author model (author_display_name + optional given_name/family_name), renamed curator_comment to inclusion_rationale, added external_references entity. Previous v1.1 changes: clarified MVP scope (MVP 0/1), simplified concepts (removed recommendation score), removed technology prescriptions, added UX requirements, improved data model (primary_category + tags), deferred data completeness scoring

## Document Purpose

This specification transforms the vision and intent documents into detailed, actionable requirements for the Reading Canon application.

All requirements maintain traceability to:
- `vision.md` - Product vision and principles
- `intent.md` - Problem statement and desired outcomes
- `design-decisions.md` - Design philosophy and choices

## MVP Scope Definition

This specification defines requirements across multiple release stages. Each requirement is tagged with its release target.

### MVP 0: Curator-Only Baseline (First Release)

**Goal:** Prove core value - "better than Excel for curator's personal use"

**Release Target:** First working system validation

**In Scope:**
- ✅ Single authenticated user (curator only) - simple authentication, no invitation workflow
- ✅ Collection management: display, search, filter, sort, view book details (FR-001 to FR-005)
- ✅ Collection curation: add, edit, remove books (FR-010 to FR-012)
- ✅ Personal reading management: status, ownership, notes, rating, timestamps (FR-020, FR-023 to FR-026)
- ✅ Basic statistics: counts by status and ownership (FR-030, FR-031)
- ✅ Excel data migration (Section 2.2, UC-004)
- ✅ Data model with canonical vs. personal data separation

**Out of Scope (Deferred to MVP 1 or Post-MVP):**
- ❌ Multi-user support: invitation tokens, registration, role-based access (FR-040 to FR-043) → **MVP 1**
- ❌ Recommendation submission/approval workflow (FR-013, FR-014) → **Post-MVP**
- ❌ Book Recommendations entity → **Post-MVP**
- ❌ Invitation Tokens entity → **MVP 1**
- ❌ Recommendation score as separate field (FR-022) → **Removed** (see Decision 2)
- ❌ Algorithmic next-book suggestions (FR-033) → **Post-MVP**
- ❌ Completed books with time-based filtering (FR-032) → **Post-MVP**
- ❌ Data completeness scoring and enrichment dashboard (US-005) → **Post-MVP**
- ❌ Reader user stories (US-006 to US-010) → **MVP 1**
- ❌ Invitation use cases (UC-005, UC-006) → **MVP 1**

**Success Criteria for MVP 0:**
- SC-001: Curator prefers application over Excel (primary criterion)
- SC-002: Deciding what to read next is easier
- SC-003: Updating reading progress is easier
- SC-007: Performance remains acceptable

**Deployment:** Local deployment (localhost) acceptable for MVP 0 validation

---

### MVP 1: Shared Canon (Second Release)

**Goal:** Enable 2-5 invited readers to use the application

**Release Target:** After MVP 0 validation

**Adds to MVP 0:**
- ✅ Multi-user with authentication (email/password)
- ✅ Invitation workflow (FR-040, FR-041, Invitation Tokens entity)
- ✅ Role-based access (FR-043: curator vs. reader)
- ✅ Reader personal data separation (readers track own status, ratings, notes)
- ✅ Reader user stories (US-006, US-007, US-009)
- ✅ Production deployment with proper hosting

**Still Deferred to Post-MVP:**
- ❌ Recommendation submission/approval workflow (FR-013, FR-014)
- ❌ Algorithmic next-book suggestions
- ❌ Data completeness scoring and enrichment dashboard
- ❌ Social features (discussions, shared comments, reading groups)
- ❌ Advanced filtering and statistics

**Success Criteria for MVP 1:**
- SC-004: Collection can be shared with selected users
- SC-005: Users maintain independent reading states
- SC-006: Curator control is preserved

---

### Post-MVP: Social and Intelligence Features

**Deferred Capabilities:**
- Recommendation submission/approval workflow
- Discussions and shared comments per book
- Enhanced statistics with visualizations and time-based filtering
- Algorithmic reading recommendations
- Data completeness scoring and enrichment tools
- Reading groups
- Enhanced search (faceted, relevance ranking)
- Bulk operations for curator
- Data export (CSV/Excel)
- Edition management
- Page-level progress tracking

**Rationale for Deferral:**
These features add value but are not essential to prove the core proposition: that Reading Canon is better than Excel for managing a curated reading collection.

---

## 1. Functional Requirements

### 1.1 Collection Management

#### FR-001: Display Book Collection
**Description:** System shall display all books in the canonical collection  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Initial Scope: Collection Management  
**Acceptance Criteria:**
- All books in the canonical collection are visible to authenticated users
- Book list shows at minimum: title, author, year
- System shall remain responsive when displaying large collections (see NFR-001)
- Empty state shown when no books exist

#### FR-002: Full-Text Search
**Description:** System shall support full-text search across title, author, and inclusion rationale fields  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Common activities: searching the collection  
**Acceptance Criteria:**
- Search returns results matching title (partial or full)
- Search returns results matching author_display_name
- Search returns results matching inclusion_rationale
- Search is case-insensitive
- Results appear within 1 second (see NFR-002)

#### FR-003: Filter Books
**Description:** System shall support filtering by primary category, tags, language, and personal reading status  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Common activities: filtering the collection  
**Acceptance Criteria:**
- Filter by primary_category (Novel, Play, Poetry, Philosophy, History, etc.)
- Filter by tags (multiple tag selection, show books matching any selected tag)
- Filter by original language
- Filter by personal reading status (Want to Read, Reading, etc.)
- Filter by ownership status
- Multiple filters can be applied simultaneously (combined with AND logic)
- Filters persist during session
- Clear all filters action available

#### FR-004: Sort Books
**Description:** System shall support sorting by title, author, year, primary category, and rating  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Common activities  
**Acceptance Criteria:**
- Sort by title (alphabetically)
- Sort by author (author_display_name, alphabetically)
- Sort by year (chronologically, oldest or newest first) - **default per UX-010**
- Sort by primary_category (alphabetically)
- Sort by personal rating (if set)
- Sort by date added to collection
- Sort direction can be reversed (ascending/descending)

#### FR-005: View Book Details
**Description:** System shall display detailed information about each book  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Initial Scope: View detailed information about books  
**Acceptance Criteria:**
- Show all canonical metadata: title, original title, author (author_display_name), year, primary_category, tags, original language, source, inclusion_rationale, author lifespan
- Show external references (if any) as clickable links with link text
- Show personal data for current user: reading status, rating, ownership, personal notes
- Gracefully handle missing optional fields
- Display timestamps (started, completed) if applicable
- Tags displayed as readable list (not internal format)
- External references grouped or listed in order of addition

### 1.2 Curation (Curator Role Only)

#### FR-010: Add New Book
**Description:** Curator shall be able to add new books to the canonical collection  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Form requires title and author_display_name (minimum)
- Form provides fields for all optional metadata including given_name, family_name, primary_category (dropdown from controlled vocabulary), tags (multi-entry field), inclusion_rationale
- Form allows adding external references (URL and optional link text)
- System validates required fields before saving
- System validates primary_category against controlled vocabulary (if provided)
- System validates URL format for external references (if provided)
- Newly added book appears in collection immediately
- System records created_by and created_at

#### FR-011: Edit Book Metadata
**Description:** Curator shall be able to edit canonical book metadata  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Curator can edit any canonical field
- System shall maintain created_at and updated_at timestamps for managed records
- Editing book metadata does not affect users' personal data
- Detailed audit history is deferred to a future release

#### FR-012: Remove Book
**Description:** Curator shall be able to remove books from the collection  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Curator can delete a book from collection
- System confirms deletion (prevent accidental removal)
- Deletion removes all user personal data for that book
- Deletion removes all external references for that book
- System warns curator if book has significant personal data from multiple users

#### FR-012a: Manage External References
**Description:** Curator shall be able to add, edit, and remove external references for books  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** External references support (Change 3)  
**Acceptance Criteria:**
- Curator can add external reference with URL and optional link text to any book
- System validates URL format
- Curator can edit existing external references (URL, link text, reference type)
- Curator can remove external references
- System prevents duplicate URLs for same book
- External references are displayed in book detail view
- Changes to external references are saved immediately

#### FR-013: Review Recommendations
**Description:** Curator shall be able to review user-submitted book recommendations  
**Priority:** Should Have  
**Release Target:** Post-MVP  
**Source:** intent.md - Collection Curation (listed as Future Enhancement)  
**Rationale for Deferral:** Recommendation workflow adds significant complexity. For MVP, curator can add books suggested by readers through informal channels (email, conversation). Formal workflow deferred until multi-user adoption is validated.  
**Acceptance Criteria:**
- Curator can view list of pending recommendations
- Each recommendation shows: proposed book details, who submitted it, when
- Curator can see submission reason/justification if provided

#### FR-014: Approve/Reject Recommendations
**Description:** Curator shall be able to approve or reject book recommendations  
**Priority:** Should Have  
**Release Target:** Post-MVP  
**Source:** intent.md - Collection Curation (listed as Future Enhancement)  
**Rationale for Deferral:** Part of recommendation workflow. Deferred with FR-013.  
**Acceptance Criteria:**
- Curator can approve recommendation (adds book to collection)
- Curator can reject recommendation with optional reason
- Submitter is notified of approval/rejection (future: email notification)
- Approved recommendations become regular books in collection

### 1.3 Personal Reading Management

#### FR-020: Maintain Reading Status
**Description:** User shall maintain reading status per book  
**Priority:** Must Have  
**Source:** design-decisions.md #4 - Reading Status  
**Acceptance Criteria:**
- User can set status for any book in collection
- Supported statuses: Want to Read, Reading, Paused, Finished, Abandoned, Not Started (default)
- User can have multiple books with status "Reading" simultaneously
- Status changes are immediate and persist
- System records started_at when status changes to "Reading"
- System records completed_at when status changes to "Finished"

#### FR-021: Set Personal Priority
**Status:** REMOVED (2026-10-06)  
**Removal Rationale:** Reading status + rating is sufficient for user needs. Priority added cognitive overhead without clear value. Users can achieve prioritization through reading_status ("want_to_read") combined with rating for relative importance.  
**Original Description:** User shall set personal reading priority per book  
**Priority:** ~~Must Have~~  
**Source:** design-decisions.md #5 - Priority vs Recommendation (modified per Decision 2)  
**Original Acceptance Criteria:**
- ~~User can set priority: High, Medium, Low, or None~~
- ~~Priority answers "when do I want to read this?" (Next/Soon/Someday)~~
- ~~Priority is separate from personal rating (which implies recommendation strength)~~
- ~~Priority is personal (does not affect other users)~~
- ~~User can filter books by priority~~
- ~~Priority can be changed at any time~~

**Replacement:** None needed. Use reading_status and personal_rating instead.

#### FR-022: Assign Recommendation Score
**Status:** REMOVED  
**Removal Rationale:** Conflates with Personal Rating (FR-025). Product Decision 2: Simplify to two concepts (Priority + Rating). For most users, rating and recommendation strength are equivalent. If separate recommendation becomes needed in the future (e.g., "important but not personally enjoyable"), it can be added post-MVP.  
**Original Description:** User shall assign recommendation score per book  
**Priority:** ~~Must Have~~  
**Source:** design-decisions.md #5 - Priority vs Recommendation  
**Original Acceptance Criteria:**
- ~~User can assign score: 1-5 scale or None~~
- ~~Recommendation represents "how strongly would I recommend this to others"~~
- ~~Recommendation is separate from personal priority~~
- ~~Recommendation is separate from personal rating~~
- ~~User can view their own highly-recommended books~~

**Replacement:** See FR-025 (Personal Rating), which now implies recommendation strength.

#### FR-023: Track Ownership Status
**Description:** User shall track ownership status for books  
**Priority:** Must Have  
**Source:** design-decisions.md #6 - Ownership / Library Status  
**Acceptance Criteria:**
- User can set status: Not Owned, Ordered, Owned (Physical), Owned (Digital), Borrowed
- Ownership is personal (does not affect other users)
- User can filter collection by ownership status
- User can see count of owned books

#### FR-024: Write Personal Notes
**Description:** User shall write personal notes/comments per book  
**Priority:** Must Have  
**Source:** intent.md - Personal Reading Management: personal notes  
**Acceptance Criteria:**
- User can write free-form text notes per book
- Notes are private (not visible to other users)
- Notes support basic formatting (line breaks, paragraphs)
- Notes can be edited at any time
- Notes are preserved when reading status changes

#### FR-025: Assign Personal Rating
**Description:** User shall assign personal rating to books  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** intent.md - Personal Reading Management: rating  
**Acceptance Criteria:**
- User can assign rating: 1-5 stars or None
- Rating is personal (not shared with other users)
- Rating represents personal enjoyment/value and by implication, recommendation strength
- A highly-rated book (4-5 stars) implies strong recommendation to others
- User can filter books by their rating
- User can view their highest-rated books as implicit recommendations

#### FR-026: View Reading Timestamps
**Description:** User shall see when they started and completed books  
**Priority:** Should Have  
**Source:** intent.md - Success Criteria: Reading progress tracking  
**Acceptance Criteria:**
- System shows started_at date when user marked book as "Reading"
- System shows completed_at date when user marked book as "Finished"
- Timestamps are automatically recorded, not manually entered
- Timestamps are displayed in book detail view
- Timestamps are used for statistics (books completed this year, etc.)

### 1.4 Statistics & Insights

#### FR-030: Show Reading Status Counts
**Description:** System shall show count of books by reading status  
**Priority:** Must Have  
**Source:** intent.md - Statistics  
**Acceptance Criteria:**
- Show count: Want to Read
- Show count: Reading
- Show count: Paused
- Show count: Finished
- Show count: Abandoned
- Counts are personal (user's own stats)

#### FR-031: Show Ownership Count
**Description:** System shall show count of owned books  
**Priority:** Must Have  
**Source:** intent.md - Statistics: books owned  
**Acceptance Criteria:**
- Show count of books marked "Owned (Physical)"
- Show count of books marked "Owned (Digital)"
- Show count of books marked "Ordered"
- Show total owned (Physical + Digital)

#### FR-032: Show Completed Books with Filtering
**Description:** System shall show books completed with time-based filtering  
**Priority:** Should Have  
**Source:** intent.md - Statistics: books completed  
**Acceptance Criteria:**
- Show list of finished books
- Filter by year completed
- Filter by date range
- Show completion count for selected period
- Sort by completion date

#### FR-033: Suggest Next Book
**Description:** System shall suggest next book to read based on reading status and rating  
**Priority:** Should Have  
**Release Target:** Post-MVP  
**Source:** intent.md - Primary user wants to: prioritize future reading  
**Rationale for Deferral:** MVP curator can manually filter and sort books. Algorithmic suggestions add complexity without proving core value.  
**Acceptance Criteria:**
- Show books with status "Want to Read"
- Sort by rating (highest rated first) to indicate relative importance
- Consider user's preferred genres (if pattern exists)
- Highlight books user owns but hasn't read
- Simple algorithm (future: more sophisticated recommendations)

### 1.5 User Management & Authentication

#### FR-040: Generate Invitation Tokens
**Description:** Curator shall generate invitation tokens for new users  
**Priority:** Must Have  
**Release Target:** MVP 1  
**Source:** intent.md - Multi-user, invite-only  
**Acceptance Criteria:**
- Curator can create invitation link
- Invitation link includes time-limited token
- Curator can see list of pending invitations
- Curator can revoke unused invitation
- Invitation is single-use

#### FR-041: Register via Invitation
**Description:** Users shall register via invitation link only  
**Priority:** Must Have  
**Release Target:** MVP 1  
**Source:** intent.md - Private application, curator-controlled  
**Acceptance Criteria:**
- Registration page only accessible via valid invitation link
- Invalid/expired/used tokens show error message
- Registration requires: email, password, display name
- System validates email format
- System enforces password strength requirements
- Registration creates account with "reader" role

#### FR-042: Authenticate with Email/Password
**Description:** Users shall authenticate with email/password  
**Priority:** Must Have  
**Release Target:** MVP 0 (simplified - curator only), MVP 1 (full multi-user)  
**Source:** Design decision - authentication approach  
**Acceptance Criteria:**
- Login page accepts email and password
- System validates credentials
- Failed login shows error (no details about which field failed)
- Successful login creates session
- Session persists across browser sessions (remember me)
- Users can log out

#### FR-043: Enforce Role-Based Permissions
**Description:** System shall enforce role-based permissions (Curator vs Reader)  
**Priority:** Must Have  
**Release Target:** MVP 1  
**Source:** design-decisions.md #2 - Curated Collection Ownership  
**Acceptance Criteria:**
- Curator role can: add/edit/remove books, approve recommendations, generate invitations
- Reader role can: view collection, manage own personal data, submit recommendations
- Unauthorized actions return error
- UI hides actions user cannot perform
- First user in system is automatically curator

### 1.6 User Experience Requirements

This section specifies user experience requirements to support the core principle of "excellent usability" (vision.md). These requirements ensure the application is intuitive, accessible, and easier to use than Excel for managing the reading collection.

#### UX-001: Information Architecture
**Requirement:** Application shall organize functionality into distinct, clearly defined views  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Clear information architecture enables users to navigate efficiently and find features without confusion  
**Views:**
- **Collection View:** Browse, search, filter, sort all books in canonical collection
- **Book Detail View:** Display full metadata and personal data for single book
- **Reading Dashboard:** Show books with status "Reading" and provide quick actions
- **Statistics View:** Display personal reading statistics (counts, completed books)
- **Settings View:** User preferences, logout (curator: add user management in MVP 1)

#### UX-002: Navigation and Wayfinding
**Requirement:** Application shall provide persistent navigation and preserve context  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Users must be able to move between views without losing their place  
**Acceptance Criteria:**
- Persistent navigation menu visible across all views
- Browser back button returns to previous view with preserved state (filters, scroll position, selected book)
- Current view clearly indicated in navigation
- Breadcrumbs or clear page titles show user's location in application

#### UX-003: Primary Interactions
**Requirement:** Application shall support quick status changes without leaving current view  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Updating reading status should be faster than Excel (success criterion SC-003)  
**Acceptance Criteria:**
- Collection view: Inline controls to change reading status without opening detail view
- Book detail view: Status dropdown or buttons with immediate save
- Completion action: Optional prompt to add rating and notes (all optional)
- Destructive actions (delete book): Require confirmation dialog with clear consequences
- All interactions provide immediate visual feedback

#### UX-004: Empty States
**Requirement:** Application shall display helpful empty states when no data is present  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Empty states guide users toward productive actions  
**Acceptance Criteria:**
- Empty collection: "Add your first book" with prominent add button
- No books matching filter: "No books match these criteria" with option to clear filters
- Zero books with status "Reading": "Start reading a book" with link to collection or filtered view
- No books with status "Finished": "You haven't finished any books yet" with encouraging message

#### UX-005: Feedback and Confirmation
**Requirement:** Application shall provide immediate feedback for state changes  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Users need confirmation that actions succeeded  
**Acceptance Criteria:**
- Status changes: Immediate visual update (color change, icon change, or inline success indicator)
- Destructive actions (delete book): Confirmation dialog stating consequences
- Long operations (migration, bulk updates): Progress indicator showing current step
- Errors: Clear error messages with recovery suggestions
- Success messages: Visible but non-intrusive (toast notifications or inline messages)

#### UX-006: Keyboard Navigation
**Requirement:** Application shall support keyboard navigation for all interactive elements  
**Priority:** Should Have  
**Release Target:** MVP 0  
**Rationale:** Keyboard navigation improves efficiency for power users and is essential for accessibility  
**Acceptance Criteria:**
- Tab key navigates through interactive elements in logical order
- Enter key activates buttons and links
- Escape key closes dialogs and modals
- Focus indicators clearly visible on all interactive elements
- No keyboard traps (user can always navigate away from any element)

#### UX-007: Screen Reader Accessibility
**Requirement:** Application shall support screen readers for visually impaired users  
**Priority:** Should Have  
**Release Target:** MVP 0  
**Rationale:** Basic accessibility compliance and inclusive design  
**Acceptance Criteria:**
- Semantic HTML elements used throughout (headings, lists, forms, buttons)
- ARIA labels provided for interactive elements where text is not visible
- Focus management in modals (focus trapped within modal, returned to trigger on close)
- Status messages announced to screen readers (ARIA live regions)
- Form validation errors announced and associated with inputs
- WCAG 2.1 AA color contrast minimum met for all text

#### UX-008: Responsive Behavior
**Requirement:** Application shall provide responsive layouts appropriate to device size and usage context  
**Priority:** Must Have for MVP 0 (essential workflows), Must Have for MVP 1 (all workflows)  
**Release Target:** MVP 0  
**Rationale:** Essential reading workflows frequently occur in mobile contexts (bookstores, libraries, travel). Desktop remains primary for curation and administration.  
**Acceptance Criteria:**
- Navigation collapses to menu icon below 768px width
- Book list reflows to single column on narrow screens
- Tables reflow to card layout or stacked rows on narrow screens
- Touch targets minimum 44x44 pixels for mobile use
- No horizontal scrolling required
- Text remains readable (no tiny fonts)
- Essential workflows (see UX-011) must be fully usable on phone-sized screens (minimum 375px width)
- Administrative workflows (book curation, metadata entry, migration) may be optimized for desktop

#### UX-009: Performance Perception
**Requirement:** Application shall indicate loading state for operations that take time  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Users tolerate delays better when they understand system is working  
**Acceptance Criteria:**
- Search: Results appear progressively or with loading indicator if delay > 500ms
- Navigation between views: Loading spinner or skeleton screen if delay > 300ms
- Long operations (migration): Progress bar with percentage or step indicator
- Initial page load: Loading state shown until interactive
- Optimistic UI updates where appropriate (show change immediately, revert if fails)

#### UX-010: Default Sort Order
**Requirement:** Collection view shall default to chronological sort (year published, oldest first)  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Source:** Decision 6  
**Rationale:** Appropriate for reading canon focused on classical/significant works - historical/chronological browsing makes sense for this collection  
**Acceptance Criteria:**
- When user first opens collection view, books sorted by year published ascending (oldest first)
- Ancient works (8th century BC) appear first
- Modern works appear last
- Books without year_published appear at end (or beginning with clear indicator)
- User can change sort order (persists during session)
- Sort order indicator clearly visible to user

#### UX-011: Mobile Essential Workflows
**Requirement:** Essential reading workflows shall be efficient and fully usable on mobile browsers (phone-sized screens)  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** High-frequency reading activities occur in mobile contexts (bookstores, libraries, travel) where desktop access is unavailable  
**Essential Workflows (mobile-optimized):**
- View current reading list (books with status "Reading")
- View reading priorities (filtered by priority: High/Medium/Low)
- View next reading candidates (books with status "Want to Read" filtered by priority)
- Mark book as currently reading (status change to "Reading")
- Mark book as completed (status change to "Finished" with optional rating/notes)
- Update ownership status (mark as Owned, Ordered, etc.)
- View book details (title, author, inclusion rationale, external references)
- Quick search by title or author

**Acceptance Criteria:**
- Essential workflows accessible within 2 taps from home screen on mobile
- Status changes can be made with single tap or minimal interaction
- Forms for status updates are mobile-friendly (large touch targets, minimal typing)
- Reading list views are scannable on phone screen without excessive scrolling
- Book detail view displays all essential information without horizontal scroll
- Search results are clearly readable on narrow screen
- Navigation between essential workflows is intuitive on mobile

**Non-Essential Workflows (desktop-optimized, may have reduced mobile experience):**
- Adding new books to collection
- Editing book metadata
- Managing external references
- Advanced filtering and sorting
- Collection-wide statistics
- Data migration and import
- User management (MVP 1)

### 1.7 Context of Use Requirements

This section describes the intended usage contexts to inform design decisions.

#### CU-001: Desktop Context - Collection Curation
**Context:** Curator working at desktop computer  
**Typical Activities:**
- Adding new books to canonical collection
- Editing book metadata (titles, categories, tags, inclusion rationale, external references)
- Reviewing and enriching incomplete records
- Performing data migration from Excel
- Managing user accounts (MVP 1)
- Conducting advanced searches across metadata
- Analyzing collection statistics

**Usage Characteristics:**
- Extended sessions (30+ minutes)
- Keyboard and mouse input available
- Large screen (desktop or laptop)
- Stable internet connection
- Focus on data entry and metadata management

**Design Implications:**
- Forms optimized for keyboard input
- Multi-field layouts suitable for wide screens
- Complex filtering and sorting interfaces acceptable
- Detailed metadata entry expected

#### CU-002: Mobile Context - Reading Activities
**Context:** Reader accessing system via mobile browser  
**Typical Activities:**
- Checking which book to read next (while at bookstore or library)
- Viewing current reading priorities
- Marking book as acquired or purchased (ownership update)
- Marking book as started (status change to "Reading")
- Marking book as completed (status change to "Finished" with optional rating)
- Looking up book details (inclusion rationale, external references)
- Quick search for specific book

**Usage Characteristics:**
- Brief sessions (under 5 minutes)
- Touch input on phone-sized screen (375-430px width typical)
- Potentially unstable or slow connection
- Likely one-handed use
- High-frequency, focused interactions

**Design Implications:**
- Large touch targets (minimum 44x44 pixels)
- Minimal data entry required
- Quick access to most frequent actions
- Streamlined navigation for essential workflows
- Graceful degradation on slow connections

#### CU-003: Primary vs Secondary Contexts
**Requirement:** System shall support both contexts with appropriate prioritization  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Different workflows have different natural contexts. Optimizing each context appropriately improves overall usability without requiring native mobile applications.

**Desktop as Primary:**
- Collection curation workflows remain desktop-first
- Administrative functions remain desktop-first
- Complex metadata entry optimized for keyboard/mouse
- Wide-screen layouts for data-rich views

**Mobile as Essential:**
- Essential reading workflows (UX-011) must be fully functional on mobile browsers
- Status updates and ownership changes must be efficient on touch screens
- Reading list views must be usable on phone screens
- No native mobile app required, no offline support required

**Technology Approach:**
- Responsive web design (not separate mobile site)
- Progressive enhancement (desktop features work on mobile when screen permits)
- No requirement for PWA, offline support, or app store deployment
- Modern mobile browser support (last 2 versions of iOS Safari, Chrome Android)

## 2. Data Model Requirements

**Note:** This section describes entities, attributes, and relationships using technology-neutral terms. Specific database technology, data types, and implementation patterns are architecture decisions deferred to ADR phase. Field constraints (max lengths, formats) are illustrative guidelines, not prescriptive implementation requirements.

### 2.1 Core Entities

#### Books (Canonical Collection)

**Purpose:** Central curated collection owned by curator

**Identity:** Each book must be uniquely identifiable throughout the system

**Required Attributes:**
- **title:** Book title (text, maximum approximately 500 characters)
- **author_display_name:** Author name as displayed to users (text, maximum approximately 300 characters). Examples: "Homer", "Unknown", "Brothers Grimm", "Various Authors", "Snorri Sturluson", "Tolstoy, Leo", "Edited by Jane Smith"

**Optional Attributes:**
- **given_name:** Author's given/first name if applicable (text, maximum approximately 200 characters)
- **family_name:** Author's family/last name if applicable (text, maximum approximately 200 characters)
- **title_original:** Original title if published in another language (text, maximum approximately 500 characters)
- **year_published:** Year or period of publication (text to accommodate formats like "8th century BC", "ca. 1200", "1965-1971")
- **year_sort:** Normalized year value suitable for chronological sorting (numeric, can be negative for BC dates)
- **primary_category:** Primary classification from controlled vocabulary (text, single value, examples: Novel, Play, Poetry, Philosophy, History, Religion, Politics, Science, Drama, Essay) - see controlled vocabulary below
- **tags:** Additional flexible classification (multi-valued collection of text strings, optional, examples: "tragedy", "political philosophy", "medieval", "existentialism")
- **original_language:** Language book was originally written in (short code, 2-3 characters suggested, ISO 639 codes recommended)
- **source:** Where the book recommendation originated (text, free-form)
- **inclusion_rationale:** Why this work belongs in the canon - its significance, cultural importance, or reason readers should consider it (text, free-form)
- **author_lifespan:** Author's birth/death years (text, format example: "1564-1616")

**Audit Attributes:**
- **created_at:** When book was added to collection (timestamp)
- **updated_at:** When book metadata was last modified (timestamp)
- **created_by_user_id:** Which user added the book (reference to Users entity)

**Business Rules:**
- Books are uniquely identified (no duplicate books)
- Required attributes must be present before book can be added
- Optional attributes may be absent (progressive enrichment principle)
- primary_category must be from controlled vocabulary (if present)
- tags are flexible and user-defined (no controlled vocabulary)
- author_display_name supports diverse authorship: single authors, unknown authors, collective authors, editors, anthologies, historical names without conventional given/family name structure
- given_name and family_name are optional parsing aids when applicable but not required

**Primary Category Controlled Vocabulary:**
The following values are permitted for primary_category:
- Novel
- Play / Drama
- Poetry
- Philosophy
- History
- Religion / Theology
- Politics / Political Theory
- Science
- Essay / Non-fiction
- Biography / Memoir
- Anthology / Collection

Additional values may be added by curator as needed. The vocabulary is intentionally broad to accommodate diverse works in the canon.

**Traceability:**
- Maps to Excel columns: Author/Last Name/First Name → author_display_name (with optional given_name/family_name), Title (EN), Original Title, Year, Category → primary_category, Genre + Subject → tags, Original Language, Source, Comment → inclusion_rationale, Author Lifespan
- Simplifies classification per Decision 5: primary_category (controlled) + tags (flexible)
- Author model supports diverse authorship patterns (ancient works, unknown authors, collective works, editors)
- Supports progressive enrichment principle (design-decisions.md)

#### User Reading Status (Personal Data)

**Purpose:** User-specific reading data, separate from canonical collection

**Identity:** Each user-book pair must be uniquely identifiable

**Relationships:**
- Belongs to one User
- Refers to one Book from canonical collection

**Attributes:**
- **reading_status:** Current reading state (enumerated: not_started, want_to_read, reading, paused, finished, abandoned; default: not_started)
- **ownership_status:** Book ownership state (enumerated: not_owned, ordered, owned_physical, owned_digital, borrowed; default: not_owned)
- **personal_notes:** Private notes and reflections (text, free-form, optional)
- **personal_rating:** Rating from 1-5 (numeric scale 1-5, optional) - represents both enjoyment/value AND recommendation strength (see FR-025)
- **started_at:** When user first marked book as "reading" (timestamp, optional, auto-set)
- **completed_at:** When user marked book as "finished" (timestamp, optional, auto-set)
- **created_at:** When this record was created (timestamp, auto-set)
- **updated_at:** When this record was last modified (timestamp, auto-set)

**Note:** personal_priority attribute was removed 2026-10-06. Reading status + rating is sufficient for user needs.

**Business Rules:**
- One reading status record per user per book (unique constraint on user + book pair)
- Personal data is private to the user (see NFR-021)
- User can have multiple books with status "Reading" simultaneously

**Traceability:**
- Maps to Excel columns: Lib (ownership), Prio (rating + status, per Decision 3 updated), Read (reading status)
- Separates personal from canonical data (design-decisions.md #3)

#### Users

**Purpose:** User accounts with role-based access

**Release Target:** MVP 1 (MVP 0 has single curator user with simplified authentication)

**Identity:** Each user must be uniquely identifiable

**Required Attributes:**
- **email:** User's email address (text, must be unique across all users, maximum approximately 255 characters)
- **password_hash:** Securely hashed password (text, one-way hash per NFR-023, never plaintext)
- **display_name:** User's display name shown in interface (text, maximum approximately 100 characters)
- **role:** User's role (enumerated: curator, reader; default: reader)

**Optional Attributes:**
- **invited_by_user_id:** Which user invited this user (reference to Users entity, optional)

**Audit Attributes:**
- **created_at:** When account was created (timestamp, auto-set)
- **last_login_at:** Most recent login time (timestamp, auto-updated)

**Business Rules:**
- Email addresses must be unique (no two users with same email)
- First user in system is automatically assigned curator role
- Password must be stored securely hashed, never in plaintext (see NFR-023)
- Users authenticate via email + password (see FR-042)

**Traceability:**
- Supports multi-user with curator control (design-decisions.md #2, #3)

#### Invitation Tokens

**Release Target:** MVP 1  
**Purpose:** Manage user invitations

**Identity:** Each invitation token must be uniquely identifiable

**Relationships:**
- Created by one User (curator)
- Optionally used by one User (becomes new user account)

**Attributes:**
- **token:** Secure random token value (text, must be unique, cryptographically random)
- **created_by_user_id:** Which curator created this invitation (reference to Users entity)
- **invited_email:** Optional pre-filled email for recipient (text, optional)
- **expires_at:** When invitation expires (timestamp)
- **used_at:** When invitation was used (timestamp, optional, auto-set)
- **used_by_user_id:** Which user account was created from this invitation (reference to Users entity, optional, auto-set)
- **revoked_at:** When invitation was revoked by curator (timestamp, optional, auto-set)

**Business Rules:**
- Tokens must be cryptographically secure random values
- Tokens must be unique across all invitations
- Each invitation can only be used once
- Expired invitations cannot be used
- Revoked invitations cannot be used
- Only curators can create invitations

#### Book Recommendations

**Release Target:** Post-MVP  
**Purpose:** User suggestions for canonical collection

**Identity:** Each recommendation must be uniquely identifiable

**Relationships:**
- Proposed by one User (reader or curator)
- Reviewed by one User (curator, optional)
- If approved, linked to one Book in canonical collection

**Attributes:**
- **proposed_by_user_id:** Which user submitted this recommendation (reference to Users entity)
- **title:** Proposed book title (text)
- **author_display_name:** Proposed author name (text)
- **justification:** Why this book should be added to canon (text, free-form)
- **status:** Current state (enumerated: pending, approved, rejected; default: pending)
- **reviewed_by_user_id:** Which curator reviewed this (reference to Users entity, optional)
- **reviewed_at:** When curator reviewed this (timestamp, optional, auto-set)
- **rejection_reason:** Why curator rejected (text, optional)
- **approved_book_id:** If approved, the created Book (reference to Books entity, optional, auto-set)
- **created_at:** When recommendation was submitted (timestamp, auto-set)

**Business Rules:**
- Any authenticated user can submit recommendations
- Only curators can review/approve/reject recommendations
- Approved recommendations create new Books in canonical collection
- Rejected recommendations remain in system for audit (with reason)

#### External References

**Release Target:** MVP 0  
**Purpose:** External links and references for books (Wikipedia, Project Gutenberg, publisher pages, educational resources, etc.)

**Identity:** Each external reference must be uniquely identifiable

**Relationships:**
- Each reference belongs to one Book in canonical collection
- Each Book can have zero or many external references

**Attributes:**
- **book_id:** Which book this reference belongs to (reference to Books entity)
- **url:** Web address of external resource (text, URL format)
- **link_text:** Display text or title for the link (text, optional, maximum approximately 200 characters)
- **reference_type:** Optional categorization (text, optional, examples: "Wikipedia", "Project Gutenberg", "Publisher", "Educational Resource", "Literary Analysis")
- **created_at:** When reference was added (timestamp, auto-set)
- **created_by_user_id:** Which user added this reference (reference to Users entity, optional)

**Business Rules:**
- Only curator can add/edit/remove external references
- URLs should be validated for basic format correctness
- Duplicate URLs for same book should be prevented
- External references are canonical (shared with all users)
- Display order determined by created_at (oldest first) or reference_type grouping

### 2.2 Data Migration Mapping

**Excel to Database Transformation:**

| Excel Column | Database Mapping | Transformation Notes |
|--------------|------------------|---------------------|
| Author | books.author_display_name | Use as-is, or combine with Last Name/First Name if present |
| Last Name | books.family_name | Optional parsing aid, also used to construct author_display_name if needed |
| First Name | books.given_name | Optional parsing aid, also used to construct author_display_name if needed |
| Title (EN) | books.title | Direct mapping |
| Original Title | books.title_original | Direct mapping, nullable |
| Year | books.year_published | Keep as string for display |
| Sort Time | books.year_sort | Use for chronological sorting |
| Category | books.primary_category | Map to controlled vocabulary value (Decision 5) |
| Genre | books.tags | Convert to tag (multi-value) |
| Subject | books.tags | Convert to tag (multi-value) |
| Original Language | books.original_language | Direct mapping, nullable |
| Source | books.source | Direct mapping, nullable |
| Comment | books.inclusion_rationale | Direct mapping, nullable |
| Author Lifespan | books.author_lifespan | Direct mapping, nullable |
| External Links | external_references.url + link_text | Parse if present, create multiple reference records if multiple links |
| Lib | user_reading_status.ownership_status | 'X' → owned_physical, blank → not_owned |
| Prio | user_reading_status.personal_rating + reading_status | Complex: 'x' → status=want_to_read; '1-5' → rating=1-5 (inverted); '-' → ignored; blank → NULL. See Decision 3. |
| Read | user_reading_status.reading_status | 'X' → finished, '-' → reading, blank → not_started |

**Prio Column Migration Detail (Decision 3, Updated 2026-10-06):**
The Excel "Prio" column historically mixed multiple concepts. Current migration logic:
- 'x' → reading_status = want_to_read (changed from personal_priority after priority removal)
- '1-5' (numeric) → personal_rating = 1-5 stars, inverted from German grading (grade 1 → 5★, grade 5 → 1★)
- '-' → Ignored (deprecated marker)
- blank → All fields NULL/default

**Note:** Read column takes precedence over Prio column for reading_status. If Read='-' (reading) and Prio='x', the book status is 'reading', not 'want_to_read'.

**Author Migration Detail:**
The Excel author columns are consolidated into the flexible author model:
- If "Author" column has value, use as author_display_name
- If "Last Name" and "First Name" both present, construct author_display_name (e.g., "Tolstoy, Leo") and populate family_name/given_name
- If only "Last Name" present, use as author_display_name
- For ancient/unknown authors (e.g., "Homer", "Unknown"), use as author_display_name without parsing
- For collective authors (e.g., "Brothers Grimm", "Various Authors"), use as author_display_name
- family_name and given_name are optional aids for sorting/filtering but author_display_name is canonical

**Category/Genre/Subject Migration Detail (Decision 5):**
The Excel columns Category, Genre, and Subject are consolidated:
- Excel "Category" → books.primary_category (validate against controlled vocabulary)
- Excel "Genre" + "Subject" → books.tags (combined into multi-valued tags collection)
- If Category value not in controlled vocabulary, add to tags and leave primary_category NULL for curator review

**Data Quality Preservation:**
- Store original Excel values for audit
- Flag records with unusual values for curator review
- Generate migration report with warnings and validation summary

### 2.3 Progressive Enrichment Design

**Principle:** System must work with incomplete data (design-decisions.md)

**Requirements:**
- System shall accept and store books with only required attributes (title, author_display_name)
- System shall gracefully display books with missing optional attributes
- UI shall clearly indicate which optional attributes are missing
- System shall allow curator to add optional attributes at any time
- Adding optional attributes shall not disrupt existing functionality

**Rationale:**
The canonical collection contains books from diverse sources and time periods. Complete metadata may not always be available at the time of entry. The system must remain functional and useful even when only minimal information is present.

**Deferred to Post-MVP:**
Data completeness scoring, enrichment dashboards, and prioritized enrichment workflows. For MVP, curator enriches books opportunistically as information becomes available.

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-001: Book List Load Time
**Requirement:** Book list shall load within 2 seconds for collections up to 1000 books  
**Priority:** Must Have  
**Rationale:** User expects better performance than Excel  
**Measurement:** Time from page request to interactive book list

#### NFR-002: Search Response Time
**Requirement:** Search results shall appear within 1 second  
**Priority:** Must Have  
**Rationale:** Searching must feel instant to match Excel's Ctrl+F  
**Measurement:** Time from keystroke to results displayed

#### NFR-003: Concurrent Users
**Requirement:** System shall support up to 10 concurrent users without degradation  
**Priority:** Must Have  
**Rationale:** Anticipated user base is 5-10 people  
**Measurement:** Load test with 10 simultaneous sessions

### 3.2 Usability

#### NFR-010: Easier Than Excel
**Requirement:** Common actions must be easier than Excel equivalents  
**Priority:** Must Have  
**Rationale:** Core success criterion (intent.md)  
**Measurement:** User feedback, task completion time comparison  
**Common Actions:**
- Finding next book to read
- Updating reading status
- Recording comments
- Filtering by criteria
- Viewing statistics

#### NFR-011: Browser Support and Responsive Design
**Requirement:** System must work on modern browsers across desktop and mobile contexts with appropriate prioritization  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Desktop remains primary for curation; mobile essential for high-frequency reading activities (see Context of Use Requirements 1.7)

**Desktop Browser Support (all workflows):**
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Full functionality for all workflows
- Optimized for keyboard/mouse input
- Wide-screen layouts

**Mobile Browser Support (essential workflows per UX-011):**
- iOS Safari (latest 2 versions)
- Chrome Android (latest 2 versions)
- Essential reading workflows must be fully functional and efficient
- Touch-optimized interfaces (44x44px minimum touch targets)
- Responsive layouts for phone screens (minimum 375px width)
- Administrative workflows (collection curation, metadata entry) may have reduced experience on mobile

**Technology Approach:**
- Responsive web design (single codebase)
- No native mobile application required
- No offline support required
- No PWA features required
- No app store deployment required

#### NFR-012: Intuitive Interface
**Requirement:** Interface must be intuitive for non-technical users  
**Priority:** Must Have  
**Rationale:** Secondary users are friends/family, not developers  
**Measurement:** Usability testing with non-technical users

### 3.3 Security

#### NFR-020: Authentication Required
**Requirement:** Authentication required for all access  
**Priority:** Must Have  
**Rationale:** Private collection, invite-only  
**Implementation:** No public routes except login/register

#### NFR-021: Personal Data Privacy
**Requirement:** Users can only access and modify their own personal data  
**Priority:** Must Have  
**Release Target:** MVP 1 (MVP 0 has single user)  
**Rationale:** Reading data is private  
**Verification:** Authorization mechanism prevents users from viewing or modifying other users' personal reading data

#### NFR-022: Curator-Only Collection Modification
**Requirement:** Only curator can modify canonical collection  
**Priority:** Must Have  
**Release Target:** MVP 1 (MVP 0 has single curator user)  
**Rationale:** Maintain editorial control (vision.md)  
**Verification:** Authorization mechanism prevents non-curator users from adding, editing, or removing books from canonical collection

#### NFR-023: Password Security
**Requirement:** Passwords must not be stored in recoverable form  
**Priority:** Must Have  
**Release Target:** MVP 0  
**Rationale:** Basic security hygiene  
**Verification:** Passwords are stored using industry-standard one-way cryptographic hashing (not reversible, not plaintext)

#### NFR-024: HTTPS Required
**Requirement:** Production deployment must use encrypted transport  
**Priority:** Must Have  
**Release Target:** MVP 1 (production deployment)  
**Rationale:** Protect credentials and session tokens  
**Verification:** All HTTP requests redirected to HTTPS, valid TLS certificate in place

### 3.4 Data Quality

#### NFR-030: Preserve Original Data
**Requirement:** System must preserve original Excel data during migration  
**Priority:** Must Have  
**Rationale:** Years of accumulated information must not be lost  
**Implementation:** Store original values in metadata, audit log

#### NFR-031: Track Quality Scores
**Requirement:** System should track data quality scores per book  
**Priority:** Should Have  
**Release Target:** Post-MVP  
**Rationale:** Support progressive enrichment (nice-to-have, not essential for MVP)  
**Deferral Rationale:** For MVP, curator enriches books opportunistically without scoring system. Algorithmic guidance deferred.

#### NFR-032: Flag Incomplete Records
**Requirement:** System should flag incomplete records for enrichment  
**Priority:** Should Have  
**Release Target:** Post-MVP  
**Rationale:** Guide curator's enrichment efforts (nice-to-have, not essential for MVP)  
**Deferral Rationale:** For MVP, curator identifies gaps through direct observation while using the system. Enrichment dashboard deferred.

### 3.5 Maintainability

#### NFR-040: Well-Documented Code
**Requirement:** Code must be well-documented  
**Priority:** Must Have  
**Rationale:** Learning exercise, long-term maintenance  
**Implementation:** Comments for non-obvious logic, README files

#### NFR-041: Architecture Decision Records
**Requirement:** Architecture decisions must be documented in ADRs  
**Priority:** Must Have  
**Rationale:** AI-native SDLC traceability requirement  
**Implementation:** ADR files for major technical choices

#### NFR-042: Traceable Implementation
**Requirement:** Implementation must be traceable to requirements  
**Priority:** Must Have  
**Rationale:** AI-native SDLC requirement  
**Implementation:** Reference requirement IDs in code comments/commits

#### NFR-043: Type Safety
**Requirement:** Codebase must support compile-time type checking  
**Priority:** Should Have  
**Release Target:** Architecture decision (ADR)  
**Rationale:** Catch type errors before runtime, improve code maintainability and IDE support  
**Verification:** Type checker runs successfully as part of build process, catches type mismatches before execution

## 4. User Stories

### 4.1 Curator Stories

**US-001: Discover Next Book**  
As a curator, I want to see which books I should read next, so I can make thoughtful reading choices.

**Acceptance:**
- View list filtered by "Want to Read" status
- Sort by rating or title
- Filter by genre/category of interest
- See books I already own highlighted
- Quick action to mark as "Reading"

---

**US-002: Record Completion**  
As a curator, I want to quickly mark a book as 'Finished' and record my thoughts, so I can track my reading journey.

**Acceptance:**
- Change status to "Finished" with one click
- Optionally add rating (1-5 stars, implies recommendation strength per FR-025)
- Optionally add personal notes
- See completion date automatically recorded
- View in list of books with status "Finished" immediately

---

**US-003: Track Ownership**  
As a curator, I want to track which books I own so I know what to buy.

**Acceptance:**
- Mark books as Owned, Ordered, or Not Owned
- Filter collection by ownership status
- See count of owned books in statistics
- Identify want-to-read books I don't yet own

---

**US-004: Enrich Collection**  
As a curator, I want to add new books to the collection as I discover them, so the canon stays current.

**Acceptance:**
- Simple form to add new book (title + author_display_name minimum)
- Add optional metadata (year, primary_category, tags, inclusion_rationale, external references, etc.)
- Book appears in collection immediately
- Can edit metadata later

---

**US-005: Identify Gaps**  
**Release Target:** Post-MVP  
**Rationale:** Enrichment dashboard deferred. MVP curator enriches opportunistically.  
As a curator, I want to see which books need more metadata, so I can gradually enrich the collection.

**Acceptance:**
- Dashboard shows books with low completeness scores
- Sort by title or rating
- See which specific fields are missing
- Quick-edit to fill in metadata

### 4.2 Reader Stories

**US-006: Browse Canon**  
As a reader, I want to browse the canon to discover significant books I haven't considered.

**Acceptance:**
- View all books in collection
- Filter by primary_category, tags, language
- Sort by year, author, title
- Read inclusion rationale about why book is significant
- See external references (Wikipedia, Project Gutenberg, etc.)
- See which books other readers have rated highly (future)

---

**US-007: Track Personal Progress**  
As a reader, I want to track my reading progress separately from the curator, so my data doesn't interfere with theirs.

**Acceptance:**
- Mark books with my own reading status
- Set my own priorities
- Write private notes
- View my own statistics
- My data doesn't affect curator's view or other readers

---

**US-008: Recommend Addition**  
**Release Target:** Post-MVP  
**Rationale:** Recommendation workflow deferred per Decision 1. MVP curator can add books suggested informally.  
As a reader, I want to recommend books for inclusion, so I can contribute to the canon.

**Acceptance:**
- Submit book recommendation with title, author, reason
- See status of my pending recommendations
- Get notified when curator approves/rejects
- Approved books appear in my "Want to Read" list

---

**US-009: View Statistics**  
As a reader, I want to see my reading statistics, so I can track my progress.

**Acceptance:**
- See count: books read this year
- See count: books with status "Reading"
- See count: books with status "Want to Read"
- See count: books owned
- See timeline of books with status "Finished"

---

**US-010: Get Recommendations**  
As a reader, I want personalized suggestions for what to read next, so I don't feel overwhelmed by the collection size.

**Acceptance:**
- System suggests books based on my priorities
- System considers books I own but haven't read
- System considers my genre preferences (if pattern exists)
- Simple, clear recommendations (not overwhelming)

## 5. Use Cases

### UC-001: Decide What to Read Next

**Actor:** Curator or Reader  
**Precondition:** User is authenticated, has marked some books as "Want to Read"  
**Trigger:** User wants to choose next book to read

**Main Flow:**
1. User navigates to "My Books" or dashboard
2. System displays books filtered by "Want to Read" status
3. System sorts books by title (alphabetically)
4. User applies additional filters (e.g., "novels only", "books I own")
5. User can sort by rating, year, author, or other criteria
6. User reviews book details for top candidates
7. User selects a book
8. User changes status to "Reading"
9. System records started_at timestamp
10. System adds book to reading list (books with status "Reading")

**Alternative Flow 8a:** User not ready to commit
- User keeps status as "Want to Read" for later decision
- User can optionally add a rating to indicate relative importance

**Postcondition:** Book status is "Reading", started_at recorded

---

### UC-002: Complete a Book

**Actor:** Curator or Reader  
**Precondition:** User is authenticated, book status is "Reading"  
**Trigger:** User finishes reading a book

**Main Flow:**
1. User navigates to book detail page
2. User clicks "Mark as Finished" or changes status to "Finished"
3. System shows completion dialog with optional fields:
   - Personal rating (1-5 stars, implies recommendation strength)
   - Personal notes/reflection
4. User fills in desired fields (all optional)
5. User confirms completion
6. System saves status change and optional data
7. System records completed_at timestamp
8. System shows success confirmation
9. System updates statistics (books completed count increments)

**Alternative Flow 2a:** Book was not good
- User changes status to "Abandoned" instead of "Finished"
- Can still add rating and notes explaining why

**Alternative Flow 3a:** User in a hurry
- User skips optional fields
- Just status and timestamp are recorded
- User can add rating/notes later

**Postcondition:** Book status is "Finished", completed_at recorded, optional personal data saved

---

### UC-003: Add Book to Collection (Curator Only)

**Actor:** Curator  
**Precondition:** User is authenticated with curator role  
**Trigger:** Curator discovers a book that belongs in the canon

**Main Flow:**
1. Curator clicks "Add Book" button
2. System displays book entry form with fields:
   - Title (required)
   - Author Display Name (required)
   - Given Name (optional)
   - Family Name (optional)
   - Original Title
   - Year Published
   - Primary Category (dropdown from controlled vocabulary)
   - Tags (multi-entry)
   - Original Language
   - Source
   - Inclusion Rationale
   - Author Lifespan
   - External References (add URL and link text, repeatable)
3. Curator enters title and author display name (minimum)
4. Curator fills in as many optional fields as available
5. Curator can add one or more external references (optional)
6. Curator submits form
7. System validates required fields
8. System validates primary_category against controlled vocabulary (if provided)
9. System validates URL format for external references (if provided)
10. System saves book to collection
11. System saves external references (if any)
12. System displays success message
13. System shows book in collection

**Alternative Flow 7a:** Validation fails
- System highlights missing/invalid fields
- Curator corrects and resubmits

**Alternative Flow 4a:** Curator only has minimal info
- Curator enters just title and author display name
- System accepts with only required fields
- Optional fields and external references can be added later (progressive enrichment)

**Postcondition:** New book exists in canonical collection, visible to all users

---

### UC-004: Migrate Excel Data

**Actor:** System Administrator (Curator)  
**Precondition:** New system, Excel workbook available  
**Trigger:** Initial system setup

**Main Flow:**
1. Administrator initiates migration with Excel file path
2. System reads Excel workbook and validates each row:
   - Validates required fields (title, author) are present
   - Identifies unusual or unexpected values
   - Reports missing optional fields
3. System generates pre-migration report showing:
   - Total rows to import
   - Validation warnings
   - Validation errors (if any)
   - Summary of missing optional fields
4. Administrator reviews warnings and errors
5. Administrator either:
   - Confirms migration (if acceptable), or
   - Cancels migration to correct source data
6. If confirmed, system imports data:
   - Creates Books entities from Excel book data
   - Creates User Reading Status entities from curator's personal data (Lib, Prio, Read columns per Decision 3)
   - Preserves original Excel values for audit
7. System generates post-migration report:
   - Number of books successfully imported
   - Number of user reading status records created
   - Summary of data preservation
8. Administrator reviews final report

**Alternative Flow 5a:** Administrator cancels migration
- Administrator corrects Excel data or reviews validation rules
- Administrator re-runs migration from step 1

**Alternative Flow 6a:** Import fails
- System reverses any partial changes
- System reports error to administrator
- Administrator investigates error, fixes issue, re-runs migration

**Postcondition:** All Excel books and curator's personal reading data successfully imported

**Notes:**
- See Section 2.2 for Excel-to-entity mapping details
- See Decision 3 for Prio column mapping logic
- Migration is idempotent: safe to re-run on fresh system

---

### UC-005: Generate User Invitation (Curator Only)

**Actor:** Curator  
**Precondition:** User is authenticated with curator role  
**Trigger:** Curator wants to invite a friend to use the application

**Main Flow:**
1. Curator navigates to "User Management" section
2. Curator clicks "Invite User"
3. System displays invitation form:
   - Optional: recipient email (for pre-fill)
   - Expiration date (default: 7 days)
4. Curator enters email and adjusts expiration if needed
5. Curator submits form
6. System generates secure random token
7. System creates invitation record
8. System displays invitation link: `https://app.url/register?token=xxx`
9. Curator copies link and sends to recipient (email, message, etc.)

**Alternative Flow 9a:** System sends email automatically
- System emails invitation link to recipient
- Curator doesn't need to manually send

**Postcondition:** Valid invitation token exists, recipient can register

---

### UC-006: Register via Invitation

**Actor:** Invited User  
**Precondition:** User has valid invitation link  
**Trigger:** User clicks invitation link

**Main Flow:**
1. User clicks invitation link
2. Browser opens registration page with token in URL
3. System validates token:
   - Token exists
   - Token not expired
   - Token not already used
4. System displays registration form (email may be pre-filled)
5. User enters:
   - Email
   - Display name
   - Password
   - Password confirmation
6. User submits form
7. System validates:
   - Email format valid
   - Email not already in use
   - Password meets strength requirements
   - Passwords match
8. System creates user account with role "reader"
9. System marks invitation token as used
10. System logs user in
11. System redirects to book collection
12. System shows welcome message

**Alternative Flow 3a:** Token invalid/expired
- System displays error message
- User cannot register
- User contacts curator for new invitation

**Alternative Flow 7a:** Validation fails
- System highlights errors
- User corrects and resubmits

**Postcondition:** New user account created with reader role, user logged in

## 6. Open Questions

### Q1: Authentication Strategy

**Question:** Should we use a managed authentication service or build custom?

**Options:**
1. **Managed Service (Supabase Auth, Auth0, Clerk)**
   - Pros: Reduces security surface, handles password reset/MFA, invitation workflows often built-in
   - Cons: External dependency, potential cost (though free tiers sufficient)
   - Recommendation: Supabase Auth if using Postgres

2. **Custom JWT-based Authentication**
   - Pros: Complete control, no external dependencies, learning opportunity
   - Cons: High security risk if implemented incorrectly, more code to maintain
   - Recommendation: Only if authentication is a specific learning goal

**Decision Criteria:**
- Learning goals (want to learn auth?) vs. time-to-market
- Hosting choice (if using Supabase for DB, their auth integrates well)
- Security comfort level

**Defer to:** Architecture phase (ADR-004)

---

### Q2: Priority Value Mapping Strategy

**Status:** RESOLVED - See Decision 3

**Question:** How should we map Excel priority values to new data model?

**Excel Prio Column Values:**
The Excel "Prio" column historically contained mixed semantic values requiring interpretation during migration.

**Resolution (Decision 3, Updated 2026-10-06):**
Excel "Prio" column mixed three concepts:
- 'x' → reading_status = want_to_read (changed from personal_priority after priority removal)
- '1-5' (numeric) → personal_rating = 1-5 stars (inverted: German grade 1→5★, 5→1★)
- '-' → Ignored (deprecated marker)
- blank → All fields NULL/default

**Note:** Original mapping used personal_priority=High for 'x', but priority feature was removed 2026-10-06. Migration now maps 'x' to reading_status=want_to_read instead.

See Section 2.2 "Prio Column Migration Detail" for implementation guidance.

**Additional Context (Decision 2):**
Recommendation Score removed as separate field. Personal Rating now implies recommendation strength (FR-025).

---

### Q3: Book vs. Edition Modeling

**Question:** Should we model Book (work) vs. Edition separately?

**Context:** Some books have multiple editions (Penguin Classics vs. Oxford World's Classics), different page counts, ISBNs

**Options:**
1. **Single Entity (Book = Edition)**
   - MVP approach: One row per book, edition info in optional fields
   - Pros: Simpler model, matches current Excel structure
   - Cons: Can't track multiple editions of same work

2. **Separate Work and Edition**
   - Work: War and Peace (the abstract work)
   - Edition: Penguin 2007 edition, ISBN XXX, 1320 pages
   - Pros: More accurate model, supports edition-specific data
   - Cons: More complex, may be overkill for canonical reading collection focused on works rather than specific editions

**Recommendation for MVP:** Single entity with optional edition fields
- Add `edition_info` text field for notes like "Penguin Classics 2007"
- Add `isbn` field if user wants to track
- Can refactor to separate entities later if needed

**Defer to:** MVP implementation decision, revisit if users want multiple editions

---

### Q4: Comments/Notes Visibility

**Question:** Should any comments be visible to other users, or all private?

**Current Design:**
- `books.inclusion_rationale` - shared with all users, explains why book is in canon, part of canonical data
- `user_reading_status.personal_notes` - private, user's own reflections

**Future Enhancement:** Shared comments/discussions
- Users could optionally share their notes
- Discussion threads per book
- Explicitly out of scope for MVP

**Decision:** Confirm this two-tier model works for curator:
1. Inclusion rationale visible to all (why book is in canon)
2. Personal notes always private
3. No shared user comments in MVP

---

### Q5: Year Field Format

**Question:** How should we store and display year/date information?

**Context:** Excel has wide variety of formats:
- "8th century BC"
- "ca. 1200–1210"
- "1965-1971"
- Numeric: 1920
- Numeric: -800 (for sorting BC dates)

**Proposed Solution:**
- `year_published` (string) - store as human-readable display text
- `year_sort` (integer) - store normalized value for sorting (negative for BC)
- `year_precision` (enum: exact, century, range, circa) - future enhancement

**Example:**
```
Book: Iliad
year_published: "8th century BC"
year_sort: -800
year_precision: century
```

**Decision:** Confirm this approach handles all Excel edge cases

---

### Q6: Search Scope

**Question:** Which fields should be included in full-text search?

**Implemented (FR-002):**
- title
- title_original (if present)
- author_display_name
- inclusion_rationale

**Not included:**
- personal_notes (excluded from search per Decision 4 - privacy concern)
- primary_category, tags (covered by filter, not search)

**Decision:** Personal notes excluded from search to maintain privacy boundaries

## 7. Success Criteria

The application is considered successful when these criteria are met:

### SC-001: Curator Preference
**Criteria:** The curator prefers using the application over the Excel spreadsheet  
**Measurement:** Curator self-reports after 2 weeks of use  
**Target:** Application becomes primary tool for all reading management tasks

### SC-002: Decision Speed
**Criteria:** Deciding what to read next becomes significantly easier  
**Measurement:** Time to answer "what should I read next?" vs. Excel  
**Target:** < 2 minutes in app vs. ~5-10 minutes in Excel

### SC-003: Data Entry Ease
**Criteria:** Reading progress, priorities, ownership, and reflections can be maintained with minimal effort  
**Measurement:** Time to mark book as finished and add notes  
**Target:** < 30 seconds (vs. ~2 minutes navigating Excel)

### SC-004: Sharing Enabled
**Criteria:** The collection can be shared with selected users  
**Measurement:** At least one secondary user successfully registered and using the app  
**Target:** 2-5 active users within first month

### SC-005: Independent User State
**Criteria:** Users can maintain their own reading states independently  
**Measurement:** Multiple users have different reading statuses for same books  
**Target:** No conflicts, no data overwrites between users

### SC-006: Curator Control
**Criteria:** The curated canonical collection is preserved and remains under editorial control  
**Measurement:** Only curator can modify canonical data, readers modify only personal data  
**Target:** No unauthorized modifications to book metadata

### SC-007: Performance
**Criteria:** The application remains usable and responsive as the collection grows  
**Measurement:** Load times, search response times  
**Target:** All NFR performance requirements met

## 8. Out of Scope (MVP)

The following capabilities are explicitly deferred and should not drive early architecture decisions:

### Explicitly Deferred
- Public social networking
- Book recommendation submission/approval workflow (FR-013, FR-014, US-008) - deferred to Post-MVP per Decision 1
- Unrestricted user-created books (only curator can add to canonical collection)
- Real-time chat
- Native mobile applications (responsive mobile-browser support is in scope per NFR-011 and UX-011, but native apps, PWAs, offline support, and app store deployment are out)
- E-reader integrations
- AI-generated reading recommendations
- Public user profiles
- Page-level progress tracking
- Complex edition management (multiple editions per work)
- Book purchasing integrations
- Import from external book databases (except initial Excel migration)
- Export to other formats (future: CSV, JSON export)
- Reading group coordination
- Email notifications (except possibly for invitation workflow)
- Social sharing to external platforms
- Detailed reading statistics (pages per day, reading speed, etc.)

### Future Enhancements to Consider
- Recommendation workflow improvements (voting, discussion)
- Reading group features (shared reading status, discussion threads)
- Richer statistics and visualizations
- Enhanced search (faceted, relevance ranking)
- Book cover images
- Timeline view of reading history
- Reading goals (e.g., "read 50 books in 2026")

## 9. Traceability Matrix

This matrix ensures all requirements trace back to source documents:

| Requirement ID | Source Document | Section |
|---------------|-----------------|---------|
| FR-001 to FR-005 | intent.md | Initial Scope: Collection Management |
| FR-010 to FR-014 | intent.md | Initial Scope: Collection Curation |
| FR-020 | design-decisions.md | #4 Reading Status |
| ~~FR-021~~, ~~FR-022~~ | design-decisions.md | #5 Priority vs Recommendation (both REMOVED) |
| FR-023 | design-decisions.md | #6 Ownership / Library Status |
| FR-024, FR-025, FR-026 | intent.md | Initial Scope: Personal Reading Management |
| FR-030 to FR-033 | intent.md | Initial Scope: Statistics |
| FR-040 to FR-043 | intent.md, design-decisions.md | Multi-user, invite-only, curator control |
| NFR-001 to NFR-003 | intent.md | Success Criteria: performance |
| NFR-010 | intent.md | Success Criteria #1: prefer over spreadsheet |
| NFR-011, NFR-012 | intent.md | Product Principles: Excellent Usability |
| NFR-020 to NFR-024 | design-decisions.md | #2 Curated Collection Ownership |
| NFR-030 to NFR-032 | intent.md | Existing Data Source: migration quality |
| NFR-040 to NFR-043 | intent.md | Constraints: AI-native SDLC, traceable |

## 10. Acceptance Criteria

Before considering this specification complete, verify:

### Completeness Checks
- [ ] All capabilities from intent.md "Initial Scope" are specified
- [ ] All design decisions from design-decisions.md are reflected
- [ ] Data model separates canonical from personal data
- [ ] All user stories have clear acceptance criteria
- [ ] All functional requirements are testable
- [ ] Non-functional requirements have measurable targets

### Consistency Checks
- [ ] Terminology is consistent across all sections
- [ ] No conflicting requirements
- [ ] Data model supports all functional requirements
- [ ] Use cases align with user stories

### Quality Checks
- [ ] Requirements are specific, not vague
- [ ] Each requirement has single responsibility
- [ ] All requirements have priority and rationale
- [ ] All edge cases considered (empty states, missing data)
- [ ] Progressive enrichment principle maintained throughout

### Traceability Checks
- [ ] All requirements reference source documents
- [ ] All intent.md success criteria are captured
- [ ] All design decisions are reflected
- [ ] Requirement IDs are unique and sequential

## 11. Next Steps

After this specification is reviewed and approved:

1. **Create Architecture Design**
   - Write Architecture Decision Records (ADRs)
   - ADR-001: Frontend framework choice
   - ADR-002: Backend architecture approach
   - ADR-003: Database selection
   - ADR-004: Authentication strategy
   - ADR-005: Hosting and deployment approach
   - ADR-006: ORM/data access layer
   - ADR-007: Testing strategy

2. **Create Implementation Plan**
   - Break work into phases/iterations
   - Identify dependencies between components
   - Estimate effort for each phase
   - Define MVP delivery scope

3. **Setup Development Environment**
   - Initialize project repository
   - Setup CI/CD pipeline
   - Configure development tools
   - Create initial project structure

4. **Begin Implementation**
   - Phase 0: Project setup, database schema
   - Phase 1: Authentication and user management
   - Phase 2: Book collection CRUD
   - Phase 3: Personal reading status
   - Phase 4: Search and filtering
   - Phase 5: Statistics and insights
   - Phase 6: Data migration script

---

**Document End**

This specification provides the foundation for technical design and implementation while maintaining full traceability to the vision and intent documents.
