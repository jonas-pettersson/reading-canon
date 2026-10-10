import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { UserReadingStatus } from '@/types/database'

/**
 * Hook to fetch user's reading status for a specific book
 * @param bookId - The book ID to fetch reading status for
 * @returns Query result with reading status data or null if not found
 */
export function useReadingStatus(bookId: string) {
  return useQuery({
    queryKey: ['reading-status', bookId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_reading_status')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .single()

      // Handle case where no reading status exists yet (PGRST116 = no rows)
      if (error && error.code === 'PGRST116') {
        return null
      }

      if (error) throw error
      return data as UserReadingStatus
    },
  })
}

interface UpdateReadingStatusParams {
  bookId: string
  updates: Partial<{
    reading_status: UserReadingStatus['reading_status']
    ownership_status: UserReadingStatus['ownership_status']
    personal_rating: UserReadingStatus['personal_rating']
    personal_notes: UserReadingStatus['personal_notes']
  }>
}

/**
 * Hook to update or create user's reading status
 * Auto-sets timestamps:
 * - started_at when status changes to "reading"
 * - completed_at when status changes to "finished"
 * @returns Mutation function to update reading status
 */
export function useUpdateReadingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookId, updates }: UpdateReadingStatusParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Prepare the upsert data
      const upsertData: Record<string, any> = {
        book_id: bookId,
        user_id: user.id,
        ...updates,
      }

      // Auto-set timestamps based on status changes
      if (updates.reading_status === 'reading' && !updates.hasOwnProperty('started_at')) {
        upsertData.started_at = new Date().toISOString()
      }

      if (updates.reading_status === 'finished' && !updates.hasOwnProperty('completed_at')) {
        upsertData.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_reading_status')
        .upsert(upsertData, {
          onConflict: 'user_id,book_id',
        })
        .select()
        .single()

      if (error) throw error
      return data as UserReadingStatus
    },
    onSuccess: (_data, variables) => {
      // Invalidate specific book's reading status
      queryClient.invalidateQueries({
        queryKey: ['reading-status', variables.bookId],
      })
      // Invalidate the full reading status list (used in useBooks for filtering)
      queryClient.invalidateQueries({
        queryKey: ['user-reading-status'],
      })
      // Invalidate Reading Dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['reading-books'],
      })
      queryClient.invalidateQueries({
        queryKey: ['want-to-read-books'],
      })
      // Show success toast (brief, unobtrusive)
      if (variables.updates.reading_status) {
        toast.success('Status updated')
      } else if (variables.updates.personal_rating !== undefined) {
        toast.success('Rating updated')
      } else if (variables.updates.ownership_status) {
        toast.success('Ownership updated')
      } else if (variables.updates.personal_notes !== undefined) {
        toast.success('Notes saved')
      }
    },
    onError: (error: Error) => {
      // Show error toast with recovery suggestion
      toast.error('Failed to update', {
        description: error.message || 'Please check your connection and try again.',
      })
    },
  })
}
