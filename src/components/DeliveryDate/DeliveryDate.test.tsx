import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeliveryDate } from './DeliveryDate'

describe('DeliveryDate', () => {
  const fixedNow = new Date('2024-07-15T12:00:00.000Z')

  it('renders "Instant download" for an eBook', () => {
    render(<DeliveryDate book={{ format: 'eBook' }} now={fixedNow} />)
    expect(screen.getByText('Instant download')).toBeInTheDocument()
  })

  it('renders calculated delivery date for a physical book with delivery days', () => {
    // 2024-07-15 + 3 days = 2024-07-18 (Thu, 18 Jul)
    render(<DeliveryDate book={{ format: 'Paperback', deliveryDays: 3 }} now={fixedNow} />)
    expect(screen.getByText(/Delivery by/)).toBeInTheDocument()
    expect(screen.getByText(/18 Jul/)).toBeInTheDocument()
  })

  it('renders default 3-day delivery date for physical books without deliveryDays specified', () => {
    render(<DeliveryDate book={{ format: 'Hardcover' }} now={fixedNow} />)
    expect(screen.getByText(/Delivery by/)).toBeInTheDocument()
    expect(screen.getByText(/18 Jul/)).toBeInTheDocument()
  })
})
