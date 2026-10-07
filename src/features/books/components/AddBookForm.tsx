import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import ISO6391 from 'iso-639-1'
import { useCreateBook, type CreateBookInput } from '../hooks/useCreateBook'
import { useDuplicateDetection } from '../hooks/useDuplicateDetection'
import { PRIMARY_CATEGORIES } from '@/constants/categories'
import type { Database } from '@/types/database'
import styles from './BookForm.module.css'

type Book = Database['public']['Tables']['books']['Row']

const externalReferenceSchema = z.object({
  url: z.string().url({ message: 'Must be a valid URL' }),
  link_text: z.string().optional(),
  reference_type: z.string().optional(),
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

export interface AddBookFormProps {
  onSuccess: (book: Book) => void
  onCancel: () => void
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debouncedTitle, setDebouncedTitle] = useState('')
  const [debouncedAuthor, setDebouncedAuthor] = useState('')
  const { mutate, isPending } = useCreateBook()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      external_references: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'external_references',
  })

  // Watch title and author for duplicate detection
  const title = watch('title')
  const author = watch('author_display_name')

  // Debounce title and author (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(title || '')
    }, 500)
    return () => clearTimeout(timer)
  }, [title])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAuthor(author || '')
    }, 500)
    return () => clearTimeout(timer)
  }, [author])

  // Check for duplicates
  const { data: duplicates } = useDuplicateDetection(debouncedTitle, debouncedAuthor)

  const onSubmit: SubmitHandler<BookFormData> = (data) => {
    setErrorMessage(null)

    // Parse tags from comma-separated string to array
    const tags = data.tags
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : undefined

    const bookInput: CreateBookInput = {
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
      externalReferences: data.external_references?.length
        ? data.external_references.map(ref => ({
            url: ref.url,
            link_text: ref.link_text || null,
            reference_type: ref.reference_type || null,
          }))
        : undefined,
    }

    mutate(bookInput, {
      onSuccess: (book) => {
        onSuccess(book)
      },
      onError: (error) => {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to create book')
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {/* Error Message */}
      {errorMessage && (
        <div className={`${styles.alert} ${styles.alertError}`} role="alert">
          {errorMessage}
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <div className={`${styles.alert} ${styles.alertWarning}`} role="alert">
          <h4 className={styles.alertTitle}>Similar books found in your collection:</h4>
          <ul className={styles.alertList}>
            {duplicates.map((duplicate) => (
              <li key={duplicate.id}>
                <span className={styles.alertBookTitle}>{duplicate.title}</span> by {duplicate.author_display_name}
                {duplicate.year_published && ` (${duplicate.year_published})`}
                {' '}
                <a
                  href={`/books/${duplicate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.alertLink}
                >
                  View
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.alertNote}>
            You can still add this book if it's intentionally different from the ones listed above.
          </p>
        </div>
      )}

      {/* Required Fields */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Required Information</h3>

        <div>
          <label htmlFor="title" className={styles.label}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className={styles.input}
          />
          {errors.title && (
            <p id="title-error" className={styles.errorMessage}>
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="author_display_name" className={styles.label}>
            Author Display Name *
          </label>
          <input
            id="author_display_name"
            type="text"
            {...register('author_display_name')}
            aria-describedby={errors.author_display_name ? 'author-display-name-error' : undefined}
            className={styles.input}
          />
          {errors.author_display_name && (
            <p id="author-display-name-error" className={styles.errorMessage}>
              {errors.author_display_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Optional Author Fields */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Author Details</h3>

        <div className={styles.grid}>
          <div>
            <label htmlFor="given_name" className={styles.label}>
              Given Name
            </label>
            <input
              id="given_name"
              type="text"
              {...register('given_name')}
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="family_name" className={styles.label}>
              Family Name
            </label>
            <input
              id="family_name"
              type="text"
              {...register('family_name')}
              className={styles.input}
            />
          </div>
        </div>

        <div>
          <label htmlFor="author_lifespan" className={styles.label}>
            Author Lifespan
          </label>
          <input
            id="author_lifespan"
            type="text"
            {...register('author_lifespan')}
            placeholder="e.g., 1564-1616"
            className={styles.input}
          />
        </div>
      </div>

      {/* Book Details */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Book Details</h3>

        <div>
          <label htmlFor="title_original" className={styles.label}>
            Original Title
          </label>
          <input
            id="title_original"
            type="text"
            {...register('title_original')}
            className={styles.input}
          />
        </div>

        <div className={styles.grid}>
          <div>
            <label htmlFor="year_published" className={styles.label}>
              Year Published
            </label>
            <input
              id="year_published"
              type="text"
              {...register('year_published')}
              placeholder="e.g., 1851 or 8th century BC"
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="original_language" className={styles.label}>
              Original Language
            </label>
            <input
              id="original_language"
              type="text"
              {...register('original_language')}
              placeholder="e.g., EN, DE, SV"
              aria-describedby={errors.original_language ? 'original-language-error' : undefined}
              className={styles.input}
            />
            {errors.original_language && (
              <p id="original-language-error" className={styles.errorMessage}>
                {errors.original_language.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="primary_category" className={styles.label}>
            Primary Category
          </label>
          <select
            id="primary_category"
            {...register('primary_category')}
            className={styles.input}
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
          <label htmlFor="tags" className={styles.label}>
            Tags
          </label>
          <input
            id="tags"
            type="text"
            {...register('tags')}
            placeholder="Comma-separated tags (e.g., epic, ancient greece)"
            className={styles.input}
          />
          <p className={styles.helperText}>
            Enter tags separated by commas
          </p>
        </div>

        <div>
          <label htmlFor="source" className={styles.label}>
            Source
          </label>
          <input
            id="source"
            type="text"
            {...register('source')}
            className={styles.input}
          />
        </div>

        <div>
          <label htmlFor="inclusion_rationale" className={styles.label}>
            Inclusion Rationale
          </label>
          <textarea
            id="inclusion_rationale"
            {...register('inclusion_rationale')}
            rows={4}
            className={styles.input}
          />
        </div>
      </div>

      {/* External References */}
      <div className={styles.section}>
        <div className={styles.referencesSection}>
          <h3 className={styles.sectionTitle}>External References</h3>
          <button
            type="button"
            onClick={() => append({ url: '', link_text: '', reference_type: '' })}
            className={styles.buttonSmall}
          >
            Add Reference
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className={styles.referenceItem}>
            <div className={styles.referenceActions}>
              <h4>Reference {index + 1}</h4>
              <button
                type="button"
                onClick={() => remove(index)}
                className={`${styles.buttonSmall} ${styles.buttonDanger}`}
              >
                Remove
              </button>
            </div>

            <div>
              <label htmlFor={`external_references.${index}.url`} className={styles.label}>
                URL *
              </label>
              <input
                id={`external_references.${index}.url`}
                type="text"
                {...register(`external_references.${index}.url`)}
                className={styles.input}
              />
              {errors.external_references?.[index]?.url && (
                <p className={styles.errorMessage}>
                  {errors.external_references[index]?.url?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`external_references.${index}.link_text`} className={styles.label}>
                Link Text
              </label>
              <input
                id={`external_references.${index}.link_text`}
                type="text"
                {...register(`external_references.${index}.link_text`)}
                className={styles.input}
              />
            </div>

            <div>
              <label htmlFor={`external_references.${index}.reference_type`} className={styles.label}>
                Reference Type
              </label>
              <input
                id={`external_references.${index}.reference_type`}
                type="text"
                {...register(`external_references.${index}.reference_type`)}
                placeholder="e.g., analysis, review, full text"
                className={styles.input}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.buttonSecondary}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className={styles.buttonPrimary}
        >
          {isPending ? 'Adding...' : 'Add Book'}
        </button>
      </div>
    </form>
  )
}
