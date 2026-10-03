-- Migration: Create user_reading_status table
-- Description: Personal reading data - private to each user
-- Author: Reading Canon MVP 0
-- Date: 2026-10-03

-- Create enum types for controlled values

-- Reading status enum
-- Maps to spec.md v1.4 reading status values
create type reading_status_enum as enum (
  'not_started',
  'want_to_read',
  'reading',
  'paused',
  'finished',
  'abandoned'
);

-- Ownership status enum
create type ownership_status_enum as enum (
  'not_owned',
  'ordered',
  'owned_physical',
  'owned_digital',
  'borrowed'
);

-- Priority enum
create type priority_enum as enum (
  'high',
  'medium',
  'low'
);

-- Create user_reading_status table
-- Stores personal reading data private to each user
create table public.user_reading_status (
  id uuid default gen_random_uuid() primary key,

  -- Foreign keys
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,

  -- Reading status and priority
  reading_status reading_status_enum default 'not_started' not null,
  personal_priority priority_enum,

  -- Ownership
  ownership_status ownership_status_enum default 'not_owned' not null,

  -- Personal notes and rating
  personal_notes text,
  personal_rating integer check (personal_rating >= 1 and personal_rating <= 5),

  -- Timestamps for reading journey
  started_at timestamp with time zone,
  completed_at timestamp with time zone,

  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure one record per user per book
  unique(user_id, book_id)
);

-- Indexes for query performance
create index user_reading_status_user_id_idx on public.user_reading_status(user_id);
create index user_reading_status_book_id_idx on public.user_reading_status(book_id);
create index user_reading_status_reading_status_idx on public.user_reading_status(reading_status);
create index user_reading_status_priority_idx on public.user_reading_status(personal_priority);

-- Updated_at trigger
-- Automatically updates the updated_at timestamp on row updates
create trigger set_user_reading_status_updated_at
  before update on public.user_reading_status
  for each row
  execute function public.handle_updated_at();

-- Enable Row Level Security (RLS)
-- Policies will be added in Task 0.2.4
alter table public.user_reading_status enable row level security;

-- Comments for documentation
comment on table public.user_reading_status is 'Personal reading data private to each user. Tracks status, priority, ownership, notes, and ratings.';
comment on column public.user_reading_status.reading_status is 'Current reading status (not_started, want_to_read, reading, paused, finished, abandoned)';
comment on column public.user_reading_status.personal_priority is 'User priority for books they want to read (high, medium, low)';
comment on column public.user_reading_status.ownership_status is 'Whether user owns the book (not_owned, ordered, owned_physical, owned_digital, borrowed)';
comment on column public.user_reading_status.personal_notes is 'User personal notes about the book';
comment on column public.user_reading_status.personal_rating is 'User rating 1-5 stars';
comment on column public.user_reading_status.started_at is 'When user started reading';
comment on column public.user_reading_status.completed_at is 'When user completed reading';
