import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type BookUpdate = Database['public']['Tables']['books']['Update']
type ExternalReferenceInsert = Omit<
  Database['public']['Tables']['external_references']['Insert'],
  'book_id'
>

export interface UpdateBookInput {
  bookId: string
  book: BookUpdate
  externalReferences?: {
    toAdd?: ExternalReferenceInsert[]
    toUpdate?: Array<{ id: string; url: string; link_text?: string | null; reference_type?: string | null }>
    toDelete?: string[] // IDs of references to delete
  }
}

export function useUpdateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateBookInput) => {
      // Update book
      const { data: book, error: bookError } = await supabase
        .from('books')
        .update(input.book)
        .eq('id', input.bookId)
        .select()
        .single()

      if (bookError) throw bookError
      if (!book) throw new Error('Failed to update book')

      // Handle external references if provided
      if (input.externalReferences) {
        const { toAdd, toUpdate, toDelete } = input.externalReferences

        // Delete references
        if (toDelete && toDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('external_references')
            .delete()
            .in('id', toDelete)

          if (deleteError) throw deleteError
        }

        // Add new references
        if (toAdd && toAdd.length > 0) {
          const referencesToInsert = toAdd.map((ref) => ({
            ...ref,
            book_id: input.bookId,
          }))

          const { error: insertError } = await supabase
            .from('external_references')
            .insert(referencesToInsert)

          if (insertError) throw insertError
        }

        // Update existing references
        if (toUpdate && toUpdate.length > 0) {
          for (const ref of toUpdate) {
            const { error: updateError } = await supabase
              .from('external_references')
              .update({
                url: ref.url,
                link_text: ref.link_text,
                reference_type: ref.reference_type,
              })
              .eq('id', ref.id)

            if (updateError) throw updateError
          }
        }
      }

      return book
    },
    onSuccess: (_data, variables) => {
      // Invalidate the specific book query
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] })
      // Invalidate the books list query
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
