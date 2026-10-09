import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddBookForm } from './AddBookForm'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

describe('AddBookForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const onSuccess = vi.fn()

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AddBookForm onSuccess={onSuccess} />
      </QueryClientProvider>
    )

    // Wait for form to render fully
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument()
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have accessible form labels', async () => {
    const onSuccess = vi.fn()

    const { getByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <AddBookForm onSuccess={onSuccess} />
      </QueryClientProvider>
    )

    // Wait for form to render
    await waitFor(() => {
      expect(getByLabelText(/^title \*/i)).toBeInTheDocument()
    })

    // All form fields should have associated labels (using exact matches)
    expect(getByLabelText(/^title \*/i)).toBeInTheDocument()
    expect(getByLabelText(/author display name/i)).toBeInTheDocument()
    expect(getByLabelText(/year published/i)).toBeInTheDocument()
    expect(getByLabelText(/primary category/i)).toBeInTheDocument()
  })

  it('should have accessible buttons', async () => {
    const onSuccess = vi.fn()

    const { getByRole } = render(
      <QueryClientProvider client={queryClient}>
        <AddBookForm onSuccess={onSuccess} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: /add book/i })).toBeInTheDocument()
    })

    const submitButton = getByRole('button', { name: /add book/i })
    expect(submitButton).toHaveAccessibleName()
  })
})
