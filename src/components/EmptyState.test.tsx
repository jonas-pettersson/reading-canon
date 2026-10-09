import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  describe('Basic Rendering', () => {
    it('should render title and message', () => {
      render(<EmptyState title="No items" message="There are no items to display" />)

      expect(screen.getByText('No items')).toBeInTheDocument()
      expect(screen.getByText('There are no items to display')).toBeInTheDocument()
    })

    it('should render icon when provided', () => {
      render(<EmptyState icon="📚" title="No books" message="Add your first book" />)

      expect(screen.getByText('📚')).toBeInTheDocument()
    })

    it('should not render icon when not provided', () => {
      const { container } = render(<EmptyState title="No items" message="No items found" />)

      expect(container.querySelector('.icon')).not.toBeInTheDocument()
    })
  })

  describe('Primary Action', () => {
    it('should render primary action button when provided', () => {
      const onClick = vi.fn()

      render(
        <EmptyState
          title="No books"
          message="Add your first book"
          action={{ label: 'Add Book', onClick }}
        />
      )

      expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument()
    })

    it('should call onClick when primary action button is clicked', async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()

      render(
        <EmptyState
          title="No books"
          message="Add your first book"
          action={{ label: 'Add Book', onClick }}
        />
      )

      const button = screen.getByRole('button', { name: /add book/i })
      await user.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not render action button when not provided', () => {
      render(<EmptyState title="No items" message="No items found" />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Secondary Action', () => {
    it('should render secondary action button when provided', () => {
      const onClick = vi.fn()

      render(
        <EmptyState
          title="No results"
          message="Try different filters"
          secondaryAction={{ label: 'Clear Filters', onClick }}
        />
      )

      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
    })

    it('should call onClick when secondary action button is clicked', async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()

      render(
        <EmptyState
          title="No results"
          message="Try different filters"
          secondaryAction={{ label: 'Clear Filters', onClick }}
        />
      )

      const button = screen.getByRole('button', { name: /clear filters/i })
      await user.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render both primary and secondary actions', () => {
      const primaryClick = vi.fn()
      const secondaryClick = vi.fn()

      render(
        <EmptyState
          title="No books"
          message="Get started"
          action={{ label: 'Add Book', onClick: primaryClick }}
          secondaryAction={{ label: 'Browse Collection', onClick: secondaryClick }}
        />
      )

      expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /browse collection/i })).toBeInTheDocument()
    })
  })

  describe('Custom Content', () => {
    it('should render custom children when provided', () => {
      render(
        <EmptyState title="No items" message="No items found">
          <p>Custom content here</p>
        </EmptyState>
      )

      expect(screen.getByText('Custom content here')).toBeInTheDocument()
    })

    it('should not render custom content area when no children provided', () => {
      const { container } = render(<EmptyState title="No items" message="No items found" />)

      expect(container.querySelector('.customContent')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(<EmptyState title="No books" message="Add your first book" />)

      expect(screen.getByRole('heading', { name: /no books/i })).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      const onClick = vi.fn()

      render(
        <EmptyState
          title="No books"
          message="Add your first book"
          action={{ label: 'Add Book', onClick }}
        />
      )

      const button = screen.getByRole('button', { name: /add book/i })
      expect(button).toHaveAccessibleName()
    })
  })
})
