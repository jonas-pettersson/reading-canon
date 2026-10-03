import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './auth-context'
import { supabase } from './supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Test that useAuth requires AuthProvider wrapper
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within AuthProvider')
    })
  })

  describe('Initial State', () => {
    it('should start with loading=true and no user/session', async () => {
      // Mock: no existing session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Initial state should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should restore existing session on mount', async () => {
      // Mock: existing session found
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for session to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have restored session
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.session).toEqual(mockSession)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'curator@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      }

      // Mock initial state (no session)
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      // Mock successful sign in
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Sign in
      await result.current.signIn('curator@example.com', 'password123')

      // Should update state with user and session (wait for React state update)
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })
      expect(result.current.session).toEqual(mockSession)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'curator@example.com',
        password: 'password123',
      })
    })

    it('should throw error with invalid credentials', async () => {
      const mockError: AuthError = {
        name: 'AuthApiError',
        message: 'Invalid login credentials',
        status: 400,
      }

      // Mock initial state
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      // Mock failed sign in
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Sign in should throw
      await expect(
        result.current.signIn('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid login credentials')

      // User should remain null
      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })

    it('should handle network errors gracefully', async () => {
      // Mock initial state
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      // Mock network error
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Sign in should throw network error
      await expect(
        result.current.signIn('test@example.com', 'password')
      ).rejects.toThrow('Network error')
    })
  })

  describe('signOut', () => {
    it('should successfully sign out and clear user state', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'curator@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      }

      // Mock initial state (signed in)
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      // Mock successful sign out
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for session to load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Sign out
      await result.current.signOut()

      // Should clear user and session (wait for React state update)
      await waitFor(() => {
        expect(result.current.user).toBe(null)
      })
      expect(result.current.session).toBe(null)
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'curator@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      }

      const mockError: AuthError = {
        name: 'AuthApiError',
        message: 'Sign out failed',
        status: 500,
      }

      // Mock initial state (signed in)
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      // Mock failed sign out
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for session to load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Sign out should throw
      await expect(result.current.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('Auth State Change Listener', () => {
    it('should update state when auth changes (e.g., logout in another tab)', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'curator@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      }

      // Mock initial state (signed in)
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      let authCallback: ((event: string, session: Session | null) => void) | null = null

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        authCallback = callback
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Simulate auth state change (e.g., logout in another tab)
      if (authCallback) {
        authCallback('SIGNED_OUT', null)
      }

      // Should clear user and session
      await waitFor(() => {
        expect(result.current.user).toBe(null)
        expect(result.current.session).toBe(null)
      })
    })

    it('should cleanup subscription on unmount', async () => {
      const unsubscribeMock = vi.fn()

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      })

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
      })

      // Unmount
      unmount()

      // Should have called unsubscribe
      expect(unsubscribeMock).toHaveBeenCalled()
    })
  })
})
