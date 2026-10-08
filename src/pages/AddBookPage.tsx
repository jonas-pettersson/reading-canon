import { useNavigate } from 'react-router-dom'
import { AddBookForm } from '@/features/books/components/AddBookForm'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']

/**
 * AddBookPage - Page for adding a new book to the collection
 *
 * Features:
 * - Displays AddBookForm component
 * - Redirects to book detail page on successful creation
 * - Returns to collection page on cancel
 */
export function AddBookPage() {
  const navigate = useNavigate()

  const handleSuccess = (book: Book) => {
    // Redirect to the newly created book's detail page
    navigate(`/books/${book.id}`)
  }

  const handleCancel = () => {
    // Return to collection page
    navigate('/')
  }

  return (
    <div className="add-book-page">
      <div className="add-book-container">
        <h1 className="page-heading">Add Book</h1>
        <AddBookForm onSuccess={handleSuccess} onCancel={handleCancel} />
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
