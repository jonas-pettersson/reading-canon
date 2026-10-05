import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface DuplicateBook {
  id: string
  title: string
  author_display_name: string
  year_published: string | null
}

export function useDuplicateDetection(title: string, author: string) {
  const query = useQuery<DuplicateBook[]>({
    queryKey: ['duplicate-check', title, author],
    queryFn: async () => {
      if (!title || !author) return []

      const { data, error } = await supabase
        .from('books')
        .select('id, title, author_display_name, year_published')
        .ilike('title', title)
        .ilike('author_display_name', author)
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: Boolean(title && author),
    staleTime: 30000, // Cache for 30 seconds
  })

  return {
    ...query,
    data: query.data ?? [], // Always return an array, even when undefined
  }
}
