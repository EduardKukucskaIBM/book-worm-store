import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from './ReviewForm'

describe('ReviewForm', () => {
  it('renders textarea with counter, rating input, and disabled submit button initially', () => {
    render(<ReviewForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/leave your review/i)).toBeInTheDocument()
    expect(screen.getByText('0/100')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('enables submit button only when text (1-100 chars) and star rating (1-5) are selected', async () => {
    const user = userEvent.setup()
    render(<ReviewForm onSubmit={vi.fn()} />)

    const textarea = screen.getByLabelText(/leave your review/i)
    await user.type(textarea, 'Great book, highly recommend!')
    expect(screen.getByText('29/100')).toBeInTheDocument()
    // Still disabled without rating
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()

    // Click 5th star
    const star5 = screen.getByRole('button', { name: /rate 5 stars/i })
    await user.click(star5)

    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()
  })

  it('submits review and clears the form upon clicking submit', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<ReviewForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/leave your review/i), 'Enjoyed reading this.')
    await user.click(screen.getByRole('button', { name: /rate 4 stars/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      userId: null,
      userName: 'Anonymous',
      rating: 4,
      text: 'Enjoyed reading this.',
    })

    // Reset state
    expect(screen.getByLabelText(/leave your review/i)).toHaveValue('')
    expect(screen.getByText('0/100')).toBeInTheDocument()
  })
})
