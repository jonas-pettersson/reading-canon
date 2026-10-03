import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component that guards authenticated routes.
 *
 * Behavior:
 * - Shows loading state while checking authentication
 * - Redirects to /login if user is not authenticated (with replace to prevent back button loop)
 * - Renders children if user is authenticated
 *
 * @example
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>
  }

  // Redirect to login if not authenticated
  // Use replace={true} to prevent back button loop
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render protected content
  return <>{children}</>
}
