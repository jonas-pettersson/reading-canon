import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersonalDataPanel } from './PersonalDataPanel'
import type { ReactNode } from 'react'
import type { UserReadingStatus } from '@/types/database'

// Mock the hooks
vi.mock('../hooks/useReadingStatus', () => ({
  useReadingStatus: vi.fn(),
  useUpdateReadingStatus: vi.fn(),
}))

import { useReadingStatus, useUpdateReadingStatus } from '../hooks/useReadingStatus'

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

describe('PersonalDataPanel', () => {
  const mockMutate = vi.fn()

  const defaultReadingStatus: UserReadingStatus = {
    id: 'status-1',
    user_id: 'user-1',
    book_id: 'book-1',
    reading_status: 'not_started',
    personal_priority: null,
    ownership_status: 'not_owned',
    personal_rating: null,
    personal_notes: null,
    started_at: null,
    completed_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useReadingStatus).mockReturnValue({
      data: defaultReadingStatus,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as any)

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

  describe('Display', () => {
    it('displays all personal data fields', () => {
      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/reading status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ownership/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/personal notes/i)).toBeInTheDocument()
    })

    it('displays current values correctly', () => {
      const status: UserReadingStatus = {
        ...defaultReadingStatus,
        reading_status: 'reading',
        personal_priority: 'high',
        ownership_status: 'owned_physical',
        personal_rating: 4,
        personal_notes: 'Great book so far!',
      }

      vi.mocked(useReadingStatus).mockReturnValue({
        data: status,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.getByDisplayValue('Great book so far!')).toBeInTheDocument()
    })

    it('shows loading state when fetching data', () => {
      vi.mocked(useReadingStatus).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('displays timestamps when available', () => {
      const status: UserReadingStatus = {
        ...defaultReadingStatus,
        started_at: '2026-01-15T00:00:00Z',
        completed_at: '2026-02-20T00:00:00Z',
      }

      vi.mocked(useReadingStatus).mockReturnValue({
        data: status,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.getByText(/started:/i)).toBeInTheDocument()
      expect(screen.getByText(/completed:/i)).toBeInTheDocument()
    })

    it('hides timestamps when not available', () => {
      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.queryByText(/started:/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/completed:/i)).not.toBeInTheDocument()
    })
  })

  describe('Priority Select', () => {
    it('allows changing priority', async () => {
      const user = userEvent.setup()

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, 'high')

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          bookId: 'book-1',
          updates: {
            personal_priority: 'high',
          },
        })
      })
    })

    it('allows setting priority to none', async () => {
      const user = userEvent.setup()

      const status: UserReadingStatus = {
        ...defaultReadingStatus,
        personal_priority: 'high',
      }

      vi.mocked(useReadingStatus).mockReturnValue({
        data: status,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, '')

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          bookId: 'book-1',
          updates: {
            personal_priority: null,
          },
        })
      })
    })
  })

  describe('Ownership Select', () => {
    it('allows changing ownership status', async () => {
      const user = userEvent.setup()

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const ownershipSelect = screen.getByLabelText(/ownership/i)
      await user.selectOptions(ownershipSelect, 'owned_physical')

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          bookId: 'book-1',
          updates: {
            ownership_status: 'owned_physical',
          },
        })
      })
    })
  })

  describe('Rating', () => {
    it('displays rating stars', () => {
      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      // Should have 5 star buttons
      const stars = screen.getAllByRole('button', { name: /rate/i })
      expect(stars).toHaveLength(5)
    })

    it('allows setting rating by clicking stars', async () => {
      const user = userEvent.setup()

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const stars = screen.getAllByRole('button', { name: /rate/i })
      await user.click(stars[3]) // Click 4th star (4-star rating)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          bookId: 'book-1',
          updates: {
            personal_rating: 4,
          },
        })
      })
    })

    it('displays current rating visually', () => {
      const status: UserReadingStatus = {
        ...defaultReadingStatus,
        personal_rating: 3,
      }

      vi.mocked(useReadingStatus).mockReturnValue({
        data: status,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      // Check that filled stars are indicated
      const stars = screen.getAllByRole('button', { name: /rate/i })
      expect(stars[0]).toHaveTextContent('★') // Filled
      expect(stars[1]).toHaveTextContent('★') // Filled
      expect(stars[2]).toHaveTextContent('★') // Filled
      expect(stars[3]).toHaveTextContent('☆') // Empty
      expect(stars[4]).toHaveTextContent('☆') // Empty
    })

    it('allows clearing rating by clicking current rating', async () => {
      const user = userEvent.setup()

      const status: UserReadingStatus = {
        ...defaultReadingStatus,
        personal_rating: 3,
      }

      vi.mocked(useReadingStatus).mockReturnValue({
        data: status,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const stars = screen.getAllByRole('button', { name: /rate/i })
      await user.click(stars[2]) // Click the 3rd star (current rating)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          bookId: 'book-1',
          updates: {
            personal_rating: null,
          },
        })
      })
    })
  })

  describe('Personal Notes', () => {
    it('allows editing personal notes', async () => {
      const user = userEvent.setup()

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const notesTextarea = screen.getByLabelText(/personal notes/i)
      await user.type(notesTextarea, 'This is a fascinating read!')

      expect(notesTextarea).toHaveValue('This is a fascinating read!')
    })

    it('auto-saves notes on blur', async () => {
      const user = userEvent.setup()

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const notesTextarea = screen.getByLabelText(/personal notes/i)
      await user.type(notesTextarea, 'Auto-save test')
      await user.tab() // Blur the textarea

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          bookId: 'book-1',
          updates: {
            personal_notes: 'Auto-save test',
          },
        })
      })
    })

    it('does not save notes if unchanged', async () => {
      const user = userEvent.setup()

      const status: UserReadingStatus = {
        ...defaultReadingStatus,
        personal_notes: 'Existing notes',
      }

      vi.mocked(useReadingStatus).mockReturnValue({
        data: status,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      const notesTextarea = screen.getByLabelText(/personal notes/i)
      await user.click(notesTextarea)
      await user.tab() // Blur without changing

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form controls', () => {
      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/reading status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ownership/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/personal notes/i)).toBeInTheDocument()
    })

    it('rating buttons have accessible labels', () => {
      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      expect(screen.getByRole('button', { name: /rate 1 star/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rate 2 stars/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rate 3 stars/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rate 4 stars/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rate 5 stars/i })).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('handles case when no reading status exists yet', () => {
      vi.mocked(useReadingStatus).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any)

      render(<PersonalDataPanel bookId="book-1" />, { wrapper: createWrapper() })

      // Should still render form with default values
      expect(screen.getByLabelText(/reading status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    })
  })
})
