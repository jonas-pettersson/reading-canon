import type { BookWithReferences } from '../hooks/useBook'

export interface BookDetailProps {
  book: BookWithReferences
  onBack?: () => void
  onEdit?: () => void
}

/**
 * BookDetail component displays full details for a single book.
 *
 * Features:
 * - Displays all canonical book metadata
 * - Shows external references as clickable links
 * - Handles missing optional fields gracefully
 * - Back navigation button
 * - Edit button (for Phase 3)
 * - Accessible with proper heading hierarchy
 * - Responsive design
 *
 * @example
 * <BookDetail
 *   book={book}
 *   onBack={() => navigate('/collection')}
 *   onEdit={() => navigate(`/books/${book.id}/edit`)}
 * />
 */
export function BookDetail({ book, onBack, onEdit }: BookDetailProps) {
  // Format year display
  const yearDisplay = book.year_sort
    ? book.year_sort < 0
      ? `${Math.abs(book.year_sort)} BCE`
      : book.year_sort.toString()
    : null

  return (
    <article
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Back to Collection
        </button>
        <button
          onClick={onEdit}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Edit
        </button>
      </div>

      {/* Title Section */}
      <header style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            lineHeight: 1.2,
          }}
        >
          {book.title}
        </h1>
        {book.title_original && (
          <p
            style={{
              fontSize: '1.25rem',
              color: '#666',
              fontStyle: 'italic',
              marginBottom: '1rem',
            }}
          >
            {book.title_original}
          </p>
        )}
      </header>

      {/* Author Section */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Author
        </h2>
        <p style={{ fontSize: '1rem', color: '#333' }}>
          {book.author_display_name}
          {book.author_lifespan && (
            <span style={{ color: '#666', marginLeft: '0.5rem' }}>
              ({book.author_lifespan})
            </span>
          )}
        </p>
      </section>

      {/* Publication Info */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Publication
        </h2>
        <dl style={{ display: 'grid', gap: '0.5rem' }}>
          {book.year_published && (
            <>
              <dt style={{ fontWeight: '600', color: '#666' }}>Year:</dt>
              <dd style={{ margin: 0 }}>
                {book.year_published}
                {yearDisplay && book.year_published !== yearDisplay && (
                  <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                    ({yearDisplay})
                  </span>
                )}
              </dd>
            </>
          )}
          {book.original_language && (
            <>
              <dt style={{ fontWeight: '600', color: '#666' }}>Original Language:</dt>
              <dd style={{ margin: 0 }}>{book.original_language}</dd>
            </>
          )}
        </dl>
      </section>

      {/* Category and Tags */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Classification
        </h2>
        {book.primary_category && (
          <div style={{ marginBottom: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              {book.primary_category}
            </span>
          </div>
        )}
        {book.tags && book.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {book.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#666',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Inclusion Rationale */}
      {book.inclusion_rationale && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}
          >
            Why This Book?
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#333',
            }}
          >
            {book.inclusion_rationale}
          </p>
        </section>
      )}

      {/* Source */}
      {book.source && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}
          >
            Source
          </h2>
          <p style={{ fontSize: '1rem', color: '#333' }}>{book.source}</p>
        </section>
      )}

      {/* External References */}
      {book.external_references && book.external_references.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}
          >
            External References
          </h2>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            {book.external_references.map((ref) => (
              <li key={ref.id}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ textDecoration: 'underline' }}>
                    {ref.link_text || ref.url}
                  </span>
                  {ref.reference_type && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        padding: '0.125rem 0.5rem',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                      }}
                    >
                      {ref.reference_type}
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem' }}>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
