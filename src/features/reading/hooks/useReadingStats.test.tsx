import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReadingStats } from './useReadingStats'
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

describe('useReadingStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns zero counts when user has no reading status records', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    const { result } = renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      byReadingStatus: {
        not_started: 0,
        want_to_read: 0,
        reading: 0,
        paused: 0,
        finished: 0,
        abandoned: 0,
      },
      byOwnership: {
        not_owned: 0,
        ordered: 0,
        owned_physical: 0,
        owned_digital: 0,
        borrowed: 0,
        totalOwned: 0,
      },
    })
  })

  it('counts books by reading status correctly', async () => {
    const mockData = [
      { reading_status: 'want_to_read', ownership_status: 'not_owned' },
      { reading_status: 'want_to_read', ownership_status: 'not_owned' },
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'finished', ownership_status: 'owned_physical' },
      { reading_status: 'finished', ownership_status: 'owned_digital' },
      { reading_status: 'finished', ownership_status: 'owned_digital' },
      { reading_status: 'paused', ownership_status: 'borrowed' },
      { reading_status: 'abandoned', ownership_status: 'not_owned' },
    ]

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: mockData,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    const { result } = renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.byReadingStatus).toEqual({
      not_started: 0,
      want_to_read: 2,
      reading: 1,
      paused: 1,
      finished: 3,
      abandoned: 1,
    })
  })

  it('counts books by ownership status correctly', async () => {
    const mockData = [
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'want_to_read', ownership_status: 'owned_digital' },
      { reading_status: 'want_to_read', ownership_status: 'owned_digital' },
      { reading_status: 'finished', ownership_status: 'ordered' },
      { reading_status: 'finished', ownership_status: 'borrowed' },
      { reading_status: 'want_to_read', ownership_status: 'not_owned' },
      { reading_status: 'want_to_read', ownership_status: 'not_owned' },
    ]

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: mockData,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    const { result } = renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.byOwnership).toEqual({
      not_owned: 2,
      ordered: 1,
      owned_physical: 3,
      owned_digital: 2,
      borrowed: 1,
      totalOwned: 5, // physical + digital
    })
  })

  it('calculates totalOwned as sum of physical and digital', async () => {
    const mockData = [
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'finished', ownership_status: 'owned_digital' },
      { reading_status: 'finished', ownership_status: 'owned_digital' },
      { reading_status: 'finished', ownership_status: 'owned_digital' },
      { reading_status: 'want_to_read', ownership_status: 'ordered' }, // Not counted in totalOwned
      { reading_status: 'want_to_read', ownership_status: 'borrowed' }, // Not counted in totalOwned
    ]

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: mockData,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    const { result } = renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.byOwnership.owned_physical).toBe(2)
    expect(result.current.data?.byOwnership.owned_digital).toBe(3)
    expect(result.current.data?.byOwnership.totalOwned).toBe(5)
  })

  it('queries user_reading_status for current user', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(mockSelect).toHaveBeenCalled())

    expect(supabase.from).toHaveBeenCalledWith('user_reading_status')
    expect(mockSelect).toHaveBeenCalledWith('reading_status,ownership_status')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id')
  })

  it('handles query errors', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    const { result } = renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })

  it('handles mixed statuses correctly', async () => {
    const mockData = [
      { reading_status: 'not_started', ownership_status: 'not_owned' },
      { reading_status: 'want_to_read', ownership_status: 'ordered' },
      { reading_status: 'reading', ownership_status: 'owned_physical' },
      { reading_status: 'paused', ownership_status: 'owned_digital' },
      { reading_status: 'finished', ownership_status: 'owned_physical' },
      { reading_status: 'abandoned', ownership_status: 'borrowed' },
    ]

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({
      data: mockData,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    } as any)

    const { result } = renderHook(() => useReadingStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify all status types are counted
    expect(result.current.data?.byReadingStatus).toEqual({
      not_started: 1,
      want_to_read: 1,
      reading: 1,
      paused: 1,
      finished: 1,
      abandoned: 1,
    })

    expect(result.current.data?.byOwnership).toEqual({
      not_owned: 1,
      ordered: 1,
      owned_physical: 2,
      owned_digital: 1,
      borrowed: 1,
      totalOwned: 3,
    })
  })
})
