-- Migration: Remove personal_priority feature
-- Description: Remove priority column and enum type - not needed (reading_status + rating sufficient)
-- Author: Reading Canon MVP 0
-- Date: 2026-10-06

-- Drop index first
drop index if exists public.user_reading_status_priority_idx;

-- Drop the column
alter table public.user_reading_status drop column if exists personal_priority;

-- Drop the enum type (no longer used)
drop type if exists priority_enum;

-- Update table comment to reflect removal
comment on table public.user_reading_status is 'Personal reading data private to each user. Tracks status, ownership, notes, and ratings.';
