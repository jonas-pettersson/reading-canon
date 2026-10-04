import { useState, useEffect, useCallback } from 'react'
import { PRIMARY_CATEGORIES, READING_STATUSES, OWNERSHIP_STATUSES } from '../constants'

export interface BookFiltersState {
  search: string
  category: string
  tags: string[]
  originalLanguage: string
  readingStatus: string
  ownershipStatus: string
  sortBy: 'title' | 'author' | 'year'
  sortOrder: 'asc' | 'desc'
}

export interface BookFiltersProps {
  filters: BookFiltersState
  onFiltersChange: (filters: BookFiltersState) => void
}

/**
 * BookFilters component provides search, filter, and sort controls for books.
 *
 * Features:
 * - Debounced search input (300ms)
 * - Category filter dropdown
 * - Tags multi-select
 * - Original language filter
 * - Reading status filter
 * - Ownership status filter
 * - Sort controls (title, author, year)
 * - Clear all filters button
 * - Accessible form controls
 *
 * @example
 * const [filters, setFilters] = useState<BookFiltersState>(defaultFilters)
 * <BookFilters filters={filters} onFiltersChange={setFilters} />
 */
export function BookFilters({ filters, onFiltersChange }: BookFiltersProps) {
  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState(filters.search)

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync search input when filters.search changes externally
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  const handleClearFilters = useCallback(() => {
    const clearedFilters: BookFiltersState = {
      search: '',
      category: '',
      tags: [],
      originalLanguage: '',
      readingStatus: '',
      ownershipStatus: '',
      sortBy: 'year',
      sortOrder: 'asc',
    }
    setSearchInput('')
    onFiltersChange(clearedFilters)
  }, [onFiltersChange])

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.tags.length > 0 ||
    filters.originalLanguage ||
    filters.readingStatus ||
    filters.ownershipStatus ||
    filters.sortBy !== 'year' ||
    filters.sortOrder !== 'asc'

  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '1.5rem',
      }}
    >
      {/* Search Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="search"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
          }}
        >
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title, author, or description..."
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <small style={{ color: '#666', fontSize: '0.85rem' }}>
          Searches: title, original title, author, inclusion rationale
        </small>
      </div>

      {/* Filter Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        {/* Category Filter */}
        <div>
          <label
            htmlFor="category"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">All Categories</option>
            {PRIMARY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label
            htmlFor="tags"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={filters.tags.join(', ')}
            onChange={(e) => {
              const tagsArray = e.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
              onFiltersChange({ ...filters, tags: tagsArray })
            }}
            placeholder="e.g., epic, ancient"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Separate multiple tags with commas
          </small>
        </div>

        {/* Original Language Filter */}
        <div>
          <label
            htmlFor="originalLanguage"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Original Language
          </label>
          <input
            id="originalLanguage"
            type="text"
            value={filters.originalLanguage}
            onChange={(e) =>
              onFiltersChange({ ...filters, originalLanguage: e.target.value })
            }
            placeholder="e.g., Ancient Greek"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Reading Status Filter */}
        <div>
          <label
            htmlFor="readingStatus"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Reading Status
          </label>
          <select
            id="readingStatus"
            value={filters.readingStatus}
            onChange={(e) =>
              onFiltersChange({ ...filters, readingStatus: e.target.value })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">All Statuses</option>
            {READING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Ownership Status Filter */}
        <div>
          <label
            htmlFor="ownershipStatus"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Ownership
          </label>
          <select
            id="ownershipStatus"
            value={filters.ownershipStatus}
            onChange={(e) =>
              onFiltersChange({ ...filters, ownershipStatus: e.target.value })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">All</option>
            {OWNERSHIP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <label
            htmlFor="sortBy"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortBy: e.target.value as 'title' | 'author' | 'year',
              })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="year">Year</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label
            htmlFor="sortOrder"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Order
          </label>
          <select
            id="sortOrder"
            value={filters.sortOrder}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortOrder: e.target.value as 'asc' | 'desc',
              })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: '500',
            color: hasActiveFilters ? '#c00' : '#999',
            backgroundColor: 'white',
            border: `1px solid ${hasActiveFilters ? '#c00' : '#ccc'}`,
            borderRadius: '4px',
            cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
            opacity: hasActiveFilters ? 1 : 0.6,
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}
