import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import ISO6391 from 'iso-639-1'
import { useUpdateBook, type UpdateBookInput } from '../hooks/useUpdateBook'
import { PRIMARY_CATEGORIES } from '@/constants/categories'
import type { Database } from '@/types/database'

type Book = Database['public']['Tables']['books']['Row']
type ExternalReference = Database['public']['Tables']['external_references']['Row']

const externalReferenceSchema = z.object({
  _dbId: z.string().optional(), // Database ID for existing references
  url: z.string().url({ message: 'Must be a valid URL' }),
  link_text: z.string().optional(),
  reference_type: z.string().optional(),
  _deleted: z.boolean().optional(), // Track deletions
})

const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author_display_name: z.string().min(1, 'Author display name is required'),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  title_original: z.string().optional(),
  year_published: z.string().optional(),
  primary_category: z.string().optional(),
  tags: z.string().optional(), // Will be split into array
  original_language: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // Empty is valid
        // Must be 2-3 uppercase letters
        if (!/^[A-Z]{2,3}$/.test(val)) return false
        // Allow legacy non-standard codes already in database
        const legacyCodes = ['GR', 'DK', 'TU', 'CH']
        if (legacyCodes.includes(val)) return true
        // Validate against ISO 639-1 standard (2-letter codes)
        return ISO6391.validate(val.toLowerCase())
      },
      { message: 'Must be a valid uppercase ISO 639-1 language code (e.g., EN, DE, SV, FR)' }
    ),
  source: z.string().optional(),
  inclusion_rationale: z.string().optional(),
  author_lifespan: z.string().optional(),
  external_references: z.array(externalReferenceSchema).optional(),
})

type BookFormData = z.infer<typeof bookFormSchema>

export interface EditBookFormProps {
  book: Book
  externalReferences: ExternalReference[]
  onSuccess: (book: Book) => void
  onCancel: () => void
}

export function EditBookForm({ book, externalReferences, onSuccess, onCancel }: EditBookFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutate, isPending } = useUpdateBook()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book.title,
      author_display_name: book.author_display_name,
      given_name: book.given_name || '',
      family_name: book.family_name || '',
      title_original: book.title_original || '',
      year_published: book.year_published || '',
      primary_category: book.primary_category || '',
      tags: book.tags?.join(', ') || '',
      original_language: book.original_language || '',
      source: book.source || '',
      inclusion_rationale: book.inclusion_rationale || '',
      author_lifespan: book.author_lifespan || '',
      external_references: externalReferences.map((ref) => ({
        _dbId: ref.id,
        url: ref.url,
        link_text: ref.link_text || '',
        reference_type: ref.reference_type || '',
        _deleted: false,
      })),
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'external_references',
  })

  const onSubmit: SubmitHandler<BookFormData> = (data) => {
    setErrorMessage(null)

    // Parse tags from comma-separated string to array
    const tags = data.tags
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : undefined

    // Separate external references into add/update/delete
    type ExternalRefsType = NonNullable<UpdateBookInput['externalReferences']>
    const toAdd: ExternalRefsType['toAdd'] = []
    const toUpdate: ExternalRefsType['toUpdate'] = []
    const toDelete: string[] = []

    data.external_references?.forEach((ref) => {
      if (ref._deleted && ref._dbId) {
        // Existing reference marked for deletion
        toDelete.push(ref._dbId)
      } else if (!ref._deleted && ref._dbId) {
        // Existing reference to update
        toUpdate.push({
          id: ref._dbId,
          url: ref.url,
          link_text: ref.link_text || null,
          reference_type: ref.reference_type || null,
        })
      } else if (!ref._deleted && !ref._dbId) {
        // New reference to add
        toAdd.push({
          url: ref.url,
          link_text: ref.link_text || null,
          reference_type: ref.reference_type || null,
        })
      }
    })

    const updateInput: UpdateBookInput = {
      bookId: book.id,
      book: {
        title: data.title,
        author_display_name: data.author_display_name,
        given_name: data.given_name || null,
        family_name: data.family_name || null,
        title_original: data.title_original || null,
        year_published: data.year_published || null,
        primary_category: data.primary_category || null,
        tags: tags || null,
        original_language: data.original_language || null,
        source: data.source || null,
        inclusion_rationale: data.inclusion_rationale || null,
        author_lifespan: data.author_lifespan || null,
      },
      externalReferences: {
        toAdd: toAdd.length > 0 ? toAdd : undefined,
        toUpdate: toUpdate.length > 0 ? toUpdate : undefined,
        toDelete: toDelete.length > 0 ? toDelete : undefined,
      },
    }

    mutate(updateInput, {
      onSuccess: (updatedBook) => {
        onSuccess(updatedBook)
      },
      onError: (error) => {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to update book')
      },
    })
  }

  const markForDeletion = (index: number) => {
    const field = fields[index]
    update(index, { ...field, _deleted: true })
  }

  const unmarkForDeletion = (index: number) => {
    const field = fields[index]
    update(index, { ...field, _deleted: false })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Required Information</h3>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="author_display_name" className="block text-sm font-medium mb-1">
            Author Display Name *
          </label>
          <input
            id="author_display_name"
            type="text"
            {...register('author_display_name')}
            aria-describedby={errors.author_display_name ? 'author-display-name-error' : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.author_display_name && (
            <p id="author-display-name-error" className="mt-1 text-sm text-red-600">
              {errors.author_display_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Optional Author Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Author Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="given_name" className="block text-sm font-medium mb-1">
              Given Name
            </label>
            <input
              id="given_name"
              type="text"
              {...register('given_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="family_name" className="block text-sm font-medium mb-1">
              Family Name
            </label>
            <input
              id="family_name"
              type="text"
              {...register('family_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="author_lifespan" className="block text-sm font-medium mb-1">
            Author Lifespan
          </label>
          <input
            id="author_lifespan"
            type="text"
            {...register('author_lifespan')}
            placeholder="e.g., 1564-1616"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Book Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Book Details</h3>

        <div>
          <label htmlFor="title_original" className="block text-sm font-medium mb-1">
            Original Title
          </label>
          <input
            id="title_original"
            type="text"
            {...register('title_original')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="year_published" className="block text-sm font-medium mb-1">
              Year Published
            </label>
            <input
              id="year_published"
              type="text"
              {...register('year_published')}
              placeholder="e.g., 1851 or 8th century BC"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="original_language" className="block text-sm font-medium mb-1">
              Original Language
            </label>
            <input
              id="original_language"
              type="text"
              {...register('original_language')}
              placeholder="e.g., EN, DE, SV"
              aria-describedby={errors.original_language ? 'original-language-error' : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.original_language && (
              <p id="original-language-error" className="mt-1 text-sm text-red-600">
                {errors.original_language.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="primary_category" className="block text-sm font-medium mb-1">
            Primary Category
          </label>
          <select
            id="primary_category"
            {...register('primary_category')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {PRIMARY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            {...register('tags')}
            placeholder="Comma-separated tags (e.g., epic, ancient greece)"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Enter tags separated by commas</p>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium mb-1">
            Source
          </label>
          <input
            id="source"
            type="text"
            {...register('source')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="inclusion_rationale" className="block text-sm font-medium mb-1">
            Inclusion Rationale
          </label>
          <textarea
            id="inclusion_rationale"
            {...register('inclusion_rationale')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* External References */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">External References</h3>
          <button
            type="button"
            onClick={() => append({ url: '', link_text: '', reference_type: '', _deleted: false })}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Reference
          </button>
        </div>

        {fields.map((field, index) => {
          const isDeleted = field._deleted
          return (
            <div
              key={field.id}
              className={`border rounded p-4 space-y-3 ${
                isDeleted ? 'border-red-300 bg-red-50 opacity-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  Reference {index + 1}
                  {isDeleted && <span className="text-red-600 ml-2">(Marked for deletion)</span>}
                </h4>
                <div className="space-x-2">
                  {isDeleted ? (
                    <button
                      type="button"
                      onClick={() => unmarkForDeletion(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Restore
                    </button>
                  ) : field._dbId ? (
                    <button
                      type="button"
                      onClick={() => markForDeletion(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden input to track existing reference IDs */}
              {field._dbId && <input type="hidden" {...register(`external_references.${index}._dbId`)} />}

              {/* Hidden input to track deletion state */}
              <input type="hidden" {...register(`external_references.${index}._deleted`)} />

              {!isDeleted && (
                <>
                  <div>
                    <label htmlFor={`external_references.${index}.url`} className="block text-sm font-medium mb-1">
                      URL *
                    </label>
                    <input
                      id={`external_references.${index}.url`}
                      type="text"
                      {...register(`external_references.${index}.url`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.external_references?.[index]?.url && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.external_references[index]?.url?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`external_references.${index}.link_text`}
                      className="block text-sm font-medium mb-1"
                    >
                      Link Text
                    </label>
                    <input
                      id={`external_references.${index}.link_text`}
                      type="text"
                      {...register(`external_references.${index}.link_text`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`external_references.${index}.reference_type`}
                      className="block text-sm font-medium mb-1"
                    >
                      Reference Type
                    </label>
                    <input
                      id={`external_references.${index}.reference_type`}
                      type="text"
                      {...register(`external_references.${index}.reference_type`)}
                      placeholder="e.g., analysis, review, full text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
