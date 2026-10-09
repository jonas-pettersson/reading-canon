import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { CollectionPage } from '@/pages/CollectionPage'
import { BookDetailPage } from '@/pages/BookDetailPage'
import { AddBookPage } from '@/pages/AddBookPage'
import { EditBookPage } from '@/pages/EditBookPage'
import { ReadingDashboardPage } from '@/pages/ReadingDashboardPage'
import { StatsPage } from '@/pages/StatsPage'
import { SettingsPage } from '@/pages/SettingsPage'

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
        <Toaster position="top-right" richColors closeButton />
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

              {/* Add book page - Task 3.1.3 */}
              <Route path="books/new" element={<AddBookPage />} />

              {/* Edit book page - Task 3.2.2 */}
              <Route path="books/:id/edit" element={<EditBookPage />} />

              {/* Book detail page - Task 2.3.2 */}
              <Route path="books/:id" element={<BookDetailPage />} />

              {/* Reading Dashboard - Task 4.2.4 */}
              <Route path="reading" element={<ReadingDashboardPage />} />

              {/* Statistics - Task 4.3.2 */}
              <Route path="stats" element={<StatsPage />} />

              {/* Settings - Task 6.1.5 (MVP0 minimal implementation) */}
              <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
