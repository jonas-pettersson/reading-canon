import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BookDetailPage } from './BookDetailPage'
import { supabase } from '@/lib/supabase'
import type { BookWithReferences } from '@/features/books/hooks/useBook'

vi.mock('@/lib/supabase')

describe('BookDetailPage', () => {
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
        <MemoryRouter initialEntries={[`/books/${bookId}`]}>
          <Routes>
            <Route path="/books/:id" element={<BookDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Page Rendering', () => {
    it('should render book details when data loads successfully', async () => {
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
        expect(screen.getByText('The Odyssey')).toBeInTheDocument()
      })

      expect(screen.getByText(/Homer/)).toBeInTheDocument()
      expect(screen.getByText('Poetry')).toBeInTheDocument()
    })

    it('should display BookDetail component with fetched data', async () => {
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
        expect(screen.getByRole('heading', { level: 1, name: 'The Odyssey' })).toBeInTheDocument()
      })

      // Verify key metadata is displayed
      expect(screen.getByText(/Ὀδύσσεια/)).toBeInTheDocument()
      expect(screen.getByText('epic')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should display loading indicator while fetching', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(
              () =>
                new Promise(() => {
                  // Never resolves to keep loading state
                })
            ),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should not display book content while loading', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(
              () =>
                new Promise(() => {
                  // Never resolves to keep loading state
                })
            ),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      expect(screen.queryByText('The Odyssey')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Network error'),
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        expect(screen.getByText(/error loading book/i)).toBeInTheDocument()
      })
    })

    it('should display user-friendly error message', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Failed to fetch'),
            }),
          }),
        }),
      } as any)

      renderWithRouter('test-book-id')

      await waitFor(() => {
        const errorMessage = screen.getByText(/error loading book/i)
        expect(errorMessage).toBeInTheDocument()
      })

      // Should not display raw error details
      expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument()
    })
  })

  describe('Not Found State', () => {
    it('should display not found message when book does not exist', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows returned' },
            }),
          }),
        }),
      } as any)

      renderWithRouter('nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText(/book not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should display back button', async () => {
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
        expect(screen.getByText('The Odyssey')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back to collection/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should display edit button', async () => {
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
        expect(screen.getByText('The Odyssey')).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
    })
  })

  describe('Route Parameters', () => {
    it('should extract book ID from route params', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockBook,
            error: null,
          }),
        }),
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: selectMock,
      } as any)

      renderWithRouter('specific-book-id')

      await waitFor(() => {
        expect(screen.getByText('The Odyssey')).toBeInTheDocument()
      })

      // Verify the correct ID was used in the query
      const eqCalls = selectMock().eq.mock.calls
      expect(eqCalls.some((call: any) => call[1] === 'specific-book-id')).toBe(true)
    })

    it('should handle different book IDs correctly', async () => {
      const differentBook: BookWithReferences = {
        ...mockBook,
        id: 'different-id',
        title: 'Different Book',
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: differentBook,
              error: null,
            }),
          }),
        }),
      } as any)

      renderWithRouter('different-id')

      await waitFor(() => {
        expect(screen.getByText('Different Book')).toBeInTheDocument()
      })
    })
  })
})
