import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDeleteBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)

      if (error) throw error
    },
    onSuccess: (_data, bookId) => {
      // Invalidate the specific book query
      queryClient.invalidateQueries({ queryKey: ['book', bookId] })
      // Invalidate the books list query
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
