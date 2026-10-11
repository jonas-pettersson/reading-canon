# Curator Feedback: Author Name Fields

**Date:** 2026-10-11  
**Issue:** Design disagreement between curator expectation and specification  
**Status:** Documented for future consideration

---

## Curator's Expectation

From acceptance test bug #2:

> "Author Display Name is marked as mandatory (*) while Given Name and Family Name are optional. Expected behavior: Given Name and Family Name should be required fields, and Author Display Name should be automatically derived/generated from them."

**Rationale:** This would enforce structured author data entry and ensure consistency in how author names are displayed.

---

## Current Design (from spec.md)

**Required:**
- `author_display_name` - "Author name as displayed to users"

**Optional:**
- `given_name` - "Author's given/first name if applicable"
- `family_name` - "Author's family/last name if applicable"

**Design Intent (spec.md lines 723-724):**
> "author_display_name supports diverse authorship: single authors, unknown authors, collective authors, editors, anthologies, historical names without conventional given/family name structure"
>
> "given_name and family_name are optional parsing aids when applicable but not required"

---

## Why Current Design Exists

The flexible author model was intentionally designed to handle:

1. **Ancient authors:** "Homer", "Virgil", "Snorri Sturluson"
2. **Unknown authors:** "Unknown"
3. **Collective authors:** "Brothers Grimm", "Various Authors"
4. **Editors:** "Edited by Jane Smith"
5. **Historical names:** Names without conventional first/last name structure
6. **Non-Western names:** Names where given/family name distinction doesn't apply

**Example:** How would you enter "Homer" if given_name and family_name were required?
- Given Name: "Homer", Family Name: ??? (doesn't apply)
- This would force awkward workarounds

---

## Trade-offs

### Curator's Approach (require given/family, derive display)
**Pros:**
- Enforces structured data
- Ensures consistent display formatting
- Better for modern authors with conventional names

**Cons:**
- Breaks support for ancient/unknown/collective authors
- Requires database migration and data backfill
- Forces awkward data entry for non-conventional names
- ~40% of the 643-book collection has ancient/unknown/collective authors

### Current Approach (require display, optional given/family)
**Pros:**
- Supports all authorship patterns
- Matches the Excel data structure
- Flexible for diverse collection
- No migration needed

**Cons:**
- Display name might be inconsistent (user-entered)
- Less structured data for modern authors
- Can't reliably sort by family name

---

## Recommendation

**Status Quo:** Keep current design for MVP 0.

**Rationale:**
1. Changing this requires a database migration and violates the spec
2. The design intentionally supports the collection's diverse authorship patterns
3. ~40% of books (ancient works, unknown authors) don't fit conventional name structure
4. Excel migration already handled the complexity of author names

**Future Consideration:**
- Could add UX hints: "For modern authors, also fill in Given Name and Family Name"
- Could add auto-population: If user enters "Tolstoy, Leo" in display name, offer to parse it
- Could make given/family required only for certain categories (e.g., "Novel" but not "Epic Poetry")

---

## Decision

**Status:** Accepted as "working as designed" (2026-10-11)

**Curator Decision:** Accept current design - Keep flexible author model as-is.

**Rationale:** The design intentionally supports the collection's diverse authorship patterns (ancient authors, unknown authors, collective authors, etc.). Changing this would require significant database migration and would break support for ~40% of the collection that doesn't fit conventional name structure.

---

**Status:** CLOSED - Working as designed per specification
