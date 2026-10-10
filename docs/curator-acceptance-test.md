# Curator Acceptance Testing Checklist

**Date:** 2026-10-09  
**Phase:** MVP 0 Validation  
**Task:** 6.3.1 - Curator Acceptance Testing  
**Duration:** 2-4 hours

---

## Overview

This document guides the curator through acceptance testing of MVP 0 to validate whether the application meets its success criteria and is ready for production use.

## Success Criteria (from spec.md)

- **SC-001:** Curator prefers the app over Excel for managing the collection
- **SC-002:** Deciding what to read next is easier than before
- **SC-003:** Updating reading progress is easier than before

---

## Pre-Test Setup

- [ ] Application is running locally (`npm run dev`)
- [ ] Database contains the full collection (643 books from Excel migration)
- [ ] Curator account is logged in
- [ ] Browser window is at comfortable size (test both desktop and mobile views)

---

## Test Workflows

### 1. Browse and Explore Collection

**Goal:** Verify basic collection browsing works well

- [ ] Navigate to Collection page (home page)
- [ ] Verify books display in grid view by default
- [ ] Switch to table view - does it display correctly?
- [ ] Switch back to grid view
- [ ] Scroll through the collection - performance acceptable?
- [ ] Click on a book to view details
- [ ] Navigate back to collection using browser back button
- [ ] Click on different books - details load quickly?

**Feedback:**
- What do you think of the grid vs table views?
- Is the layout clear and easy to navigate?
- Any books displaying incorrectly?

---

### 2. Search Functionality

**Goal:** Verify search helps you find books quickly

- [ ] Use search box to search for a book by title
- [ ] Try searching by author name
- [ ] Try a partial search (e.g., "great" to find "The Great Gatsby")
- [ ] Clear search - does the full list return?
- [ ] Try searching for something that doesn't exist
- [ ] Verify "no books match your filters" message appears
- [ ] Use "Clear Filters" button to reset

**Feedback:**
- Is search fast enough? (should feel instant)
- Does it find what you're looking for?
- Any books you expect to find but can't?

---

### 3. Filter by Category and Tags

**Goal:** Verify filtering helps narrow down the collection

- [ ] Filter by a specific category (e.g., "Novel")
- [ ] Verify only books in that category appear
- [ ] Clear the category filter
- [ ] Try filtering by a tag
- [ ] Try combining category + tag filters
- [ ] Try filtering by original language
- [ ] Clear all filters using "Clear Filters" button

**Feedback:**
- Are the filter options clear?
- Do filters help you find what you're looking for?
- Any categories or tags that seem wrong?

---

### 4. View Book Details

**Goal:** Verify book detail page shows all necessary information

- [ ] Open several different books
- [ ] Verify all metadata displays correctly:
  - Title and original title
  - Author (display name and lifespan)
  - Publication year
  - Category
  - Tags
  - Original language
  - Source
  - Inclusion rationale
- [ ] Check that external references display (if present)
- [ ] Verify personal data panel shows reading status options
- [ ] Check that the layout works on mobile (resize browser window)

**Feedback:**
- Is any information missing that you need?
- Is any information displayed that you don't care about?
- Is the layout clear and easy to read?

---

### 5. Decide What to Read Next

**Goal:** Verify the app helps with reading decisions (SC-002)

- [ ] Go to Reading Dashboard (`/reading`)
- [ ] Review the "Want to Read" list
- [ ] If empty, go to Collection and mark a few books as "Want to Read"
- [ ] Return to Reading Dashboard
- [ ] Review your Want to Read list
- [ ] Use Collection filters to find books by:
  - Reading Status: "Want to Read"
  - Category of interest
  - Ownership Status: "Owned Physical" or "Owned Digital"
- [ ] Click "Mark as Reading" on a book from Want to Read list

**Feedback:**
- Is it easier to decide what to read next than with Excel? (SC-002)
- What information helps you make the decision?
- What's missing that would help?

---

### 6. Track Reading Progress

**Goal:** Verify reading progress tracking is easy (SC-003)

**Start Reading:**
- [ ] Find a book you want to start reading
- [ ] Set reading status to "Reading"
- [ ] Verify it appears in "Currently Reading" section on Reading Dashboard
- [ ] Add a personal note (e.g., "Starting this today")
- [ ] Set priority (e.g., "High")

**Finish Reading:**
- [ ] Go to Reading Dashboard
- [ ] Find a book you're "Currently Reading"
- [ ] Click "Mark as Finished"
- [ ] Verify status changes to "Finished"
- [ ] Go to book detail page
- [ ] Add a rating (1-5 stars)
- [ ] Add notes about the book
- [ ] Verify changes save automatically

**Pause/Abandon:**
- [ ] Mark a book as "Paused"
- [ ] Mark a book as "Abandoned"

**Feedback:**
- Is updating reading progress easier than Excel? (SC-003)
- Do you like the quick actions on the dashboard?
- Is auto-save working reliably?

---

### 7. View Statistics

**Goal:** Verify stats provide useful insights

- [ ] Navigate to Stats page (`/stats`)
- [ ] Review statistics cards:
  - Total books
  - Books read (Finished)
  - Currently reading
  - Want to read
  - Reading completion percentage
- [ ] Check breakdown by category
- [ ] Check breakdown by reading status
- [ ] Check reading progress section

**Feedback:**
- Are the statistics useful?
- What other stats would you like to see?
- Is anything confusing or unclear?

---

### 8. Add a New Book

**Goal:** Verify book curation workflow (SC-001)

- [ ] Click "Add Book" button on Collection page
- [ ] Fill in required fields:
  - Title
  - Author (display name)
  - Publication year
  - Category
- [ ] Try adding optional fields:
  - Original title
  - Given name / Family name
  - Tags
  - Original language
  - Source
  - Inclusion rationale
  - Author lifespan
- [ ] Try to add a duplicate book (same title/author)
- [ ] Verify duplicate warning appears but allows proceed
- [ ] Add external reference (e.g., Wikipedia link)
- [ ] Submit the form
- [ ] Verify success message appears
- [ ] Verify book appears in collection
- [ ] Verify book detail page shows all entered data

**Feedback:**
- Is the form clear and easy to use?
- Are any fields confusing?
- Is validation helpful or annoying?

---

### 9. Edit an Existing Book

**Goal:** Verify editing workflow works smoothly

- [ ] Find a book with incomplete or incorrect data
- [ ] Click to view book details
- [ ] Click "Edit" button
- [ ] Update some fields (e.g., add tags, fix spelling)
- [ ] Add or edit external references
- [ ] Save changes
- [ ] Verify success message appears
- [ ] Verify changes appear on detail page
- [ ] Try canceling an edit - verify no changes saved

**Feedback:**
- Is editing straightforward?
- Can you easily find and fix incorrect data?

---

### 10. Delete a Book

**Goal:** Verify deletion works with proper confirmation

- [ ] Find a test book to delete (or use the one you just added)
- [ ] Click "Delete" button on book detail page
- [ ] Verify confirmation dialog appears
- [ ] Cancel the deletion
- [ ] Verify book still exists
- [ ] Click "Delete" again
- [ ] Confirm the deletion
- [ ] Verify success message appears
- [ ] Verify book is removed from collection

**Feedback:**
- Is the confirmation dialog clear?
- Do you feel safe from accidental deletions?

---

### 11. Mobile Experience

**Goal:** Verify mobile usability (UX-011)

- [ ] Resize browser to mobile width (375px) or use phone
- [ ] Test navigation - can you access all pages?
- [ ] Test hamburger menu (if visible on mobile)
- [ ] Browse collection on mobile
- [ ] View book details on mobile
- [ ] Try searching on mobile
- [ ] Try filtering on mobile
- [ ] Update reading status on mobile
- [ ] Check Reading Dashboard on mobile

**Feedback:**
- Is the mobile experience usable?
- Any buttons too small to tap?
- Any text too small to read?
- Any horizontal scrolling issues?

---

### 12. Accessibility & Keyboard Navigation

**Goal:** Verify keyboard navigation works

- [ ] Use Tab key to navigate through Collection page
- [ ] Verify you can reach all buttons and links
- [ ] Use Enter key to activate buttons
- [ ] Navigate filters using keyboard only
- [ ] Open book detail page using keyboard
- [ ] Navigate Reading Dashboard with keyboard

**Feedback:**
- Can you navigate the entire app with keyboard?
- Is focus indicator visible?
- Any elements unreachable by keyboard?

---

### 13. Settings & Account

**Goal:** Verify settings page works

- [ ] Navigate to Settings page (from navigation menu)
- [ ] Verify user profile displays correctly
- [ ] Verify user ID is shown
- [ ] Test logout button
- [ ] Verify you're redirected to login page
- [ ] Log back in
- [ ] Verify you return to the app successfully

**Feedback:**
- Is anything missing from Settings page?
- Would you like to see preferences or configuration options?

---

### 14. Performance & Reliability

**Goal:** Verify performance meets expectations

- [ ] Measure time to load Collection page (should be <2s per NFR-001)
- [ ] Measure time for search results to appear (should be <1s per NFR-002)
- [ ] Try operations with slow/flaky internet (optional)
- [ ] Refresh pages - does data persist?
- [ ] Open multiple tabs - does data stay in sync?

**Feedback:**
- Is the app fast enough for your needs?
- Any operations that feel slow?
- Any unexpected errors or glitches?

---

## Overall Experience Assessment

### Success Criteria Evaluation

**SC-001: Do you prefer this app over Excel for managing the collection?**
- [ ] Yes, definitely
- [x] Yes, with some reservations
- [ ] No, not yet
- [ ] No, prefer Excel

**Why?**
Yes, but it needs to be deployed first so it's accessible without running locally.

---

**SC-002: Is deciding what to read next easier than before?**
- [ ] Yes, much easier
- [ ] Yes, somewhat easier
- [ ] About the same
- [ ] No, harder

**Why?**

---

**SC-003: Is updating reading progress easier than before?**
- [ ] Yes, much easier
- [ ] Yes, somewhat easier
- [ ] About the same
- [ ] No, harder

**Why?**

---

### General Feedback

**What works well?**
(List 3-5 things)

1. 
2. 
3. 
4. 
5. 

**What's confusing or frustrating?**
(List any issues, ranked by severity)

1. 
2. 
3. 
4. 
5. 

**What's missing?**
(Features or information you expected but didn't find)

1. 
2. 
3. 
4. 
5. 

**Bugs or errors encountered:**
(Describe any errors, broken features, or incorrect behavior)

1. **Reading Dashboard UI not updating immediately:** When pressing "Mark as Reading" button on a book in the Want to Read section, the book does not immediately move to the Currently Reading section. Page refresh is required to see the change. (Tested: 2026-10-10)
2. **Add Book form: Author name field requirements unintuitive:** Author Display Name is marked as mandatory (*) while Given Name and Family Name are optional. Expected behavior: Given Name and Family Name should be required fields, and Author Display Name should be automatically derived/generated from them. (Tested: 2026-10-10)
3. **Collection page arrow key navigation unintuitive:** When navigating the book list/grid using arrow keys, navigation steps through individual text fields within each book card rather than moving between book cards. Expected behavior: Down arrow should move to the book below, Right arrow should move to the book to the right (in grid view), etc. Tab key navigation works well. (Tested: 2026-10-10)
4. 
5. 

**Would you use this app as your primary tool for managing your reading canon?**
- [ ] Yes, ready to use as-is
- [ ] Yes, after fixing critical issues
- [ ] Not yet, needs significant improvements
- [ ] No, missing essential features

---

## Action Items

Based on the feedback above, list action items by priority:

### Blocking Issues (Must fix before MVP 0 release)
1. 
2. 
3. 

### High Priority (Should fix before MVP 0 release)
1. 
2. 
3. 

### Medium Priority (Could defer to MVP 1)
1. 
2. 
3. 

### Low Priority / Future Enhancements
1. 
2. 
3. 

---

## Sign-Off

**Curator:** ________________________________  
**Date:** ______________  
**MVP 0 Status:** [ ] Approved for release  [ ] Needs fixes (see action items)

---

## Notes

Use this section for any additional observations, thoughts, or context that doesn't fit in the sections above.
