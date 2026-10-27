-- Migration: Backfill year_sort from year_published
-- Description: Parse year_sort from year_published for books where year_sort is null
-- Date: 2026-10-27

-- Update books where year_sort is null but year_published is not empty
-- This handles various formats: simple years, BCE/BC, ranges, circa, etc.
UPDATE public.books
SET year_sort = CASE
  -- Handle BCE/BC years (negative)
  WHEN year_published ~* '\bBCE?\b|\bBC\b' THEN
    -(substring(year_published from '\d{1,4}')::integer)
  -- Handle normal years (positive)
  WHEN year_published ~ '\d{1,4}' THEN
    (substring(year_published from '\d{1,4}')::integer)
  -- No valid year found
  ELSE NULL
END
WHERE year_sort IS NULL
  AND year_published IS NOT NULL
  AND year_published != '';

-- Comment for documentation
COMMENT ON COLUMN public.books.year_sort IS 'Numeric year for sorting purposes (automatically derived from year_published)';
