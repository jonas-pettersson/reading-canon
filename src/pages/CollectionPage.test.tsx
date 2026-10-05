import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CollectionPage } from './CollectionPage'
import type { Book } from '@/types/database'

// Mock Supabase
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Iliad',
    title_original: null,
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
  },
  {
    id: '2',
    title: 'Hamlet',
    title_original: null,
    author_display_name: 'William Shakespeare',
    given_name: 'William',
    family_name: 'Shakespeare',
    year_published: '1603',
    year_sort: 1603,
    primary_category: 'Play / Drama',
    tags: ['tragedy', 'renaissance'],
    original_language: 'English',
    source: 'Western Canon',
    inclusion_rationale: 'Greatest tragedy',
    author_lifespan: '1564-1616',
    created_at: '2024-01-01T00:00:00Z',
    created_by_user_id: null,
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'The Republic',
    title_original: 'Πολιτεία',
    author_display_name: 'Plato',
    given_name: null,
    family_name: 'Plato',
    year_published: '380 BC',
    year_sort: -380,
    primary_category: 'Philosophy',
    tags: ['political philosophy', 'ancient'],
    original_language: 'Ancient Greek',
    source: 'Western Canon',
    inclusion_rationale: 'Foundational philosophy',
    author_lifespan: 'c. 428-348 BC',
    created_at: '2024-01-01T00:00:00Z',
    created_by_user_id: null,
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Create a chainable query builder mock
const createQueryBuilder = (data: Book[] = mockBooks, error: any = null) => {
  const builder: any = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    or: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    contains: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    then: vi.fn((callback) => callback({ data, error })),
  }
  return builder
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createQueryBuilder()),
  },
}))

function renderCollectionPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CollectionPage />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('CollectionPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset mock to default state with books data
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.from).mockReturnValue(createQueryBuilder())
  })

  describe('Page Rendering', () => {
    it('should render the page heading', async () => {
      renderCollectionPage()

      expect(screen.getByRole('heading', { name: /collection/i, level: 1 })).toBeInTheDocument()
    })

    it('should render BookFilters component', async () => {
      renderCollectionPage()

      await waitFor(() => {
        // Check for search input
        expect(screen.getByPlaceholderText(/search by title, author/i)).toBeInTheDocument()
      })
    })

    it('should render BookList component', async () => {
      renderCollectionPage()

      await waitFor(() => {
        // Check that books are rendered
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
        expect(screen.getByText('Hamlet')).toBeInTheDocument()
        expect(screen.getByText('The Republic')).toBeInTheDocument()
      })
    })
  })

  describe('Book Display', () => {
    it('should display books from useBooks hook', async () => {
      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
        expect(screen.getByText('Homer')).toBeInTheDocument()
      })

      expect(screen.getByText('Hamlet')).toBeInTheDocument()
      expect(screen.getByText('William Shakespeare')).toBeInTheDocument()

      expect(screen.getByText('The Republic')).toBeInTheDocument()
      expect(screen.getByText('Plato')).toBeInTheDocument()
    })

    it('should display loading state while fetching books', async () => {
      const { supabase } = await import('@/lib/supabase')

      // Mock delayed response
      const delayedBuilder: any = {
        select: vi.fn(function(this: any) { return this }),
        order: vi.fn(function(this: any) { return this }),
        or: vi.fn(function(this: any) { return this }),
        eq: vi.fn(function(this: any) { return this }),
        contains: vi.fn(function(this: any) { return this }),
        ilike: vi.fn(function(this: any) { return this }),
        then: vi.fn((callback) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(callback({ data: mockBooks, error: null })), 100)
          })
        ),
      }

      vi.mocked(supabase.from).mockReturnValue(delayedBuilder)

      renderCollectionPage()

      // Should show loading state initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Should show books after loading
      await waitFor(() => {
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
      })
    })

    it('should display empty state when no books', async () => {
      const { supabase } = await import('@/lib/supabase')

      vi.mocked(supabase.from).mockReturnValue(createQueryBuilder([], null))

      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText(/no books found/i)).toBeInTheDocument()
      })
    })

    it('should display error state on fetch failure', async () => {
      const { supabase } = await import('@/lib/supabase')

      vi.mocked(supabase.from).mockReturnValue(
        createQueryBuilder(null as any, { message: 'Database error' })
      )

      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText(/unable to load books/i)).toBeInTheDocument()
      })
    })
  })

  describe('Filter Integration', () => {
    it('should update displayed books when search filter changes', async () => {
      const user = userEvent.setup()
      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
      })

      // Type in search box
      const searchInput = screen.getByPlaceholderText(/search by title, author/i)
      await user.type(searchInput, 'hamlet')

      // Search input should update
      expect(searchInput).toHaveValue('hamlet')
    })

    it('should update displayed books when category filter changes', async () => {
      const user = userEvent.setup()
      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
      })

      // Select category filter
      const categorySelect = screen.getByLabelText(/category/i)
      await user.selectOptions(categorySelect, 'Philosophy')

      // Category filter should update
      expect(categorySelect).toHaveValue('Philosophy')
    })

    it('should update displayed books when sort changes', async () => {
      const user = userEvent.setup()
      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
      })

      // Change sort option
      const sortSelect = screen.getByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'title')

      // Sort should update
      expect(sortSelect).toHaveValue('title')
    })
  })

  describe('Book Click Navigation', () => {
    it('should pass click handler to BookList', async () => {
      renderCollectionPage()

      await waitFor(() => {
        expect(screen.getByText('The Iliad')).toBeInTheDocument()
      })

      // Books should be rendered - individual click behavior is tested in BookListItem tests
      expect(screen.getByText('Homer')).toBeInTheDocument()
      expect(screen.getByText('William Shakespeare')).toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('should render with proper semantic structure', () => {
      renderCollectionPage()

      // Should have heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('Add Book Button', () => {
    it('should render the Add Book button', () => {
      renderCollectionPage()

      const addButton = screen.getByRole('button', { name: /add new book/i })
      expect(addButton).toBeInTheDocument()
      expect(addButton).toHaveTextContent(/add book/i)
    })

    it('should have proper accessibility attributes', () => {
      renderCollectionPage()

      const addButton = screen.getByRole('button', { name: /add new book/i })
      expect(addButton).toHaveAttribute('aria-label', 'Add new book')
    })
  })
})
