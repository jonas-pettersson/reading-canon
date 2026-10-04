import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookList } from './BookList'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']

describe('BookList', () => {
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'The Iliad',
      author_display_name: 'Homer',
      year_sort: -800,
      year_published: '8th century BCE',
      primary_category: 'Poetry',
      tags: ['epic'],
      original_language: 'Ancient Greek',
      title_original: null,
      author_lifespan: null,
      inclusion_rationale: null,
      family_name: null,
      given_name: null,
      source: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by_user_id: null,
    },
    {
      id: '2',
      title: 'The Odyssey',
      author_display_name: 'Homer',
      year_sort: -700,
      year_published: '8th century BCE',
      primary_category: 'Poetry',
      tags: ['epic'],
      original_language: 'Ancient Greek',
      title_original: null,
      author_lifespan: null,
      inclusion_rationale: null,
      family_name: null,
      given_name: null,
      source: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by_user_id: null,
    },
  ]

  describe('Rendering Books', () => {
    it('should render list of books', () => {
      render(<BookList books={mockBooks} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
      expect(screen.getByText('The Odyssey')).toBeInTheDocument()
    })

    it('should render books in a list', () => {
      render(<BookList books={mockBooks} />)

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)
    })

    it('should pass onClick handler to BookListItem', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<BookList books={mockBooks} onBookClick={onClickMock} />)

      const firstBook = screen.getAllByRole('button')[0]
      await user.click(firstBook)

      expect(onClickMock).toHaveBeenCalledWith('1')
    })
  })

  describe('Loading State', () => {
    it('should display loading spinner when isLoading is true', () => {
      render(<BookList books={[]} isLoading={true} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading books...')).toBeInTheDocument()
    })

    it('should not render books while loading', () => {
      render(<BookList books={mockBooks} isLoading={true} />)

      expect(screen.queryByText('The Iliad')).not.toBeInTheDocument()
    })

    it('should have aria-live for loading state', () => {
      render(<BookList books={[]} isLoading={true} />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Empty State', () => {
    it('should display empty state when books array is empty', () => {
      render(<BookList books={[]} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(
        screen.getByText('No books found. Try adjusting your filters.')
      ).toBeInTheDocument()
    })

    it('should display empty state when books is undefined', () => {
      render(<BookList books={undefined as any} />)

      expect(
        screen.getByText('No books found. Try adjusting your filters.')
      ).toBeInTheDocument()
    })

    it('should not display empty state while loading', () => {
      render(<BookList books={[]} isLoading={true} />)

      expect(
        screen.queryByText('No books found. Try adjusting your filters.')
      ).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when error is provided', () => {
      const error = new Error('Database connection failed')

      render(<BookList books={[]} error={error} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Unable to load books')).toBeInTheDocument()
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })

    it('should display generic error message when error has no message', () => {
      const error = new Error()

      render(<BookList books={[]} error={error} />)

      expect(
        screen.getByText('Something went wrong. Please try again later.')
      ).toBeInTheDocument()
    })

    it('should not render books when error is present', () => {
      const error = new Error('Test error')

      render(<BookList books={mockBooks} error={error} />)

      expect(screen.queryByText('The Iliad')).not.toBeInTheDocument()
    })

    it('should prioritize error over loading state', () => {
      const error = new Error('Test error')

      render(<BookList books={[]} isLoading={true} error={error} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.queryByText('Loading books...')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should use semantic list markup', () => {
      render(<BookList books={mockBooks} />)

      const list = screen.getByRole('list')
      expect(list.tagName).toBe('UL')
    })

    it('should have list items for each book', () => {
      render(<BookList books={mockBooks} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(mockBooks.length)
      listItems.forEach((item) => {
        expect(item.tagName).toBe('LI')
      })
    })

    it('should use role="alert" for error state', () => {
      const error = new Error('Test error')

      render(<BookList books={[]} error={error} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should use role="status" for loading state', () => {
      render(<BookList books={[]} isLoading={true} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should use role="status" for empty state', () => {
      render(<BookList books={[]} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
})
