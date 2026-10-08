import type { Book } from '@/types/database'
import styles from './BookListItem.module.css'

export interface BookListItemProps {
  book: Book
  onClick?: (bookId: string) => void
}

/**
 * BookListItem component displays a single book in a list.
 *
 * Features:
 * - Displays title, author, year
 * - Shows category badge and tags
 * - Clickable to navigate to detail view
 * - Handles missing optional fields gracefully
 * - Accessible with keyboard navigation
 * - Compact responsive design
 *
 * @example
 * <BookListItem
 *   book={book}
 *   onClick={(id) => navigate(`/books/${id}`)}
 * />
 */
export function BookListItem({ book, onClick }: BookListItemProps) {
  const handleClick = () => {
    onClick?.(book.id)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(book.id)
    }
  }

  // Format year display
  const yearDisplay = book.year_sort
    ? book.year_sort < 0
      ? `${Math.abs(book.year_sort)} BCE`
      : book.year_sort
    : 'Unknown'

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {/* Title and Author */}
      <div className={styles.titleSection}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>
          {book.author_display_name}
          {book.author_lifespan && (
            <span className={styles.authorLifespan}>({book.author_lifespan})</span>
          )}
        </p>
      </div>

      {/* Year and Category */}
      <div className={styles.metaRow}>
        <span className={styles.year}>{yearDisplay}</span>

        {book.primary_category && (
          <span data-testid="category-badge" className={styles.categoryBadge}>
            {book.primary_category}
          </span>
        )}
      </div>

      {/* Tags */}
      {book.tags && book.tags.length > 0 && (
        <div className={styles.tagsRow}>
          {book.tags.map((tag) => (
            <span key={tag} data-testid="tag" className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Original Language */}
      {book.original_language && (
        <div className={styles.year} style={{ marginTop: '0.375rem' }}>
          Original language: {book.original_language}
        </div>
      )}
    </article>
  )
}
