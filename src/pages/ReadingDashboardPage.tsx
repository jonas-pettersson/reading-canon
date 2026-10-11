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

  // Split want-to-read books by ownership status
  const ownedBooks = wantToReadBooks.filter(
    (book) => book.ownership_status === 'owned_physical' || book.ownership_status === 'owned_digital'
  )
  const notOwnedBooks = wantToReadBooks.filter(
    (book) => book.ownership_status !== 'owned_physical' && book.ownership_status !== 'owned_digital'
  )

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

      {/* On Your Shelf Section (Want to Read + Owned) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>On Your Shelf</h2>
        <p className={styles.sectionSubtitle}>Books you want to read that you already own</p>
        {ownedBooks.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No owned books in your Want to Read list"
            message="Mark owned books as 'Want to Read' to see them here. These are books you can start reading right away!"
            action={{
              label: 'Browse Collection',
              onClick: () => navigate('/'),
            }}
          />
        ) : (
          <div className={styles.cardList}>
            {ownedBooks.map((book) => (
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

      {/* To Acquire Section (Want to Read + Not Owned) */}
      <section>
        <h2 className={styles.sectionTitle}>To Acquire</h2>
        <p className={styles.sectionSubtitle}>Books you want to read but need to acquire</p>
        {notOwnedBooks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No books to acquire"
            message="Books you want to read but don't own yet will appear here."
          />
        ) : (
          <div className={styles.cardList}>
            {notOwnedBooks.map((book) => (
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
