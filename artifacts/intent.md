# Intent: Reading Canon

## Status

Draft

## Problem Statement

I currently maintain a curated reading collection in a personal Excel workbook.

The workbook contains several hundred literary and intellectual works that I consider important, meaningful, influential, or otherwise worth reading. The collection has been assembled over many years and is influenced by sources such as:

- ZEIT-Bibliothek der 100 Bücher
- school literature curricula
- anthologies
- personal recommendations
- personal judgement

The workbook serves as the authoritative collection but increasingly suffers from the limitations of spreadsheet-based management.

Common activities such as:

- deciding what to read next
- tracking books currently being read
- recording completed books
- maintaining priorities
- tracking ownership
- recording ratings and reflections
- searching and filtering the collection

are cumbersome and do not provide a modern or enjoyable user experience.

The current solution is also difficult to share with other readers.

## Desired Outcome

Create a web application called Reading Canon that replaces the workbook as the primary interface for maintaining and exploring the curated collection.

The application should help readers answer:

- What should I read next?
- Which books am I currently reading?
- Which books have I completed?
- Which books do I own or have ordered?
- Why is a book included in the canon?
- What did I think about it?
- Which books would I strongly recommend to others?

The application should feel like a personal reading companion rather than a database.

## Product Vision

Reading Canon helps readers focus on books that are worth reading rather than simply finding more books to read.

A curated canon of significant literary and intellectual works forms the centre of the application.

Readers can maintain their own reading journey, priorities, ratings and reflections while benefiting from the shared canon.

The collection remains a curated canon under editorial control rather than becoming an unrestricted public catalogue.

## Primary User

The primary user is the curator of the collection.

The curator wants to:

- maintain the canonical collection
- decide which books belong in it
- prioritize future reading
- track reading progress
- track ownership
- maintain comments and contextual information

## Secondary Users

Friends and invited readers.

They want to:

- browse the canon
- track their own reading progress
- maintain ratings
- record comments and reflections
- recommend books for inclusion

They cannot directly modify the canonical collection.

## Key Principles

### Curated, Not Comprehensive

The application is not intended to become a general-purpose book database.

The curated canon is one of the central values of the product.

### Reading Quality Over Reading Quantity

The purpose is to support meaningful reading rather than maximize consumption metrics.

### Personal Data Separate from Collection Data

Book metadata belongs to the canonical collection.

Reading status, ratings, priorities, ownership information and personal notes belong to individual users.

### Excellent Usability

The application should be pleasant and intuitive enough that users prefer it over maintaining a spreadsheet.

### Progressive Enrichment

The application should remain useful even if metadata is incomplete.

Additional information can be added gradually over time.

## Initial Scope

### Collection Management

- Maintain canonical collection
- Search books
- Filter books
- Sort books
- Browse books
- View detailed information about books

### Collection Curation

The curator can:

- add books to the canonical collection
- update book metadata
- remove books from the collection
- review user recommendations
- approve proposed additions
- reject proposed additions

### Personal Reading Management

Each user can maintain:

- reading status
- ~~personal reading priority~~ (removed 2026-10-06, reading status + rating sufficient)
- ~~recommendation score~~ (removed, see rating)
- personal notes
- ownership status
- rating

### Reading Status Lifecycle

The application should support:

- Not Started
- Want to Read
- Currently Reading
- Paused
- Completed
- Abandoned

Multiple books may be marked as Currently Reading.

### Ownership Tracking

The application should distinguish between:

- Not Owned
- Owned
- Ordered
- Borrowed

### Recommendation Tracking

~~A recommendation score indicates how strongly a user would recommend a book to others.~~

~~This is distinct from personal reading priority.~~

**Note:** Both recommendation score and personal priority were removed. Personal rating now serves to indicate both enjoyment/value and relative importance.

### Statistics

The application should provide basic statistics such as:

- books completed
- books currently being read
- books owned
- books by reading status

## Explicitly Out of Scope for MVP

The following capabilities are intentionally deferred:

- public social networking
- unrestricted user-created books
- real-time chat
- mobile applications
- e-reader integrations
- AI-generated reading recommendations
- public user profiles
- page tracking
- edition management
- book purchasing integrations

## Future Enhancements

Potential future enhancements include:

- recommendation workflow for new books
- discussions attached to individual books
- reading groups
- page-level progress tracking
- edition handling
- richer statistics and dashboards
- import from external book databases
- AI-assisted recommendations and summaries

These future capabilities should not unnecessarily drive architecture decisions for the MVP.

## Existing Data Source

The initial collection already exists in a spreadsheet.

The system should support migration of that data.

Migration quality is important because the workbook contains years of accumulated information, comments, classifications and references.

## Success Criteria

The application is considered successful when:

1. The curator prefers using the application over the spreadsheet.

2. Deciding what to read next becomes significantly easier.

3. Reading progress, priorities, ownership information and reflections can be maintained with minimal effort.

4. The collection can be shared with selected users.

5. Users can maintain their own reading states independently.

6. The curated canonical collection is preserved and remains under editorial control.

7. The application remains usable and responsive as the collection grows.

## Constraints

This project is primarily a learning exercise intended to practice an AI-native software development process.

The implementation should therefore emphasize:

- clear requirements
- traceable decisions
- documented architecture
- maintainable code
- testability
- incremental delivery

Technology choices should be driven by requirements and user experience rather than convenience.

## Open Questions

The following questions should be resolved during requirements and design:

1. Authentication strategy
   - local accounts
   - social login
   - invitation-only access

2. Hosting approach
   - static deployment
   - server application
   - cloud platform

3. Database technology

4. Extent of social functionality in the initial release

5. Whether comments are private, shared or both

6. Whether users may maintain private reading lists in addition to the canonical collection

7. Which metadata should be mandatory and which should be optional

8. How book recommendations should be reviewed and approved