import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Book, ExternalReference } from '@/types/database'

export interface BookWithReferences extends Book {
  external_references?: ExternalReference[]
}

/**
 * Hook to fetch a single book by ID with external references.
 *
 * @param id - Book UUID
 * @returns React Query result with book data, loading state, and error
 *
 * @example
 * const { data: book, isLoading, error } = useBook('book-id')
 */
export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*, external_references(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as BookWithReferences
    },
  })
}
