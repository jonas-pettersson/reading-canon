import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useReadingBooks, useWantToReadBooks } from './useReadingDashboard'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
  return Wrapper
}

describe('useReadingBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches books with reading status', async () => {
    const mockBooks = [
      {
        id: 'book-1',
        title: 'Test Book 1',
        author_display_name: 'Test Author 1',
        year_sort: 2020,
      },
      {
        id: 'book-2',
        title: 'Test Book 2',
        author_display_name: 'Test Author 2',
        year_sort: 2021,
      },
    ]

    const mockStatus = [
      {
        book_id: 'book-1',
        reading_status: 'Reading',
        started_at: '2024-01-01T00:00:00Z',
      },
      {
        book_id: 'book-2',
        reading_status: 'Reading',
        started_at: '2024-01-15T00:00:00Z',
      },
    ]

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockStatus, error: null }),
    }

    const mockBooksQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: mockBooks, error: null }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(mockQuery as never)
      .mockReturnValueOnce(mockBooksQuery as never)

    const { result } = renderHook(() => useReadingBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]).toMatchObject({
      id: 'book-1',
      title: 'Test Book 1',
      started_at: '2024-01-01T00:00:00Z',
    })
  })

  it('returns empty array when no books are being read', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as never)

    const { result } = renderHook(() => useReadingBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('handles query errors', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: null, error: new Error('Query failed') }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as never)

    const { result } = renderHook(() => useReadingBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useWantToReadBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches books with want to read status sorted by priority', async () => {
    const mockBooks = [
      {
        id: 'book-1',
        title: 'High Priority Book',
        author_display_name: 'Author 1',
        year_sort: 2020,
      },
      {
        id: 'book-2',
        title: 'Medium Priority Book',
        author_display_name: 'Author 2',
        year_sort: 2021,
      },
      {
        id: 'book-3',
        title: 'Low Priority Book',
        author_display_name: 'Author 3',
        year_sort: 2022,
      },
    ]

    const mockStatus = [
      {
        book_id: 'book-1',
        reading_status: 'Want to Read',
        personal_priority: 'High',
      },
      {
        book_id: 'book-2',
        reading_status: 'Want to Read',
        personal_priority: 'Medium',
      },
      {
        book_id: 'book-3',
        reading_status: 'Want to Read',
        personal_priority: 'Low',
      },
    ]

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockStatus, error: null }),
    }

    const mockBooksQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: mockBooks, error: null }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(mockQuery as never)
      .mockReturnValueOnce(mockBooksQuery as never)

    const { result } = renderHook(() => useWantToReadBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(3)
    // Verify sorted by priority: High → Medium → Low
    expect(result.current.data?.[0].personal_priority).toBe('High')
    expect(result.current.data?.[1].personal_priority).toBe('Medium')
    expect(result.current.data?.[2].personal_priority).toBe('Low')
  })

  it('places books with no priority at the end', async () => {
    const mockBooks = [
      { id: 'book-1', title: 'High Priority', author_display_name: 'A1', year_sort: 2020 },
      { id: 'book-2', title: 'No Priority', author_display_name: 'A2', year_sort: 2021 },
      { id: 'book-3', title: 'Low Priority', author_display_name: 'A3', year_sort: 2022 },
    ]

    const mockStatus = [
      { book_id: 'book-1', reading_status: 'Want to Read', personal_priority: 'High' },
      { book_id: 'book-2', reading_status: 'Want to Read', personal_priority: null },
      { book_id: 'book-3', reading_status: 'Want to Read', personal_priority: 'Low' },
    ]

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockStatus, error: null }),
    }

    const mockBooksQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: mockBooks, error: null }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(mockQuery as never)
      .mockReturnValueOnce(mockBooksQuery as never)

    const { result } = renderHook(() => useWantToReadBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(3)
    // High should be first, Low second, null last
    expect(result.current.data?.[0].personal_priority).toBe('High')
    expect(result.current.data?.[1].personal_priority).toBe('Low')
    expect(result.current.data?.[2].personal_priority).toBeNull()
  })

  it('returns empty array when no books in want to read', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as never)

    const { result } = renderHook(() => useWantToReadBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('handles query errors', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi
        .fn()
        .mockResolvedValue({ data: null, error: new Error('Query failed') }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as never)

    const { result } = renderHook(() => useWantToReadBooks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.data).toBeUndefined()
  })

  it('filters by priority when provided', async () => {
    const mockBooks = [
      { id: 'book-1', title: 'High Priority', author_display_name: 'A1', year_sort: 2020 },
      { id: 'book-2', title: 'Medium Priority', author_display_name: 'A2', year_sort: 2021 },
    ]

    const mockStatus = [
      { book_id: 'book-1', reading_status: 'Want to Read', personal_priority: 'High' },
    ]

    // Create a mock that supports chaining .eq() calls
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn(),
    }
    // First .eq() call returns the query for chaining
    // Second .eq() call resolves with data
    mockQuery.eq
      .mockReturnValueOnce(mockQuery)
      .mockResolvedValueOnce({ data: mockStatus, error: null })

    const mockBooksQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: mockBooks, error: null }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(mockQuery as never)
      .mockReturnValueOnce(mockBooksQuery as never)

    const { result } = renderHook(() => useWantToReadBooks('High'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify only High priority books are returned
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].personal_priority).toBe('High')
    expect(result.current.data?.[0].title).toBe('High Priority')
  })
})
