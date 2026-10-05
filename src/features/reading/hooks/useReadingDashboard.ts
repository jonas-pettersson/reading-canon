import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Book } from '@/types/database'

/**
 * Reading dashboard data type combining book and user reading status
 */
export type ReadingBook = Book & {
  started_at?: string | null
  personal_priority?: 'High' | 'Medium' | 'Low' | null
  reading_status: string
}

/**
 * Priority order for sorting (High > Medium > Low > None)
 */
const PRIORITY_ORDER: Record<string, number> = {
  High: 1,
  Medium: 2,
  Low: 3,
}

/**
 * Fetch books currently being read by the user.
 * Returns books with reading_status = "Reading", ordered by started_at (newest first).
 */
export function useReadingBooks() {
  return useQuery({
    queryKey: ['reading-books'],
    queryFn: async () => {
      // First, get user reading status for "Reading" books
      const { data: statusData, error: statusError } = await supabase
        .from('user_reading_status')
        .select('book_id, started_at, reading_status')
        .eq('reading_status', 'Reading')
        .order('started_at', { ascending: false })

      if (statusError) throw statusError
      if (!statusData || statusData.length === 0) return []

      // Get book details
      const bookIds = statusData.map((s) => s.book_id)
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds)

      if (booksError) throw booksError

      // Combine books with their status info
      const booksMap = new Map(booksData?.map((b) => [b.id, b]) || [])
      const result: ReadingBook[] = statusData
        .map((status) => {
          const book = booksMap.get(status.book_id)
          if (!book) return null
          return {
            ...book,
            started_at: status.started_at,
            reading_status: status.reading_status,
          }
        })
        .filter((b): b is ReadingBook => b !== null)

      return result
    },
  })
}

/**
 * Fetch books the user wants to read.
 * Returns books with reading_status = "Want to Read", sorted by priority (High → Medium → Low → None).
 *
 * @param priorityFilter - Optional filter to show only books with a specific priority
 */
export function useWantToReadBooks(priorityFilter?: 'High' | 'Medium' | 'Low') {
  return useQuery({
    queryKey: ['want-to-read-books', priorityFilter],
    queryFn: async () => {
      // First, get user reading status for "Want to Read" books
      let query = supabase
        .from('user_reading_status')
        .select('book_id, personal_priority, reading_status')
        .eq('reading_status', 'Want to Read')

      // Apply priority filter if provided
      if (priorityFilter) {
        query = query.eq('personal_priority', priorityFilter)
      }

      const { data: statusData, error: statusError } = await query

      if (statusError) throw statusError
      if (!statusData || statusData.length === 0) return []

      // Get book details
      const bookIds = statusData.map((s) => s.book_id)
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds)

      if (booksError) throw booksError

      // Combine books with their status info
      const booksMap = new Map(booksData?.map((b) => [b.id, b]) || [])
      const result: ReadingBook[] = statusData
        .map((status) => {
          const book = booksMap.get(status.book_id)
          if (!book) return null
          return {
            ...book,
            personal_priority: status.personal_priority,
            reading_status: status.reading_status,
          }
        })
        .filter((b): b is ReadingBook => b !== null)

      // Sort by priority: High → Medium → Low → None
      result.sort((a, b) => {
        const aPriority = a.personal_priority || ''
        const bPriority = b.personal_priority || ''
        const aOrder = PRIORITY_ORDER[aPriority] || 999
        const bOrder = PRIORITY_ORDER[bPriority] || 999
        return aOrder - bOrder
      })

      return result
    },
  })
}
