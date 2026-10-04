import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']
type UserReadingStatus = Database['public']['Tables']['user_reading_status']['Row']

interface BooksQueryParams {
  search?: string
  category?: string
  tags?: string[]
  originalLanguage?: string
  readingStatus?: string
  ownershipStatus?: string
  sortBy?: 'title' | 'author' | 'year'
  sortOrder?: 'asc' | 'desc'
}

export function useBooks(params: BooksQueryParams = {}) {
  // Fetch books from database
  const booksQuery = useQuery({
    queryKey: ['books', {
      search: params.search,
      category: params.category,
      tags: params.tags,
      originalLanguage: params.originalLanguage,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }],
    queryFn: async () => {
      let query = supabase.from('books').select('*')

      // Apply search across multiple fields (FR-002)
      if (params.search) {
        // Search in: title, title_original, author_display_name, inclusion_rationale
        query = query.or(
          `title.ilike.%${params.search}%,` +
          `title_original.ilike.%${params.search}%,` +
          `author_display_name.ilike.%${params.search}%,` +
          `inclusion_rationale.ilike.%${params.search}%`
        )
      }

      // Apply filters that exist on books table (FR-003)
      if (params.category) {
        query = query.eq('primary_category', params.category)
      }

      if (params.tags && params.tags.length > 0) {
        query = query.contains('tags', params.tags)
      }

      if (params.originalLanguage) {
        query = query.eq('original_language', params.originalLanguage)
      }

      // Apply sorting (FR-004)
      if (params.sortBy) {
        const column = params.sortBy === 'year'
          ? 'year_sort'
          : params.sortBy === 'author'
          ? 'author_display_name'
          : params.sortBy
        query = query.order(column, { ascending: params.sortOrder === 'asc' })
      } else {
        // Default sort: year (oldest first) per UX-010
        query = query.order('year_sort', { ascending: true })
      }

      const { data, error } = await query
      if (error) throw error
      return data as Book[]
    },
  })

  // Fetch user reading status (for client-side filtering)
  const statusQuery = useQuery({
    queryKey: ['user-reading-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reading_status')
        .select('*')
      if (error) throw error
      return data as UserReadingStatus[]
    },
    // Only fetch if we need status filtering
    enabled: Boolean(params.readingStatus || params.ownershipStatus),
  })

  // Combine and filter client-side (for reading_status/ownership_status)
  const filteredBooks = useMemo(() => {
    if (!booksQuery.data) return []

    let books = booksQuery.data

    // Apply client-side filters if status data available
    if (statusQuery.data && (params.readingStatus || params.ownershipStatus)) {
      const statusMap = new Map(statusQuery.data.map(s => [s.book_id, s]))

      books = books.filter(book => {
        const status = statusMap.get(book.id)

        if (params.readingStatus && status?.reading_status !== params.readingStatus) {
          return false
        }

        if (params.ownershipStatus && status?.ownership_status !== params.ownershipStatus) {
          return false
        }

        return true
      })
    }

    return books
  }, [booksQuery.data, statusQuery.data, params.readingStatus, params.ownershipStatus])

  return {
    data: filteredBooks,
    isLoading: booksQuery.isLoading || statusQuery.isLoading,
    error: booksQuery.error || statusQuery.error,
  }
}
