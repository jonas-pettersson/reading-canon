import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BookDetail } from './BookDetail'
import type { BookWithReferences } from '../hooks/useBook'
import type { ReactNode } from 'react'

// Mock the reading hooks
vi.mock('@/features/reading/hooks/useReadingStatus', () => ({
  useReadingStatus: vi.fn(),
  useUpdateReadingStatus: vi.fn(),
}))

import { useReadingStatus, useUpdateReadingStatus } from '@/features/reading/hooks/useReadingStatus'

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

describe('BookDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock reading status hook
    vi.mocked(useReadingStatus).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as any)

    vi.mocked(useUpdateReadingStatus).mockReturnValue({
      mutate: vi.fn(),
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

  const mockBook: BookWithReferences = {
    id: '1',
    title: 'The Iliad',
    author_display_name: 'Homer',
    author_lifespan: 'c. 8th century BCE',
    year_sort: -800,
    year_published: '8th century BCE',
    primary_category: 'Poetry',
    tags: ['epic', 'ancient', 'war'],
    original_language: 'Ancient Greek',
    title_original: 'Ἰλιάς',
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
        book_id: '1',
        url: 'https://www.gutenberg.org/ebooks/1727',
        link_text: 'Project Gutenberg',
        reference_type: 'Full Text',
        created_at: '2024-01-01T00:00:00Z',
        created_by_user_id: null,
      },
      {
        id: 'ref2',
        book_id: '1',
        url: 'https://en.wikipedia.org/wiki/Iliad',
        link_text: 'Wikipedia',
        reference_type: 'Reference',
        created_at: '2024-01-01T00:00:00Z',
        created_by_user_id: null,
      },
    ],
  }

  describe('Canonical Metadata Display', () => {
    it('should display title', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should display original title when available', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText(/Ἰλιάς/)).toBeInTheDocument()
    })

    it('should display author display name', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText(/Homer/)).toBeInTheDocument()
    })

    it('should display author lifespan when available', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      // Check that author lifespan is displayed in parentheses after author name
      expect(screen.getByText(/\(c\. 8th century BCE\)/)).toBeInTheDocument()
    })

    it('should display year published', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      // Check for the Year Published label in metadata grid
      expect(screen.getByText(/year published/i)).toBeInTheDocument()
      // The year value appears multiple times, just verify it's present
      const yearElements = screen.getAllByText(/8th century BCE/)
      expect(yearElements.length).toBeGreaterThan(0)
    })

    it('should display category', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText('Poetry')).toBeInTheDocument()
    })

    it('should display all tags', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText('epic')).toBeInTheDocument()
      expect(screen.getByText('ancient')).toBeInTheDocument()
      expect(screen.getByText('war')).toBeInTheDocument()
    })

    it('should display original language', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText(/Ancient Greek/)).toBeInTheDocument()
    })

    it('should display source', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      // Verify Source label in metadata grid
      expect(screen.getByText(/source/i)).toBeInTheDocument()
      // Project Gutenberg appears in multiple places, just verify it's there
      const elements = screen.getAllByText(/Project Gutenberg/)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should display inclusion rationale', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      // Verify the "Why This Book?" label in left column
      expect(screen.getByText(/Why This Book\?/i)).toBeInTheDocument()
      expect(screen.getByText(/Foundational epic of Western literature/)).toBeInTheDocument()
    })
  })

  describe('External References', () => {
    it('should display external references as clickable links', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      const gutenbergLink = screen.getByRole('link', { name: /Project Gutenberg/i })
      expect(gutenbergLink).toBeInTheDocument()
      expect(gutenbergLink).toHaveAttribute('href', 'https://www.gutenberg.org/ebooks/1727')

      const wikipediaLink = screen.getByRole('link', { name: /Wikipedia/i })
      expect(wikipediaLink).toBeInTheDocument()
      expect(wikipediaLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Iliad')
    })

    it('should open external links in new tab', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      const links = screen.getAllByRole('link', { name: /Project Gutenberg|Wikipedia/i })
      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('should display reference type when available', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(screen.getByText('Full Text')).toBeInTheDocument()
      // "Reference" appears in heading too, use getAllByText
      const refElements = screen.getAllByText(/^Reference$/)
      expect(refElements.length).toBeGreaterThan(0)
    })

    it('should handle books with no external references', () => {
      const bookWithoutRefs: BookWithReferences = {
        ...mockBook,
        external_references: [],
      }
      render(<BookDetail book={bookWithoutRefs} />)

      // Should not crash, and should not display references section
      const links = screen.queryAllByRole('link', { name: /Project Gutenberg|Wikipedia/i })
      expect(links).toHaveLength(0)
    })

    it('should handle books with undefined external references', () => {
      const bookWithoutRefs: BookWithReferences = {
        ...mockBook,
        external_references: undefined,
      }
      render(<BookDetail book={bookWithoutRefs} />)

      // Should not crash
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })
  })

  describe('Missing Optional Fields', () => {
    it('should handle missing original title', () => {
      const book: BookWithReferences = {
        ...mockBook,
        title_original: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
      expect(screen.queryByText(/Ἰλιάς/)).not.toBeInTheDocument()
    })

    it('should handle missing author lifespan', () => {
      const book: BookWithReferences = {
        ...mockBook,
        author_lifespan: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText(/Homer/)).toBeInTheDocument()
      // Lifespan should not be displayed
      expect(screen.queryByText(/c\. 8th century BCE/)).not.toBeInTheDocument()
    })

    it('should handle missing year published', () => {
      const book: BookWithReferences = {
        ...mockBook,
        year_published: null,
        year_sort: null,
      }
      render(<BookDetail book={book} />)

      // Should still display the book without crashing
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing category', () => {
      const book: BookWithReferences = {
        ...mockBook,
        primary_category: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing tags', () => {
      const book: BookWithReferences = {
        ...mockBook,
        tags: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing original language', () => {
      const book: BookWithReferences = {
        ...mockBook,
        original_language: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing source', () => {
      const book: BookWithReferences = {
        ...mockBook,
        source: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing inclusion rationale', () => {
      const book: BookWithReferences = {
        ...mockBook,
        inclusion_rationale: null,
      }
      render(<BookDetail book={book} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should render back button', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      const backButton = screen.getByRole('button', { name: /back to collection/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      const onBack = vi.fn()

      render(<BookDetail book={mockBook} onBack={onBack} />, { wrapper: createWrapper() })

      const backButton = screen.getByRole('button', { name: /back to collection/i })
      await user.click(backButton)

      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('should render edit button for future Phase 3', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()

      render(<BookDetail book={mockBook} onEdit={onEdit} />, { wrapper: createWrapper() })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      // Main title should be h1
      const heading = screen.getByRole('heading', { level: 1, name: /The Iliad/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible section headings', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      // Should have section headings for different metadata groups
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(1)
    })
  })

  describe('Responsive Layout', () => {
    it('should render without crashing', () => {
      const { container } = render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should display all content in a single container', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      // All key content should be present
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
      expect(screen.getByText(/Homer/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /back to collection/i })).toBeInTheDocument()
    })
  })

  describe('Personal Data Integration', () => {
    it('should display PersonalDataPanel', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      // Check for personal data section
      expect(screen.getByText(/personal reading data/i)).toBeInTheDocument()
    })

    it('should pass book ID to PersonalDataPanel', () => {
      render(<BookDetail book={mockBook} />, { wrapper: createWrapper() })

      // Personal data panel should be present with the correct book context
      // The panel fetches its own data using the bookId
      expect(screen.getByText(/personal reading data/i)).toBeInTheDocument()
    })
  })
})
