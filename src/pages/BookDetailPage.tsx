import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBook } from '@/features/books/hooks/useBook'
import { useDeleteBook } from '@/features/books/hooks/useDeleteBook'
import { BookDetail } from '@/features/books/components/BookDetail'
import { ConfirmDialog } from '@/components/ConfirmDialog'

/**
 * BookDetailPage - Display full details for a single book
 *
 * Features:
 * - Extracts book ID from route parameters
 * - Fetches book data with useBook hook
 * - Displays BookDetail component
 * - Handles loading, error, and not-found states
 * - Provides back navigation to collection
 * - Delete book with confirmation dialog (Phase 3)
 */
export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: book, isLoading, error } = useBook(id || '')
  const deleteBook = useDeleteBook()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Handle back navigation
  const handleBack = () => {
    navigate('/collection')
  }

  // Handle edit navigation (for Phase 3)
  const handleEdit = () => {
    if (id) {
      navigate(`/books/${id}/edit`)
    }
  }

  // Handle delete - open confirmation dialog
  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation - delete book and redirect
  const handleConfirmDelete = () => {
    if (id) {
      deleteBook.mutate(id, {
        onSuccess: () => {
          navigate('/collection')
        },
      })
    }
  }

  // Handle delete cancellation - close dialog
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="book-detail-page">
        <div className="loading-container">
          <p className="loading-message">Loading book details...</p>
        </div>

        <style>{`
          .book-detail-page {
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
      <div className="book-detail-page">
        <div className="error-container">
          <h1 className="error-heading">
            {isNotFound ? 'Book Not Found' : 'Error Loading Book'}
          </h1>
          <p className="error-message">
            {isNotFound
              ? 'The book you are looking for does not exist.'
              : 'There was a problem loading the book details. Please try again later.'}
          </p>
          <button onClick={handleBack} className="back-button">
            ← Back to Collection
          </button>
        </div>

        <style>{`
          .book-detail-page {
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

  // Book loaded successfully
  if (!book) {
    // This shouldn't happen if useBook is working correctly
    // but handle it gracefully
    return (
      <div className="book-detail-page">
        <div className="error-container">
          <h1 className="error-heading">Book Not Found</h1>
          <p className="error-message">
            The book you are looking for does not exist.
          </p>
          <button onClick={handleBack} className="back-button">
            ← Back to Collection
          </button>
        </div>

        <style>{`
          .book-detail-page {
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

  // Success - display book details
  return (
    <div className="book-detail-page">
      <BookDetail
        book={book}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone and will remove all associated reading data.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
