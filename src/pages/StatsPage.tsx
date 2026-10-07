import { useReadingStats } from '@/features/reading/hooks/useReadingStats'
import { StatsCard } from '@/features/reading/components/StatsCard'
import styles from './StatsPage.module.css'

/**
 * Statistics Page
 *
 * Displays reading and ownership statistics for the current user.
 * Implements FR-030 (reading status counts) and FR-031 (ownership counts).
 */
export function StatsPage() {
  const { data: stats, isLoading } = useReadingStats()

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Statistics</h1>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Statistics</h1>

      {/* Reading Status Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reading Status</h2>
        <div className={styles.statsGrid}>
          <StatsCard
            label="Want to Read"
            count={stats.byReadingStatus.want_to_read}
          />
          <StatsCard
            label="Currently Reading"
            count={stats.byReadingStatus.reading}
          />
          <StatsCard label="Paused" count={stats.byReadingStatus.paused} />
          <StatsCard label="Finished" count={stats.byReadingStatus.finished} />
          <StatsCard
            label="Abandoned"
            count={stats.byReadingStatus.abandoned}
          />
        </div>
      </section>

      {/* Ownership Section */}
      <section>
        <h2 className={styles.sectionTitle}>Ownership</h2>
        <div className={styles.statsGridOwnership}>
          <StatsCard
            label="Owned (Physical)"
            count={stats.byOwnership.owned_physical}
          />
          <StatsCard
            label="Owned (Digital)"
            count={stats.byOwnership.owned_digital}
          />
          <StatsCard label="Total Owned" count={stats.byOwnership.totalOwned} />
        </div>
      </section>
    </div>
  )
}
