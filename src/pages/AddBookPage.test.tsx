import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AddBookPage } from './AddBookPage'

// Mock the AddBookForm component
vi.mock('@/features/books/components/AddBookForm', () => ({
  AddBookForm: ({ onSuccess, onCancel }: any) => (
    <div data-testid="add-book-form">
      <button onClick={() => onSuccess({ id: 'new-book-123', title: 'New Book' })}>
        Submit Success
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

function renderAddBookPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<div>Collection Page</div>} />
          <Route path="/books/new" element={<AddBookPage />} />
          <Route path="/books/:id" element={<div>Book Detail Page</div>} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('AddBookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set initial route to /books/new
    window.history.pushState({}, '', '/books/new')
  })

  describe('Page Rendering', () => {
    it('should render the page heading', () => {
      renderAddBookPage()

      expect(screen.getByRole('heading', { name: /add book/i, level: 1 })).toBeInTheDocument()
    })

    it('should render the AddBookForm component', () => {
      renderAddBookPage()

      expect(screen.getByTestId('add-book-form')).toBeInTheDocument()
    })

    it('should have proper semantic structure', () => {
      renderAddBookPage()

      // Should have a main heading
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(/add book/i)
    })
  })

  describe('Form Success Handling', () => {
    it('should redirect to book detail page on successful book creation', async () => {
      const user = userEvent.setup()
      renderAddBookPage()

      // Click the success button (simulates form submission)
      const successButton = screen.getByText('Submit Success')
      await user.click(successButton)

      // Should navigate to book detail page
      await waitFor(() => {
        expect(screen.getByText('Book Detail Page')).toBeInTheDocument()
      })
    })

    it('should navigate to the correct book ID', async () => {
      const user = userEvent.setup()
      renderAddBookPage()

      // Trigger success with a specific book ID
      const successButton = screen.getByText('Submit Success')
      await user.click(successButton)

      // Should be on the book detail page route
      await waitFor(() => {
        expect(window.location.pathname).toBe('/books/new-book-123')
      })
    })
  })

  describe('Form Cancel Handling', () => {
    it('should return to collection page on cancel', async () => {
      const user = userEvent.setup()
      renderAddBookPage()

      // Click the cancel button
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Should navigate back to collection page
      await waitFor(() => {
        expect(screen.getByText('Collection Page')).toBeInTheDocument()
      })
    })

    it('should navigate to root path on cancel', async () => {
      const user = userEvent.setup()
      renderAddBookPage()

      // Click the cancel button
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Should be on the collection page route
      await waitFor(() => {
        expect(window.location.pathname).toBe('/')
      })
    })
  })

  describe('Page Layout', () => {
    it('should have proper spacing and layout structure', () => {
      renderAddBookPage()

      // Check that main container exists
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()

      // Check that form is rendered
      const form = screen.getByTestId('add-book-form')
      expect(form).toBeInTheDocument()
    })
  })
})
