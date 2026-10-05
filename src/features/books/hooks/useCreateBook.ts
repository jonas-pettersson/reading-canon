import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type BookInsert = Database['public']['Tables']['books']['Insert']
type ExternalReferenceInsert = Database['public']['Tables']['external_references']['Insert']

export interface CreateBookInput {
  book: Omit<BookInsert, 'id' | 'created_at' | 'updated_at' | 'created_by_user_id'>
  externalReferences?: Array<Omit<ExternalReferenceInsert, 'id' | 'book_id' | 'created_at' | 'created_by_user_id'>>
}

export function useCreateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBookInput) => {
      // Insert book
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert(input.book)
        .select()
        .single()

      if (bookError) throw bookError
      if (!book) throw new Error('Failed to create book')

      // Insert external references if provided
      if (input.externalReferences && input.externalReferences.length > 0) {
        const referencesToInsert = input.externalReferences.map(ref => ({
          ...ref,
          book_id: book.id,
        }))

        const { error: referencesError } = await supabase
          .from('external_references')
          .insert(referencesToInsert)

        if (referencesError) throw referencesError
      }

      return book
    },
    onSuccess: () => {
      // Invalidate books queries to refetch
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
