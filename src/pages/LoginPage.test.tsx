import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { AuthProvider } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

// Helper to render LoginPage with routing context
const renderLoginPage = (initialRoute = '/login', isAuthenticated = false) => {
  // Mock session data
  const mockUser: User = {
    id: 'test-user-id',
    email: 'curator@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
  }

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockUser,
  }

  // Setup auth mock based on authentication state
  if (isAuthenticated) {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: mockSession,
      },
      error: null,
    })
  } else {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: null,
      },
      error: null,
    })
  }

  vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
    data: {
      subscription: {
        id: 'mock-subscription-id',
        callback: vi.fn(),
        unsubscribe: vi.fn(),
      },
    },
  })

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the login page heading', async () => {
      renderLoginPage()

      expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should render the login form', async () => {
      renderLoginPage()

      expect(await screen.findByLabelText(/email/i)).toBeInTheDocument()
      expect(await screen.findByLabelText(/password/i)).toBeInTheDocument()
      expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should have proper semantic structure', async () => {
      renderLoginPage()

      // Page should have a main landmark
      const heading = await screen.findByRole('heading', { name: /sign in/i })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Authentication Redirect', () => {
    it('should redirect authenticated users to home page', async () => {
      renderLoginPage('/login', true)

      // Wait for redirect to home page
      expect(await screen.findByText('Home Page')).toBeInTheDocument()

      // Login page should not be visible
      expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument()
    })

    it('should allow unauthenticated users to access the page', async () => {
      renderLoginPage('/login', false)

      expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      expect(await screen.findByLabelText(/email/i)).toBeInTheDocument()
    })
  })

  describe('Post-Login Redirect', () => {
    it('should redirect to home after successful login', async () => {
      const user = userEvent.setup()

      // Mock successful login
      const mockUser: User = {
        id: 'test-user-id',
        email: 'curator@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z',
      }

      const mockSession: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockUser,
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      renderLoginPage('/login', false)

      // Wait for form to render, then fill out and submit
      const emailInput = await screen.findByLabelText(/email/i)
      const passwordInput = await screen.findByLabelText(/password/i)
      const submitButton = await screen.findByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'curator@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should redirect to home page after successful login
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })

      expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form elements', async () => {
      renderLoginPage()

      const emailInput = await screen.findByLabelText(/email/i)
      const passwordInput = await screen.findByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('should have keyboard-accessible navigation', async () => {
      renderLoginPage()

      const emailInput = await screen.findByLabelText(/email/i)
      const passwordInput = await screen.findByLabelText(/password/i)
      const submitButton = await screen.findByRole('button', { name: /sign in/i })

      // All interactive elements should be focusable
      expect(emailInput).not.toHaveAttribute('tabindex', '-1')
      expect(passwordInput).not.toHaveAttribute('tabindex', '-1')
      expect(submitButton).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
