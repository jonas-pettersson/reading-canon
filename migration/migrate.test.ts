import { describe, it, expect, beforeEach, vi } from 'vitest'
import { runMigration } from './migrate'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

// Mock the excel-parser module
vi.mock('./excel-parser', () => ({
  parseExcelFile: vi.fn(),
}))

import { parseExcelFile } from './excel-parser'

describe('runMigration', () => {
  let mockSupabase: SupabaseClient<Database>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      auth: {
        getUser: vi.fn(() => Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })),
      },
    } as any
  })

  describe('pre-migration report', () => {
    it('should generate pre-migration report with parsed data counts', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [
          { title: 'Book 1', author_display_name: 'Author 1' },
          { title: 'Book 2', author_display_name: 'Author 2' },
        ] as any,
        userReadingStatuses: [
          { book_id: '', user_id: '' },
          { book_id: '', user_id: '' },
        ] as any,
        validationErrors: [],
        validationWarnings: ['Warning 1'],
      })

      await runMigration('./test.xlsx', mockSupabase)

      expect(consoleLogSpy).toHaveBeenCalledWith('\nPre-migration report:')
      expect(consoleLogSpy).toHaveBeenCalledWith('Books to import: 2')
      expect(consoleLogSpy).toHaveBeenCalledWith('Reading status records: 2')
      expect(consoleLogSpy).toHaveBeenCalledWith('Validation errors: 0')
      expect(consoleLogSpy).toHaveBeenCalledWith('Warnings: 1')
    })

    it('should stop migration if validation errors exist', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [],
        userReadingStatuses: [],
        validationErrors: ['Missing title in row 2', 'Missing author in row 3'],
        validationWarnings: [],
      })

      const result = await runMigration('./test.xlsx', mockSupabase)

      expect(result.success).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('\nValidation errors found. Migration aborted.')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.arrayContaining(['Missing title in row 2']))
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })

  describe('books insertion', () => {
    it('should insert books into database', async () => {
      const mockBooks = [
        { title: 'The Odyssey', author_display_name: 'Homer' },
        { title: 'War and Peace', author_display_name: 'Tolstoy, Leo' },
      ]

      vi.mocked(parseExcelFile).mockReturnValue({
        books: mockBooks as any,
        userReadingStatuses: [] as any,
        validationErrors: [],
        validationWarnings: [],
      })

      const mockInsertedBooks = mockBooks.map((book, i) => ({
        ...book,
        id: `book-${i + 1}`,
      }))

      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: mockInsertedBooks, error: null })),
        })),
      }))

      mockSupabase.from = mockFrom as any

      await runMigration('./test.xlsx', mockSupabase)

      expect(mockFrom).toHaveBeenCalledWith('books')
    })

    it('should handle book insertion errors', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [{ title: 'Book 1', author_display_name: 'Author 1' }] as any,
        userReadingStatuses: [] as any,
        validationErrors: [],
        validationWarnings: [],
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null })), // For existing books check
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database connection failed' },
          })),
        })),
      }))

      mockSupabase.from = mockFrom as any

      const result = await runMigration('./test.xlsx', mockSupabase)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to insert books')
    })
  })

  describe('user reading status insertion', () => {
    it('should map reading statuses to created book IDs and insert', async () => {
      const mockBooks = [
        { title: 'The Odyssey', author_display_name: 'Homer' },
        { title: 'War and Peace', author_display_name: 'Tolstoy, Leo' },
      ]

      const mockStatuses = [
        { book_id: '', user_id: '', ownership_status: 'owned_physical' as const },
        { book_id: '', user_id: '', reading_status: 'finished' as const },
      ]

      vi.mocked(parseExcelFile).mockReturnValue({
        books: mockBooks as any,
        userReadingStatuses: mockStatuses as any,
        validationErrors: [],
        validationWarnings: [],
      })

      const mockInsertedBooks = mockBooks.map((book, i) => ({
        ...book,
        id: `book-${i + 1}`,
      }))

      let insertCalls = 0
      const mockFrom = vi.fn((table: string) => {
        if (table === 'books') {
          return {
            select: vi.fn(() => Promise.resolve({ data: [], error: null })), // For existing books check
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: mockInsertedBooks, error: null })),
            })),
          }
        } else if (table === 'user_reading_status') {
          insertCalls++
          return {
            insert: vi.fn((data: any) => {
              // Verify that book_id and user_id are set
              expect(data[0].book_id).toBe('book-1')
              expect(data[0].user_id).toBe('test-user-id')
              expect(data[1].book_id).toBe('book-2')
              expect(data[1].user_id).toBe('test-user-id')
              return Promise.resolve({ data: data, error: null })
            }),
          }
        }
        return {} as any
      })

      mockSupabase.from = mockFrom as any

      await runMigration('./test.xlsx', mockSupabase)

      expect(insertCalls).toBe(1)
    })

    it('should handle reading status insertion errors', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [{ title: 'Book 1', author_display_name: 'Author 1' }] as any,
        userReadingStatuses: [{ book_id: '', user_id: '' }] as any,
        validationErrors: [],
        validationWarnings: [],
      })

      const mockInsertedBooks = [{ id: 'book-1', title: 'Book 1', author_display_name: 'Author 1' }]

      const mockFrom = vi.fn((table: string) => {
        if (table === 'books') {
          return {
            select: vi.fn(() => Promise.resolve({ data: [], error: null })), // For existing books check
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: mockInsertedBooks, error: null })),
            })),
          }
        } else if (table === 'user_reading_status') {
          return {
            insert: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Foreign key constraint failed' },
            })),
          }
        }
        return {} as any
      })

      mockSupabase.from = mockFrom as any

      const result = await runMigration('./test.xlsx', mockSupabase)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to insert reading statuses')
    })
  })

  describe('idempotent migration', () => {
    it('should detect existing books and skip duplicates', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [
          { title: 'The Odyssey', author_display_name: 'Homer' },
          { title: 'Existing Book', author_display_name: 'Existing Author' },
        ] as any,
        userReadingStatuses: [] as any,
        validationErrors: [],
        validationWarnings: [],
      })

      // Mock existing books query
      const mockExistingBooks = [
        { id: 'existing-id', title: 'Existing Book', author_display_name: 'Existing Author' },
      ]

      const mockFrom = vi.fn((table: string) => {
        if (table === 'books') {
          // First call is select (check existing)
          const selectFn = vi.fn(() =>
            Promise.resolve({ data: mockExistingBooks, error: null })
          )
          const insertFn = vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({
              data: [{ id: 'new-id', title: 'The Odyssey', author_display_name: 'Homer' }],
              error: null,
            })),
          }))

          return {
            select: selectFn,
            insert: insertFn,
          }
        }
        return {} as any
      })

      mockSupabase.from = mockFrom as any

      const result = await runMigration('./test.xlsx', mockSupabase)

      expect(result.success).toBe(true)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1 books already exist'))
    })
  })

  describe('post-migration report', () => {
    it('should generate post-migration report with counts', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [
          { title: 'Book 1', author_display_name: 'Author 1' },
          { title: 'Book 2', author_display_name: 'Author 2' },
        ] as any,
        userReadingStatuses: [
          { book_id: '', user_id: '' },
          { book_id: '', user_id: '' },
        ] as any,
        validationErrors: [],
        validationWarnings: [],
      })

      const mockInsertedBooks = [
        { id: 'book-1', title: 'Book 1', author_display_name: 'Author 1' },
        { id: 'book-2', title: 'Book 2', author_display_name: 'Author 2' },
      ]

      const mockFrom = vi.fn((table: string) => {
        if (table === 'books') {
          return {
            select: vi.fn(() => Promise.resolve({ data: [], error: null })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: mockInsertedBooks, error: null })),
            })),
          }
        } else if (table === 'user_reading_status') {
          return {
            insert: vi.fn(() => Promise.resolve({ data: [{}, {}], error: null })),
          }
        }
        return {} as any
      })

      mockSupabase.from = mockFrom as any

      await runMigration('./test.xlsx', mockSupabase)

      expect(consoleLogSpy).toHaveBeenCalledWith('\nMigration complete!')
      expect(consoleLogSpy).toHaveBeenCalledWith('Books imported: 2')
      expect(consoleLogSpy).toHaveBeenCalledWith('Reading statuses created: 2')
    })
  })

  describe('return value', () => {
    it('should return success result with counts on successful migration', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [{ title: 'Book 1', author_display_name: 'Author 1' }] as any,
        userReadingStatuses: [{ book_id: '', user_id: '' }] as any,
        validationErrors: [],
        validationWarnings: [],
      })

      const mockInsertedBooks = [{ id: 'book-1', title: 'Book 1', author_display_name: 'Author 1' }]

      const mockFrom = vi.fn((table: string) => {
        if (table === 'books') {
          return {
            select: vi.fn(() => Promise.resolve({ data: [], error: null })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: mockInsertedBooks, error: null })),
            })),
          }
        } else if (table === 'user_reading_status') {
          return {
            insert: vi.fn(() => Promise.resolve({ data: [{}], error: null })),
          }
        }
        return {} as any
      })

      mockSupabase.from = mockFrom as any

      const result = await runMigration('./test.xlsx', mockSupabase)

      expect(result.success).toBe(true)
      expect(result.booksImported).toBe(1)
      expect(result.statusesCreated).toBe(1)
      expect(result.error).toBeUndefined()
    })

    it('should return error result on failure', async () => {
      vi.mocked(parseExcelFile).mockReturnValue({
        books: [],
        userReadingStatuses: [],
        validationErrors: ['Error'],
        validationWarnings: [],
      })

      const result = await runMigration('./test.xlsx', mockSupabase)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.booksImported).toBe(0)
      expect(result.statusesCreated).toBe(0)
    })
  })
})
