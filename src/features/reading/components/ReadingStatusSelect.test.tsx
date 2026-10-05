import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReadingStatusSelect } from './ReadingStatusSelect'
import type { ReactNode } from 'react'

// Mock the useUpdateReadingStatus hook
vi.mock('../hooks/useReadingStatus', () => ({
  useUpdateReadingStatus: vi.fn(),
}))

import { useUpdateReadingStatus } from '../hooks/useReadingStatus'

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

describe('ReadingStatusSelect', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateReadingStatus).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      status: 'idle',
      submittedAt: 0,
    } as any)
  })

  it('renders all status options', () => {
    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="not_started" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    expect(select).toBeInTheDocument()

    // Get all options
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(6)

    // Verify all status options are present
    expect(screen.getByRole('option', { name: 'Not Started' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Want to Read' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Reading' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Paused' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Finished' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Abandoned' })).toBeInTheDocument()
  })

  it('displays current status as selected', () => {
    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="reading" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i }) as HTMLSelectElement
    expect(select.value).toBe('reading')
  })

  it('calls mutation when status changes', async () => {
    const user = userEvent.setup()

    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="want_to_read" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    await user.selectOptions(select, 'reading')

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        bookId: 'book-1',
        updates: {
          reading_status: 'reading',
        },
      })
    })
  })

  it('updates UI optimistically before backend response', async () => {
    const user = userEvent.setup()

    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="want_to_read" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })

    // Change the value
    await user.selectOptions(select, 'reading')

    // The select should show the new value immediately (optimistic update)
    // even before the mutation completes
    expect((select as HTMLSelectElement).value).toBe('reading')

    // And the mutation should have been called
    expect(mockMutate).toHaveBeenCalledWith({
      bookId: 'book-1',
      updates: {
        reading_status: 'reading',
      },
    })
  })

  it('shows loading state while updating', () => {
    vi.mocked(useUpdateReadingStatus).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      status: 'pending',
      submittedAt: 0,
    } as any)

    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="reading" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    expect(select).toBeDisabled()
  })

  it('calls onStatusChange callback when provided', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()

    render(
      <ReadingStatusSelect
        bookId="book-1"
        currentStatus="not_started"
        onStatusChange={onStatusChange}
      />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    await user.selectOptions(select, 'finished')

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('finished')
    })
  })

  it('does not call mutation if status unchanged', async () => {
    const user = userEvent.setup()

    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="reading" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    // Select the same value
    await user.selectOptions(select, 'reading')

    // Should not call mutate
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('has proper ARIA labels', () => {
    render(
      <ReadingStatusSelect bookId="book-1" currentStatus="reading" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    expect(select).toHaveAttribute('aria-label')
  })

  it('handles custom className', () => {
    render(
      <ReadingStatusSelect
        bookId="book-1"
        currentStatus="reading"
        className="custom-class"
      />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i })
    expect(select).toHaveClass('custom-class')
  })

  it('updates when currentStatus prop changes', () => {
    const { rerender } = render(
      <ReadingStatusSelect bookId="book-1" currentStatus="reading" />,
      { wrapper: createWrapper() }
    )

    const select = screen.getByRole('combobox', { name: /reading status/i }) as HTMLSelectElement
    expect(select.value).toBe('reading')

    // Change prop
    rerender(
      <ReadingStatusSelect bookId="book-1" currentStatus="finished" />
    )

    expect(select.value).toBe('finished')
  })
})
