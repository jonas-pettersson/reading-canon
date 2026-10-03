-- Migration: Create Row-Level Security (RLS) Policies - MVP 0
-- Description: Security policies for authenticated access and user data isolation
-- Author: Reading Canon MVP 0
-- Date: 2026-10-03

-- ============================================================================
-- SECURITY MODEL - MVP 0
-- ============================================================================
-- MVP 0 uses simple authenticated access with single curator:
--
-- 1. Books Table (Canonical Data):
--    - Authenticated users can read all books
--    - Authenticated users can insert/update/delete books (curator)
--    - Anonymous users: NO ACCESS
--
-- 2. User Reading Status (Personal Data):
--    - Users can ONLY access their own reading status records
--    - Enforced via auth.uid() = user_id check
--    - Strong data isolation between users
--    - Anonymous users: NO ACCESS
--
-- 3. External References:
--    - Authenticated users can read/manage references (curator)
--    - Anonymous users: NO ACCESS
--
-- Note: MVP 1 will add role-based access (curator vs reader roles)
-- ============================================================================

-- ============================================================================
-- BOOKS TABLE POLICIES
-- ============================================================================
-- Canonical book data - shared across all users
-- MVP 0: All authenticated users can manage (single curator scenario)

-- Allow authenticated users to view all books
create policy "Authenticated users can view books"
  on public.books
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert books
create policy "Authenticated users can insert books"
  on public.books
  for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update books
create policy "Authenticated users can update books"
  on public.books
  for update
  to authenticated
  using (true);

-- Allow authenticated users to delete books
create policy "Authenticated users can delete books"
  on public.books
  for delete
  to authenticated
  using (true);

-- ============================================================================
-- USER READING STATUS TABLE POLICIES
-- ============================================================================
-- Personal reading data - private to each user
-- Critical: Users can ONLY access their own reading status records

-- Allow users to view ONLY their own reading status
create policy "Users can view their own reading status"
  on public.user_reading_status
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to insert reading status for themselves only
create policy "Users can insert their own reading status"
  on public.user_reading_status
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow users to update ONLY their own reading status
create policy "Users can update their own reading status"
  on public.user_reading_status
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to delete ONLY their own reading status
create policy "Users can delete their own reading status"
  on public.user_reading_status
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- EXTERNAL REFERENCES TABLE POLICIES
-- ============================================================================
-- External links/references associated with books
-- MVP 0: All authenticated users can manage (curator scenario)

-- Allow authenticated users to view all external references
create policy "Authenticated users can view external references"
  on public.external_references
  for select
  to authenticated
  using (true);

-- Allow authenticated users to manage external references (insert/update/delete)
create policy "Authenticated users can manage external references"
  on public.external_references
  for all
  to authenticated
  using (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- To verify policies are working correctly:
-- 1. Anonymous requests should be blocked on all tables
-- 2. Authenticated users can access books and external_references
-- 3. User A cannot see User B's reading_status records
-- 4. Each user can only manage their own reading_status
--
-- See: src/lib/rls-policies.test.ts for comprehensive security tests
-- ============================================================================
