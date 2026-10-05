import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type ReadingStatus = Database['public']['Enums']['reading_status_enum']
type OwnershipStatus = Database['public']['Enums']['ownership_status_enum']

interface ReadingStatusRecord {
  reading_status: ReadingStatus
  ownership_status: OwnershipStatus
}

export interface ReadingStats {
  byReadingStatus: Record<ReadingStatus, number>
  byOwnership: Record<OwnershipStatus, number> & {
    totalOwned: number
  }
}

/**
 * Hook to fetch aggregated reading statistics for the current user
 * Returns counts by reading status and ownership status
 * @returns Query result with reading statistics
 */
export function useReadingStats() {
  return useQuery({
    queryKey: ['reading-stats'],
    queryFn: async (): Promise<ReadingStats> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_reading_status')
        .select('reading_status,ownership_status')
        .eq('user_id', user.id)

      if (error) throw error

      // Initialize all counts to zero
      const byReadingStatus: Record<ReadingStatus, number> = {
        not_started: 0,
        want_to_read: 0,
        reading: 0,
        paused: 0,
        finished: 0,
        abandoned: 0,
      }

      const byOwnership: Record<OwnershipStatus, number> = {
        not_owned: 0,
        ordered: 0,
        owned_physical: 0,
        owned_digital: 0,
        borrowed: 0,
      }

      // Count occurrences
      const records = data as ReadingStatusRecord[]
      for (const record of records) {
        byReadingStatus[record.reading_status]++
        byOwnership[record.ownership_status]++
      }

      // Calculate total owned (physical + digital only)
      const totalOwned = byOwnership.owned_physical + byOwnership.owned_digital

      return {
        byReadingStatus,
        byOwnership: {
          ...byOwnership,
          totalOwned,
        },
      }
    },
  })
}
