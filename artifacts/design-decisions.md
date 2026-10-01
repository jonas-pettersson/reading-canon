# Design Decisions and Recommendations

These are decisions and recommendations discussed during visioning. They are not yet formal requirements but should be considered during requirements and design work.

## 1. Product Philosophy

The application is not intended to be a generic book database.

Its core purpose is:

> Help readers identify, prioritize, read, and reflect on books that are worth reading, especially classics and culturally significant works.

The curated collection is a key differentiator and should remain central to the product.

The application should feel like a personal literary guide and reading journal, not a database admin tool.

---

## 2. Curated Collection Ownership

The canonical book collection is centrally curated.

Only the collection owner (initially Jonas) can:

- Add books to the official collection
- Modify shared book metadata
- Remove books

Other users may:

- Maintain their own reading data
- Recommend books for inclusion
- Participate in discussions (if implemented)

Recommended future workflow:

- User submits recommendation
- Curator reviews recommendation
- Curator accepts or rejects recommendation

---

## 3. Multi-User Approach

Design the domain model with multi-user support in mind, even if the first MVP may only have one user.

Important distinction:

### Shared data

Belongs to the book:

- Title
- Author
- Year
- Genre
- Description
- Original language
- Sources
- External links
- Tags

### Personal data

Belongs to a user-book relationship:

- Reading status
- Rating
- Comments
- Notes
- Progress
- Ownership information
- Reading priority

This separation should be reflected in the data model.

---

## 4. Reading Status

Do NOT keep a simple Read / Not Read flag.

The application should support richer reading states because multiple books may be read simultaneously.

Suggested status model:

- Want To Read
- Reading
- Paused
- Finished
- Abandoned

Names may change later.

---

## 5. Priority vs Recommendation

The current Excel "Prio" column appears to mix two concepts.

These should be separated.

### Personal Priority

How soon I want to read the book.

Examples:

- High
- Medium
- Low

or

- Next
- Soon
- Someday

### Recommendation Score

How strongly I would recommend this book to others.

Examples:

- 1-5 stars
- 1-10 score

The application should support both concepts independently.

---

## 6. Ownership / Library Status

The current "Lib" field should not be reduced to a boolean.

Consider a richer ownership model.

Examples:

- Not Owned
- Ordered
- Owned (Physical)
- Owned (Digital)
- Borrowed

Exact values can be refined later.

---

## 7. One Unified Collection

Avoid a strict separation between fiction and non-fiction.

Many books are difficult to classify cleanly.

Preferred approach:

Single collection with:

- Categories
- Genres
- Subjects
- Tags

Examples:

- Novel
- Drama
- Poetry
- Philosophy
- History
- Religion
- Politics
- Science

Users can filter and create views from tags instead of maintaining separate collections.

---

## 8. Social Features

Interesting but NOT MVP-critical.

Potential future features:

- Book discussions
- Comments shared with others
- Reading group functionality
- Likes/reactions
- Book recommendations from users

These should not drive early architecture decisions.

---

## 9. Metrics and Statistics

Interesting metrics include:

- Books completed
- Books currently being read
- Books owned
- Author statistics
- Genre statistics

Potential future extension:

- Pages read

Page tracking is only feasible if page count information exists for a specific edition.

---

## 10. Book vs Edition

Conceptually distinguish:

### Work

Example:
War and Peace

### Edition

Example:
Penguin Classics edition, ISBN XXX, 1320 pages

### User Copy

The physical or digital copy owned by a user

The MVP may simplify this, but the distinction should be kept in mind during modelling.

---

## 11. UX Direction

The goal is an excellent user experience.

The spreadsheet is the thing being replaced.

The application should make common actions easier than Excel:

- Finding the next book
- Updating reading status
- Recording comments
- Tracking progress
- Discovering books in the collection

Technology decisions (Streamlit, React, Vue, etc.) should follow UX requirements, not precede them.

---

## 12. Hosting and Technology

No technology decision has yet been made.

Initial thoughts:

- Streamlit may be sufficient for a prototype
- React/Vue may provide better long-term UX

Technology selection should be deferred until:
- Requirements
- UX concept
- Architecture

have been completed.

---

## 13. AI-Native SDLC Goal

The project is also a learning exercise.

The desired artifact chain is:

vision.md
→ intent.md
→ spec.md
→ plan.md
→ implementation

Implementation decisions should remain traceable back to earlier artifacts.
