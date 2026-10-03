import { describe, expect, it } from 'vitest'
import { supabase } from './supabase'

describe('Books Table Schema', () => {
  describe('Table Structure', () => {
    it('should have the books table', async () => {
      const { error } = await supabase.from('books').select('id').limit(0)

      expect(error).toBeNull()
    })

    it('should have RLS enabled (prevents unauthenticated access)', async () => {
      // RLS is enabled but no policies exist yet - this should fail
      const { error } = await supabase
        .from('books')
        .insert({
          title: 'Test Book',
          author_display_name: 'Test Author',
        })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('row-level security')
    })

    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should enforce NOT NULL constraint on title', async () => {
      const { error } = await supabase
        .from('books')
        .insert({
          // @ts-expect-error - Testing constraint violation
          title: null,
          author_display_name: 'Test Author',
        })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('null')
    })

    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should enforce NOT NULL constraint on author_display_name', async () => {
      const { error } = await supabase
        .from('books')
        .insert({
          title: 'Test Book',
          // @ts-expect-error - Testing constraint violation
          author_display_name: null,
        })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('null')
    })
  })

  describe('Data Types', () => {
    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should accept string arrays for tags', async () => {
      const testBook = {
        title: 'Test Book for Tags',
        author_display_name: 'Test Author',
        tags: ['fiction', 'classic'],
      }

      const { data, error } = await supabase
        .from('books')
        .insert(testBook)
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('books').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.tags).toEqual(['fiction', 'classic'])
    })

    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should accept integer values for year_sort', async () => {
      const testBook = {
        title: 'Test Book for Year',
        author_display_name: 'Test Author',
        year_sort: 1925,
      }

      const { data, error } = await supabase
        .from('books')
        .insert(testBook)
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('books').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.year_sort).toBe(1925)
    })
  })

  describe('Automatic Timestamps', () => {
    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should auto-populate created_at on insert', async () => {
      const testBook = {
        title: 'Test Book for Timestamps',
        author_display_name: 'Test Author',
      }

      const { data, error } = await supabase
        .from('books')
        .insert(testBook)
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('books').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.created_at).toBeDefined()
      expect(new Date(data!.created_at).getTime()).toBeGreaterThan(0)
    })

    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should auto-update updated_at on update', async () => {
      // Create a book
      const testBook = {
        title: 'Test Book for Update',
        author_display_name: 'Test Author',
      }

      const { data: insertedBook, error: insertError } = await supabase
        .from('books')
        .insert(testBook)
        .select()
        .single()

      expect(insertError).toBeNull()
      expect(insertedBook).toBeDefined()

      const originalUpdatedAt = insertedBook!.updated_at

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Update the book
      const { data: updatedBook, error: updateError } = await supabase
        .from('books')
        .update({ title: 'Updated Title' })
        .eq('id', insertedBook!.id)
        .select()
        .single()

      // Cleanup
      await supabase.from('books').delete().eq('id', insertedBook!.id)

      expect(updateError).toBeNull()
      expect(updatedBook?.updated_at).toBeDefined()
      expect(new Date(updatedBook!.updated_at).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })
  })

  describe('UUID Primary Key', () => {
    // Skipped until RLS policies are added (Task 0.2.3+)
    it.skip('should auto-generate UUID for id field', async () => {
      const testBook = {
        title: 'Test Book for UUID',
        author_display_name: 'Test Author',
      }

      const { data, error } = await supabase
        .from('books')
        .insert(testBook)
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('books').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.id).toBeDefined()
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(data?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    })
  })
})
