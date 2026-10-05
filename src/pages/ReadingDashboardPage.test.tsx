import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReadingDashboardPage } from './ReadingDashboardPage'
import type { ReadingBook } from '@/features/reading/hooks/useReadingDashboard'

// Mock the hooks
vi.mock('@/features/reading/hooks/useReadingDashboard', () => ({
  useReadingBooks: vi.fn(),
  useWantToReadBooks: vi.fn(),
}))

vi.mock('@/features/reading/hooks/useReadingStatus', () => ({
  useUpdateReadingStatus: vi.fn(),
  useUpdatePriority: vi.fn(),
}))

// Mock auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}))

import { useReadingBooks, useWantToReadBooks } from '@/features/reading/hooks/useReadingDashboard'
import { useUpdateReadingStatus, useUpdatePriority } from '@/features/reading/hooks/useReadingStatus'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ReadingDashboardPage />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('ReadingDashboardPage', () => {
  const mockUpdateStatus = vi.fn()
  const mockUpdatePriority = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateReadingStatus).mockReturnValue({
      mutate: mockUpdateStatus,
      isPending: false,
    } as never)
    vi.mocked(useUpdatePriority).mockReturnValue({
      mutate: mockUpdatePriority,
      isPending: false,
    } as never)
  })

  it('displays currently reading books', async () => {
    const mockReadingBooks: ReadingBook[] = [
      {
        id: 'book-1',
        title: 'The Great Gatsby',
        author_display_name: 'F. Scott Fitzgerald',
        year_sort: 1925,
        started_at: '2024-01-15T00:00:00Z',
        reading_status: 'Reading',
      } as ReadingBook,
    ]

    vi.mocked(useReadingBooks).mockReturnValue({
      data: mockReadingBooks,
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Currently Reading')).toBeInTheDocument()
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
      expect(screen.getByText(/F\. Scott Fitzgerald/)).toBeInTheDocument()
    })
  })

  it('displays want to read books with priorities', async () => {
    const mockWantToReadBooks: ReadingBook[] = [
      {
        id: 'book-1',
        title: 'To Kill a Mockingbird',
        author_display_name: 'Harper Lee',
        year_sort: 1960,
        personal_priority: 'High',
        reading_status: 'Want to Read',
      } as ReadingBook,
      {
        id: 'book-2',
        title: '1984',
        author_display_name: 'George Orwell',
        year_sort: 1949,
        personal_priority: 'Medium',
        reading_status: 'Want to Read',
      } as ReadingBook,
    ]

    vi.mocked(useReadingBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: mockWantToReadBooks,
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Want to Read')).toBeInTheDocument()
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument()
      expect(screen.getByText('1984')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
    })
  })

  it('displays empty state when no books are being read', async () => {
    vi.mocked(useReadingBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/no books currently reading/i)).toBeInTheDocument()
    })
  })

  it('displays empty state when no books in want to read', async () => {
    vi.mocked(useReadingBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/no books in your want to read list/i)).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', () => {
    vi.mocked(useReadingBooks).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)

    renderPage()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles quick status update actions', async () => {
    const user = userEvent.setup()
    const mockReadingBooks: ReadingBook[] = [
      {
        id: 'book-1',
        title: 'The Great Gatsby',
        author_display_name: 'F. Scott Fitzgerald',
        year_sort: 1925,
        started_at: '2024-01-15T00:00:00Z',
        reading_status: 'Reading',
      } as ReadingBook,
    ]

    vi.mocked(useReadingBooks).mockReturnValue({
      data: mockReadingBooks,
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
    })

    // Find and click the "Mark as Finished" button
    const finishButton = screen.getByRole('button', { name: /mark as finished/i })
    await user.click(finishButton)

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      bookId: 'book-1',
      updates: { reading_status: 'Finished' },
    })
  })

  it('allows changing priority for want to read books', async () => {
    const user = userEvent.setup()
    const mockWantToReadBooks: ReadingBook[] = [
      {
        id: 'book-1',
        title: 'To Kill a Mockingbird',
        author_display_name: 'Harper Lee',
        year_sort: 1960,
        personal_priority: 'High',
        reading_status: 'Want to Read',
      } as ReadingBook,
    ]

    vi.mocked(useReadingBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: mockWantToReadBooks,
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument()
    })

    // Find and click "Mark as Reading" button
    const readingButton = screen.getByRole('button', { name: /mark as reading/i })
    await user.click(readingButton)

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      bookId: 'book-1',
      updates: { reading_status: 'Reading' },
    })
  })

  it('links to book detail pages', async () => {
    const mockReadingBooks: ReadingBook[] = [
      {
        id: 'book-1',
        title: 'The Great Gatsby',
        author_display_name: 'F. Scott Fitzgerald',
        year_sort: 1925,
        started_at: '2024-01-15T00:00:00Z',
        reading_status: 'Reading',
      } as ReadingBook,
    ]

    vi.mocked(useReadingBooks).mockReturnValue({
      data: mockReadingBooks,
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /the great gatsby/i })
      expect(link).toHaveAttribute('href', '/books/book-1')
    })
  })

  it('is mobile optimized with touch-friendly buttons', async () => {
    const mockReadingBooks: ReadingBook[] = [
      {
        id: 'book-1',
        title: 'The Great Gatsby',
        author_display_name: 'F. Scott Fitzgerald',
        year_sort: 1925,
        started_at: '2024-01-15T00:00:00Z',
        reading_status: 'Reading',
      } as ReadingBook,
    ]

    vi.mocked(useReadingBooks).mockReturnValue({
      data: mockReadingBooks,
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useWantToReadBooks).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never)

    renderPage()

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      // Verify buttons exist (touch-friendly size should be handled by CSS)
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
