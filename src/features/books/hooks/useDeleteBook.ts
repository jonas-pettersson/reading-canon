import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      // Show success toast
      toast.success('Book deleted successfully', {
        description: 'The book has been removed from your collection.',
      })
    },
    onError: (error: Error) => {
      // Show error toast with recovery suggestion
      toast.error('Failed to delete book', {
        description: error.message || 'Please check your connection and try again.',
      })
    },
  })
}
