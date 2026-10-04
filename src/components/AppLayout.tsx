import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

/**
 * AppLayout - Main application layout with persistent navigation
 *
 * Provides:
 * - Persistent navigation menu (desktop and mobile)
 * - Active route highlighting
 * - User info display
 * - Logout functionality
 * - Responsive hamburger menu for mobile
 */
export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Reading Canon</h1>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
          >
            <span className="menu-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>

          {/* Desktop navigation */}
          <nav
            id="main-navigation"
            className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}
            role="navigation"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Collection
            </NavLink>
            <NavLink
              to="/reading"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Reading Dashboard
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Statistics
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Settings
            </NavLink>
          </nav>

          {/* User info and logout */}
          <div className="user-section">
            <span className="user-email">{user?.email}</span>
            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main role="main" className="main-content">
        <Outlet />
      </main>

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background: #2c3e50;
          color: white;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .app-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          margin-left: auto;
        }

        .menu-icon {
          display: block;
          width: 24px;
          height: 24px;
        }

        .main-nav {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex: 1;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.15);
          font-weight: 500;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: auto;
        }

        .user-email {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
        }

        .logout-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .main-content {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block;
          }

          .header-content {
            flex-wrap: wrap;
          }

          .app-title {
            flex: 1;
          }

          .main-nav {
            display: none;
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            padding-top: 1rem;
          }

          .main-nav.mobile-open {
            display: flex;
          }

          .nav-link {
            padding: 0.75rem 1rem;
          }

          .user-section {
            width: 100%;
            justify-content: space-between;
            margin-left: 0;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>
    </div>
  )
}
