import { useState, useEffect } from 'react'
import { useUpdateReadingStatus } from '../hooks/useReadingStatus'
import type { Database } from '@/types/database'

type ReadingStatus = Database['public']['Enums']['reading_status_enum']

interface ReadingStatusSelectProps {
  bookId: string
  currentStatus: ReadingStatus
  onStatusChange?: (status: ReadingStatus) => void
  className?: string
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  not_started: 'Not Started',
  want_to_read: 'Want to Read',
  reading: 'Reading',
  paused: 'Paused',
  finished: 'Finished',
  abandoned: 'Abandoned',
}

const STATUS_OPTIONS: ReadingStatus[] = [
  'not_started',
  'want_to_read',
  'reading',
  'paused',
  'finished',
  'abandoned',
]

/**
 * Dropdown select component for changing a book's reading status
 * Updates are optimistic and saved to the backend automatically
 */
export function ReadingStatusSelect({
  bookId,
  currentStatus,
  onStatusChange,
  className = '',
}: ReadingStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>(currentStatus)
  const { mutate, isPending } = useUpdateReadingStatus()

  // Sync with prop changes
  useEffect(() => {
    setSelectedStatus(currentStatus)
  }, [currentStatus])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as ReadingStatus

    // Don't update if status hasn't changed
    if (newStatus === currentStatus) {
      return
    }

    // Optimistic update
    setSelectedStatus(newStatus)

    // Call mutation
    mutate({
      bookId,
      updates: {
        reading_status: newStatus,
      },
    })

    // Call optional callback
    onStatusChange?.(newStatus)
  }

  return (
    <select
      value={selectedStatus}
      onChange={handleChange}
      disabled={isPending}
      aria-label="Reading status"
      className={`rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  )
}
