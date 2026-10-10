# Acceptance Test Setup Guide

**Task:** 6.3.1 - Curator Acceptance Testing  
**Date:** 2026-10-09

---

## Purpose

This guide helps prepare the application for curator acceptance testing. Follow these steps to ensure a smooth testing session.

---

## Prerequisites

1. **Database Status**
   - Supabase project is running
   - Database contains the full migrated collection (643 books)
   - Curator account exists and is accessible

2. **Code Status**
   - All tests passing: 520 tests
   - CI/CD passing on master branch
   - No uncommitted changes (clean working directory)

---

## Setup Steps

### 1. Start the Development Server

```bash
# Navigate to project directory
cd C:\dev\reading-canon

# Install dependencies (if needed)
npm install

# Start the dev server
npm run dev
```

The application should start at: `http://localhost:5173`

### 2. Verify Database Connection

- Open the app in your browser
- Log in with curator credentials
- Verify the Collection page loads and shows books

### 3. Pre-Flight Checks

Run these quick checks before starting the formal acceptance test:

**Collection Page:**
- [ ] Books load within 2 seconds (NFR-001)
- [ ] All books display correctly in grid view
- [ ] Table view toggle works
- [ ] No console errors in browser DevTools

**Search:**
- [ ] Search responds within 1 second (NFR-002)
- [ ] Results update as you type (debounced)

**Navigation:**
- [ ] All menu items work (Collection, Reading, Stats, Settings)
- [ ] Back button works correctly
- [ ] No broken links

**Authentication:**
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on page refresh

### 4. Test Data Preparation (Optional)

If you want to start with a clean personal reading state:

**Option A: Keep existing reading data**
- Use your actual reading status, notes, and ratings from the migration
- Most realistic testing scenario

**Option B: Reset personal data**
- This would require clearing the `user_reading_status` table for your user
- Only do this if you want to test "first-time user" experience
- **Not recommended** - you'll lose your reading history

---

## Testing Environment

**Recommended Browser:** Chrome or Edge (latest version)

**Screen Sizes to Test:**
- Desktop: 1200px+ width (your normal browser window)
- Tablet: 768px width (resize browser window)
- Mobile: 375px width (resize browser window or use phone)

**Browser DevTools:**
- Keep DevTools open (F12) to monitor for errors
- Check Console tab for JavaScript errors
- Check Network tab if pages load slowly

---

## During Testing

### Taking Notes

As you test, document in `docs/curator-acceptance-test.md`:
- What works well
- What's confusing or frustrating
- Any bugs or errors
- Missing features or information
- Success criteria evaluation

### Reporting Issues

For each issue found:
1. Describe what you were doing
2. Describe what happened
3. Describe what you expected
4. Note any error messages
5. Rate severity: Blocking / High / Medium / Low

### Performance Monitoring

If you notice slow performance:
1. Note which specific operation is slow
2. Check browser DevTools Network tab
3. Check browser DevTools Console for errors
4. Note approximate time it takes

---

## Common Issues & Troubleshooting

### Issue: "Unable to load books" error
**Solution:** 
- Check that Supabase project is running
- Verify you're logged in
- Check browser console for specific error
- Try refreshing the page

### Issue: Search or filters not working
**Solution:**
- Check browser console for JavaScript errors
- Try clearing filters and searching again
- Try hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Issue: Changes not saving
**Solution:**
- Check browser console for errors
- Verify internet connection
- Check that you're still logged in (session didn't expire)
- Try the operation again

### Issue: Page layout looks broken
**Solution:**
- Try hard refresh (Ctrl+F5)
- Check browser zoom level (should be 100%)
- Try a different browser
- Check browser console for CSS loading errors

### Issue: Mobile view not working
**Solution:**
- Ensure browser window is actually <768px wide
- Try using browser's device emulation mode (DevTools)
- Or test on actual mobile device

---

## After Testing

### 1. Complete the Checklist

Fill out all sections of `docs/curator-acceptance-test.md`:
- All workflow tests
- Success criteria evaluation
- Feedback sections
- Action items

### 2. Prioritize Issues

Categorize all issues found:
- **Blocking:** Prevents core functionality, must fix
- **High Priority:** Significant usability problem, should fix
- **Medium Priority:** Annoyance but workable, could defer
- **Low Priority:** Nice-to-have improvement

### 3. Next Steps

Based on the testing results:

**If no blocking issues:**
- Proceed to optional bug fixes (Task 6.3.2)
- Or declare MVP 0 complete and ready for deployment

**If blocking issues found:**
- Task 6.3.2 becomes mandatory
- Fix blocking issues first
- Re-test affected workflows
- Consider another acceptance test session

---

## Quick Reference: Key URLs

- **Home/Collection:** `http://localhost:5173/`
- **Reading Dashboard:** `http://localhost:5173/reading`
- **Stats:** `http://localhost:5173/stats`
- **Settings:** `http://localhost:5173/settings`
- **Add Book:** `http://localhost:5173/books/new`
- **Book Detail:** `http://localhost:5173/books/:id` (click any book)
- **Edit Book:** `http://localhost:5173/books/:id/edit` (click Edit on detail page)
- **Login:** `http://localhost:5173/login`

---

## Testing Duration

**Estimated Time:** 2-4 hours

**Suggested Approach:**
- Set aside uninterrupted time
- Go through workflows systematically
- Don't rush - take notes as you go
- Test both desktop and mobile views
- Take breaks if needed

---

## Support

If you encounter technical issues during testing that prevent you from continuing:
1. Note the exact error message
2. Take a screenshot if helpful
3. Check the browser console for details
4. We can troubleshoot and resume testing

---

## Success!

The goal of this acceptance test is to validate that MVP 0 meets the success criteria:
- **SC-001:** You prefer the app over Excel for managing the collection
- **SC-002:** Deciding what to read next is easier
- **SC-003:** Updating reading progress is easier

Be honest in your feedback - that's how we make the app truly useful for you!
