import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { AddBookForm } from '@/features/books/components/AddBookForm'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']

/**
 * AddBookPage - Page for adding a new book to the collection
 *
 * Features:
 * - Displays AddBookForm component
 * - Redirects to book detail page on successful creation
 * - Returns to collection page on cancel (or source book if copying)
 * - Supports copying from existing book via ?copyFrom=<bookId> query parameter
 * - Preserves origin state for proper back navigation
 */
export function AddBookPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const copyFromId = searchParams.get('copyFrom')

  // Get the origin path from location state (preserve for back navigation)
  const originPath = (location.state as { from?: string })?.from

  const handleSuccess = (book: Book) => {
    // Redirect to the newly created book's detail page, preserving origin
    navigate(`/books/${book.id}`, {
      state: originPath ? { from: originPath } : undefined
    })
  }

  const handleCancel = () => {
    // If copying, go back to the source book (with origin preserved)
    // Otherwise, return to collection page
    if (copyFromId) {
      navigate(`/books/${copyFromId}`, {
        state: originPath ? { from: originPath } : undefined
      })
    } else {
      navigate('/')
    }
  }

  return (
    <div className="add-book-page">
      <div className="add-book-container">
        <h1 className="page-heading">{copyFromId ? 'Copy Book' : 'Add Book'}</h1>
        <AddBookForm onSuccess={handleSuccess} onCancel={handleCancel} copyFromId={copyFromId || undefined} />
      </div>

      <style>{`
        .add-book-page {
          width: 100%;
          /* Padding provided by AppLayout */
        }

        .add-book-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .page-heading {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #333;
        }
      `}</style>
    </div>
  )
}
