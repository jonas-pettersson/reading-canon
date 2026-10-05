import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddBookForm } from './AddBookForm'
import { PRIMARY_CATEGORIES } from '@/constants/categories'

// Mock the useCreateBook hook
const mockMutate = vi.fn()
const mockUseCreateBook = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false,
  isError: false,
  error: null,
}))

vi.mock('../hooks/useCreateBook', () => ({
  useCreateBook: () => mockUseCreateBook(),
}))

// Mock the useDuplicateDetection hook
const mockUseDuplicateDetection = vi.fn(() => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
}))

vi.mock('../hooks/useDuplicateDetection', () => ({
  useDuplicateDetection: (title: string, author: string) => mockUseDuplicateDetection(title, author),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('AddBookForm', () => {
  beforeEach(() => {
    mockMutate.mockClear()
    mockUseCreateBook.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })
    mockUseDuplicateDetection.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })
  })

  describe('Form Fields', () => {
    it('should render all required fields', () => {
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByLabelText(/^title \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/author display name/i)).toBeInTheDocument()
    })

    it('should render all optional book metadata fields', () => {
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByLabelText(/given name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/family name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/original title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/year published/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/primary category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/original language/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/source/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/inclusion rationale/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/author lifespan/i)).toBeInTheDocument()
    })

    it('should render submit and cancel buttons', () => {
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Category Dropdown', () => {
    it('should have dropdown with controlled vocabulary from PRIMARY_CATEGORIES', () => {
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const categorySelect = screen.getByLabelText(/primary category/i) as HTMLSelectElement

      // Check that all categories are present
      PRIMARY_CATEGORIES.forEach(category => {
        expect(screen.getByRole('option', { name: category })).toBeInTheDocument()
      })

      // Check that we have the right number of options (+ 1 for empty option)
      expect(categorySelect.options.length).toBe(PRIMARY_CATEGORIES.length + 1)
    })

    it('should allow selecting a category', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const categorySelect = screen.getByLabelText(/primary category/i) as HTMLSelectElement

      await user.selectOptions(categorySelect, 'Novel')

      expect(categorySelect.value).toBe('Novel')
    })
  })

  describe('External References', () => {
    it('should render external references section', () => {
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByText(/external references/i)).toBeInTheDocument()
    })

    it('should allow adding external references', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const addButton = screen.getByRole('button', { name: /add reference/i })
      await user.click(addButton)

      // Should have at least one set of reference fields
      const urlInputs = screen.getAllByLabelText(/url/i)
      expect(urlInputs.length).toBeGreaterThan(0)
    })

    it('should allow removing external references', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      // Add a reference
      const addButton = screen.getByRole('button', { name: /add reference/i })
      await user.click(addButton)

      // Remove the reference
      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      // Should not have any reference fields visible
      expect(screen.queryByLabelText(/url/i)).not.toBeInTheDocument()
    })

    it('should render url, link text, and reference type fields for each reference', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const addButton = screen.getByRole('button', { name: /add reference/i })
      await user.click(addButton)

      expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/link text/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/reference type/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require title field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
    })

    it('should require author display name field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/author.*name.*required/i)).toBeInTheDocument()
      })
    })

    it('should accept form with only required fields filled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })

    it('should validate URL format for external references', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      // Add required fields
      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')

      // Add a reference with invalid URL
      const addButton = screen.getByRole('button', { name: /add reference/i })
      await user.click(addButton)

      const urlInput = screen.getByLabelText(/url/i)
      await user.type(urlInput, 'not-a-valid-url')

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/valid url/i)).toBeInTheDocument()
      })
    })
  })

  describe('Tags Input', () => {
    it('should allow entering tags', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.type(tagsInput, 'epic, ancient greece')

      expect(tagsInput).toHaveValue('epic, ancient greece')
    })
  })

  describe('Form Submission', () => {
    it('should call mutation with correct data on submit', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()
      renderWithProviders(<AddBookForm onSuccess={onSuccess} onCancel={() => {}} />)

      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')
      await user.type(screen.getByLabelText(/given name/i), 'Homer')
      await user.type(screen.getByLabelText(/year published/i), '8th century BC')
      await user.selectOptions(screen.getByLabelText(/primary category/i), 'Poetry')
      await user.type(screen.getByLabelText(/tags/i), 'epic, ancient greece')

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            book: expect.objectContaining({
              title: 'The Iliad',
              author_display_name: 'Homer',
              given_name: 'Homer',
              year_published: '8th century BC',
              primary_category: 'Poetry',
              tags: expect.arrayContaining(['epic', 'ancient greece']),
            }),
          }),
          expect.any(Object)
        )
      })
    })

    it('should include external references in submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')

      // Add external reference
      const addButton = screen.getByRole('button', { name: /add reference/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/url/i), 'https://example.com')
      await user.type(screen.getByLabelText(/link text/i), 'Example Link')
      await user.type(screen.getByLabelText(/reference type/i), 'analysis')

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            externalReferences: expect.arrayContaining([
              expect.objectContaining({
                url: 'https://example.com',
                link_text: 'Example Link',
                reference_type: 'analysis',
              }),
            ]),
          }),
          expect.any(Object)
        )
      })
    })

    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()

      // Mock successful mutation
      mockMutate.mockImplementation((_data, options) => {
        options.onSuccess({ id: '123' })
      })

      renderWithProviders(<AddBookForm onSuccess={onSuccess} onCancel={() => {}} />)

      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({ id: '123' })
      })
    })
  })

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message on submission failure', async () => {
      const user = userEvent.setup()

      // Mock failed mutation
      const mockFailingMutate = vi.fn().mockImplementation((_data, options) => {
        options.onError(new Error('Failed to create book'))
      })

      vi.mocked(mockMutate).mockImplementation(mockFailingMutate)

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to create book/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const titleInput = screen.getByLabelText(/^title \*/i)
      const authorInput = screen.getByLabelText(/author display name/i)

      expect(titleInput).toHaveAttribute('id')
      expect(authorInput).toHaveAttribute('id')
    })

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const submitButton = screen.getByRole('button', { name: /add book/i })
      await user.click(submitButton)

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/^title \*/i)
        const errorId = titleInput.getAttribute('aria-describedby')
        expect(errorId).toBeTruthy()
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const titleInput = screen.getByLabelText(/^title \*/i)
      titleInput.focus()

      expect(titleInput).toHaveFocus()

      // Tab to next field
      await user.tab()

      expect(titleInput).not.toHaveFocus()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button during submission', async () => {
      // Mock pending mutation
      mockUseCreateBook.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const submitButton = screen.getByRole('button', { name: /adding/i })

      expect(submitButton).toBeDisabled()
    })
  })

  describe('Duplicate Detection', () => {
    it('should not show warning when no duplicates found', () => {
      mockUseDuplicateDetection.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.queryByText(/similar books found/i)).not.toBeInTheDocument()
    })

    it('should display warning when duplicates are found', async () => {
      const duplicates = [
        {
          id: 'book-1',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_published: '8th century BC',
        },
      ]

      mockUseDuplicateDetection.mockReturnValue({
        data: duplicates,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByText(/similar books found in your collection:/i)).toBeInTheDocument()
      expect(screen.getByText(/The Iliad/)).toBeInTheDocument()
      expect(screen.getByText(/Homer/)).toBeInTheDocument()
      expect(screen.getByText(/8th century BC/)).toBeInTheDocument()
    })

    it('should display multiple duplicates', () => {
      const duplicates = [
        {
          id: 'book-1',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_published: '8th century BC',
        },
        {
          id: 'book-2',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_published: '750 BC',
        },
      ]

      mockUseDuplicateDetection.mockReturnValue({
        data: duplicates,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByText(/similar books found in your collection:/i)).toBeInTheDocument()
      expect(screen.getAllByText(/The Iliad/)).toHaveLength(2)
      expect(screen.getAllByText(/Homer/)).toHaveLength(2)
    })

    it('should show link to view duplicate book', () => {
      const duplicates = [
        {
          id: 'book-123',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_published: '8th century BC',
        },
      ]

      mockUseDuplicateDetection.mockReturnValue({
        data: duplicates,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      const link = screen.getByRole('link', { name: /view/i })
      expect(link).toHaveAttribute('href', '/books/book-123')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should allow curator to proceed despite duplicates (soft warning)', async () => {
      const user = userEvent.setup()
      const duplicates = [
        {
          id: 'book-1',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_published: '8th century BC',
        },
      ]

      mockUseDuplicateDetection.mockReturnValue({
        data: duplicates,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      // Fill in the form
      await user.type(screen.getByLabelText(/^title \*/i), 'The Iliad')
      await user.type(screen.getByLabelText(/author display name/i), 'Homer')

      // Should still be able to submit
      const submitButton = screen.getByRole('button', { name: /add book/i })
      expect(submitButton).not.toBeDisabled()

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })

    it('should show message that curator can still proceed', () => {
      const duplicates = [
        {
          id: 'book-1',
          title: 'The Iliad',
          author_display_name: 'Homer',
          year_published: '8th century BC',
        },
      ]

      mockUseDuplicateDetection.mockReturnValue({
        data: duplicates,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<AddBookForm onSuccess={() => {}} onCancel={() => {}} />)

      expect(screen.getByText(/you can still add this book if it's intentionally different/i)).toBeInTheDocument()
    })
  })
})
