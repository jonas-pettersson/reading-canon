import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { CollectionPage } from '@/pages/CollectionPage'
import { BookDetailPage } from '@/pages/BookDetailPage'

// Create a client for TanStack Query
const queryClient = new QueryClient()

/**
 * Main App component with routing and authentication.
 *
 * Route structure:
 * - /login: Authentication page
 * - / (protected): Application with persistent layout
 *   - /: Collection page (coming in Task 2.2.5)
 *   - /reading: Reading Dashboard (Phase 4)
 *   - /stats: Statistics (Phase 5)
 *   - /settings: Settings (Phase 6)
 *   - /books/:id: Book detail page (Task 2.3.2)
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Collection page - Task 2.2.5 complete */}
              <Route index element={<CollectionPage />} />
              <Route path="collection" element={<CollectionPage />} />

              {/* Book detail page - Task 2.3.2 */}
              <Route path="books/:id" element={<BookDetailPage />} />

              {/* Reading Dashboard - placeholder until Phase 4 */}
            <Route
              path="reading"
              element={
                <div>
                  <h2>Reading Dashboard</h2>
                  <p>Coming in Phase 4</p>
                </div>
              }
            />
            {/* Statistics - placeholder until Phase 5 */}
            <Route
              path="stats"
              element={
                <div>
                  <h2>Statistics</h2>
                  <p>Coming in Phase 5</p>
                </div>
              }
            />
            {/* Settings - placeholder until Phase 6 */}
            <Route
              path="settings"
              element={
                <div>
                  <h2>Settings</h2>
                  <p>Coming in Phase 6</p>
                </div>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
