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
      <h1 className="page-heading">Add Book</h1>

      <div className="form-section">
        <AddBookForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>

      <style>{`
        .add-book-page {
          width: 100%;
          max-width: 800px;
        }

        .page-heading {
          font-size: 2rem;
          font-weight: 600;
          margin: 0 0 2rem 0;
          color: #2c3e50;
        }

        .form-section {
          background: #ffffff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .page-heading {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .form-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
