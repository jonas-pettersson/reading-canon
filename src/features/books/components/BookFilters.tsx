import { useState, useEffect, useCallback } from 'react'
import {
  PRIMARY_CATEGORIES,
  READING_STATUSES,
  OWNERSHIP_STATUSES,
  getReadingStatusDisplayName,
  getOwnershipStatusDisplayName,
  getLanguageDisplayName
} from '../constants'
import { useLanguages } from '../hooks/useLanguages'
import styles from './BookFilters.module.css'

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
 * BookFilters component provides compact search, filter, and sort controls for books.
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
 * - Compact design for better space efficiency
 *
 * @example
 * const [filters, setFilters] = useState<BookFiltersState>(defaultFilters)
 * <BookFilters filters={filters} onFiltersChange={setFilters} />
 */
export function BookFilters({ filters, onFiltersChange }: BookFiltersProps) {
  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState(filters.search)

  // Collapsible filters state
  const [isExpanded, setIsExpanded] = useState(false)

  // Fetch available languages dynamically
  const { data: languages = [] } = useLanguages()

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
    <div className={styles.container}>
      {/* Collapsible Header */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          Filters {hasActiveFilters && `(${Object.keys(filters).filter(k => {
            const v = filters[k as keyof BookFiltersState];
            return v && (Array.isArray(v) ? v.length > 0 : v !== '' && !(k === 'sortBy' && v === 'year') && !(k === 'sortOrder' && v === 'asc'));
          }).length} active)`}
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.toggleButton}
          aria-expanded={isExpanded}
          aria-controls="filter-content"
        >
          {isExpanded ? '▲ Hide' : '▼ Show'}
        </button>
      </div>

      {/* Collapsible Content */}
      <div id="filter-content" className={isExpanded ? '' : styles.collapsed}>
      {/* Search Input */}
      <div className={styles.searchSection}>
        <label htmlFor="search" className={styles.label}>
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title, author, or description..."
          className={styles.input}
        />
        <small className={styles.helpText}>
          Searches: title, original title, author, inclusion rationale
        </small>
      </div>

      {/* Filter Grid */}
      <div className={styles.filterGrid}>
        {/* Category Filter */}
        <div className={styles.filterField}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value })
            }
            className={styles.select}
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
        <div className={styles.filterField}>
          <label htmlFor="tags" className={styles.label}>
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
            className={styles.input}
          />
          <small className={styles.helpText}>
            Separate multiple tags with commas
          </small>
        </div>

        {/* Original Language Filter */}
        <div className={styles.filterField}>
          <label htmlFor="originalLanguage" className={styles.label}>
            Original Language
          </label>
          <select
            id="originalLanguage"
            value={filters.originalLanguage}
            onChange={(e) =>
              onFiltersChange({ ...filters, originalLanguage: e.target.value })
            }
            className={styles.select}
          >
            <option value="">All Languages</option>
            {languages.map((code) => (
              <option key={code} value={code}>
                {getLanguageDisplayName(code)}
              </option>
            ))}
          </select>
        </div>

        {/* Reading Status Filter */}
        <div className={styles.filterField}>
          <label htmlFor="readingStatus" className={styles.label}>
            Reading Status
          </label>
          <select
            id="readingStatus"
            value={filters.readingStatus}
            onChange={(e) =>
              onFiltersChange({ ...filters, readingStatus: e.target.value })
            }
            className={styles.select}
          >
            <option value="">All Statuses</option>
            {READING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getReadingStatusDisplayName(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Ownership Status Filter */}
        <div className={styles.filterField}>
          <label htmlFor="ownershipStatus" className={styles.label}>
            Ownership
          </label>
          <select
            id="ownershipStatus"
            value={filters.ownershipStatus}
            onChange={(e) =>
              onFiltersChange({ ...filters, ownershipStatus: e.target.value })
            }
            className={styles.select}
          >
            <option value="">All</option>
            {OWNERSHIP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getOwnershipStatusDisplayName(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className={styles.sortSection}>
        <div className={styles.sortField}>
          <label htmlFor="sortBy" className={styles.label}>
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
            className={styles.select}
          >
            <option value="year">Year</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>

        <div className={styles.sortField}>
          <label htmlFor="sortOrder" className={styles.label}>
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
            className={styles.select}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className={styles.clearButton}
        >
          Clear Filters
        </button>
      </div>
      </div>
      {/* End Collapsible Content */}
    </div>
  )
}
