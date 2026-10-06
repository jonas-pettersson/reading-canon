import { Link } from 'react-router-dom'
import { useReadingBooks, useWantToReadBooks } from '@/features/reading/hooks/useReadingDashboard'
import { useUpdateReadingStatus } from '@/features/reading/hooks/useReadingStatus'
import type { ReadingBook } from '@/features/reading/hooks/useReadingDashboard'
import type { Database } from '@/types/database'

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
  const readingQuery = useReadingBooks()
  const wantToReadQuery = useWantToReadBooks()
  const updateStatus = useUpdateReadingStatus()

  const isLoading = readingQuery.isLoading || wantToReadQuery.isLoading

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Reading Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const readingBooks = readingQuery.data || []
  const wantToReadBooks = wantToReadQuery.data || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Reading Dashboard
      </h1>

      {/* Currently Reading Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Currently Reading
        </h2>
        {readingBooks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No books currently reading. Start reading from your Want to Read list below!
          </p>
        ) : (
          <div className="space-y-4">
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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Want to Read
        </h2>
        {wantToReadBooks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No books in your Want to Read list. Add books from the collection!
          </p>
        ) : (
          <div className="space-y-4">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/books/${book.id}`}
            className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {book.title}
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            {book.author_display_name}
            {book.year_sort && ` (${book.year_sort})`}
          </p>
          {book.started_at && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Started: {new Date(book.started_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => onStatusChange('finished')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700
                     transition-colors min-h-[44px] text-sm font-medium"
            aria-label="Mark as Finished"
          >
            Mark as Finished
          </button>
          <button
            onClick={() => onStatusChange('paused')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700
                     transition-colors min-h-[44px] text-sm font-medium"
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/books/${book.id}`}
            className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {book.title}
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            {book.author_display_name}
            {book.year_sort && ` (${book.year_sort})`}
          </p>
        </div>
        <button
          onClick={() => onStatusChange('reading')}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
                   transition-colors min-h-[44px] text-sm font-medium"
          aria-label="Mark as Reading"
        >
          Mark as Reading
        </button>
      </div>
    </div>
  )
}
