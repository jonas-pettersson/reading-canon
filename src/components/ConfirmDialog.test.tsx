import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ConfirmDialog
          isOpen={false}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })

  describe('Content Display', () => {
    it('should display title and message', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="This action cannot be undone. The book and all associated data will be permanently removed."
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Delete Book')).toBeInTheDocument()
      expect(
        screen.getByText(/This action cannot be undone/)
      ).toBeInTheDocument()
    })

    it('should display default button labels', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should display custom button labels', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          confirmLabel="Delete Forever"
          cancelLabel="Go Back"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Delete Forever')).toBeInTheDocument()
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      await user.click(screen.getByText('Cancel'))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should call onConfirm when Confirm button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      await user.click(screen.getByText('Confirm'))

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('should call onCancel when overlay is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const overlay = screen.getByRole('presentation')
      await user.click(overlay)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should not call onCancel when dialog content is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      await user.click(dialog)

      expect(mockOnCancel).not.toHaveBeenCalled()
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Accessibility', () => {
    it('should call onCancel when ESC key is pressed', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      await user.keyboard('{Escape}')

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should not call onCancel when ESC is pressed and dialog is closed', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={false}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      await user.keyboard('{Escape}')

      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('Focus Management', () => {
    it('should focus the confirm button when dialog opens', () => {
      const { rerender } = render(
        <ConfirmDialog
          isOpen={false}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      // Open the dialog
      rerender(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const confirmButton = screen.getByText('Confirm')
      expect(document.activeElement).toBe(confirmButton)
    })

    it('should trap focus within dialog using Tab key', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Confirm')

      // Confirm button should be focused initially
      expect(document.activeElement).toBe(confirmButton)

      // Tab should cycle to Cancel button
      await user.keyboard('{Tab}')
      expect(document.activeElement).toBe(cancelButton)

      // Tab again should wrap back to Confirm button
      await user.keyboard('{Tab}')
      expect(document.activeElement).toBe(confirmButton)
    })

    it('should trap focus using Shift+Tab (reverse)', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Confirm')

      // Confirm button should be focused initially
      expect(document.activeElement).toBe(confirmButton)

      // Shift+Tab should wrap to Cancel button
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(document.activeElement).toBe(cancelButton)

      // Shift+Tab again should wrap to Confirm button
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(document.activeElement).toBe(confirmButton)
    })
  })

  describe('ARIA Attributes', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('alertdialog')

      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-message')
    })

    it('should have properly linked title and message', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Delete Book')).toHaveAttribute(
        'id',
        'dialog-title'
      )
      expect(screen.getByText('Are you sure?')).toHaveAttribute(
        'id',
        'dialog-message'
      )
    })
  })

  describe('Variant Styling', () => {
    it('should apply danger variant class to dialog', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          variant="danger"
        />
      )

      const dialog = screen.getByRole('alertdialog')
      expect(dialog).toHaveClass('dialog-danger')
    })

    it('should apply danger variant class to confirm button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          variant="danger"
        />
      )

      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveClass('dialog-button-danger')
    })

    it('should not apply danger classes with default variant', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Book"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const confirmButton = screen.getByText('Confirm')

      expect(dialog).not.toHaveClass('dialog-danger')
      expect(confirmButton).not.toHaveClass('dialog-button-danger')
    })
  })
})
