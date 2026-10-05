import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditBookForm } from './EditBookForm'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']
type ExternalReference = Database['public']['Tables']['external_references']['Row']

// Mock useUpdateBook hook
const mockMutate = vi.fn()
const mockUseUpdateBook = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false,
  isError: false,
  error: null,
}))

vi.mock('../hooks/useUpdateBook', () => ({
  useUpdateBook: () => mockUseUpdateBook(),
}))

const mockBook: Book = {
  id: 'book-123',
  title: 'The Iliad',
  title_original: 'Ἰλιάς',
  author_display_name: 'Homer',
  given_name: null,
  family_name: 'Homer',
  year_published: '8th century BC',
  year_sort: -750,
  primary_category: 'Poetry',
  tags: ['epic', 'ancient'],
  original_language: 'Ancient Greek',
  source: 'Western Canon',
  inclusion_rationale: 'Foundational epic',
  author_lifespan: 'c. 8th century BC',
  created_at: '2024-01-01T00:00:00Z',
  created_by_user_id: null,
  updated_at: '2024-01-01T00:00:00Z',
}

const mockExternalReferences: ExternalReference[] = [
  {
    id: 'ref-1',
    book_id: 'book-123',
    url: 'https://example.com/iliad',
    link_text: 'Full Text',
    reference_type: 'text',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ref-2',
    book_id: 'book-123',
    url: 'https://example.com/analysis',
    link_text: 'Analysis',
    reference_type: 'review',
    created_at: '2024-01-01T00:00:00Z',
  },
]

function renderEditBookForm(
  book: Book = mockBook,
  externalReferences: ExternalReference[] = mockExternalReferences,
  onSuccess = vi.fn(),
  onCancel = vi.fn()
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <EditBookForm
        book={book}
        externalReferences={externalReferences}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </QueryClientProvider>
  )
}

describe('EditBookForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Pre-population', () => {
    it('should pre-populate title field', () => {
      renderEditBookForm()

      const titleInput = screen.getByLabelText(/^title/i)
      expect(titleInput).toHaveValue('The Iliad')
    })

    it('should pre-populate author display name', () => {
      renderEditBookForm()

      const authorInput = screen.getByLabelText(/author display name/i)
      expect(authorInput).toHaveValue('Homer')
    })

    it('should pre-populate optional fields', () => {
      renderEditBookForm()

      expect(screen.getByLabelText(/original title/i)).toHaveValue('Ἰλιάς')
      expect(screen.getByLabelText(/year published/i)).toHaveValue('8th century BC')
      expect(screen.getByLabelText(/primary category/i)).toHaveValue('Poetry')
      expect(screen.getByLabelText(/original language/i)).toHaveValue('Ancient Greek')
      expect(screen.getByLabelText(/source/i)).toHaveValue('Western Canon')
      expect(screen.getByLabelText(/inclusion rationale/i)).toHaveValue('Foundational epic')
      expect(screen.getByLabelText(/author lifespan/i)).toHaveValue('c. 8th century BC')
    })

    it('should pre-populate tags as comma-separated string', () => {
      renderEditBookForm()

      const tagsInput = screen.getByLabelText(/tags/i)
      expect(tagsInput).toHaveValue('epic, ancient')
    })

    it('should pre-populate existing external references', () => {
      renderEditBookForm()

      // Check that both references are displayed
      expect(screen.getByText('Reference 1')).toBeInTheDocument()
      expect(screen.getByText('Reference 2')).toBeInTheDocument()

      // Check URLs are pre-filled
      const urlInputs = screen.getAllByLabelText(/^url/i)
      expect(urlInputs[0]).toHaveValue('https://example.com/iliad')
      expect(urlInputs[1]).toHaveValue('https://example.com/analysis')
    })

    it('should handle book with no tags', () => {
      const bookWithoutTags = { ...mockBook, tags: null }
      renderEditBookForm(bookWithoutTags)

      const tagsInput = screen.getByLabelText(/tags/i)
      expect(tagsInput).toHaveValue('')
    })

    it('should handle book with no external references', () => {
      renderEditBookForm(mockBook, [])

      // Should not show any reference sections
      expect(screen.queryByText('Reference 1')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require title', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      const titleInput = screen.getByLabelText(/^title/i)
      await user.clear(titleInput)
      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })

    it('should require author display name', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      const authorInput = screen.getByLabelText(/author display name/i)
      await user.clear(authorInput)
      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(screen.getByText('Author display name is required')).toBeInTheDocument()
      })
    })

    it('should validate URL format for external references', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Add a new reference
      await user.click(screen.getByText('Add Reference'))

      // Enter invalid URL
      const urlInputs = screen.getAllByLabelText(/^url/i)
      const newUrlInput = urlInputs[urlInputs.length - 1]
      await user.type(newUrlInput, 'not-a-url')

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(screen.getByText('Must be a valid URL')).toBeInTheDocument()
      })
    })
  })

  describe('Form Editing', () => {
    it('should allow editing title', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      const titleInput = screen.getByLabelText(/^title/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'The Odyssey')

      expect(titleInput).toHaveValue('The Odyssey')
    })

    it('should allow editing all fields', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      await user.clear(screen.getByLabelText(/^title/i))
      await user.type(screen.getByLabelText(/^title/i), 'Updated Title')

      await user.clear(screen.getByLabelText(/author display name/i))
      await user.type(screen.getByLabelText(/author display name/i), 'Updated Author')

      expect(screen.getByLabelText(/^title/i)).toHaveValue('Updated Title')
      expect(screen.getByLabelText(/author display name/i)).toHaveValue('Updated Author')
    })
  })

  describe('External References Management', () => {
    it('should allow adding new external reference', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      await user.click(screen.getByText('Add Reference'))

      // Should now have 3 references (2 existing + 1 new)
      expect(screen.getByText('Reference 3')).toBeInTheDocument()
    })

    it('should allow marking existing reference for deletion', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Click delete on first reference
      const deleteButtons = screen.getAllByText('Delete')
      await user.click(deleteButtons[0])

      // Should show "Marked for deletion"
      await waitFor(() => {
        expect(screen.getByText('(Marked for deletion)')).toBeInTheDocument()
      })

      // Should show "Restore" button
      expect(screen.getByText('Restore')).toBeInTheDocument()
    })

    it('should allow restoring deleted reference', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Mark for deletion
      const deleteButtons = screen.getAllByText('Delete')
      await user.click(deleteButtons[0])

      // Restore
      await user.click(screen.getByText('Restore'))

      await waitFor(() => {
        expect(screen.queryByText('(Marked for deletion)')).not.toBeInTheDocument()
      })
    })

    it('should allow removing new (unsaved) reference', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Add new reference
      await user.click(screen.getByText('Add Reference'))

      // Wait for new reference to appear
      await waitFor(() => {
        expect(screen.getByText('Reference 3')).toBeInTheDocument()
      })

      // Should show "Remove" button for new reference (not "Delete")
      const removeButtons = screen.queryAllByText('Remove')
      expect(removeButtons.length).toBeGreaterThan(0)

      await user.click(removeButtons[0])

      // New reference should be removed
      await waitFor(() => {
        expect(screen.queryByText('Reference 3')).not.toBeInTheDocument()
      })
    })

    it('should allow editing existing reference URL', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      const urlInputs = screen.getAllByLabelText(/^url/i)
      await user.clear(urlInputs[0])
      await user.type(urlInputs[0], 'https://updated.com')

      expect(urlInputs[0]).toHaveValue('https://updated.com')
    })
  })

  describe('Form Submission', () => {
    it('should call mutate with updated book data', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      await user.clear(screen.getByLabelText(/^title/i))
      await user.type(screen.getByLabelText(/^title/i), 'Updated Title')

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      const callArgs = mockMutate.mock.calls[0][0]
      expect(callArgs.bookId).toBe('book-123')
      expect(callArgs.book.title).toBe('Updated Title')
    })

    it('should include updated external references', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Edit existing reference
      const urlInputs = screen.getAllByLabelText(/^url/i)
      await user.clear(urlInputs[0])
      await user.type(urlInputs[0], 'https://updated.com')

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      const callArgs = mockMutate.mock.calls[0][0]
      expect(callArgs.externalReferences.toUpdate).toHaveLength(2)
      expect(callArgs.externalReferences.toUpdate[0].url).toBe('https://updated.com')
    })

    it('should include new external references to add', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Add new reference
      await user.click(screen.getByText('Add Reference'))

      const urlInputs = screen.getAllByLabelText(/^url/i)
      const newUrlInput = urlInputs[urlInputs.length - 1]
      await user.type(newUrlInput, 'https://new-reference.com')

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      const callArgs = mockMutate.mock.calls[0][0]
      expect(callArgs.externalReferences.toAdd).toHaveLength(1)
      expect(callArgs.externalReferences.toAdd[0].url).toBe('https://new-reference.com')
    })

    it('should include references marked for deletion', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      // Mark first reference for deletion
      const deleteButtons = screen.getAllByText('Delete')
      await user.click(deleteButtons[0])

      // Wait for "Marked for deletion" to appear
      await waitFor(() => {
        expect(screen.getByText('(Marked for deletion)')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      const callArgs = mockMutate.mock.calls[0][0]
      expect(callArgs.externalReferences.toDelete).toBeDefined()
      expect(callArgs.externalReferences.toDelete).toEqual(expect.arrayContaining(['ref-1']))
    })

    it('should parse tags from comma-separated string', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      await user.clear(screen.getByLabelText(/tags/i))
      await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2, tag3')

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })

      const callArgs = mockMutate.mock.calls[0][0]
      expect(callArgs.book.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should call onSuccess callback after successful update', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()
      const updatedBook = { ...mockBook, title: 'Updated Title' }

      mockMutate.mockImplementation((_input, { onSuccess: successCallback }) => {
        successCallback(updatedBook)
      })

      renderEditBookForm(mockBook, mockExternalReferences, onSuccess)

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(updatedBook)
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message on update failure', async () => {
      const user = userEvent.setup()

      mockMutate.mockImplementation((_input, { onError }) => {
        onError(new Error('Update failed'))
      })

      renderEditBookForm()

      await user.click(screen.getByText('Save Changes'))

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument()
      })
    })

    it('should show loading state during update', () => {
      mockUseUpdateBook.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      })

      renderEditBookForm()

      const submitButton = screen.getByText('Saving...')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      renderEditBookForm(mockBook, mockExternalReferences, vi.fn(), onCancel)

      await user.click(screen.getByText('Cancel'))

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      renderEditBookForm()

      expect(screen.getByLabelText(/^title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/author display name/i)).toBeInTheDocument()
    })

    // TODO: Fix test isolation issue - test passes in isolation but fails in full suite
    it.skip('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      renderEditBookForm()

      const titleInput = screen.getByLabelText(/^title/i)
      await user.clear(titleInput)

      // Submit the form (trigger validation)
      const form = titleInput.closest('form')
      expect(form).not.toBeNull()

      // Trigger form submission which will show validation errors
      await user.click(screen.getAllByRole('button')[screen.getAllByRole('button').length - 1])

      await waitFor(() => {
        const errorMessage = screen.getByText('Title is required')
        expect(errorMessage).toHaveAttribute('id', 'title-error')
        expect(titleInput).toHaveAttribute('aria-describedby', 'title-error')
      })
    })
  })
})
