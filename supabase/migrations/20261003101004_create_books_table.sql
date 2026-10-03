-- Migration: Create books table
-- Description: Core canonical book metadata table with trigram search indexes (ADR-003)
-- Author: Reading Canon MVP 0
-- Date: 2026-10-03

-- Enable pg_trgm extension for trigram-based search (ADR-003)
create extension if not exists pg_trgm;

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create books table
create table public.books (
  id uuid default gen_random_uuid() primary key,

  -- Core book metadata
  title text not null,
  author_display_name text not null,
  given_name text,
  family_name text,
  title_original text,
  year_published text,
  year_sort integer,
  primary_category text,
  tags text[],
  original_language text,
  source text,

  -- Curator-controlled fields
  inclusion_rationale text,
  author_lifespan text,

  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by_user_id uuid references auth.users(id)
);

-- Trigram indexes for ILIKE pattern matching (recommended by ADR-003 for MVP0)
-- These indexes enable fuzzy search with acceptable performance for <1000 books
create index books_title_trgm_idx on public.books using gin (title gin_trgm_ops);
create index books_title_original_trgm_idx on public.books using gin (title_original gin_trgm_ops);
create index books_author_trgm_idx on public.books using gin (author_display_name gin_trgm_ops);
create index books_rationale_trgm_idx on public.books using gin (inclusion_rationale gin_trgm_ops);

-- Standard indexes for sorting/filtering
create index books_year_sort_idx on public.books(year_sort);
create index books_primary_category_idx on public.books(primary_category);

-- Note: Full-text search (to_tsvector) can be added later if ILIKE performance
-- becomes inadequate per ADR-003 migration guidance.

-- Updated_at trigger
-- Automatically updates the updated_at timestamp on row updates
create trigger set_books_updated_at
  before update on public.books
  for each row
  execute function public.handle_updated_at();

-- Enable Row Level Security (RLS) on books table
-- Policies will be added in a separate migration
alter table public.books enable row level security;

-- Comments for documentation
comment on table public.books is 'Canonical book metadata shared across all users. Curator-controlled content.';
comment on column public.books.title is 'Book title in display language (usually English)';
comment on column public.books.author_display_name is 'Author name as displayed (e.g., "Leo Tolstoy")';
comment on column public.books.given_name is 'Author given name (e.g., "Leo")';
comment on column public.books.family_name is 'Author family name (e.g., "Tolstoy")';
comment on column public.books.title_original is 'Original title if not in English';
comment on column public.books.year_published is 'Year of publication as text (may include ranges or "c. 1850")';
comment on column public.books.year_sort is 'Numeric year for sorting purposes';
comment on column public.books.primary_category is 'Primary category from controlled vocabulary (Novel, Poetry, etc.)';
comment on column public.books.tags is 'Array of tags for additional categorization';
comment on column public.books.inclusion_rationale is 'Curator notes on why this book is in the canon';
comment on column public.books.author_lifespan is 'Author lifespan as text (e.g., "1828-1910")';
