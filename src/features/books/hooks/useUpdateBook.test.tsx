import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateBook } from './useUpdateBook'
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

describe('useUpdateBook', () => {
  const mockUpdate = vi.fn()
  const mockSelect = vi.fn()
  const mockSingle = vi.fn()
  const mockEq = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
    } as any)
  })

  it('should update a book without external references', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'Updated Title',
      author_display_name: 'Homer',
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    }

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    const { result } = renderHook(() => useUpdateBook(), {
      wrapper: createWrapper(),
    })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'Updated Title',
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(supabase.from).toHaveBeenCalledWith('books')
    expect(mockUpdate).toHaveBeenCalledWith({ title: 'Updated Title' })
    expect(mockEq).toHaveBeenCalledWith('id', 'book-123')
    expect(result.current.data).toEqual(mockBook)
  })

  it('should handle book update error', async () => {
    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Update failed', code: '500' },
    })

    const { result } = renderHook(() => useUpdateBook(), {
      wrapper: createWrapper(),
    })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'Updated Title',
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should add new external references', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
    }

    const mockInsert = vi.fn()

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
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
    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        update: mockUpdate,
      } as any)
      .mockReturnValueOnce({
        insert: mockInsert,
      } as any)

    mockInsert.mockResolvedValue({
      data: null,
      error: null,
    })

    const { result } = renderHook(() => useUpdateBook(), {
      wrapper: createWrapper(),
    })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'The Iliad',
      },
      externalReferences: {
        toAdd: [
          {
            url: 'https://example.com',
            link_text: 'Example',
            reference_type: 'analysis',
          },
        ],
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsert).toHaveBeenCalledWith([
      {
        url: 'https://example.com',
        link_text: 'Example',
        reference_type: 'analysis',
        book_id: 'book-123',
      },
    ])
  })

  it('should delete external references', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
    }

    const mockDelete = vi.fn()
    const mockIn = vi.fn()

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    // Mock external references deletion
    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        update: mockUpdate,
      } as any)
      .mockReturnValueOnce({
        delete: mockDelete,
      } as any)

    mockDelete.mockReturnValue({
      in: mockIn,
    })

    mockIn.mockResolvedValue({
      data: null,
      error: null,
    })

    const { result } = renderHook(() => useUpdateBook(), {
      wrapper: createWrapper(),
    })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'The Iliad',
      },
      externalReferences: {
        toDelete: ['ref-1', 'ref-2'],
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDelete).toHaveBeenCalled()
    expect(mockIn).toHaveBeenCalledWith('id', ['ref-1', 'ref-2'])
  })

  it('should update existing external references', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
    }

    const mockRefUpdate = vi.fn()
    const mockRefEq = vi.fn()

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    // Mock external references update
    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        update: mockUpdate,
      } as any)
      .mockReturnValueOnce({
        update: mockRefUpdate,
      } as any)

    mockRefUpdate.mockReturnValue({
      eq: mockRefEq,
    })

    mockRefEq.mockResolvedValue({
      data: null,
      error: null,
    })

    const { result } = renderHook(() => useUpdateBook(), {
      wrapper: createWrapper(),
    })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'The Iliad',
      },
      externalReferences: {
        toUpdate: [
          {
            id: 'ref-1',
            url: 'https://updated.com',
            link_text: 'Updated',
            reference_type: 'review',
          },
        ],
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockRefUpdate).toHaveBeenCalledWith({
      url: 'https://updated.com',
      link_text: 'Updated',
      reference_type: 'review',
    })
    expect(mockRefEq).toHaveBeenCalledWith('id', 'ref-1')
  })

  it('should handle external references error', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'The Iliad',
      author_display_name: 'Homer',
    }

    const mockInsert = vi.fn()

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      select: mockSelect,
    })

    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockSingle.mockResolvedValue({
      data: mockBook,
      error: null,
    })

    // Mock external references insertion with error
    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        update: mockUpdate,
      } as any)
      .mockReturnValueOnce({
        insert: mockInsert,
      } as any)

    mockInsert.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed', code: '500' },
    })

    const { result } = renderHook(() => useUpdateBook(), {
      wrapper: createWrapper(),
    })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'The Iliad',
      },
      externalReferences: {
        toAdd: [
          {
            url: 'https://example.com',
            link_text: 'Example',
            reference_type: 'analysis',
          },
        ],
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should invalidate queries on success', async () => {
    const mockBook = {
      id: 'book-123',
      title: 'Updated Title',
      author_display_name: 'Homer',
    }

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
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

    const { result } = renderHook(() => useUpdateBook(), { wrapper })

    const updateInput = {
      bookId: 'book-123',
      book: {
        title: 'Updated Title',
      },
    }

    result.current.mutate(updateInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['book', 'book-123'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['books'] })
  })
})
