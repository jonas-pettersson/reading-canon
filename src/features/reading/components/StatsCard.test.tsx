import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatsCard } from './StatsCard'

describe('StatsCard', () => {
  it('renders label and count', () => {
    render(<StatsCard label="Want to Read" count={42} />)

    expect(screen.getByText('Want to Read')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders zero count', () => {
    render(<StatsCard label="Reading" count={0} />)

    expect(screen.getByText('Reading')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders as a static card without onClick', () => {
    render(<StatsCard label="Finished" count={10} />)

    const card = screen.getByText('Finished').closest('div')
    expect(card).toBeInTheDocument()
    expect(card?.tagName).not.toBe('BUTTON')
  })

  it('renders as a clickable button when onClick provided', () => {
    const handleClick = vi.fn()
    render(<StatsCard label="Want to Read" count={5} onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /want to read/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<StatsCard label="Want to Read" count={5} onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /want to read/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when using keyboard navigation on static card', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<StatsCard label="Want to Read" count={5} />)

    const card = screen.getByText('Want to Read').closest('div')
    if (card) {
      card.focus()
      await user.keyboard('{Enter}')
    }

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies consistent styling with rounded corners and shadow', () => {
    const { container } = render(<StatsCard label="Finished" count={20} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('shadow')
  })

  it('has proper dark mode classes', () => {
    const { container } = render(<StatsCard label="Reading" count={3} />)

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('dark:bg-gray-800')
  })

  it('displays count with proper text size', () => {
    render(<StatsCard label="Want to Read" count={123} />)

    const count = screen.getByText('123')
    expect(count).toHaveClass('text-4xl')
    expect(count).toHaveClass('font-bold')
  })

  it('handles large numbers', () => {
    render(<StatsCard label="Total Books" count={9999} />)

    expect(screen.getByText('9999')).toBeInTheDocument()
  })

  it('is keyboard accessible when clickable', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<StatsCard label="Want to Read" count={5} onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /want to read/i })
    button.focus()
    await user.keyboard('{Enter}')

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has hover state when clickable', () => {
    const handleClick = vi.fn()
    render(<StatsCard label="Want to Read" count={5} onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /want to read/i })
    expect(button).toHaveClass('hover:bg-gray-50')
  })
})
