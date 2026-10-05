import { useParams, useNavigate } from 'react-router-dom'
import { useBook } from '@/features/books/hooks/useBook'
import { EditBookForm } from '@/features/books/components/EditBookForm'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']

/**
 * EditBookPage - Edit an existing book's details
 *
 * Features:
 * - Extracts book ID from route parameters
 * - Fetches book data with external references
 * - Displays EditBookForm component
 * - Handles loading, error, and not-found states
 * - Navigates to detail view on success or cancel
 */
export function EditBookPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: book, isLoading, error } = useBook(id || '')

  // Handle successful update
  const handleSuccess = (updatedBook: Book) => {
    navigate(`/books/${updatedBook.id}`)
  }

  // Handle cancel
  const handleCancel = () => {
    if (id) {
      navigate(`/books/${id}`)
    } else {
      navigate('/collection')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="edit-book-page">
        <div className="loading-container">
          <p className="loading-message">Loading book...</p>
        </div>

        <style>{`
          .edit-book-page {
            width: 100%;
            padding: 2rem;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }

          .loading-message {
            font-size: 1.125rem;
            color: #666;
          }
        `}</style>
      </div>
    )
  }

  // Error state - distinguish between "not found" and other errors
  if (error) {
    const isNotFound = (error as any)?.code === 'PGRST116'

    return (
      <div className="edit-book-page">
        <div className="error-container">
          <h1 className="error-heading">
            {isNotFound ? 'Book Not Found' : 'Error Loading Book'}
          </h1>
          <p className="error-message">
            {isNotFound
              ? 'The book you are trying to edit does not exist.'
              : 'There was a problem loading the book details. Please try again later.'}
          </p>
          <button onClick={() => navigate('/collection')} className="back-button">
            ← Back to Collection
          </button>
        </div>

        <style>{`
          .edit-book-page {
            width: 100%;
            padding: 2rem;
          }

          .error-container {
            max-width: 600px;
            margin: 4rem auto;
            text-align: center;
          }

          .error-heading {
            font-size: 1.75rem;
            font-weight: 600;
            color: #d32f2f;
            margin-bottom: 1rem;
          }

          .error-message {
            font-size: 1rem;
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .back-button {
            padding: 0.75rem 1.5rem;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.2s;
          }

          .back-button:hover {
            background: #e0e0e0;
          }

          .back-button:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
          }
        `}</style>
      </div>
    )
  }

  // Book not found (shouldn't happen if useBook is working correctly)
  if (!book) {
    return (
      <div className="edit-book-page">
        <div className="error-container">
          <h1 className="error-heading">Book Not Found</h1>
          <p className="error-message">
            The book you are trying to edit does not exist.
          </p>
          <button onClick={() => navigate('/collection')} className="back-button">
            ← Back to Collection
          </button>
        </div>

        <style>{`
          .edit-book-page {
            width: 100%;
            padding: 2rem;
          }

          .error-container {
            max-width: 600px;
            margin: 4rem auto;
            text-align: center;
          }

          .error-heading {
            font-size: 1.75rem;
            font-weight: 600;
            color: #d32f2f;
            margin-bottom: 1rem;
          }

          .error-message {
            font-size: 1rem;
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .back-button {
            padding: 0.75rem 1.5rem;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.2s;
          }

          .back-button:hover {
            background: #e0e0e0;
          }

          .back-button:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
          }
        `}</style>
      </div>
    )
  }

  // Success - display edit form
  return (
    <div className="edit-book-page">
      <div className="edit-book-container">
        <h1 className="page-heading">Edit Book</h1>
        <EditBookForm
          book={book}
          externalReferences={book.external_references || []}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>

      <style>{`
        .edit-book-page {
          width: 100%;
          padding: 2rem;
        }

        .edit-book-container {
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
