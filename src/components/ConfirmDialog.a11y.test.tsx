import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog Accessibility', () => {
  it('should have no accessibility violations when open', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper dialog role and aria attributes', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    const { getByRole } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    // ConfirmDialog uses alertdialog role (more specific than dialog)
    const dialog = getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAccessibleName()
  })

  it('should have accessible buttons', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    const { getByRole } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const confirmButton = getByRole('button', { name: /confirm/i })
    const cancelButton = getByRole('button', { name: /cancel/i })

    expect(confirmButton).toHaveAccessibleName()
    expect(cancelButton).toHaveAccessibleName()
  })
})
