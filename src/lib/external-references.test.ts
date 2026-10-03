import { describe, expect, it } from 'vitest'
import { supabase } from './supabase'

describe('External References Table Schema', () => {
  describe('Table Structure', () => {
    it('should have the external_references table', async () => {
      const { error } = await supabase
        .from('external_references')
        .select('id')
        .limit(0)

      expect(error).toBeNull()
    })

    it('should have RLS enabled (prevents unauthenticated access)', async () => {
      // RLS is enabled but no policies exist yet - this should fail
      const { error } = await supabase.from('external_references').insert({
        book_id: '00000000-0000-0000-0000-000000000000',
        url: 'https://example.com',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('row-level security')
    })
  })

  describe('Unique Constraint', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should enforce unique constraint on (book_id, url)', async () => {
      const testReference = {
        book_id: '00000000-0000-0000-0000-000000000001',
        url: 'https://en.wikipedia.org/wiki/War_and_Peace',
        link_text: 'Wikipedia: War and Peace',
        reference_type: 'wikipedia',
      }

      // Insert first reference
      const { data: firstInsert, error: firstError } = await supabase
        .from('external_references')
        .insert(testReference)
        .select()
        .single()

      expect(firstError).toBeNull()

      // Try to insert duplicate (same book_id + url)
      const { error: duplicateError } = await supabase
        .from('external_references')
        .insert(testReference)

      // Cleanup
      if (firstInsert) {
        await supabase
          .from('external_references')
          .delete()
          .eq('id', firstInsert.id)
      }

      expect(duplicateError).not.toBeNull()
      expect(duplicateError?.message).toContain('duplicate')
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should allow same URL for different books', async () => {
      const wikipediaUrl = 'https://en.wikipedia.org/wiki/Leo_Tolstoy'

      // Insert reference for first book
      const { data: firstInsert, error: firstError } = await supabase
        .from('external_references')
        .insert({
          book_id: '00000000-0000-0000-0000-000000000001',
          url: wikipediaUrl,
          reference_type: 'wikipedia',
        })
        .select()
        .single()

      expect(firstError).toBeNull()

      // Insert same URL for second book - should succeed
      const { data: secondInsert, error: secondError } = await supabase
        .from('external_references')
        .insert({
          book_id: '00000000-0000-0000-0000-000000000002',
          url: wikipediaUrl,
          reference_type: 'wikipedia',
        })
        .select()
        .single()

      // Cleanup
      if (firstInsert) {
        await supabase
          .from('external_references')
          .delete()
          .eq('id', firstInsert.id)
      }
      if (secondInsert) {
        await supabase
          .from('external_references')
          .delete()
          .eq('id', secondInsert.id)
      }

      expect(secondError).toBeNull()
      expect(secondInsert?.url).toBe(wikipediaUrl)
    })
  })

  describe('Cascade Delete', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should cascade delete references when book is deleted', async () => {
      // Create a test book
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          title: 'Test Book for Cascade',
          author_display_name: 'Test Author',
        })
        .select()
        .single()

      expect(bookError).toBeNull()
      expect(book).toBeDefined()

      // Add references to the book
      const { data: references, error: refError } = await supabase
        .from('external_references')
        .insert([
          {
            book_id: book!.id,
            url: 'https://en.wikipedia.org/wiki/Test1',
            reference_type: 'wikipedia',
          },
          {
            book_id: book!.id,
            url: 'https://www.gutenberg.org/ebooks/12345',
            reference_type: 'gutenberg',
          },
        ])
        .select()

      expect(refError).toBeNull()
      expect(references).toHaveLength(2)

      // Delete the book
      const { error: deleteError } = await supabase
        .from('books')
        .delete()
        .eq('id', book!.id)

      expect(deleteError).toBeNull()

      // Verify references were cascade deleted
      const { data: remainingRefs, error: checkError } = await supabase
        .from('external_references')
        .select('id')
        .eq('book_id', book!.id)

      expect(checkError).toBeNull()
      expect(remainingRefs).toHaveLength(0)
    })
  })

  describe('Foreign Key Relationships', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should enforce foreign key to books table', async () => {
      const { error } = await supabase.from('external_references').insert({
        book_id: '00000000-0000-0000-0000-999999999999', // Non-existent book
        url: 'https://example.com',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('foreign key')
    })
  })

  describe('Required Fields', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should require book_id', async () => {
      const { error } = await supabase.from('external_references').insert({
        // @ts-expect-error - Testing constraint violation
        book_id: null,
        url: 'https://example.com',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('null')
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should require url', async () => {
      const { error } = await supabase.from('external_references').insert({
        book_id: '00000000-0000-0000-0000-000000000000',
        // @ts-expect-error - Testing constraint violation
        url: null,
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('null')
    })
  })

  describe('Optional Fields', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should allow null link_text', async () => {
      const { data, error } = await supabase
        .from('external_references')
        .insert({
          book_id: '00000000-0000-0000-0000-000000000000',
          url: 'https://example.com',
          link_text: null,
        })
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('external_references').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.link_text).toBeNull()
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should allow null reference_type', async () => {
      const { data, error } = await supabase
        .from('external_references')
        .insert({
          book_id: '00000000-0000-0000-0000-000000000000',
          url: 'https://example.com',
          reference_type: null,
        })
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('external_references').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.reference_type).toBeNull()
    })
  })
})
