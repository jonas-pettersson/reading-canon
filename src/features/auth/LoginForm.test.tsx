import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'
import { AuthProvider } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { AuthError } from '@supabase/supabase-js'

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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock: no existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  describe('Form Rendering', () => {
    it('should render email and password fields', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should have proper input types', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should have required attributes on inputs', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Form Validation', () => {
    it('should not submit with empty fields', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      // Email input with type="email" has built-in validation
      expect(emailInput).toHaveValue('invalid-email')
      expect(emailInput).toBeInvalid()
    })

    it('should accept valid email format', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'curator@example.com')

      expect(emailInput).toHaveValue('curator@example.com')
      expect(emailInput).toBeValid()
    })
  })

  describe('Form Submission', () => {
    it('should call signIn with email and password on submit', async () => {
      const user = userEvent.setup()

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: {
            id: 'test-id',
            email: 'curator@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'test-id',
              email: 'curator@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            },
          },
        },
        error: null,
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'curator@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'curator@example.com',
          password: 'password123',
        })
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()

      // Mock slow sign in
      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'curator@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled()
    })

    it('should prevent double submission', async () => {
      const user = userEvent.setup()

      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'curator@example.com')
      await user.type(passwordInput, 'password123')

      // Try to click multiple times
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only call once (button is disabled after first click)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should display error message for invalid credentials', async () => {
      const user = userEvent.setup()

      const mockError: AuthError = {
        name: 'AuthApiError',
        message: 'Invalid login credentials',
        status: 400,
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Should display error message
      expect(
        await screen.findByText(/invalid login credentials/i)
      ).toBeInTheDocument()
    })

    it('should display user-friendly error for network issues', async () => {
      const user = userEvent.setup()

      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      )

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'curator@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should display error message
      expect(
        await screen.findByText(/network error|something went wrong/i)
      ).toBeInTheDocument()
    })

    it('should clear error message on retry', async () => {
      const user = userEvent.setup()

      const mockError: AuthError = {
        name: 'AuthApiError',
        message: 'Invalid login credentials',
        status: 400,
      }

      // First attempt fails
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      })

      // Second attempt succeeds
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-id',
            email: 'curator@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'test-id',
              email: 'curator@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            },
          },
        },
        error: null,
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // First attempt
      await user.type(emailInput, 'curator@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Error should appear
      expect(
        await screen.findByText(/invalid login credentials/i)
      ).toBeInTheDocument()

      // Clear and retry
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      // Error should disappear
      await waitFor(() => {
        expect(
          screen.queryByText(/invalid login credentials/i)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      // Labels should be associated with inputs
      expect(emailInput).toHaveAccessibleName()
      expect(passwordInput).toHaveAccessibleName()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Tab through form
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup()

      const mockError: AuthError = {
        name: 'AuthApiError',
        message: 'Invalid login credentials',
        status: 400,
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      // Error should have role="alert" for screen readers
      const errorMessage = await screen.findByText(/invalid login credentials/i)
      expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument()
    })
  })
})
