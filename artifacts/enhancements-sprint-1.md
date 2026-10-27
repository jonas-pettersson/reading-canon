# Sprint 1: Curator Productivity Enhancements

**Date:** 2026-10-27  
**Issues:** #5, #9, #1  
**Scope:** Post-MVP 0 enhancements for curator workflow and navigation UX

## Overview

Three small, independent enhancements to improve curator productivity and user experience. All changes align with existing architecture and require no new dependencies.

## Issue #5: Link to Online Book

**Problem:** Some books have online versions (Project Gutenberg, Internet Archive) but links are being stored inconsistently in the `inclusion_rationale` field.

**Solution:**
- Add new optional field: `online_book_url` (TEXT, nullable)
- Display as external link icon on book detail page
- Form validation: Optional URL format check

**Database Changes:**
```sql
ALTER TABLE books ADD COLUMN online_book_url TEXT;
```

**Implementation:**
1. Create migration: `20261027000000_add_online_book_url.sql`
2. Regenerate database types
3. Add field to BookFormData type
4. Update BookForm component (optional URL input)
5. Update BookDetail component (display link if present)
6. Add tests: form validation, link rendering

**Test Strategy:**
- Unit: URL validation in form
- E2E: Add book with link, verify display, verify optional

**Conflicts:** None. Complements existing fields.

**Future Cleanup:** Issue #6 can extract URLs from inclusion_rationale during data cleanup.

## Issue #9: Copy Book

**Problem:** Adding books by the same author requires re-entering repetitive information (author name, tags, category).

**Solution:**
- Add "Copy Book" button on book detail page (curator only)
- Navigate to Add Book form with fields pre-populated from source book
- User can modify any field before saving
- Clear user-specific fields (no IDs, reset timestamps)

**No Database Changes**

**Implementation:**
1. Add "Copy" button to BookDetail actions (next to Edit/Delete)
2. Navigation: `/books/new?copyFrom={bookId}`
3. BookForm: Check for `copyFrom` query param on mount
4. If present: Fetch book data, pre-populate form
5. User edits and saves as normal (creates new book)

**Pre-populated Fields:**
- author, publication_year, category, tags
- original_language, inclusion_rationale, curator_notes

**Cleared Fields:**
- id (generate new)
- title (clear - force user to enter)
- created_at, updated_at (new timestamps)

**Test Strategy:**
- Component: BookForm pre-population logic
- E2E: Click Copy → verify pre-fill → modify title → save → verify new book created

**Conflicts:** None. Pure UI enhancement.

## Issue #1: Back to Collection Button

**Problem:** "Back to Collection" button always routes to `/collection`, but users may have arrived from `/dashboard`. Button is also too prominent on mobile.

**Solution:**
- Use browser history API: `navigate(-1)` instead of fixed route
- Fallback to `/collection` if no history (direct link)
- Reduce button visual weight on mobile (smaller, less prominent)

**No Database Changes**

**Implementation:**
1. Update BookDetail: Replace `navigate('/collection')` with `navigate(-1)`
2. Add fallback handling for direct navigation
3. Update button styles for mobile (sm:larger on desktop)
4. Consider renaming to "Back" (context-agnostic)

**Test Strategy:**
- E2E: Navigate Collection → Book → Back (verify returns to Collection)
- E2E: Navigate Dashboard → Book → Back (verify returns to Dashboard)
- E2E: Direct link to book → Back (verify goes to Collection)
- Visual: Verify mobile button sizing

**Conflicts:** None. Aligns with UX goals from spec.

## Implementation Order

1. **#5 first** (database migration must be deployed before code)
2. **#9 second** (independent feature)
3. **#1 last** (independent feature)

## Testing Requirements

All features follow ADR-007 testing strategy:
- Unit tests for logic (form validation, pre-population)
- E2E tests for user flows (Playwright)
- Manual testing on mobile (responsive design)

## Documentation Updates

- `STATUS.md`: Add "Post-MVP 0 Enhancements" section
- Commit messages: Reference issue numbers
- This doc: Links implementation to issues

## Deployment

Standard workflow:
1. Run tests locally
2. Commit + push
3. Verify CI passes
4. Supabase migration runs automatically
5. Manual verification on production

## Issue Closing Comments

After implementation, provide closing comments with:
- Commit hash(es)
- Files changed
- Test coverage
- Link to this document

---

**Status:** Ready for implementation  
**Approved by:** Jonas Pettersson  
**Implementation date:** 2026-10-27
