import { BookListItem } from './BookListItem'
import { EmptyState } from '@/components/EmptyState'
import type { Book } from '@/types/database'
import styles from './BookList.module.css'

export type ViewMode = 'grid' | 'table'

export interface BookListProps {
  books: Book[]
  isLoading?: boolean
  error?: Error | null
  onBookClick?: (bookId: string) => void
  viewMode?: ViewMode
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  onAddBook?: () => void
}

/**
 * BookList component displays books in grid or table view with loading, empty, and error states.
 *
 * Features:
 * - Grid view: Multi-column card layout (2-4 columns based on screen width)
 * - Table view: Compact table with key information
 * - Loading state with spinner
 * - Empty state with helpful message
 * - Error state with user-friendly message
 * - Accessible markup
 *
 * @example
 * const { data: books, isLoading, error } = useBooks()
 * const [viewMode, setViewMode] = useState<ViewMode>('grid')
 * <BookList
 *   books={books}
 *   isLoading={isLoading}
 *   error={error}
 *   viewMode={viewMode}
 *   onBookClick={(id) => navigate(`/books/${id}`)}
 * />
 */
export function BookList({
  books,
  isLoading,
  error,
  onBookClick,
  viewMode = 'grid',
  hasActiveFilters = false,
  onClearFilters,
  onAddBook,
}: BookListProps) {
  // Error state (prioritize errors over loading)
  if (error) {
    return (
      <div
        role="alert"
        style={{
          padding: '2rem',
          backgroundColor: '#fee',
          color: '#c00',
          border: '1px solid #fcc',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
          Unable to load books
        </h2>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          {error.message || 'Something went wrong. Please try again later.'}
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
        }}
      >
        <div
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <span className="sr-only">Loading books...</span>
      </div>
    )
  }

  // Empty state - distinguish between empty collection and no search results
  if (!books || books.length === 0) {
    // No search results (filters are active)
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon="🔍"
          title="No books match your filters"
          message="Try adjusting your search or filter criteria to find what you're looking for."
          action={
            onClearFilters
              ? {
                  label: 'Clear Filters',
                  onClick: onClearFilters,
                }
              : undefined
          }
        />
      )
    }

    // Empty collection (no books at all)
    return (
      <EmptyState
        icon="📚"
        title="No books in your collection yet"
        message="Get started by adding your first book to the collection."
        action={
          onAddBook
            ? {
                label: 'Add Your First Book',
                onClick: onAddBook,
              }
            : undefined
        }
      />
    )
  }

  // Format year for display
  const formatYear = (book: Book) => {
    if (!book.year_sort) return 'Unknown'
    return book.year_sort < 0 ? `${Math.abs(book.year_sort)} BCE` : book.year_sort
  }

  // Table view
  if (viewMode === 'table') {
    return (
      <table className={styles.tableView}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Year</th>
            <th>Category</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr
              key={book.id}
              onClick={() => onBookClick?.(book.id)}
              tabIndex={onBookClick ? 0 : undefined}
              onKeyPress={(e) => {
                if (onBookClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onBookClick(book.id)
                }
              }}
            >
              <td className={styles.tableTitle}>{book.title}</td>
              <td className={styles.tableAuthor}>
                {book.author_display_name}
                {book.author_lifespan && (
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.25rem' }}>
                    ({book.author_lifespan})
                  </span>
                )}
              </td>
              <td className={styles.tableYear}>{formatYear(book)}</td>
              <td>
                {book.primary_category && (
                  <span className={styles.tableCategory}>{book.primary_category}</span>
                )}
              </td>
              <td className={styles.tableTags}>
                {book.tags && book.tags.length > 0 ? book.tags.slice(0, 3).join(', ') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // Grid view (default)
  return (
    <ul role="list" className={styles.gridView}>
      {books.map((book) => (
        <li key={book.id}>
          <BookListItem book={book} onClick={onBookClick} />
        </li>
      ))}
    </ul>
  )
}
