# Pre-Test Observations

**Date:** 2026-10-09  
**Observer:** Curator (Jonas)  
**Status:** Identified before formal acceptance testing begins

---

## Issues Identified Before Testing

These issues were noticed during initial exploration before the formal acceptance test session. They should be validated and documented during the acceptance test.

### 1. ~~Page Title Inconsistency~~

**Status:** ✅ RESOLVED

**Description:** Top-level page titles (Collection, Reading, Stats, Settings) have different sizes, styles, and colors.

**Resolution:** Page titles are now consistent across all pages (confirmed 2026-10-11)

**Category:** Visual consistency / Polish

---

### 2. ~~Filter State Lost on Navigation~~

**Status:** ✅ RESOLVED (2026-10-07)

**Description:** When filters are applied on Collection page, clicking a book to view details, then navigating back (via back button or browser back), the filters are cleared.

**Resolution:** Filters are now persisted in localStorage and restored when navigating back to the Collection page.

**Category:** User Experience / Navigation

---

### 3. Missing Wikipedia Links from Excel Migration

**Description:** The Excel file contained hyperlinks for authors and books to Wikipedia pages. These were embedded in:
- Author column (author Wikipedia links)
- Title (EN) column (book Wikipedia links)
- Original Title column (book Wikipedia links)

These links were not extracted during the data migration.

**Impact:** Lost valuable reference data. Need to determine if:
- Links should be re-migrated from Excel
- Links should be manually re-added
- This is acceptable loss

**Validation During Test:**
- Check several book detail pages for external references
- Note which books you know had Wikipedia links in Excel
- Assess how much you miss having these links

**Category:** Data Migration / External References

---

### 4. ~~Category vs Tags Display Confusion~~

**Status:** ✅ RESOLVED (2026-10-10)

**Description:** On book detail page, categories and tags were not clearly separated visually.

**Resolution:** Category and Tags now have separate labeled sections with clear visual hierarchy. Category is displayed with its own label, and tags are displayed below in their own section.

**Category:** Information Display / Clarity

---

### 5. Reading Dashboard Enhancement Request

**Description:** Current Reading Dashboard has two sections:
1. Currently Reading
2. Want to Read

**Proposed Enhancement:** Split into three sections:
1. Currently Reading (unchanged)
2. Want to Read AND Owned (books you already have)
3. Want to Read BUT Not Owned (books you need to acquire)

**Rationale:** You prefer to read books you already own before buying/borrowing new ones. This split helps prioritize reading decisions.

**Validation During Test:**
- Use the current Reading Dashboard
- Document how you actually use it to make reading decisions
- Note if the proposed split would improve the workflow
- Consider if ownership status filters on Collection page achieve the same goal

**Category:** Feature Request / Workflow Enhancement

---

## Notes for Acceptance Testing

These observations should be:
1. Validated during the formal acceptance test
2. Documented in `docs/curator-acceptance-test.md`
3. Prioritized based on real-world impact during testing
4. Included in action items if confirmed as issues

**Do not assume these are definitely problems** - test them objectively and assess their true impact on the workflows.

Some may be more severe than expected, others may be minor annoyances you can work around.

---

## Next Steps

1. Proceed with formal acceptance testing
2. Experience these issues in context of real workflows
3. Document all findings (including these) in acceptance test checklist
4. Prioritize fixes based on complete testing feedback
