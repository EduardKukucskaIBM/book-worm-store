import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingStars } from './RatingStars'

describe('RatingStars', () => {
  it('renders in display mode with role="img" when no onChange is passed', () => {
    render(<RatingStars value={4.5} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', 'Rating: 4.5 out of 5')
  })

  it('renders interactive button group with role="group" when onChange is passed', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<RatingStars value={3} onChange={handleChange} />)

    const group = screen.getByRole('group')
    expect(group).toBeInTheDocument()

    const star4 = screen.getByRole('button', { name: 'Rate 4 stars' })
    await user.click(star4)

    expect(handleChange).toHaveBeenCalledWith(4)
  })
})
