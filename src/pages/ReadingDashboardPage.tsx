import { Link, useNavigate } from 'react-router-dom'
import { useReadingBooks, useWantToReadBooks } from '@/features/reading/hooks/useReadingDashboard'
import { useUpdateReadingStatus } from '@/features/reading/hooks/useReadingStatus'
import { EmptyState } from '@/components/EmptyState'
import type { ReadingBook } from '@/features/reading/hooks/useReadingDashboard'
import type { Database } from '@/types/database'
import styles from './ReadingDashboardPage.module.css'

type ReadingStatus = Database['public']['Enums']['reading_status_enum']

/**
 * Reading Dashboard Page
 *
 * Primary page for reader workflow (UC-001, UC-002):
 * - View books currently reading
 * - View books in want-to-read list
 * - Quick actions to update status
 * - Mobile-optimized per UX-011
 */
export function ReadingDashboardPage() {
  const navigate = useNavigate()
  const readingQuery = useReadingBooks()
  const wantToReadQuery = useWantToReadBooks()
  const updateStatus = useUpdateReadingStatus()

  const isLoading = readingQuery.isLoading || wantToReadQuery.isLoading

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Reading Dashboard</h1>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  const readingBooks = readingQuery.data || []
  const wantToReadBooks = wantToReadQuery.data || []

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Reading Dashboard</h1>

      {/* Currently Reading Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Currently Reading</h2>
        {readingBooks.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No books currently reading"
            message="Start reading a book from your collection or Want to Read list to track your progress here."
            action={{
              label: 'Browse Collection',
              onClick: () => navigate('/'),
            }}
          />
        ) : (
          <div className={styles.cardList}>
            {readingBooks.map((book) => (
              <ReadingBookCard
                key={book.id}
                book={book}
                onStatusChange={(status) =>
                  updateStatus.mutate({
                    bookId: book.id,
                    updates: { reading_status: status },
                  })
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Want to Read Section */}
      <section>
        <h2 className={styles.sectionTitle}>Want to Read</h2>
        {wantToReadBooks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Want to Read list is empty"
            message="Add books from your collection that you'd like to read next. This helps you decide what to read!"
            action={{
              label: 'Browse Collection',
              onClick: () => navigate('/'),
            }}
          />
        ) : (
          <div className={styles.cardList}>
            {wantToReadBooks.map((book) => (
              <WantToReadBookCard
                key={book.id}
                book={book}
                onStatusChange={(status) =>
                  updateStatus.mutate({
                    bookId: book.id,
                    updates: { reading_status: status },
                  })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/**
 * Card for books currently being read
 */
function ReadingBookCard({
  book,
  onStatusChange,
}: {
  book: ReadingBook
  onStatusChange: (status: ReadingStatus) => void
}) {
  return (
    <div className={styles.bookCard}>
      <div className={styles.bookCardContent}>
        <div className={styles.bookInfo}>
          <Link to={`/books/${book.id}`} className={styles.bookLink}>
            {book.title}
          </Link>
          <p className={styles.bookAuthor}>
            {book.author_display_name}
            {book.year_sort && ` (${book.year_sort})`}
          </p>
          {book.started_at && (
            <p className={styles.bookMeta}>
              Started: {new Date(book.started_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className={styles.actionButtons}>
          <button
            onClick={() => onStatusChange('finished')}
            className={styles.buttonSuccess}
            aria-label="Mark as Finished"
          >
            Mark as Finished
          </button>
          <button
            onClick={() => onStatusChange('paused')}
            className={styles.buttonWarning}
            aria-label="Mark as Paused"
          >
            Mark as Paused
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Card for books in want-to-read list
 */
function WantToReadBookCard({
  book,
  onStatusChange,
}: {
  book: ReadingBook
  onStatusChange: (status: ReadingStatus) => void
}) {
  return (
    <div className={styles.bookCard}>
      <div className={styles.bookCardContent}>
        <div className={styles.bookInfo}>
          <Link to={`/books/${book.id}`} className={styles.bookLink}>
            {book.title}
          </Link>
          <p className={styles.bookAuthor}>
            {book.author_display_name}
            {book.year_sort && ` (${book.year_sort})`}
          </p>
        </div>
        <button
          onClick={() => onStatusChange('reading')}
          className={styles.buttonPrimary}
          aria-label="Mark as Reading"
        >
          Mark as Reading
        </button>
      </div>
    </div>
  )
}
