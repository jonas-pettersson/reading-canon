import { useEffect, useRef } from 'react'

/**
 * ConfirmDialog - Generic confirmation dialog
 *
 * Features:
 * - Accessible (focus trap, ESC key, ARIA attributes)
 * - Keyboard navigation
 * - Customizable title, message, and button labels
 * - Overlay/backdrop click to cancel
 */

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management: focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus()
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onCancel])

  // Focus trap: keep focus within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const dialog = dialogRef.current
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    dialog.addEventListener('keydown', handleTab)
    return () => {
      dialog.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="dialog-overlay"
        onClick={onCancel}
        role="presentation"
        aria-hidden={!isOpen}
      >
        <div
          ref={dialogRef}
          className={`dialog ${variant === 'danger' ? 'dialog-danger' : ''}`}
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-message"
        >
          <h2 id="dialog-title" className="dialog-title">
            {title}
          </h2>
          <p id="dialog-message" className="dialog-message">
            {message}
          </p>
          <div className="dialog-actions">
            <button
              className="dialog-button dialog-button-cancel"
              onClick={onCancel}
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmButtonRef}
              className={`dialog-button dialog-button-confirm ${
                variant === 'danger' ? 'dialog-button-danger' : ''
              }`}
              onClick={onConfirm}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: dialog-overlay-fade-in 0.15s ease-out;
        }

        @keyframes dialog-overlay-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .dialog {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: var(--shadow);
          padding: 1.5rem;
          max-width: 500px;
          width: 90%;
          animation: dialog-slide-in 0.2s ease-out;
        }

        @keyframes dialog-slide-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .dialog-title {
          color: var(--text-h);
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem;
        }

        .dialog-message {
          color: var(--text);
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 1.5rem;
        }

        .dialog-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .dialog-button {
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
        }

        .dialog-button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .dialog-button-cancel {
          background: var(--bg);
          color: var(--text);
          border-color: var(--border);
        }

        .dialog-button-cancel:hover {
          background: var(--code-bg);
          border-color: var(--text);
        }

        .dialog-button-confirm {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .dialog-button-confirm:hover {
          opacity: 0.9;
          box-shadow: 0 2px 8px rgba(170, 59, 255, 0.3);
        }

        /* Danger variant */
        .dialog-danger .dialog-title {
          color: #dc2626;
        }

        .dialog-button-danger {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .dialog-button-danger:hover {
          background: #b91c1c;
          border-color: #b91c1c;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }

        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .dialog-overlay {
            background: rgba(0, 0, 0, 0.7);
          }

          .dialog-danger .dialog-title {
            color: #f87171;
          }

          .dialog-button-danger {
            background: #dc2626;
            border-color: #dc2626;
          }

          .dialog-button-danger:hover {
            background: #b91c1c;
            border-color: #b91c1c;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .dialog {
            width: 95%;
            padding: 1.25rem;
          }

          .dialog-actions {
            flex-direction: column-reverse;
          }

          .dialog-button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
    </>
  )
}
