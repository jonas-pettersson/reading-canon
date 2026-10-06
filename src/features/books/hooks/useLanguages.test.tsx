import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLanguages } from './useLanguages'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('useLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it('should fetch and return unique languages', async () => {
    const mockBooks = [
      { original_language: 'EN' },
      { original_language: 'DE' },
      { original_language: 'EN' }, // duplicate
      { original_language: 'FR' },
      { original_language: null },  // should be filtered out
      { original_language: '' },    // should be filtered out
    ]

    const mockSelect = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(['EN', 'FR', 'DE']) // sorted by display name: English, French, German
  })

  it('should return empty array when no languages exist', async () => {
    const mockBooks = [
      { original_language: null },
      { original_language: null },
    ]

    const mockSelect = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle database errors', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should sort languages by display name', async () => {
    const mockBooks = [
      { original_language: 'ZH' },
      { original_language: 'EN' },
      { original_language: 'DE' },
      { original_language: 'FR' },
    ]

    const mockSelect = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(['ZH', 'EN', 'FR', 'DE']) // sorted by display name: Chinese, English, French, German
  })

  it('should include exotic/unmapped language codes', async () => {
    const mockBooks = [
      { original_language: 'EN' },
      { original_language: 'XYZ' }, // Exotic/unknown language code
      { original_language: 'QQ' },  // Another unknown code
    ]

    const mockSelect = vi.fn().mockResolvedValue({
      data: mockBooks,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should include all codes, even if not in display name mapping
    expect(result.current.data).toEqual(['EN', 'QQ', 'XYZ'])
  })
})
