import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'
import { LoginPage } from '@/pages/LoginPage'

/**
 * Main App component with routing and authentication.
 *
 * Route structure:
 * - /login: Authentication page
 * - /: Home page (placeholder for MVP 0)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Reading Canon</h1>
                <p>Home page - Coming soon</p>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
