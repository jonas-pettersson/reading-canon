import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersonalDataPanel } from './PersonalDataPanel'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

// Mock the hooks
vi.mock('../hooks/useReadingStatus', () => ({
  useReadingStatus: () => ({
    data: {
      id: '1',
      user_id: 'test-user',
      book_id: 'test-book',
      reading_status: 'reading' as const,
      ownership_status: 'owned_physical' as const,
      personal_rating: 4,
      personal_notes: 'Test notes',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    isLoading: false,
  }),
  useUpdateReadingStatus: () => ({
    mutate: vi.fn(),
  }),
}))

describe('PersonalDataPanel Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PersonalDataPanel bookId="test-book" />
      </QueryClientProvider>
    )

    // Wait for component to render
    await waitFor(() => {
      expect(container.querySelector('h3')).toBeInTheDocument()
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper heading structure', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PersonalDataPanel bookId="test-book" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(container.querySelector('h3')).toBeInTheDocument()
    })

    const heading = container.querySelector('h3')
    expect(heading).toHaveTextContent(/personal reading data/i)
  })

  it('should have accessible form controls', async () => {
    const { getByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <PersonalDataPanel bookId="test-book" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(getByLabelText(/ownership/i)).toBeInTheDocument()
    })

    // Form controls should have labels
    expect(getByLabelText(/ownership/i)).toBeInTheDocument()
    expect(getByLabelText(/personal notes/i)).toBeInTheDocument()
  })
})
