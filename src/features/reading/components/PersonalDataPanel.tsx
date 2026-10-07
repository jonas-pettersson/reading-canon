import { useState, useEffect } from 'react'
import { useReadingStatus, useUpdateReadingStatus } from '../hooks/useReadingStatus'
import { ReadingStatusSelect } from './ReadingStatusSelect'
import type { Database } from '@/types/database'
import styles from './PersonalDataPanel.module.css'

type OwnershipStatus = Database['public']['Enums']['ownership_status_enum']

interface PersonalDataPanelProps {
  bookId: string
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
 * Includes status, ownership, rating, notes, and timestamps
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
    return <div className={styles.loadingText}>Loading personal data...</div>
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
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>Personal Reading Data</h3>

      {/* Reading Status */}
      <div className={styles.field}>
        <label
          htmlFor={`status-${bookId}`}
          className={styles.label}
        >
          Reading Status
        </label>
        <ReadingStatusSelect
          bookId={bookId}
          currentStatus={readingStatus?.reading_status || 'not_started'}
          className="w-full"
        />
      </div>

      {/* Ownership */}
      <div className={styles.field}>
        <label
          htmlFor={`ownership-${bookId}`}
          className={styles.label}
        >
          Ownership
        </label>
        <select
          id={`ownership-${bookId}`}
          value={readingStatus?.ownership_status || 'not_owned'}
          onChange={handleOwnershipChange}
          className={styles.select}
        >
          {Object.entries(OWNERSHIP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div className={styles.field}>
        <label id={`rating-label-${bookId}`} className={styles.label}>
          Rating
        </label>
        <div
          className={styles.ratingStars}
          role="group"
          aria-labelledby={`rating-label-${bookId}`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              className={styles.ratingStar}
            >
              {star <= currentRating ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Notes */}
      <div className={styles.field}>
        <label htmlFor={`notes-${bookId}`} className={styles.label}>
          Personal Notes
        </label>
        <textarea
          id={`notes-${bookId}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          placeholder="Add your thoughts, reflections, or reading notes..."
          className={styles.textarea}
        />
      </div>

      {/* Timestamps */}
      {(readingStatus?.started_at || readingStatus?.completed_at) && (
        <div className={styles.timestampsSection}>
          {readingStatus.started_at && (
            <div className={styles.timestampRow}>
              <span className={styles.timestampLabel}>Started:</span>{' '}
              {formatDate(readingStatus.started_at)}
            </div>
          )}
          {readingStatus.completed_at && (
            <div className={styles.timestampRow}>
              <span className={styles.timestampLabel}>Completed:</span>{' '}
              {formatDate(readingStatus.completed_at)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
