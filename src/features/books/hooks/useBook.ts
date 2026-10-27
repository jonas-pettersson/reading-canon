import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Book, ExternalReference } from '@/types/database'

export interface BookWithReferences extends Book {
  external_references?: ExternalReference[]
}

/**
 * Hook to fetch a single book by ID with external references.
 *
 * @param id - Book UUID
 * @param options - Optional React Query options (e.g., enabled)
 * @returns React Query result with book data, loading state, and error
 *
 * @example
 * const { data: book, isLoading, error } = useBook('book-id')
 * const { data: book } = useBook('book-id', { enabled: !!bookId })
 */
export function useBook(id: string, options?: Omit<UseQueryOptions<BookWithReferences>, 'queryKey' | 'queryFn'>) {
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
    ...options,
  })
}
