import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { SettingsPage } from './SettingsPage'
import * as authContext from '@/lib/auth-context'

// Mock the auth context
vi.mock('@/lib/auth-context', async () => {
  const actual = await vi.importActual('@/lib/auth-context')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('SettingsPage', () => {
  const mockSignOut = vi.fn()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementation
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: {
        id: 'test-user-id-123',
        email: 'curator@example.com',
      },
      loading: false,
      signOut: mockSignOut,
    })

    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  describe('Page Rendering', () => {
    it('should render the settings page heading', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
    })

    it('should display user profile section', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/user profile/i)).toBeInTheDocument()
    })
  })

  describe('User Profile Display', () => {
    it('should display user email', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText('curator@example.com')).toBeInTheDocument()
    })

    it('should display user ID for debugging', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/test-user-id-123/i)).toBeInTheDocument()
    })

    it('should label email field', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/email/i)).toBeInTheDocument()
    })

    it('should label user ID field', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/user id/i)).toBeInTheDocument()
    })
  })

  describe('Logout Functionality', () => {
    it('should render logout button', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByRole('button', { name: /log out|logout/i })).toBeInTheDocument()
    })

    it('should call signOut when logout button is clicked', async () => {
      mockSignOut.mockResolvedValue(undefined)
      const user = userEvent.setup()

      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      const logoutButton = screen.getByRole('button', { name: /log out|logout/i })
      await user.click(logoutButton)

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('should navigate to login page after successful logout', async () => {
      mockSignOut.mockResolvedValue(undefined)
      const user = userEvent.setup()

      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      const logoutButton = screen.getByRole('button', { name: /log out|logout/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading state while auth is loading', () => {
      vi.mocked(authContext.useAuth).mockReturnValue({
        user: null,
        loading: true,
        signOut: mockSignOut,
      })

      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should show message when no user is logged in', () => {
      vi.mocked(authContext.useAuth).mockReturnValue({
        user: null,
        loading: false,
        signOut: mockSignOut,
      })

      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/no user logged in/i)).toBeInTheDocument()
    })
  })

  describe('MVP0 Implementation Note', () => {
    it('should include note about MVP1 expansion', () => {
      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      )

      // Check for some indication this is MVP0 minimal version
      expect(screen.getByText(/user profile/i)).toBeInTheDocument()
    })
  })
})
