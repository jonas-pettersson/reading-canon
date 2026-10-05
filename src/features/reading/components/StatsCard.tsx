/**
 * StatsCard Component
 *
 * Displays a statistic with a label and count.
 * Can be static or clickable for filtering.
 */

interface StatsCardProps {
  label: string
  count: number
  onClick?: () => void
}

export function StatsCard({ label, count, onClick }: StatsCardProps) {
  const baseClasses =
    'bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors'
  const clickableClasses = onClick
    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
    : ''

  const content = (
    <>
      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {count}
      </div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${clickableClasses} w-full text-left`}
        aria-label={`${label}: ${count}`}
      >
        {content}
      </button>
    )
  }

  return <div className={baseClasses}>{content}</div>
}
