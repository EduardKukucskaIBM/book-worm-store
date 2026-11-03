import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CouponInput } from './CouponInput'

describe('CouponInput', () => {
  it('renders input and apply button when no coupon is applied', () => {
    render(<CouponInput appliedCode={null} onApply={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByPlaceholderText(/apply coupon/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
  })

  it('shows error message when submitted with empty code', async () => {
    const user = userEvent.setup()
    render(<CouponInput appliedCode={null} onApply={vi.fn()} onRemove={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /apply/i }))
    expect(screen.getByText('Enter a coupon code')).toBeInTheDocument()
  })

  it('shows error message when submitted with invalid code', async () => {
    const user = userEvent.setup()
    render(<CouponInput appliedCode={null} onApply={vi.fn()} onRemove={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/apply coupon/i), 'INVALID')
    await user.click(screen.getByRole('button', { name: /apply/i }))
    expect(screen.getByText('This coupon code is not valid')).toBeInTheDocument()
  })

  it('calls onApply with trimmed upper-case valid coupon', async () => {
    const user = userEvent.setup()
    const handleApply = vi.fn()
    render(<CouponInput appliedCode={null} onApply={handleApply} onRemove={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/apply coupon/i), ' bookworm100 ')
    await user.click(screen.getByRole('button', { name: /apply/i }))
    expect(handleApply).toHaveBeenCalledWith('BOOKWORM100')
  })

  it('renders dismissible tag when coupon is applied and calls onRemove on dismiss', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(<CouponInput appliedCode="BOOKWORM100" onApply={vi.fn()} onRemove={handleRemove} />)

    expect(screen.getByText(/BOOKWORM100 applied/)).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: /remove coupon/i })
    await user.click(closeBtn)
    expect(handleRemove).toHaveBeenCalled()
  })
})
