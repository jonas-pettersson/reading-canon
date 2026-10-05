import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditBookPage } from './EditBookPage'
import { supabase } from '@/lib/supabase'
import type { BookWithReferences } from '@/features/books/hooks/useBook'

vi.mock('@/lib/supabase')

describe('EditBookPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const mockBook: BookWithReferences = {
    id: 'test-book-id',
    title: 'The Odyssey',
    author_display_name: 'Homer',
    author_lifespan: 'c. 8th century BCE',
    year_sort: -800,
    year_published: '8th century BCE',
    primary_category: 'Poetry',
    tags: ['epic', 'ancient', 'adventure'],
    original_language: 'Ancient Greek',
    title_original: 'Ὀδύσσεια',
    inclusion_rationale: 'Foundational epic of Western literature',
    family_name: null,
    given_name: null,
    source: 'Project Gutenberg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by_user_id: null,
    external_references: [
      {
        id: 'ref1',
        book_id: 'test-book-id',
        url: 'https://www.gutenberg.org/ebooks/1727',
        link_text: 'Project Gutenberg',
        reference_type: 'Full Text',
        created_at: '2024-01-01T00:00:00Z',
        created_by_user_id: null,
      },
    ],
  }

  const renderWithRouter = (bookId: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/books/${bookId}/edit`]}>
          <Routes>
            <Route path="/books/:id/edit" element={<EditBookPage />} />
            <Route path="/books/:id" element={<div>Book Detail Page</div>} />
            <Route path="/collection" element={<div>Collection Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Page Rendering', () => {
    it('should display loading state while fetching book', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(
              new Promise(() => {}) // Never resolves to simulate loading
            ),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      expect(screen.getByText('Loading book...')).toBeInTheDocument()
    })

    it('should render edit form when book loads successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBook,
              error: null,
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText('Edit Book')).toBeInTheDocument()
      })

      // Check that form is displayed with book data
      expect(screen.getByDisplayValue('The Odyssey')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Homer')).toBeInTheDocument()
    })

    it('should display EditBookForm with book and external references', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBook,
              error: null,
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText('Edit Book')).toBeInTheDocument()
      })

      // Verify external reference is displayed
      expect(screen.getByDisplayValue('https://www.gutenberg.org/ebooks/1727')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error message when book fails to load', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'DATABASE_ERROR' },
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText('Error Loading Book')).toBeInTheDocument()
      })

      expect(
        screen.getByText('There was a problem loading the book details. Please try again later.')
      ).toBeInTheDocument()
    })

    it('should display not found message for non-existent book', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found', code: 'PGRST116' },
            }),
          }),
        }),
      } as any)

      renderWithRouter('non-existent-id')

      await waitFor(() => {
        expect(screen.getByText('Book Not Found')).toBeInTheDocument()
      })

      expect(
        screen.getByText('The book you are trying to edit does not exist.')
      ).toBeInTheDocument()
    })

    it('should display back to collection button on error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'DATABASE_ERROR' },
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText('Error Loading Book')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back to collection/i })
      expect(backButton).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to book detail page on successful save', async () => {
      const user = userEvent.setup()

      // Mock all Supabase calls
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'books') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockBook,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockBook,
                    error: null,
                  }),
                }),
              }),
            }),
          } as any
        }
        if (table === 'external_references') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          } as any
        }
        return {} as any
      })

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText('Edit Book')).toBeInTheDocument()
      })

      // Find and click save button
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      // Should navigate to detail page
      await waitFor(() => {
        expect(screen.getByText('Book Detail Page')).toBeInTheDocument()
      })
    })

    it('should navigate to book detail page on cancel', async () => {
      const user = userEvent.setup()

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBook,
              error: null,
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText('Edit Book')).toBeInTheDocument()
      })

      // Find and click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Should navigate to detail page
      await waitFor(() => {
        expect(screen.getByText('Book Detail Page')).toBeInTheDocument()
      })
    })

    it('should navigate to collection on error when back button is clicked', async () => {
      const user = userEvent.setup()

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found', code: 'PGRST116' },
            }),
          }),
        }),
      } as any)

      renderWithRouter('non-existent-id')

      await waitFor(() => {
        expect(screen.getByText('Book Not Found')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back to collection/i })
      await user.click(backButton)

      // Should navigate to collection page
      await waitFor(() => {
        expect(screen.getByText('Collection Page')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockBook,
              error: null,
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Edit Book' })).toBeInTheDocument()
      })
    })

    it('should have accessible error messages', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found', code: 'PGRST116' },
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1, name: 'Book Not Found' })
        expect(heading).toBeInTheDocument()
      })
    })
  })
})
