import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Hook to fetch unique original languages from books
 * Returns sorted list of language codes that exist in the database
 */
export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('original_language')

      if (error) throw error

      // Extract unique non-null language codes and sort
      const uniqueLanguages = Array.from(
        new Set(
          data
            .map(book => book.original_language)
            .filter((lang): lang is string => lang !== null && lang !== '')
        )
      ).sort()

      return uniqueLanguages
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}
