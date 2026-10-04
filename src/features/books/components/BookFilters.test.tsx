import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BookFilters, type BookFiltersState, PRIMARY_CATEGORIES, READING_STATUSES, OWNERSHIP_STATUSES } from './BookFilters'

describe('BookFilters', () => {
  const defaultFilters: BookFiltersState = {
    search: '',
    category: '',
    tags: [],
    originalLanguage: '',
    readingStatus: '',
    ownershipStatus: '',
    sortBy: 'year',
    sortOrder: 'asc',
  }

  describe('Rendering', () => {
    it('should render all filter controls', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Check all controls are present
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Tags')).toBeInTheDocument()
      expect(screen.getByLabelText('Original Language')).toBeInTheDocument()
      expect(screen.getByLabelText('Reading Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Ownership')).toBeInTheDocument()
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
      expect(screen.getByLabelText('Order')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument()
    })

    it('should render all category options', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      PRIMARY_CATEGORIES.forEach((category) => {
        expect(screen.getByRole('option', { name: category })).toBeInTheDocument()
      })
    })

    it('should render all reading status options', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      READING_STATUSES.forEach((status) => {
        expect(screen.getByRole('option', { name: status })).toBeInTheDocument()
      })
    })

    it('should render all ownership status options', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      OWNERSHIP_STATUSES.forEach((status) => {
        expect(screen.getByRole('option', { name: status })).toBeInTheDocument()
      })
    })
  })

  describe('Filter Updates', () => {
    it('should call onFiltersChange when category changes', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const categorySelect = screen.getByLabelText('Category')
      fireEvent.change(categorySelect, { target: { value: 'Poetry' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: 'Poetry',
      })
    })

    it('should call onFiltersChange when reading status changes', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const statusSelect = screen.getByLabelText('Reading Status')
      fireEvent.change(statusSelect, { target: { value: 'Reading' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        readingStatus: 'Reading',
      })
    })

    it('should call onFiltersChange when ownership status changes', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const ownershipSelect = screen.getByLabelText('Ownership')
      fireEvent.change(ownershipSelect, { target: { value: 'Owned Physical' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        ownershipStatus: 'Owned Physical',
      })
    })

    it('should call onFiltersChange when sort by changes', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const sortBySelect = screen.getByLabelText('Sort By')
      fireEvent.change(sortBySelect, { target: { value: 'title' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: 'title',
      })
    })

    it('should call onFiltersChange when sort order changes', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const sortOrderSelect = screen.getByLabelText('Order')
      fireEvent.change(sortOrderSelect, { target: { value: 'desc' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortOrder: 'desc',
      })
    })
  })

  describe('Clear Filters', () => {
    it('should disable clear button when no filters are active', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const clearButton = screen.getByRole('button', { name: 'Clear Filters' })
      expect(clearButton).toBeDisabled()
    })

    it('should enable clear button when search filter is active', () => {
      const mockOnFiltersChange = vi.fn()
      const activeFilters: BookFiltersState = {
        ...defaultFilters,
        search: 'Homer',
      }

      render(
        <BookFilters
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const clearButton = screen.getByRole('button', { name: 'Clear Filters' })
      expect(clearButton).not.toBeDisabled()
    })

    it('should enable clear button when category filter is active', () => {
      const mockOnFiltersChange = vi.fn()
      const activeFilters: BookFiltersState = {
        ...defaultFilters,
        category: 'Poetry',
      }

      render(
        <BookFilters
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const clearButton = screen.getByRole('button', { name: 'Clear Filters' })
      expect(clearButton).not.toBeDisabled()
    })

    it('should reset all filters when clicked', () => {
      const mockOnFiltersChange = vi.fn()
      const activeFilters: BookFiltersState = {
        search: 'Homer',
        category: 'Poetry',
        tags: ['epic'],
        originalLanguage: 'Ancient Greek',
        readingStatus: 'Reading',
        ownershipStatus: 'Owned Physical',
        sortBy: 'title',
        sortOrder: 'desc',
      }

      render(
        <BookFilters
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const clearButton = screen.getByRole('button', { name: 'Clear Filters' })
      fireEvent.click(clearButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultFilters)
    })
  })

  describe('Accessibility', () => {
    it('should have labels for all form controls', () => {
      const mockOnFiltersChange = vi.fn()

      render(
        <BookFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Tags')).toBeInTheDocument()
      expect(screen.getByLabelText('Original Language')).toBeInTheDocument()
      expect(screen.getByLabelText('Reading Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Ownership')).toBeInTheDocument()
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
      expect(screen.getByLabelText('Order')).toBeInTheDocument()
    })
  })
})
