import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { CollectionPage } from './CollectionPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

// Mock the hooks
vi.mock('@/features/books/hooks/useBooks', () => ({
  useBooks: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/features/reading/hooks/useReadingStatus', () => ({
  useReadingStatusBatch: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe('CollectionPage Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CollectionPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for page to render
    await waitFor(() => {
      expect(container.querySelector('h1')).toBeInTheDocument()
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CollectionPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(container.querySelector('h1')).toBeInTheDocument()
    })

    const h1 = container.querySelector('h1')
    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent(/collection/i)
  })

  it('should have accessible search and filter controls', async () => {
    const { getByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CollectionPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(getByLabelText(/search/i)).toBeInTheDocument()
    })

    const searchBox = getByLabelText(/search/i)
    expect(searchBox).toBeInTheDocument()
    expect(searchBox).toHaveAccessibleName()
  })
})
