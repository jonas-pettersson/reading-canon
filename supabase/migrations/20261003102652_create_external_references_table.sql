-- Migration: Create external_references table
-- Description: External links and references for books (Wikipedia, Gutenberg, etc.)
-- Author: Reading Canon MVP 0
-- Date: 2026-10-03

-- Create external_references table
-- Stores external links and references associated with books
create table public.external_references (
  id uuid default gen_random_uuid() primary key,

  -- Foreign key to books table
  book_id uuid references public.books(id) on delete cascade not null,

  -- Link details
  url text not null,
  link_text text,
  reference_type text,

  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by_user_id uuid references auth.users(id),

  -- Prevent duplicate URLs for same book
  unique(book_id, url)
);

-- Index for query performance
-- Supports fetching all references for a given book
create index external_references_book_id_idx on public.external_references(book_id);

-- Index for filtering by reference type
create index external_references_type_idx on public.external_references(reference_type);

-- Enable Row Level Security (RLS)
-- Policies will be added in Task 0.2.4
alter table public.external_references enable row level security;

-- Comments for documentation
comment on table public.external_references is 'External links and references for books (Wikipedia, Project Gutenberg, etc.)';
comment on column public.external_references.book_id is 'Book this reference relates to';
comment on column public.external_references.url is 'External URL (Wikipedia, Gutenberg, etc.)';
comment on column public.external_references.link_text is 'Display text for the link';
comment on column public.external_references.reference_type is 'Type of reference (wikipedia, gutenberg, goodreads, etc.)';
comment on column public.external_references.created_by_user_id is 'User who added this reference (curator)';
