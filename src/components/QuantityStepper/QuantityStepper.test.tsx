import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuantityStepper } from './QuantityStepper'

describe('QuantityStepper', () => {
  it('renders stepper with accessible label and current value', () => {
    render(
      <QuantityStepper
        id="stepper-test"
        title="Joy of Minimalism"
        value={2}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Quantity of Joy of Minimalism')).toHaveValue(2)
  })

  it('calls onChange with incremented quantity on plus button click', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <QuantityStepper
        id="stepper-test"
        title="Joy of Minimalism"
        value={1}
        onChange={handleChange}
      />,
    )

    const incBtn = screen.getByRole('button', { name: 'Increase quantity of Joy of Minimalism' })
    await user.click(incBtn)
    expect(handleChange).toHaveBeenCalledWith(2)
  })
})
