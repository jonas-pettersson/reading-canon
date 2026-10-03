import { describe, expect, it } from 'vitest'
import { supabase } from './supabase'

describe('User Reading Status Table Schema', () => {
  describe('Table Structure', () => {
    it('should have the user_reading_status table', async () => {
      const { error } = await supabase
        .from('user_reading_status')
        .select('id')
        .limit(0)

      expect(error).toBeNull()
    })

    it('should have RLS enabled (prevents unauthenticated access)', async () => {
      // RLS is enabled but no policies exist yet - this should fail
      const { error } = await supabase.from('user_reading_status').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        book_id: '00000000-0000-0000-0000-000000000000',
        reading_status: 'not_started',
        ownership_status: 'not_owned',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('row-level security')
    })
  })

  describe('Enum Types', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should accept valid reading_status enum values', async () => {
      const validStatuses = [
        'not_started',
        'want_to_read',
        'reading',
        'paused',
        'finished',
        'abandoned',
      ] as const

      for (const status of validStatuses) {
        const { error } = await supabase.from('user_reading_status').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          book_id: '00000000-0000-0000-0000-000000000000',
          reading_status: status,
          ownership_status: 'not_owned',
        })

        // Should succeed (no enum violation)
        // Will still fail due to RLS or foreign key, but not enum
        expect(error?.message).not.toContain('invalid input value for enum')
      }
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should reject invalid reading_status enum values', async () => {
      const { error } = await supabase.from('user_reading_status').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        book_id: '00000000-0000-0000-0000-000000000000',
        // @ts-expect-error - Testing enum constraint violation
        reading_status: 'invalid_status',
        ownership_status: 'not_owned',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('invalid input value for enum')
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should accept valid ownership_status enum values', async () => {
      const validStatuses = [
        'not_owned',
        'ordered',
        'owned_physical',
        'owned_digital',
        'borrowed',
      ] as const

      for (const status of validStatuses) {
        const { error } = await supabase.from('user_reading_status').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          book_id: '00000000-0000-0000-0000-000000000000',
          reading_status: 'not_started',
          ownership_status: status,
        })

        // Should succeed (no enum violation)
        expect(error?.message).not.toContain('invalid input value for enum')
      }
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should accept valid priority enum values', async () => {
      const validPriorities = ['high', 'medium', 'low'] as const

      for (const priority of validPriorities) {
        const { error } = await supabase.from('user_reading_status').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          book_id: '00000000-0000-0000-0000-000000000000',
          reading_status: 'not_started',
          ownership_status: 'not_owned',
          personal_priority: priority,
        })

        // Should succeed (no enum violation)
        expect(error?.message).not.toContain('invalid input value for enum')
      }
    })
  })

  describe('Rating Constraint', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should accept valid rating values (1-5)', async () => {
      const validRatings = [1, 2, 3, 4, 5]

      for (const rating of validRatings) {
        const { error } = await supabase.from('user_reading_status').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          book_id: '00000000-0000-0000-0000-000000000000',
          reading_status: 'not_started',
          ownership_status: 'not_owned',
          personal_rating: rating,
        })

        // Should succeed (no check constraint violation)
        expect(error?.message).not.toContain('check constraint')
      }
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should reject rating less than 1', async () => {
      const { error } = await supabase.from('user_reading_status').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        book_id: '00000000-0000-0000-0000-000000000000',
        reading_status: 'not_started',
        ownership_status: 'not_owned',
        personal_rating: 0,
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('check constraint')
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should reject rating greater than 5', async () => {
      const { error } = await supabase.from('user_reading_status').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        book_id: '00000000-0000-0000-0000-000000000000',
        reading_status: 'not_started',
        ownership_status: 'not_owned',
        personal_rating: 6,
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('check constraint')
    })
  })

  describe('Unique Constraint', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should enforce unique constraint on (user_id, book_id)', async () => {
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000001',
        book_id: '00000000-0000-0000-0000-000000000001',
        reading_status: 'not_started' as const,
        ownership_status: 'not_owned' as const,
      }

      // Insert first record
      const { data: firstInsert, error: firstError } = await supabase
        .from('user_reading_status')
        .insert(testData)
        .select()
        .single()

      expect(firstError).toBeNull()

      // Try to insert duplicate
      const { error: duplicateError } = await supabase
        .from('user_reading_status')
        .insert(testData)

      // Cleanup
      if (firstInsert) {
        await supabase
          .from('user_reading_status')
          .delete()
          .eq('id', firstInsert.id)
      }

      expect(duplicateError).not.toBeNull()
      expect(duplicateError?.message).toContain('duplicate')
    })
  })

  describe('Foreign Key Relationships', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should enforce foreign key to books table', async () => {
      const { error } = await supabase.from('user_reading_status').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        book_id: '00000000-0000-0000-0000-999999999999', // Non-existent book
        reading_status: 'not_started',
        ownership_status: 'not_owned',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('foreign key')
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should enforce foreign key to auth.users table', async () => {
      const { error } = await supabase.from('user_reading_status').insert({
        user_id: '00000000-0000-0000-0000-999999999999', // Non-existent user
        book_id: '00000000-0000-0000-0000-000000000000',
        reading_status: 'not_started',
        ownership_status: 'not_owned',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('foreign key')
    })
  })

  describe('Default Values', () => {
    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should use default reading_status of "not_started"', async () => {
      const { data, error } = await supabase
        .from('user_reading_status')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          book_id: '00000000-0000-0000-0000-000000000000',
          ownership_status: 'not_owned',
        })
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('user_reading_status').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.reading_status).toBe('not_started')
    })

    // Skipped until RLS policies are added (Task 0.2.4+)
    it.skip('should use default ownership_status of "not_owned"', async () => {
      const { data, error } = await supabase
        .from('user_reading_status')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          book_id: '00000000-0000-0000-0000-000000000000',
          reading_status: 'not_started',
        })
        .select()
        .single()

      // Cleanup
      if (data) {
        await supabase.from('user_reading_status').delete().eq('id', data.id)
      }

      expect(error).toBeNull()
      expect(data?.ownership_status).toBe('not_owned')
    })
  })
})
