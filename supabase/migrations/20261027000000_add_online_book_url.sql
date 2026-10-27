-- Migration: Add online_book_url to books table
-- Description: Add optional URL field for links to online book versions (Project Gutenberg, Internet Archive, etc.)
-- Related to: Issue #5, Sprint 1 Enhancements
-- Date: 2026-10-27

-- Add online_book_url column to books table
alter table public.books add column online_book_url text;

-- Add comment for documentation
comment on column public.books.online_book_url is 'Optional URL to online version of the book (e.g., Project Gutenberg, Internet Archive)';
