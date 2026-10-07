import styles from './StatsCard.module.css'

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
  const content = (
    <>
      <div className={styles.count}>{count}</div>
      <div className={styles.label}>{label}</div>
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${styles.card} ${styles.cardClickable}`}
        aria-label={`${label}: ${count}`}
      >
        {content}
      </button>
    )
  }

  return <div className={styles.card}>{content}</div>
}
