import { BookListItem } from './BookListItem'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']

export interface BookListProps {
  books: Book[]
  isLoading?: boolean
  error?: Error | null
  onBookClick?: (bookId: string) => void
}

/**
 * BookList component displays a list of books with loading, empty, and error states.
 *
 * Features:
 * - Renders books using BookListItem
 * - Loading state with spinner
 * - Empty state with helpful message
 * - Error state with user-friendly message
 * - Accessible list markup (ul/li)
 *
 * @example
 * const { data: books, isLoading, error } = useBooks()
 * <BookList
 *   books={books}
 *   isLoading={isLoading}
 *   error={error}
 *   onBookClick={(id) => navigate(`/books/${id}`)}
 * />
 */
export function BookList({ books, isLoading, error, onBookClick }: BookListProps) {
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

  // Empty state
  if (!books || books.length === 0) {
    return (
      <div
        role="status"
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#666',
        }}
      >
        <p style={{ fontSize: '1.1rem', margin: 0 }}>
          No books found. Try adjusting your filters.
        </p>
      </div>
    )
  }

  // Books list
  return (
    <ul
      role="list"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      {books.map((book) => (
        <li key={book.id}>
          <BookListItem book={book} onClick={onBookClick} />
        </li>
      ))}
    </ul>
  )
}
