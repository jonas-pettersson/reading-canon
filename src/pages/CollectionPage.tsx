import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookFilters } from '@/features/books/components/BookFilters'
import { BookList, type ViewMode } from '@/features/books/components/BookList'
import { useBooks } from '@/features/books/hooks/useBooks'
import type { BookFiltersState } from '@/features/books/components/BookFilters'

/**
 * CollectionPage - Main page for browsing the book collection
 *
 * Integrates:
 * - BookFilters for search, filtering, and sorting
 * - BookList for displaying books with loading/empty/error states (grid or table view)
 * - View mode toggle with localStorage persistence
 * - useBooks hook for data fetching
 * - Navigation to book detail pages
 */
export function CollectionPage() {
  const navigate = useNavigate()

  // View mode state (persisted in localStorage)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('bookListViewMode')
    return (saved === 'grid' || saved === 'table') ? saved : 'grid'
  })

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('bookListViewMode', viewMode)
  }, [viewMode])

  // Filter state management (persisted in localStorage)
  const [filters, setFilters] = useState<BookFiltersState>(() => {
    const saved = localStorage.getItem('bookListFilters')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // If parsing fails, return default
      }
    }
    return {
      search: '',
      category: '',
      tags: [],
      originalLanguage: '',
      readingStatus: '',
      ownershipStatus: '',
      sortBy: 'year',
      sortOrder: 'asc',
    }
  })

  // Persist filter state
  useEffect(() => {
    localStorage.setItem('bookListFilters', JSON.stringify(filters))
  }, [filters])

  // Fetch books with current filters
  const { data: books, isLoading, error } = useBooks({
    search: filters.search || undefined,
    category: filters.category || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    originalLanguage: filters.originalLanguage || undefined,
    readingStatus: filters.readingStatus || undefined,
    ownershipStatus: filters.ownershipStatus || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })

  // Handle filter changes from BookFilters component
  const handleFiltersChange = (newFilters: BookFiltersState) => {
    setFilters(newFilters)
  }

  // Handle book click - navigate to detail page
  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`)
  }

  // Check if any filters are active
  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    filters.tags.length > 0 ||
    Boolean(filters.originalLanguage) ||
    Boolean(filters.readingStatus) ||
    Boolean(filters.ownershipStatus)

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      tags: [],
      originalLanguage: '',
      readingStatus: '',
      ownershipStatus: '',
      sortBy: 'year',
      sortOrder: 'asc',
    })
  }

  return (
    <div className="collection-page">
      <div className="page-header">
        <h1 className="page-heading">Collection</h1>
        <div className="header-actions">
          {/* View Mode Toggle */}
          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
              title="Table view"
            >
              ≡ Table
            </button>
          </div>
          <button
            className="add-book-button"
            onClick={() => navigate('/books/new')}
            aria-label="Add new book"
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <BookFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Books List Section */}
      <div className="books-section">
        <BookList
          books={books || []}
          isLoading={isLoading}
          error={error}
          viewMode={viewMode}
          onBookClick={handleBookClick}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onAddBook={() => navigate('/books/new')}
        />
      </div>

      <style>{`
        .collection-page {
          width: 100%;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .page-heading {
          font-size: var(--font-2xl);
          font-weight: 600;
          margin: 0;
          color: #2c3e50;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .view-toggle {
          display: flex;
          gap: 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .view-button {
          padding: 0.5rem 0.75rem;
          background-color: white;
          color: #666;
          border: none;
          border-right: 1px solid #ddd;
          font-size: var(--font-base);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-button:last-child {
          border-right: none;
        }

        .view-button:hover {
          background-color: #f5f5f5;
          color: #333;
        }

        .view-button.active {
          background-color: #2563eb;
          color: white;
        }

        .view-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
          z-index: 1;
        }

        .add-book-button {
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: var(--font-base);
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .add-book-button:hover {
          background-color: #1d4ed8;
        }

        .add-book-button:active {
          background-color: #1e40af;
        }

        .add-book-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .filters-section {
          margin-bottom: 0.75rem;
        }

        .books-section {
          min-height: 400px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .page-heading {
            font-size: var(--font-2xl);
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
            gap: 0.5rem;
          }

          .view-toggle {
            width: 100%;
          }

          .view-button {
            flex: 1;
            padding: 0.625rem;
            font-size: var(--font-base);
            text-align: center;
          }

          .add-book-button {
            width: 100%;
            padding: 0.625rem 1rem;
            font-size: var(--font-base);
          }

          .filters-section {
            padding: 1rem;
            margin-bottom: 1rem;
          }

          .books-section {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  )
}
