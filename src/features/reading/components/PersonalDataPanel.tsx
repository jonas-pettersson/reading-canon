import { useState, useEffect } from 'react'
import { useReadingStatus, useUpdateReadingStatus } from '../hooks/useReadingStatus'
import { ReadingStatusSelect } from './ReadingStatusSelect'
import type { Database } from '@/types/database'

type PriorityEnum = Database['public']['Enums']['priority_enum']
type OwnershipStatus = Database['public']['Enums']['ownership_status_enum']

interface PersonalDataPanelProps {
  bookId: string
}

const PRIORITY_LABELS: Record<PriorityEnum, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const OWNERSHIP_LABELS: Record<OwnershipStatus, string> = {
  not_owned: 'Not Owned',
  ordered: 'Ordered',
  owned_physical: 'Physical',
  owned_digital: 'Digital',
  borrowed: 'Borrowed',
}

/**
 * Panel component for editing personal reading data
 * Includes status, priority, ownership, rating, notes, and timestamps
 */
export function PersonalDataPanel({ bookId }: PersonalDataPanelProps) {
  const { data: readingStatus, isLoading } = useReadingStatus(bookId)
  const { mutate } = useUpdateReadingStatus()

  const [notes, setNotes] = useState('')

  // Sync notes with fetched data
  useEffect(() => {
    setNotes(readingStatus?.personal_notes || '')
  }, [readingStatus?.personal_notes])

  if (isLoading) {
    return <div className="text-gray-500">Loading personal data...</div>
  }

  const handlePriorityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    mutate({
      bookId,
      updates: {
        personal_priority: value === '' ? null : (value as PriorityEnum),
      },
    })
  }

  const handleOwnershipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as OwnershipStatus
    mutate({
      bookId,
      updates: {
        ownership_status: value,
      },
    })
  }

  const handleRatingClick = (rating: number) => {
    // If clicking the current rating, clear it
    const newRating = readingStatus?.personal_rating === rating ? null : rating
    mutate({
      bookId,
      updates: {
        personal_rating: newRating,
      },
    })
  }

  const handleNotesBlur = () => {
    // Only save if notes changed
    if (notes !== (readingStatus?.personal_notes || '')) {
      mutate({
        bookId,
        updates: {
          personal_notes: notes || null,
        },
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const currentRating = readingStatus?.personal_rating || 0

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-lg font-semibold text-gray-900">Personal Reading Data</h3>

      {/* Reading Status */}
      <div>
        <label htmlFor={`status-${bookId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Reading Status
        </label>
        <ReadingStatusSelect
          bookId={bookId}
          currentStatus={readingStatus?.reading_status || 'not_started'}
          className="w-full"
        />
      </div>

      {/* Priority */}
      <div>
        <label htmlFor={`priority-${bookId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id={`priority-${bookId}`}
          value={readingStatus?.personal_priority || ''}
          onChange={handlePriorityChange}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">None</option>
          <option value="high">{PRIORITY_LABELS.high}</option>
          <option value="medium">{PRIORITY_LABELS.medium}</option>
          <option value="low">{PRIORITY_LABELS.low}</option>
        </select>
      </div>

      {/* Ownership */}
      <div>
        <label htmlFor={`ownership-${bookId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Ownership
        </label>
        <select
          id={`ownership-${bookId}`}
          value={readingStatus?.ownership_status || 'not_owned'}
          onChange={handleOwnershipChange}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.entries(OWNERSHIP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label id={`rating-label-${bookId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="flex gap-1" role="group" aria-labelledby={`rating-label-${bookId}`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              className="text-2xl text-yellow-500 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {star <= currentRating ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Notes */}
      <div>
        <label htmlFor={`notes-${bookId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Personal Notes
        </label>
        <textarea
          id={`notes-${bookId}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          placeholder="Add your thoughts, reflections, or reading notes..."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Timestamps */}
      {(readingStatus?.started_at || readingStatus?.completed_at) && (
        <div className="space-y-1 border-t border-gray-300 pt-3 text-sm text-gray-600">
          {readingStatus.started_at && (
            <div>
              <span className="font-medium">Started:</span> {formatDate(readingStatus.started_at)}
            </div>
          )}
          {readingStatus.completed_at && (
            <div>
              <span className="font-medium">Completed:</span> {formatDate(readingStatus.completed_at)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
