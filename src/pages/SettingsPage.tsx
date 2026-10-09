import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import styles from './SettingsPage.module.css'

/**
 * SettingsPage - User settings and profile
 *
 * MVP 0 Implementation (Minimal):
 * - Display user profile information (read-only)
 * - Logout functionality
 *
 * MVP 1 Expansion (Planned):
 * - User preferences (theme, default filters)
 * - Profile editing
 * - Data export
 * - Account management
 * - User management (curator only)
 */
export function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>No user logged in</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Settings</h1>

      {/* User Profile Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User Profile</h2>

        <div className={styles.profileGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.value}>{user.email}</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>User ID</label>
            <div className={styles.valueSecondary}>{user.id}</div>
            <p className={styles.helpText}>For debugging and support purposes</p>
          </div>
        </div>
      </section>

      {/* Account Actions Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Log Out
        </button>
      </section>

      {/* MVP0 Note */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Settings page will be expanded in future releases with user preferences, profile editing,
          and account management features.
        </p>
      </footer>
    </div>
  )
}
