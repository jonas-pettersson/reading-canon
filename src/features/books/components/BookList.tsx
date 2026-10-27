import { useRef, useCallback, useEffect, useState } from 'react'
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
  // Track focused book index for keyboard navigation (roving tabindex pattern)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef<HTMLUListElement | HTMLTableElement>(null)
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map())

  // Reset focused index when books change
  useEffect(() => {
    setFocusedIndex(0)
  }, [books])

  // Calculate number of columns in grid view (for 2D navigation)
  const getGridColumns = useCallback(() => {
    if (!containerRef.current || viewMode !== 'grid') return 1

    // Get computed style to find actual column count
    const gridElement = containerRef.current
    const computedStyle = window.getComputedStyle(gridElement)
    const columnCount = computedStyle.gridTemplateColumns.split(' ').length
    return columnCount || 1
  }, [viewMode])

  // Handle arrow key navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!books || books.length === 0) return

    const totalBooks = books.length
    let nextIndex = focusedIndex

    if (viewMode === 'grid') {
      // 2D navigation for grid view
      const columns = getGridColumns()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = focusedIndex + columns
          if (nextIndex >= totalBooks) {
            // Wrap to first row, same column
            nextIndex = focusedIndex % columns
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = focusedIndex - columns
          if (nextIndex < 0) {
            // Wrap to last row, same column
            const lastRowStart = Math.floor((totalBooks - 1) / columns) * columns
            nextIndex = lastRowStart + (focusedIndex % columns)
            if (nextIndex >= totalBooks) {
              // If that position doesn't exist, go to previous row
              nextIndex = nextIndex - columns
            }
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = (focusedIndex + 1) % totalBooks
          break
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = (focusedIndex - 1 + totalBooks) % totalBooks
          break
        default:
          return // Don't prevent default for other keys
      }
    } else {
      // Linear navigation for table view
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = (focusedIndex + 1) % totalBooks
          break
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = (focusedIndex - 1 + totalBooks) % totalBooks
          break
        default:
          return
      }
    }

    setFocusedIndex(nextIndex)
    // Focus the new element
    const nextElement = itemRefs.current.get(nextIndex)
    if (nextElement) {
      nextElement.focus()
    }
  }, [books, focusedIndex, viewMode, getGridColumns])

  // Register item ref for keyboard navigation
  const setItemRef = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(index, element)
    } else {
      itemRefs.current.delete(index)
    }
  }, [])

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

  // Format year for display (hide if missing)
  const formatYear = (book: Book) => {
    if (!book.year_sort) return ''
    return book.year_sort < 0 ? `${Math.abs(book.year_sort)} BCE` : book.year_sort.toString()
  }

  // Table view
  if (viewMode === 'table') {
    return (
      <table className={styles.tableView} ref={containerRef as React.RefObject<HTMLTableElement>}>
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
          {books.map((book, index) => (
            <tr
              key={book.id}
              ref={(el) => setItemRef(index, el)}
              onClick={() => onBookClick?.(book.id)}
              tabIndex={onBookClick ? (index === focusedIndex ? 0 : -1) : undefined}
              onKeyDown={handleKeyDown}
              onKeyPress={(e) => {
                if (onBookClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onBookClick(book.id)
                }
              }}
              onFocus={() => setFocusedIndex(index)}
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
    <ul
      role="list"
      className={styles.gridView}
      ref={containerRef as React.RefObject<HTMLUListElement>}
    >
      {books.map((book, index) => (
        <li key={book.id}>
          <BookListItem
            book={book}
            onClick={onBookClick}
            tabIndex={onBookClick ? (index === focusedIndex ? 0 : -1) : undefined}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocusedIndex(index)}
            ref={(el) => setItemRef(index, el)}
          />
        </li>
      ))}
    </ul>
  )
}
