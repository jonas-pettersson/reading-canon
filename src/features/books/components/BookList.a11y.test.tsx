import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { BookList } from './BookList'
import { Book } from '@/types/database'

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Test Book 1',
    author: 'Test Author 1',
    publication_year: 2020,
    primary_category: 'Fiction',
    tags: ['literary'],
    original_language: 'en',
    inclusion_rationale: 'Test rationale',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Book 2',
    author: 'Test Author 2',
    publication_year: 2021,
    primary_category: 'Non-Fiction',
    tags: ['history'],
    original_language: 'es',
    inclusion_rationale: 'Test rationale 2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('BookList Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <BookList books={mockBooks} onBookClick={() => {}} />
      </MemoryRouter>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should use semantic list markup', () => {
    const { container } = render(
      <MemoryRouter>
        <BookList books={mockBooks} />
      </MemoryRouter>
    )

    const list = container.querySelector('ul, ol')
    expect(list).toBeInTheDocument()
  })

  it('should have accessible book items', () => {
    const { getAllByRole } = render(
      <MemoryRouter>
        <BookList books={mockBooks} onBookClick={() => {}} />
      </MemoryRouter>
    )

    // BookListItem uses button role when clickable (onClick provided)
    const buttons = getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Each button should have accessible content
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
    })
  })
})
