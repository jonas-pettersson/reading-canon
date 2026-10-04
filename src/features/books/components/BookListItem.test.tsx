import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookListItem } from './BookListItem'
import type { Book } from '@/types/database'

describe('BookListItem', () => {
  const mockBook: Book = {
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
    source: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by_user_id: null,
  }

  describe('Display Content', () => {
    it('should display title, author, and year', () => {
      render(<BookListItem book={mockBook} />)

      expect(screen.getByText('The Iliad')).toBeInTheDocument()
      expect(screen.getByText('Homer')).toBeInTheDocument()
      expect(screen.getByText('800 BCE')).toBeInTheDocument()
    })

    it('should display author lifespan when available', () => {
      render(<BookListItem book={mockBook} />)

      expect(screen.getByText(/c\. 8th century BCE/i)).toBeInTheDocument()
    })

    it('should display positive years correctly', () => {
      const modernBook: Book = {
        ...mockBook,
        title: 'Modern Book',
        year_sort: 1984,
      }

      render(<BookListItem book={modernBook} />)

      expect(screen.getByText('1984')).toBeInTheDocument()
    })

    it('should display "Unknown" when year is missing', () => {
      const bookWithoutYear: Book = {
        ...mockBook,
        year_sort: null,
      }

      render(<BookListItem book={bookWithoutYear} />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
  })

  describe('Category and Tags', () => {
    it('should display category badge', () => {
      render(<BookListItem book={mockBook} />)

      const categoryBadge = screen.getByTestId('category-badge')
      expect(categoryBadge).toBeInTheDocument()
      expect(categoryBadge).toHaveTextContent('Poetry')
    })

    it('should display all tags', () => {
      render(<BookListItem book={mockBook} />)

      const tags = screen.getAllByTestId('tag')
      expect(tags).toHaveLength(3)
      expect(tags[0]).toHaveTextContent('epic')
      expect(tags[1]).toHaveTextContent('ancient')
      expect(tags[2]).toHaveTextContent('war')
    })

    it('should display original language', () => {
      render(<BookListItem book={mockBook} />)

      expect(screen.getByText(/Original language: Ancient Greek/i)).toBeInTheDocument()
    })
  })

  describe('Missing Optional Fields', () => {
    it('should handle missing category gracefully', () => {
      const bookWithoutCategory: Book = {
        ...mockBook,
        primary_category: null,
      }

      render(<BookListItem book={bookWithoutCategory} />)

      expect(screen.queryByTestId('category-badge')).not.toBeInTheDocument()
      // Should still display title
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing tags gracefully', () => {
      const bookWithoutTags: Book = {
        ...mockBook,
        tags: null,
      }

      render(<BookListItem book={bookWithoutTags} />)

      expect(screen.queryByTestId('tag')).not.toBeInTheDocument()
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle empty tags array', () => {
      const bookWithEmptyTags: Book = {
        ...mockBook,
        tags: [],
      }

      render(<BookListItem book={bookWithEmptyTags} />)

      expect(screen.queryByTestId('tag')).not.toBeInTheDocument()
    })

    it('should handle missing original language gracefully', () => {
      const bookWithoutLanguage: Book = {
        ...mockBook,
        original_language: null,
      }

      render(<BookListItem book={bookWithoutLanguage} />)

      expect(screen.queryByText(/Original language:/i)).not.toBeInTheDocument()
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
    })

    it('should handle missing author lifespan gracefully', () => {
      const bookWithoutLifespan: Book = {
        ...mockBook,
        author_lifespan: null,
      }

      render(<BookListItem book={bookWithoutLifespan} />)

      expect(screen.getByText('Homer')).toBeInTheDocument()
      expect(screen.queryByText(/century BCE/i)).not.toBeInTheDocument()
    })

    it('should handle all optional fields missing', () => {
      const minimalBook: Book = {
        ...mockBook,
        author_lifespan: null,
        primary_category: null,
        tags: null,
        original_language: null,
        year_sort: null,
      }

      render(<BookListItem book={minimalBook} />)

      // Should still render with required fields
      expect(screen.getByText('The Iliad')).toBeInTheDocument()
      expect(screen.getByText('Homer')).toBeInTheDocument()
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
  })

  describe('Click Interaction', () => {
    it('should call onClick with book id when clicked', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')
      await user.click(article)

      expect(onClickMock).toHaveBeenCalledWith('1')
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')
      article.focus()
      await user.keyboard('{Enter}')

      expect(onClickMock).toHaveBeenCalledWith('1')
    })

    it('should call onClick when Space key is pressed', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')
      article.focus()
      await user.keyboard(' ')

      expect(onClickMock).toHaveBeenCalledWith('1')
    })

    it('should not be clickable when onClick is not provided', () => {
      render(<BookListItem book={mockBook} />)

      const article = screen.getByRole('article')
      expect(article).not.toHaveAttribute('role', 'button')
      expect(article).not.toHaveAttribute('tabIndex')
    })
  })

  describe('Hover Behavior', () => {
    it('should change background color on mouse enter when clickable', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')
      expect(article).toHaveStyle({ backgroundColor: '' })

      await user.hover(article)

      expect(article).toHaveStyle({ backgroundColor: 'rgb(245, 245, 245)' })
    })

    it('should restore background color on mouse leave', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')

      // Hover then unhover
      await user.hover(article)
      expect(article).toHaveStyle({ backgroundColor: 'rgb(245, 245, 245)' })

      await user.unhover(article)
      // Should restore to initial background (empty string or transparent)
      expect(article.style.backgroundColor).toBe('transparent')
    })

    it('should not change background when not clickable', async () => {
      const user = userEvent.setup()

      render(<BookListItem book={mockBook} />)

      const article = screen.getByRole('article')
      const initialBg = article.style.backgroundColor

      await user.hover(article)

      // Background should not change
      expect(article.style.backgroundColor).toBe(initialBg)
    })
  })

  describe('Accessibility', () => {
    it('should use semantic article element', () => {
      render(<BookListItem book={mockBook} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should be keyboard accessible when clickable', () => {
      const onClickMock = vi.fn()
      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')
      expect(article).toHaveAttribute('tabIndex', '0')
    })

    it('should use heading for title', () => {
      render(<BookListItem book={mockBook} />)

      const heading = screen.getByRole('heading', { name: 'The Iliad' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H3')
    })

    it('should have proper ARIA role when clickable', () => {
      const onClickMock = vi.fn()
      render(<BookListItem book={mockBook} onClick={onClickMock} />)

      const article = screen.getByRole('button')
      expect(article).toHaveAttribute('role', 'button')
    })
  })
})
