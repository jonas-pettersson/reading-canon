import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateBook } from './useCreateBook'
import { supabase } from '@/lib/supabase'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useCreateBook', () => {
  const mockFrom = vi.fn()
  const mockInsert = vi.fn()
  const mockSelect = vi.fn()
  const mockSingle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any)
  })

  it('should create a book without external references', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    mockInsert.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    const { result } = renderHook(() => useCreateBook(), {
      wrapper: createWrapper(),
    })

    const bookInput = {
      book: {
        title: 'The Iliad',
        author_display_name: 'Homer',
      },
    }

    result.current.mutate(bookInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(supabase.from).toHaveBeenCalledWith('books')
    expect(mockInsert).toHaveBeenCalledWith(bookInput.book)
    expect(result.current.data).toEqual(mockBook)
  })

  it('should create a book with external references', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    const mockInsertRefs = vi.fn()

    // Mock book insertion
    mockInsert.mockReturnValueOnce({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    // Mock external references insertion
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as any).mockReturnValueOnce({
      insert: mockInsertRefs,
    } as any)

    mockInsertRefs.mockResolvedValue({
      data: null,
      error: null,
    })

    const { result } = renderHook(() => useCreateBook(), {
      wrapper: createWrapper(),
    })

    const bookInput = {
      book: {
        title: 'The Iliad',
        author_display_name: 'Homer',
      },
      externalReferences: [
        {
          url: 'https://example.com',
          link_text: 'Example',
          reference_type: 'analysis',
        },
      ],
    }

    result.current.mutate(bookInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsertRefs).toHaveBeenCalledWith([
      {
        url: 'https://example.com',
        link_text: 'Example',
        reference_type: 'analysis',
        book_id: 'book-123',
      },
    ])
  })

  it('should handle book insertion error', async () => {
    mockInsert.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed', code: '500' },
    })

    const { result } = renderHook(() => useCreateBook(), {
      wrapper: createWrapper(),
    })

    const bookInput = {
      book: {
        title: 'The Iliad',
        author_display_name: 'Homer',
      },
    }

    result.current.mutate(bookInput)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should handle missing book data after insertion', async () => {
    mockInsert.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    })

    const { result } = renderHook(() => useCreateBook(), {
      wrapper: createWrapper(),
    })

    const bookInput = {
      book: {
        title: 'The Iliad',
        author_display_name: 'Homer',
      },
    }

    result.current.mutate(bookInput)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Failed to create book'))
  })

  it('should handle external references insertion error', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    const mockInsertRefs = vi.fn()

    // Mock successful book insertion
    mockInsert.mockReturnValueOnce({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    // Mock failed external references insertion
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as any).mockReturnValueOnce({
      insert: mockInsertRefs,
    } as any)

    mockInsertRefs.mockResolvedValue({
      data: null,
      error: { message: 'Insert references failed', code: '500' },
    })

    const { result } = renderHook(() => useCreateBook(), {
      wrapper: createWrapper(),
    })

    const bookInput = {
      book: {
        title: 'The Iliad',
        author_display_name: 'Homer',
      },
      externalReferences: [
        {
          url: 'https://example.com',
          link_text: 'Example',
          reference_type: 'analysis',
        },
      ],
    }

    result.current.mutate(bookInput)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should invalidate books queries on success', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    mockInsert.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateBook(), { wrapper })

    const bookInput = {
      book: {
        title: 'The Iliad',
        author_display_name: 'Homer',
      },
    }

    result.current.mutate(bookInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['books'] })
  })
})
