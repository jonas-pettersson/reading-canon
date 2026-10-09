import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'

// Mock the auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

describe('AppLayout Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      </MemoryRouter>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper navigation landmarks', () => {
    const { container } = render(
      <MemoryRouter>
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      </MemoryRouter>
    )

    const nav = container.querySelector('nav')
    const main = container.querySelector('main')

    expect(nav).toBeInTheDocument()
    expect(main).toBeInTheDocument()
  })

  it('should have accessible navigation links', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      </MemoryRouter>
    )

    // All navigation links should be accessible
    expect(getByRole('link', { name: /collection/i })).toBeInTheDocument()
    expect(getByRole('link', { name: /reading dashboard/i })).toBeInTheDocument()
    expect(getByRole('link', { name: /statistics/i })).toBeInTheDocument()
  })
})
