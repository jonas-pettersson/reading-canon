import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']

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
 * - Responsive design
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
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      style={{
        padding: '1rem',
        marginBottom: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#f5f5f5'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {/* Title and Author */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {book.title}
        </h3>
        <p
          style={{
            margin: '0.25rem 0 0 0',
            fontSize: '1rem',
            color: '#666',
          }}
        >
          {book.author_display_name}
          {book.author_lifespan && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>
              ({book.author_lifespan})
            </span>
          )}
        </p>
      </div>

      {/* Year and Category */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.9rem',
            color: '#888',
          }}
        >
          {yearDisplay}
        </span>

        {book.primary_category && (
          <span
            data-testid="category-badge"
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: '#0066cc',
              backgroundColor: '#e6f2ff',
              borderRadius: '3px',
            }}
          >
            {book.primary_category}
          </span>
        )}
      </div>

      {/* Tags */}
      {book.tags && book.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}
        >
          {book.tags.map((tag) => (
            <span
              key={tag}
              data-testid="tag"
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.4rem',
                fontSize: '0.8rem',
                color: '#666',
                backgroundColor: '#f0f0f0',
                borderRadius: '3px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Original Language */}
      {book.original_language && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: '#888',
          }}
        >
          Original language: {book.original_language}
        </div>
      )}
    </article>
  )
}
