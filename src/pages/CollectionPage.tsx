import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookFilters } from '@/features/books/components/BookFilters'
import { BookList } from '@/features/books/components/BookList'
import { useBooks } from '@/features/books/hooks/useBooks'
import type { BookFiltersState } from '@/features/books/components/BookFilters'

/**
 * CollectionPage - Main page for browsing the book collection
 *
 * Integrates:
 * - BookFilters for search, filtering, and sorting
 * - BookList for displaying books with loading/empty/error states
 * - useBooks hook for data fetching
 * - Navigation to book detail pages
 */
export function CollectionPage() {
  const navigate = useNavigate()

  // Filter state management
  const [filters, setFilters] = useState<BookFiltersState>({
    search: '',
    category: '',
    tags: [],
    originalLanguage: '',
    readingStatus: '',
    ownershipStatus: '',
    sortBy: 'year',
    sortOrder: 'asc',
  })

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

  return (
    <div className="collection-page">
      <div className="page-header">
        <h1 className="page-heading">Collection</h1>
        <button
          className="add-book-button"
          onClick={() => navigate('/books/new')}
          aria-label="Add new book"
        >
          + Add Book
        </button>
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
          onBookClick={handleBookClick}
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
          margin-bottom: 2rem;
        }

        .page-heading {
          font-size: 2rem;
          font-weight: 600;
          margin: 0;
          color: #2c3e50;
        }

        .add-book-button {
          padding: 0.75rem 1.5rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
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
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
            font-size: 1.5rem;
          }

          .add-book-button {
            width: 100%;
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
          }

          .filters-section {
            padding: 1rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
