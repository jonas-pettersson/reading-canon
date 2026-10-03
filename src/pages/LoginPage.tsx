import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/LoginForm'
import { useAuth } from '@/lib/auth-context'

/**
 * LoginPage component that handles user authentication.
 *
 * Features:
 * - Renders the LoginForm component
 * - Redirects authenticated users to home page
 * - Redirects to home after successful login
 * - Accessible page layout with semantic HTML
 *
 * @example
 * <Route path="/login" element={<LoginPage />} />
 */
export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to home page
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  // Show nothing while checking authentication state
  // This prevents flash of login form for already-authenticated users
  if (loading) {
    return null
  }

  // Don't render login form if user is authenticated
  // (useEffect will redirect, but this prevents a flash)
  if (user) {
    return null
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: '2rem',
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333',
          }}
        >
          Sign in
        </h1>
        <LoginForm />
      </div>
    </div>
  )
}
