import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useBook } from './useBook'
import { supabase } from '@/lib/supabase'
import type { ReactNode } from 'react'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('useBook', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  describe('Fetching Single Book', () => {
    it('should fetch book by ID', async () => {
      const mockBook = {
        id: '1',
        title: 'The Iliad',
        author_display_name: 'Homer',
        year_sort: -800,
        primary_category: 'Poetry',
        tags: ['epic'],
        original_language: 'Ancient Greek',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockBook,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any)

      const { result } = renderHook(() => useBook('1'), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBook)
      expect(result.current.error).toBe(null)

      expect(supabase.from).toHaveBeenCalledWith('books')
      expect(mockSelect).toHaveBeenCalledWith('*, external_references(*)')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(mockSingle).toHaveBeenCalled()
    })

    it('should include external references', async () => {
      const mockBookWithRefs = {
        id: '1',
        title: 'The Iliad',
        author_display_name: 'Homer',
        year_sort: -800,
        external_references: [
          {
            id: 'ref1',
            book_id: '1',
            url: 'https://gutenberg.org/iliad',
            reference_type: 'full_text',
            link_text: 'Project Gutenberg',
          },
          {
            id: 'ref2',
            book_id: '1',
            url: 'https://en.wikipedia.org/wiki/Iliad',
            reference_type: 'wiki',
            link_text: 'Wikipedia',
          },
        ],
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockBookWithRefs,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any)

      const { result } = renderHook(() => useBook('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBookWithRefs)
      expect(result.current.data?.external_references).toHaveLength(2)
      expect(mockSelect).toHaveBeenCalledWith('*, external_references(*)')
    })
  })

  describe('Error Handling', () => {
    it('should handle not found (PGRST116)', async () => {
      const notFoundError = {
        code: 'PGRST116',
        message: 'The result contains 0 rows',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: notFoundError,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any)

      const { result } = renderHook(() => useBook('nonexistent-id'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeTruthy()
    })

    it('should handle query errors', async () => {
      const mockError = new Error('Database error')

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any)

      const { result } = renderHook(() => useBook('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })
  })
})
