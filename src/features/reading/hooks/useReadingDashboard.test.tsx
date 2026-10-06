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
        reading_status: 'reading',
        started_at: '2024-01-01T00:00:00Z',
      },
      {
        book_id: 'book-2',
        reading_status: 'reading',
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

  it('fetches books with want to read status sorted by title', async () => {
    const mockBooks = [
      {
        id: 'book-1',
        title: 'Moby Dick',
        author_display_name: 'Herman Melville',
        year_sort: 1851,
      },
      {
        id: 'book-2',
        title: 'Animal Farm',
        author_display_name: 'George Orwell',
        year_sort: 1945,
      },
      {
        id: 'book-3',
        title: 'Zen and the Art',
        author_display_name: 'Robert Pirsig',
        year_sort: 1974,
      },
    ]

    const mockStatus = [
      {
        book_id: 'book-1',
        reading_status: 'want_to_read',
      },
      {
        book_id: 'book-2',
        reading_status: 'want_to_read',
      },
      {
        book_id: 'book-3',
        reading_status: 'want_to_read',
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
    // Verify sorted by title alphabetically
    expect(result.current.data?.[0].title).toBe('Animal Farm')
    expect(result.current.data?.[1].title).toBe('Moby Dick')
    expect(result.current.data?.[2].title).toBe('Zen and the Art')
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
})
