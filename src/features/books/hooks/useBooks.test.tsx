import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useBooks } from './useBooks'
import { supabase } from '@/lib/supabase'
import type { ReactNode } from 'react'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('useBooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for faster tests
        },
      },
    })
  })

  // Wrapper to provide QueryClient to hooks
  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  describe('Basic Fetching', () => {
    it('should fetch all books', async () => {
      // Arrange: Mock successful query
      const mockBooks = [
        {
          id: '1',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_sort: -800,
          primary_category: 'Poetry',
          tags: ['epic'],
          original_language: 'Ancient Greek',
        },
        {
          id: '2',
          title: 'The Odyssey',
          author_display_name: 'Homer',
          year_sort: -700,
          primary_category: 'Poetry',
          tags: ['epic'],
          original_language: 'Ancient Greek',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      // Act: Render the hook
      const { result } = renderHook(() => useBooks(), {
        wrapper: createWrapper(),
      })

      // Assert: Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert: Data is returned
      expect(result.current.data).toEqual(mockBooks)
      expect(result.current.error).toBe(null)

      // Verify Supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith('books')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('year_sort', { ascending: true })
    })
  })

  describe('Search Functionality', () => {
    it('should search by title', async () => {
      // Arrange
      const mockBooks = [
        {
          id: '1',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_sort: -800,
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOr = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        or: mockOr,
        order: mockOrder,
      } as any)

      // Act
      const { result } = renderHook(() => useBooks({ search: 'iliad' }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.data).toEqual(mockBooks)
      expect(mockOr).toHaveBeenCalledWith(
        'title.ilike.%iliad%,' +
        'title_original.ilike.%iliad%,' +
        'author_display_name.ilike.%iliad%,' +
        'inclusion_rationale.ilike.%iliad%'
      )
    })
  })

  describe('Filter Functionality', () => {
    it('should filter by category', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'The Iliad',
          primary_category: 'Poetry',
          author_display_name: 'Homer',
          year_sort: -800,
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useBooks({ category: 'Poetry' }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)
      expect(mockEq).toHaveBeenCalledWith('primary_category', 'Poetry')
    })

    it('should filter by tags', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'The Iliad',
          tags: ['epic', 'ancient'],
          author_display_name: 'Homer',
          year_sort: -800,
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockContains = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        contains: mockContains,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useBooks({ tags: ['epic'] }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)
      expect(mockContains).toHaveBeenCalledWith('tags', ['epic'])
    })

    it('should filter by original language', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'The Iliad',
          original_language: 'Ancient Greek',
          author_display_name: 'Homer',
          year_sort: -800,
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(
        () => useBooks({ originalLanguage: 'Ancient Greek' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)
      expect(mockEq).toHaveBeenCalledWith('original_language', 'Ancient Greek')
    })
  })

  describe('Sort Functionality', () => {
    it('should sort by title ascending', async () => {
      const mockBooks = [
        { id: '1', title: 'A Tale', author_display_name: 'Author', year_sort: 1900 },
        { id: '2', title: 'B Tale', author_display_name: 'Author', year_sort: 1901 },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(
        () => useBooks({ sortBy: 'title', sortOrder: 'asc' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)
      expect(mockOrder).toHaveBeenCalledWith('title', { ascending: true })
    })

    it('should sort by author descending', async () => {
      const mockBooks = [
        { id: '1', title: 'Book', author_display_name: 'Zeus', year_sort: 1900 },
        { id: '2', title: 'Book', author_display_name: 'Apollo', year_sort: 1901 },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(
        () => useBooks({ sortBy: 'author', sortOrder: 'desc' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)
      expect(mockOrder).toHaveBeenCalledWith('author_display_name', { ascending: false })
    })

    it('should sort by year (using year_sort column)', async () => {
      const mockBooks = [
        { id: '1', title: 'Old Book', author_display_name: 'Author', year_sort: -800 },
        { id: '2', title: 'New Book', author_display_name: 'Author', year_sort: 1900 },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(
        () => useBooks({ sortBy: 'year', sortOrder: 'asc' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)
      expect(mockOrder).toHaveBeenCalledWith('year_sort', { ascending: true })
    })
  })

  describe('Error Handling', () => {
    it('should handle query errors', async () => {
      const mockError = new Error('Database error')

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useBooks(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toEqual([])
    })

    it('should handle empty results', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useBooks(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
      expect(result.current.error).toBe(null)
    })
  })

  describe('Client-Side Filtering (User Reading Status)', () => {
    it('should filter by reading_status', async () => {
      // Mock books query
      const mockBooks = [
        { id: '1', title: 'Book 1', author_display_name: 'Author', year_sort: 1900 },
        { id: '2', title: 'Book 2', author_display_name: 'Author', year_sort: 1901 },
        { id: '3', title: 'Book 3', author_display_name: 'Author', year_sort: 1902 },
      ]

      // Mock user reading status
      const mockUserStatus = [
        { id: 's1', book_id: '1', user_id: 'u1', reading_status: 'reading' },
        { id: 's2', book_id: '2', user_id: 'u1', reading_status: 'finished' },
        // Book 3 has no status
      ]

      const mockBooksFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockBooks,
          error: null,
        }),
      }

      const mockStatusFrom = {
        select: vi.fn().mockResolvedValue({
          data: mockUserStatus,
          error: null,
        }),
      }

      // Mock supabase.from to return different mocks based on table name
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'books') return mockBooksFrom as any
        if (table === 'user_reading_status') return mockStatusFrom as any
        return {} as any
      })

      const { result } = renderHook(
        () => useBooks({ readingStatus: 'reading' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should only return Book 1 (reading_status = 'reading')
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0].id).toBe('1')

      // Verify both queries were made
      expect(supabase.from).toHaveBeenCalledWith('books')
      expect(supabase.from).toHaveBeenCalledWith('user_reading_status')
    })

    it('should filter by ownership_status', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', author_display_name: 'Author', year_sort: 1900 },
        { id: '2', title: 'Book 2', author_display_name: 'Author', year_sort: 1901 },
      ]

      const mockUserStatus = [
        { id: 's1', book_id: '1', user_id: 'u1', ownership_status: 'owned_physical' },
        { id: 's2', book_id: '2', user_id: 'u1', ownership_status: 'not_owned' },
      ]

      const mockBooksFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockBooks,
          error: null,
        }),
      }

      const mockStatusFrom = {
        select: vi.fn().mockResolvedValue({
          data: mockUserStatus,
          error: null,
        }),
      }

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'books') return mockBooksFrom as any
        if (table === 'user_reading_status') return mockStatusFrom as any
        return {} as any
      })

      const { result } = renderHook(
        () => useBooks({ ownershipStatus: 'owned_physical' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should only return Book 1 (ownership_status = 'owned_physical')
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0].id).toBe('1')
    })

    it('should not fetch user_reading_status when no status filter applied', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', author_display_name: 'Author', year_sort: 1900 },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockBooks,
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useBooks(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockBooks)

      // Should only call books table, not user_reading_status
      expect(supabase.from).toHaveBeenCalledWith('books')
      expect(supabase.from).not.toHaveBeenCalledWith('user_reading_status')
    })
  })
})
