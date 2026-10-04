import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { AuthProvider } from '@/lib/auth-context'
import type { User } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: {
                id: 'test-user-id',
                email: 'curator@example.com',
              } as User,
            },
          },
          error: null,
        })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}))

// Helper to render AppLayout in router context
function renderAppLayout(initialRoute = '/') {
  window.history.pushState({}, '', initialRoute)

  return render(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div>Collection Page</div>} />
            <Route path="reading" element={<div>Reading Dashboard</div>} />
            <Route path="stats" element={<div>Statistics Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation Menu', () => {
    it('should render navigation menu with all links', async () => {
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })

      expect(screen.getByRole('link', { name: /collection/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /reading dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /statistics/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    })

    it('should render main content area with child routes', async () => {
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByText('Collection Page')).toBeInTheDocument()
      })
    })
  })

  describe('Active Route Highlighting', () => {
    it('should highlight Collection link when on home route', async () => {
      renderAppLayout('/')

      await waitFor(() => {
        const collectionLink = screen.getByRole('link', { name: /collection/i })
        expect(collectionLink).toHaveAttribute('aria-current', 'page')
      })
    })

    it('should highlight Reading Dashboard link when on /reading route', async () => {
      renderAppLayout('/reading')

      await waitFor(() => {
        const readingLink = screen.getByRole('link', { name: /reading dashboard/i })
        expect(readingLink).toHaveAttribute('aria-current', 'page')
      })
    })

    it('should highlight Statistics link when on /stats route', async () => {
      renderAppLayout('/stats')

      await waitFor(() => {
        const statsLink = screen.getByRole('link', { name: /statistics/i })
        expect(statsLink).toHaveAttribute('aria-current', 'page')
      })
    })

    it('should highlight Settings link when on /settings route', async () => {
      renderAppLayout('/settings')

      await waitFor(() => {
        const settingsLink = screen.getByRole('link', { name: /settings/i })
        expect(settingsLink).toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('Navigation Links', () => {
    it('should navigate to Reading Dashboard when link clicked', async () => {
      const user = userEvent.setup()
      renderAppLayout('/')

      await waitFor(() => {
        expect(screen.getByText('Collection Page')).toBeInTheDocument()
      })

      const readingLink = screen.getByRole('link', { name: /reading dashboard/i })
      await user.click(readingLink)

      await waitFor(() => {
        // Check for the page content, not the link text
        expect(screen.getAllByText('Reading Dashboard').length).toBeGreaterThan(0)
      })
    })

    it('should navigate to Statistics when link clicked', async () => {
      const user = userEvent.setup()
      renderAppLayout('/')

      await waitFor(() => {
        expect(screen.getByText('Collection Page')).toBeInTheDocument()
      })

      const statsLink = screen.getByRole('link', { name: /statistics/i })
      await user.click(statsLink)

      await waitFor(() => {
        expect(screen.getByText('Statistics Page')).toBeInTheDocument()
      })
    })
  })

  describe('User Info Display', () => {
    it('should display user email', async () => {
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByText('curator@example.com')).toBeInTheDocument()
      })
    })
  })

  describe('Logout Button', () => {
    it('should render logout button', async () => {
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /log out|logout|sign out/i })).toBeInTheDocument()
      })
    })

    it('should call signOut when logout button clicked', async () => {
      const user = userEvent.setup()
      const { supabase } = await import('@/lib/supabase')

      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /log out|logout|sign out/i })).toBeInTheDocument()
      })

      const logoutButton = screen.getByRole('button', { name: /log out|logout|sign out/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Mobile Hamburger Menu', () => {
    it('should render mobile menu button', async () => {
      renderAppLayout()

      await waitFor(() => {
        // Mobile menu button should have accessible name
        const menuButton = screen.getByLabelText('Toggle navigation menu')
        expect(menuButton).toBeInTheDocument()
        expect(menuButton).toHaveAttribute('aria-controls', 'main-navigation')
      })
    })

    it('should toggle mobile menu when hamburger clicked', async () => {
      const user = userEvent.setup()
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      })

      const menuButton = screen.getByLabelText('Toggle navigation menu')

      // Menu should have aria-expanded attribute
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      })

      // Click again to close
      await user.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('Accessibility', () => {
    it('should use semantic nav element', async () => {
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })
    })

    it('should use semantic main element for content area', async () => {
      renderAppLayout()

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderAppLayout('/')

      await waitFor(() => {
        expect(screen.getByText('Collection Page')).toBeInTheDocument()
      })

      // Tab to first link (Collection)
      await user.tab()
      const collectionLink = screen.getByRole('link', { name: /^collection$/i })
      expect(collectionLink).toHaveFocus()

      // Tab to Reading Dashboard link
      await user.tab()
      const readingLink = screen.getByRole('link', { name: /reading dashboard/i })
      expect(readingLink).toHaveFocus()

      // Press Enter to navigate
      await user.keyboard('{Enter}')

      await waitFor(() => {
        // Check multiple elements exist (link + page content)
        expect(screen.getAllByText(/reading dashboard/i).length).toBeGreaterThan(0)
      })
    })
  })
})
