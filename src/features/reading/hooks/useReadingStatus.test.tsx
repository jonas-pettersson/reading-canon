import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReadingStatus, useUpdateReadingStatus } from './useReadingStatus'
import { supabase } from '@/lib/supabase'
import type { ReactNode } from 'react'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
  },
}))

// Create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useReadingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches user reading status for a book', async () => {
    const mockStatus = {
      id: 'status-1',
      user_id: 'test-user-id',
      book_id: 'book-1',
      reading_status: 'reading',
      personal_priority: 'high',
      ownership_status: 'owned_physical',
      personal_rating: 4,
      personal_notes: 'Great book!',
      started_at: '2026-01-01T00:00:00Z',
      completed_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: mockStatus,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useReadingStatus('book-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(supabase.from).toHaveBeenCalledWith('user_reading_status')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('book_id', 'book-1')
    expect(result.current.data).toEqual(mockStatus)
  })

  it('returns null when no reading status exists', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useReadingStatus('book-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeNull()
  })

  it('handles errors', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST001', message: 'Database error' },
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useReadingStatus('book-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })
})

describe('useUpdateReadingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates new reading status record', async () => {
    const newStatus = {
      id: 'status-1',
      user_id: 'test-user-id',
      book_id: 'book-1',
      reading_status: 'want_to_read',
      personal_priority: null,
      ownership_status: 'not_owned',
      personal_rating: null,
      personal_notes: null,
      started_at: null,
      completed_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: newStatus,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useUpdateReadingStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      bookId: 'book-1',
      updates: {
        reading_status: 'want_to_read',
      },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(supabase.from).toHaveBeenCalledWith('user_reading_status')
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        book_id: 'book-1',
        user_id: 'test-user-id',
        reading_status: 'want_to_read',
      }),
      expect.objectContaining({
        onConflict: 'user_id,book_id',
      })
    )
  })

  it('updates existing reading status', async () => {
    const updatedStatus = {
      id: 'status-1',
      user_id: 'test-user-id',
      book_id: 'book-1',
      reading_status: 'finished',
      personal_priority: 'high',
      ownership_status: 'owned_physical',
      personal_rating: 5,
      personal_notes: 'Excellent!',
      started_at: '2026-01-01T00:00:00Z',
      completed_at: '2026-01-10T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    }

    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: updatedStatus,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useUpdateReadingStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      bookId: 'book-1',
      updates: {
        reading_status: 'finished',
        personal_rating: 5,
        personal_notes: 'Excellent!',
      },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(updatedStatus)
  })

  it('auto-sets started_at when status changes to reading', async () => {
    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: { started_at: '2026-01-01T00:00:00Z' },
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useUpdateReadingStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      bookId: 'book-1',
      updates: {
        reading_status: 'reading',
      },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        reading_status: 'reading',
        started_at: expect.any(String),
      }),
      expect.any(Object)
    )
  })

  it('auto-sets completed_at when status changes to finished', async () => {
    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: { completed_at: '2026-01-10T00:00:00Z' },
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useUpdateReadingStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      bookId: 'book-1',
      updates: {
        reading_status: 'finished',
      },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        reading_status: 'finished',
        completed_at: expect.any(String),
      }),
      expect.any(Object)
    )
  })

  it('handles mutation errors', async () => {
    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    })

    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      single: mockSingle,
    } as any)

    const { result } = renderHook(() => useUpdateReadingStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      bookId: 'book-1',
      updates: {
        reading_status: 'reading',
      },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })

  it('invalidates queries after successful update', async () => {
    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockReturnThis()
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'status-1' },
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
      single: mockSingle,
    } as any)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateReadingStatus(), { wrapper })

    result.current.mutate({
      bookId: 'book-1',
      updates: {
        reading_status: 'reading',
      },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['reading-status', 'book-1'],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['user-reading-status'],
    })
  })
})
