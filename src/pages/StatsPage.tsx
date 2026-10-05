import { useReadingStats } from '@/features/reading/hooks/useReadingStats'
import { StatsCard } from '@/features/reading/components/StatsCard'

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Statistics
      </h1>

      {/* Reading Status Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Reading Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard
            label="Want to Read"
            count={stats.byReadingStatus.want_to_read}
          />
          <StatsCard
            label="Currently Reading"
            count={stats.byReadingStatus.reading}
          />
          <StatsCard
            label="Paused"
            count={stats.byReadingStatus.paused}
          />
          <StatsCard
            label="Finished"
            count={stats.byReadingStatus.finished}
          />
          <StatsCard
            label="Abandoned"
            count={stats.byReadingStatus.abandoned}
          />
        </div>
      </section>

      {/* Ownership Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ownership
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            label="Owned (Physical)"
            count={stats.byOwnership.owned_physical}
          />
          <StatsCard
            label="Owned (Digital)"
            count={stats.byOwnership.owned_digital}
          />
          <StatsCard
            label="Total Owned"
            count={stats.byOwnership.totalOwned}
          />
        </div>
      </section>
    </div>
  )
}
