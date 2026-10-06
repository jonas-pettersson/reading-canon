import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getLanguageDisplayName } from '../constants'

/**
 * Hook to fetch unique original languages from books
 * Returns list of language codes sorted by display name (not code)
 */
export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('original_language')

      if (error) throw error

      // Extract unique non-null language codes
      const uniqueLanguages = Array.from(
        new Set(
          data
            .map(book => book.original_language)
            .filter((lang): lang is string => lang !== null && lang !== '')
        )
      )

      // Sort by display name (what users see), not by code
      uniqueLanguages.sort((a, b) => {
        const displayA = getLanguageDisplayName(a)
        const displayB = getLanguageDisplayName(b)
        return displayA.localeCompare(displayB)
      })

      return uniqueLanguages
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}
