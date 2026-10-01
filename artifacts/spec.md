# Requirements Specification: Reading Canon

## Document Status

**Version:** 1.0  
**Date:** 2026-10-01  
**Status:** Draft

## Document Purpose

This specification transforms the vision and intent documents into detailed, actionable requirements for the Reading Canon application.

All requirements maintain traceability to:
- `vision.md` - Product vision and principles
- `intent.md` - Problem statement and desired outcomes
- `design-decisions.md` - Design philosophy and choices

## 1. Functional Requirements

### 1.1 Collection Management

#### FR-001: Display Book Collection
**Description:** System shall display all books in the canonical collection  
**Priority:** Must Have  
**Source:** intent.md - Initial Scope: Collection Management  
**Acceptance Criteria:**
- All books in the database are visible to authenticated users
- Book list shows at minimum: title, author, year
- List is paginated for collections over 100 books
- Empty state shown when no books exist

#### FR-002: Full-Text Search
**Description:** System shall support full-text search across title, author, and comment fields  
**Priority:** Must Have  
**Source:** intent.md - Common activities: searching the collection  
**Acceptance Criteria:**
- Search returns results matching title (partial or full)
- Search returns results matching author name (first or last)
- Search returns results matching curator comments
- Search is case-insensitive
- Results appear within 1 second (see NFR-002)

#### FR-003: Filter Books
**Description:** System shall support filtering by category, genre, language, and personal reading status  
**Priority:** Must Have  
**Source:** intent.md - Common activities: filtering the collection  
**Acceptance Criteria:**
- Filter by category (novel, play, poetry, etc.)
- Filter by genre
- Filter by original language
- Filter by personal reading status (Want to Read, Reading, etc.)
- Filter by ownership status
- Multiple filters can be applied simultaneously
- Filters persist during session

#### FR-004: Sort Books
**Description:** System shall support sorting by title, author, year, priority, and rating  
**Priority:** Must Have  
**Source:** intent.md - Common activities  
**Acceptance Criteria:**
- Sort by title (alphabetically)
- Sort by author last name (alphabetically)
- Sort by year (chronologically, oldest or newest first)
- Sort by personal priority (if set)
- Sort by personal rating (if set)
- Sort by date added to collection
- Sort direction can be reversed

#### FR-005: View Book Details
**Description:** System shall display detailed information about each book  
**Priority:** Must Have  
**Source:** intent.md - Initial Scope: View detailed information about books  
**Acceptance Criteria:**
- Show all canonical metadata: title, original title, author, year, category, genre, subject, language, source, author lifespan, curator comment
- Show personal data for current user: reading status, priority, rating, recommendation score, ownership, personal notes
- Show data completeness indicator
- Gracefully handle missing optional fields
- Display timestamps (started, completed) if applicable

### 1.2 Curation (Curator Role Only)

#### FR-010: Add New Book
**Description:** Curator shall be able to add new books to the canonical collection  
**Priority:** Must Have  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Form requires title and author last name (minimum)
- Form provides fields for all optional metadata
- System validates required fields before saving
- System calculates data completeness score
- Newly added book appears in collection immediately
- System records created_by and created_at

#### FR-011: Edit Book Metadata
**Description:** Curator shall be able to edit canonical book metadata  
**Priority:** Must Have  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Curator can edit any canonical field
- Changes are saved with updated_at timestamp
- Editing book metadata does not affect users' personal data
- System maintains audit log of changes (future: detailed history)

#### FR-012: Remove Book
**Description:** Curator shall be able to remove books from the collection  
**Priority:** Must Have  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Curator can delete a book from collection
- System confirms deletion (prevent accidental removal)
- Deletion removes all user personal data for that book
- System warns curator if book has significant personal data from multiple users

#### FR-013: Review Recommendations
**Description:** Curator shall be able to review user-submitted book recommendations  
**Priority:** Should Have (MVP scope)  
**Source:** intent.md - Collection Curation  
**Acceptance Criteria:**
- Curator can view list of pending recommendations
- Each recommendation shows: proposed book details, who submitted it, when
- Curator can see submission reason/justification if provided

#### FR-014: Approve/Reject Recommendations
**Description:** Curator shall be able to approve or reject book recommendations  
**Priority:** Should Have (MVP scope)  
**Source:** intent.md - Collection Curation  
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
**Description:** User shall set personal reading priority per book  
**Priority:** Must Have  
**Source:** design-decisions.md #5 - Priority vs Recommendation  
**Acceptance Criteria:**
- User can set priority: High, Medium, Low, or None
- Priority is separate from recommendation score
- Priority is personal (does not affect other users)
- User can filter books by priority
- Priority can be changed at any time

#### FR-022: Assign Recommendation Score
**Description:** User shall assign recommendation score per book  
**Priority:** Must Have  
**Source:** design-decisions.md #5 - Priority vs Recommendation  
**Acceptance Criteria:**
- User can assign score: 1-5 scale or None
- Recommendation represents "how strongly would I recommend this to others"
- Recommendation is separate from personal priority
- Recommendation is separate from personal rating
- User can view their own highly-recommended books

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
**Source:** intent.md - Personal Reading Management: rating  
**Acceptance Criteria:**
- User can assign rating: 1-5 stars or None
- Rating is personal (not shared with other users)
- Rating represents personal enjoyment/value
- Rating is separate from recommendation score
- User can filter books by their rating

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
- Show count: Currently Reading
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
**Description:** System shall suggest next book to read based on priority and status  
**Priority:** Should Have  
**Source:** intent.md - Primary user wants to: prioritize future reading  
**Acceptance Criteria:**
- Show books with status "Want to Read" sorted by priority
- Prioritize books with High priority
- Consider user's preferred genres (if pattern exists)
- Highlight books user owns but hasn't read
- Simple algorithm (future: more sophisticated recommendations)

### 1.5 User Management & Authentication

#### FR-040: Generate Invitation Tokens
**Description:** Curator shall generate invitation tokens for new users  
**Priority:** Must Have  
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
**Source:** design-decisions.md #2 - Curated Collection Ownership  
**Acceptance Criteria:**
- Curator role can: add/edit/remove books, approve recommendations, generate invitations
- Reader role can: view collection, manage own personal data, submit recommendations
- Unauthorized actions return error
- UI hides actions user cannot perform
- First user in system is automatically curator

## 2. Data Model Requirements

### 2.1 Core Entities

#### Books (Canonical Collection)

**Purpose:** Central curated collection owned by curator

**Required Fields:**
- `id` (UUID, primary key)
- `title` (string, max 500 characters)
- `author_last_name` (string, max 200 characters)

**Optional Fields:**
- `author_first_name` (string, max 200 characters)
- `title_original` (string, max 500 characters)
- `year_published` (string, max 100 characters) - flexible format for "8th century BC", "ca. 1200", "1965-1971"
- `year_sort` (integer) - normalized for sorting, can be negative for BC
- `category` (string, max 100 characters) - novel, play, poetry, etc.
- `genre` (string, max 100 characters)
- `subject` (string, max 100 characters)
- `original_language` (string, 2-3 char code) - ISO 639 codes
- `source` (text) - where book recommendation came from
- `curator_comment` (text) - shared notes about the book
- `author_lifespan` (string, max 100 characters) - e.g., "1564-1616"
- `data_completeness_score` (float 0.0-1.0) - calculated field

**Metadata Fields:**
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by_user_id` (UUID, FK to users)

**Traceability:**
- Maps to Excel columns: Author, Last Name, First Name, Title (EN), Original Title, Year, Category, Genre, Subject, Original Language, Source, Comment, Author Lifespan
- Supports progressive enrichment principle (design-decisions.md)

#### User Reading Status (Personal Data)

**Purpose:** User-specific reading data, separate from canonical collection

**Fields:**
- `id` (UUID, primary key)
- `user_id` (UUID, FK to users) - NOT NULL
- `book_id` (UUID, FK to books) - NOT NULL
- `reading_status` (enum: not_started, want_to_read, reading, paused, finished, abandoned) - default not_started
- `personal_priority` (enum: high, medium, low) - nullable
- `recommendation_score` (integer 1-5) - nullable
- `ownership_status` (enum: not_owned, ordered, owned_physical, owned_digital, borrowed) - default not_owned
- `personal_notes` (text) - nullable
- `personal_rating` (integer 1-5) - nullable
- `started_at` (timestamp) - nullable, set when status becomes "reading"
- `completed_at` (timestamp) - nullable, set when status becomes "finished"
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Constraints:**
- UNIQUE (user_id, book_id) - one status record per user per book

**Traceability:**
- Maps to Excel columns: Lib (ownership), Prio (priority + recommendation mixed), Read (reading status)
- Separates personal from canonical data (design-decisions.md #3)

#### Users

**Purpose:** User accounts with role-based access

**Fields:**
- `id` (UUID, primary key)
- `email` (string, max 255, unique) - NOT NULL
- `password_hash` (string) - NOT NULL, bcrypt or argon2
- `display_name` (string, max 100) - NOT NULL
- `role` (enum: curator, reader) - NOT NULL, default reader
- `invited_by_user_id` (UUID, FK to users) - nullable
- `created_at` (timestamp)
- `last_login_at` (timestamp)

**Traceability:**
- Supports multi-user with curator control (design-decisions.md #2, #3)

#### Invitation Tokens (Optional MVP Scope)

**Purpose:** Manage user invitations

**Fields:**
- `id` (UUID, primary key)
- `token` (string, unique) - secure random token
- `created_by_user_id` (UUID, FK to users)
- `invited_email` (string, max 255) - optional pre-fill
- `expires_at` (timestamp)
- `used_at` (timestamp) - nullable
- `used_by_user_id` (UUID, FK to users) - nullable
- `revoked_at` (timestamp) - nullable

#### Book Recommendations (Optional MVP Scope)

**Purpose:** User suggestions for canonical collection

**Fields:**
- `id` (UUID, primary key)
- `proposed_by_user_id` (UUID, FK to users)
- `title` (string)
- `author_last_name` (string)
- `author_first_name` (string) - nullable
- `justification` (text) - why should this be added
- `status` (enum: pending, approved, rejected)
- `reviewed_by_user_id` (UUID, FK to users) - nullable
- `reviewed_at` (timestamp) - nullable
- `rejection_reason` (text) - nullable
- `approved_book_id` (UUID, FK to books) - nullable, set if approved
- `created_at` (timestamp)

### 2.2 Data Migration Mapping

**Excel to Database Transformation:**

| Excel Column | Database Mapping | Transformation Notes |
|--------------|------------------|---------------------|
| Author | books.author_last_name + books.author_first_name | Split or use as single name |
| Last Name | books.author_last_name | Direct mapping |
| First Name | books.author_first_name | Direct mapping, nullable |
| Title (EN) | books.title | Direct mapping |
| Original Title | books.title_original | Direct mapping, nullable |
| Year | books.year_published | Keep as string for display |
| Sort Time | books.year_sort | Use for chronological sorting |
| Category | books.category | Direct mapping, nullable |
| Genre | books.genre | Direct mapping, nullable |
| Subject | books.subject | Direct mapping, nullable |
| Original Language | books.original_language | Direct mapping, nullable |
| Source | books.source | Direct mapping, nullable |
| Comment | books.curator_comment | Direct mapping, nullable |
| Author Lifespan | books.author_lifespan | Direct mapping, nullable |
| Lib | user_reading_status.ownership_status | 'X' → owned_physical, blank → not_owned |
| Prio | user_reading_status.personal_priority | '1-2' → high, '3' → medium, '4-5' → low, 'x' → NULL |
| Read | user_reading_status.reading_status | 'X' → finished, blank → not_started |

**Data Quality Preservation:**
- Store original Excel values in metadata JSONB field
- Flag records with unusual values for curator review
- Track data completeness score per book
- Generate migration report with warnings

### 2.3 Progressive Enrichment Design

**Principle:** System must work with incomplete data

**Implementation:**
- All optional fields nullable at database level
- UI shows placeholder text for missing fields
- Book detail page shows data completeness percentage
- Curator dashboard shows "books needing enrichment"
- Prioritize enrichment: high-priority books, frequently viewed books, books with partial data

**Completeness Score Calculation:**
```
score = (filled_fields / total_optional_fields) × 0.7 + (has_required_fields ? 0.3 : 0)

Where filled_fields counts non-null, non-empty optional fields:
- author_first_name
- title_original
- year_published
- category
- genre
- original_language
- curator_comment
- author_lifespan
```

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

#### NFR-011: Desktop Browser Support
**Requirement:** System must work on modern desktop browsers  
**Priority:** Must Have  
**Supported:** Chrome, Firefox, Safari, Edge (latest 2 versions)  
**Mobile:** Nice-to-have, not required for MVP  
**Rationale:** Primary use case is desktop work

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
**Rationale:** Reading data is private  
**Implementation:** Row-level security or application-level authorization

#### NFR-022: Curator-Only Collection Modification
**Requirement:** Only curator can modify canonical collection  
**Priority:** Must Have  
**Rationale:** Maintain editorial control (vision.md)  
**Implementation:** Role-based access control

#### NFR-023: Password Security
**Requirement:** Passwords must be securely hashed  
**Priority:** Must Have  
**Rationale:** Basic security hygiene  
**Implementation:** bcrypt or argon2, never store plaintext

#### NFR-024: HTTPS Required
**Requirement:** HTTPS required for production deployment  
**Priority:** Must Have  
**Rationale:** Protect credentials and session tokens  
**Implementation:** TLS certificate, force HTTPS redirect

### 3.4 Data Quality

#### NFR-030: Preserve Original Data
**Requirement:** System must preserve original Excel data during migration  
**Priority:** Must Have  
**Rationale:** Years of accumulated information must not be lost  
**Implementation:** Store original values in metadata, audit log

#### NFR-031: Track Quality Scores
**Requirement:** System must track data quality scores per book  
**Priority:** Should Have  
**Rationale:** Support progressive enrichment  
**Implementation:** Calculated completeness score field

#### NFR-032: Flag Incomplete Records
**Requirement:** System must flag incomplete records for enrichment  
**Priority:** Should Have  
**Rationale:** Guide curator's enrichment efforts  
**Implementation:** Curator dashboard shows books needing data

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
**Requirement:** System must use TypeScript for type safety  
**Priority:** Should Have  
**Rationale:** Catch errors at compile time, better IDE support  
**Implementation:** TypeScript for all application code

## 4. User Stories

### 4.1 Curator Stories

**US-001: Discover Next Book**  
As a curator, I want to see which books I should read next based on my priorities, so I can make thoughtful reading choices.

**Acceptance:**
- View list filtered by "Want to Read" status
- Sort by personal priority (High first)
- Filter by genre/category of interest
- See books I already own highlighted
- Quick action to mark as "Reading"

---

**US-002: Record Completion**  
As a curator, I want to quickly mark a book as 'Finished' and record my thoughts, so I can track my reading journey.

**Acceptance:**
- Change status to "Finished" with one click
- Optionally add rating (1-5 stars)
- Optionally add personal notes
- Optionally add recommendation score
- See completion date automatically recorded
- View in "Completed" list immediately

---

**US-003: Track Ownership**  
As a curator, I want to track which books I own so I know what to buy.

**Acceptance:**
- Mark books as Owned, Ordered, or Not Owned
- Filter collection by ownership status
- See count of owned books in statistics
- Identify high-priority books I don't yet own

---

**US-004: Enrich Collection**  
As a curator, I want to add new books to the collection as I discover them, so the canon stays current.

**Acceptance:**
- Simple form to add new book (title + author minimum)
- Add optional metadata (year, genre, language, etc.)
- See data completeness score
- Book appears in collection immediately
- Can edit metadata later

---

**US-005: Identify Gaps**  
As a curator, I want to see which books need more metadata, so I can gradually enrich the collection.

**Acceptance:**
- Dashboard shows books with low completeness scores
- Sort by priority (enrich high-priority books first)
- See which specific fields are missing
- Quick-edit to fill in metadata

### 4.2 Reader Stories

**US-006: Browse Canon**  
As a reader, I want to browse the canon to discover significant books I haven't considered.

**Acceptance:**
- View all books in collection
- Filter by genre, category, language
- Sort by year, author, title
- Read curator comments about why book is significant
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
- See count: books currently reading
- See count: books in "Want to Read"
- See count: books owned
- See timeline of completed books

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
3. System sorts books by personal priority (High → Medium → Low)
4. User applies additional filters (e.g., "novels only", "books I own")
5. User reviews book details for top candidates
6. User selects a book
7. User changes status to "Reading"
8. System records started_at timestamp
9. System adds book to "Currently Reading" section

**Alternative Flow 3a:** No priority set
- System shows all "Want to Read" books unsorted
- User can sort by year, author, or other criteria

**Alternative Flow 7a:** User not ready to commit
- User adds book to "priority queue" for later decision
- Status remains "Want to Read" but priority set to High

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
   - Personal rating (1-5 stars)
   - Recommendation score (1-5)
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
   - Author Last Name (required)
   - Author First Name
   - Original Title
   - Year Published
   - Category
   - Genre
   - Subject
   - Original Language
   - Source
   - Curator Comment
   - Author Lifespan
3. Curator enters title and author last name (minimum)
4. Curator fills in as many optional fields as available
5. Curator submits form
6. System validates required fields
7. System calculates data completeness score
8. System saves book to database
9. System displays success message with completeness score
10. System shows book in collection
11. If completeness < 0.7, system adds to "Needs Enrichment" queue

**Alternative Flow 6a:** Validation fails
- System highlights missing/invalid fields
- Curator corrects and resubmits

**Alternative Flow 5a:** Curator only has minimal info
- Curator enters just title and author
- Submits as "draft" or "minimal entry"
- System accepts and flags for later enrichment

**Postcondition:** New book exists in canonical collection, visible to all users

---

### UC-004: Migrate Excel Data

**Actor:** System Administrator (Curator)  
**Precondition:** Fresh database, Excel file available  
**Trigger:** Initial system setup

**Main Flow:**
1. Administrator runs migration script with Excel file path
2. Script reads Excel file, loads 648 rows
3. Script performs three-tier validation on each row:
   - Tier 1: Hard constraints (must have title or author)
   - Tier 2: Soft validation (priority values, year formats)
   - Tier 3: Enrichment checks (optional fields present)
4. Script generates data quality report showing:
   - Total books to import
   - Books with warnings
   - Books with errors
   - Fields with missing data
5. Script displays summary to administrator
6. Administrator reviews warnings (priority 'x' mapped to NULL, etc.)
7. Administrator confirms migration
8. Script creates canonical books in database
9. Script creates user_reading_status entries for curator's personal data
10. Script generates final report:
    - Books imported successfully
    - Data completeness scores
    - Books flagged for enrichment
11. Script outputs enrichment priority list
12. Administrator reviews report

**Alternative Flow 6a:** Administrator finds issues
- Administrator cancels migration
- Corrects Excel data or validation rules
- Re-runs migration script

**Alternative Flow 8a:** Database transaction fails
- Script rolls back all changes
- Administrator investigates error
- Fixes issue and re-runs

**Postcondition:** All Excel books imported, curator's personal data migrated, quality report generated

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

**Question:** How should we map Excel priority values to new data model?

**Current Excel Values:**
- 1-5 (numeric priority, 1 = highest)
- 'x' (88 occurrences - meaning unclear)
- '-' (1 occurrence)
- blank (405 occurrences)

**Design Decision Context:** Priority and Recommendation should be separate concepts

**Proposed Mapping:**

**Priority (Personal, "When do I want to read this?")**
- Excel 1-2 → High
- Excel 3 → Medium
- Excel 4-5 → Low
- Excel 'x', '-', blank → NULL (not yet prioritized)

**Recommendation (Social, "How strongly would I recommend this?")**
- New field, starts as NULL for all migrated books
- User can optionally set 1-5 after reading

**Alternative:** Map Excel Prio to Recommendation instead of Priority
- If Excel Prio actually meant "how important is this book" rather than "when do I want to read it"
- Would need to confirm with curator

**Decision Needed:** Confirm Excel Prio semantic meaning with curator before migration

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
   - Cons: More complex, may be overkill for 648 classical books

**Recommendation for MVP:** Single entity with optional edition fields
- Add `edition_info` text field for notes like "Penguin Classics 2007"
- Add `isbn` field if user wants to track
- Can refactor to separate entities later if needed

**Defer to:** MVP implementation decision, revisit if users want multiple editions

---

### Q4: Comments/Notes Visibility

**Question:** Should any comments be visible to other users, or all private?

**Current Design:**
- `books.curator_comment` - shared with all users, part of canonical data
- `user_reading_status.personal_notes` - private, user's own reflections

**Future Enhancement:** Shared comments/discussions
- Users could optionally share their notes
- Discussion threads per book
- Explicitly out of scope for MVP

**Decision:** Confirm this two-tier model works for curator:
1. Curator comments visible to all (why book is in canon)
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

**Proposed:**
- title
- title_original (if present)
- author_first_name
- author_last_name
- curator_comment

**Not included:**
- personal_notes (should personal notes be searchable? Privacy concern if shown in results)
- category, genre (covered by filter, not search)

**Decision Needed:** Confirm search scope, especially regarding personal notes

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
- Unrestricted user-created books (readers can recommend, not add directly)
- Real-time chat
- Mobile applications (responsive mobile is nice-to-have, but native apps are out)
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
| FR-021, FR-022 | design-decisions.md | #5 Priority vs Recommendation |
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
