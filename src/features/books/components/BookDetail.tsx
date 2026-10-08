import type { BookWithReferences } from '../hooks/useBook'
import { PersonalDataPanel } from '@/features/reading/components/PersonalDataPanel'
import styles from './BookDetail.module.css'

export interface BookDetailProps {
  book: BookWithReferences
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

/**
 * BookDetail component displays full details for a single book in a compact two-column layout.
 *
 * Features:
 * - Compact two-column metadata grid
 * - Inline labels (no large section headings)
 * - Tight spacing - fits more on screen
 * - All canonical book metadata
 * - External references as clickable links
 * - Personal reading data panel
 * - Responsive (single column on mobile)
 *
 * @example
 * <BookDetail
 *   book={book}
 *   onBack={() => navigate('/collection')}
 *   onEdit={() => navigate(`/books/${book.id}/edit`)}
 *   onDelete={() => handleDelete()}
 * />
 */
export function BookDetail({ book, onBack, onEdit, onDelete }: BookDetailProps) {
  // Format year display
  const yearDisplay = book.year_sort
    ? book.year_sort < 0
      ? `${Math.abs(book.year_sort)} BCE`
      : book.year_sort.toString()
    : null

  return (
    <article className={styles.container}>
      {/* Action buttons */}
      <div className={styles.actions}>
        <button onClick={onBack} className={`${styles.button} ${styles.buttonBack}`}>
          ← Back to Collection
        </button>
        <button onClick={onEdit} className={`${styles.button} ${styles.buttonEdit}`}>
          Edit
        </button>
        <button onClick={onDelete} className={`${styles.button} ${styles.buttonDelete}`}>
          Delete
        </button>
      </div>

      {/* Title */}
      <header className={styles.header}>
        <h1 className={styles.title}>{book.title}</h1>
        {book.title_original && (
          <p className={styles.titleOriginal}>{book.title_original}</p>
        )}
      </header>

      {/* Two-Column Metadata Grid */}
      <div className={styles.metadata}>
        {/* Author */}
        <div className={styles.metadataItem}>
          <span className={styles.label}>Author</span>
          <span className={styles.value}>
            {book.author_display_name}
            {book.author_lifespan && (
              <span className={styles.valueSecondary}> ({book.author_lifespan})</span>
            )}
          </span>
        </div>

        {/* Year */}
        {book.year_published && (
          <div className={styles.metadataItem}>
            <span className={styles.label}>Year Published</span>
            <span className={styles.value}>
              {book.year_published}
              {yearDisplay && book.year_published !== yearDisplay && (
                <span className={styles.valueSecondary}> ({yearDisplay})</span>
              )}
            </span>
          </div>
        )}

        {/* Original Language */}
        {book.original_language && (
          <div className={styles.metadataItem}>
            <span className={styles.label}>Original Language</span>
            <span className={styles.value}>{book.original_language}</span>
          </div>
        )}

        {/* Source */}
        {book.source && (
          <div className={styles.metadataItem}>
            <span className={styles.label}>Source</span>
            <span className={styles.value}>{book.source}</span>
          </div>
        )}
      </div>

      {/* Classification: Category + Tags */}
      {(book.primary_category || (book.tags && book.tags.length > 0)) && (
        <div className={styles.classification}>
          <div className={styles.classificationContent}>
            {book.primary_category && (
              <span className={styles.categoryBadge}>{book.primary_category}</span>
            )}
            {book.tags && book.tags.length > 0 && (
              <>
                {book.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Inclusion Rationale */}
      {book.inclusion_rationale && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why This Book?</h2>
          <p className={styles.sectionContent}>{book.inclusion_rationale}</p>
        </section>
      )}

      {/* External References */}
      {book.external_references && book.external_references.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>External References</h2>
          <ul className={styles.referencesList}>
            {book.external_references.map((ref) => (
              <li key={ref.id}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.referenceLink}
                >
                  <span>{ref.link_text || ref.url}</span>
                  {ref.reference_type && (
                    <span className={styles.referenceType}>{ref.reference_type}</span>
                  )}
                  <span className={styles.externalIcon}>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Personal Reading Data */}
      <section className={styles.personalData}>
        <PersonalDataPanel bookId={book.id} />
      </section>
    </article>
  )
}
