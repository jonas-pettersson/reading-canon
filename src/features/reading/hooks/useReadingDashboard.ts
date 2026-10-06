import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Book, Database } from '@/types/database'

type ReadingStatus = Database['public']['Enums']['reading_status_enum']

/**
 * Reading dashboard data type combining book and user reading status
 */
export type ReadingBook = Book & {
  started_at?: string | null
  reading_status: ReadingStatus
}

/**
 * Fetch books currently being read by the user.
 * Returns books with reading_status = "Reading", ordered by started_at (newest first).
 */
export function useReadingBooks() {
  return useQuery({
    queryKey: ['reading-books'],
    queryFn: async () => {
      // First, get user reading status for "reading" books
      const { data: statusData, error: statusError } = await supabase
        .from('user_reading_status')
        .select('book_id, started_at, reading_status')
        .eq('reading_status', 'reading')
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
      const result = statusData
        .map((status) => {
          const book = booksMap.get(status.book_id)
          if (!book) return null
          return {
            ...book,
            started_at: status.started_at,
            reading_status: status.reading_status,
          } as ReadingBook
        })
        .filter((b): b is ReadingBook => b !== null)

      return result
    },
  })
}

/**
 * Fetch books the user wants to read.
 * Returns books with reading_status = "want_to_read", ordered by book title.
 */
export function useWantToReadBooks() {
  return useQuery({
    queryKey: ['want-to-read-books'],
    queryFn: async () => {
      // First, get user reading status for "want_to_read" books
      const { data: statusData, error: statusError } = await supabase
        .from('user_reading_status')
        .select('book_id, reading_status')
        .eq('reading_status', 'want_to_read')

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
      const result = statusData
        .map((status) => {
          const book = booksMap.get(status.book_id)
          if (!book) return null
          return {
            ...book,
            reading_status: status.reading_status,
          } as ReadingBook
        })
        .filter((b): b is ReadingBook => b !== null)

      // Sort by title
      result.sort((a, b) => a.title.localeCompare(b.title))

      return result
    },
  })
}
