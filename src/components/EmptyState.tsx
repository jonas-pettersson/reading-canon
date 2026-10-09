import { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon?: string
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

/**
 * EmptyState - Reusable component for empty state UI
 *
 * Features:
 * - Icon (optional emoji or text)
 * - Title (bold heading)
 * - Message (explanatory text)
 * - Primary action button (optional)
 * - Secondary action button/link (optional)
 * - Custom children (optional)
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon="📚"
 *   title="No books yet"
 *   message="Add your first book to get started"
 *   action={{ label: "Add Book", onClick: () => navigate('/books/new') }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>

      {(action || secondaryAction) && (
        <div className={styles.actions}>
          {action && (
            <button onClick={action.onClick} className={styles.primaryButton}>
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} className={styles.secondaryButton}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {children && <div className={styles.customContent}>{children}</div>}
    </div>
  )
}
