import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './AppLayout'

// Mock the auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

// Helper to render AppLayout with router
function renderAppLayout() {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<div>Test content</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

describe('AppLayout Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = renderAppLayout()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper navigation landmarks', () => {
    const { container } = renderAppLayout()

    const nav = container.querySelector('nav')
    const main = container.querySelector('main')

    expect(nav).toBeInTheDocument()
    expect(main).toBeInTheDocument()
  })

  it('should have accessible navigation links', () => {
    const { getByRole } = renderAppLayout()

    // All navigation links should be accessible
    expect(getByRole('link', { name: /collection/i })).toBeInTheDocument()
    expect(getByRole('link', { name: /reading dashboard/i })).toBeInTheDocument()
    expect(getByRole('link', { name: /statistics/i })).toBeInTheDocument()
  })
})
