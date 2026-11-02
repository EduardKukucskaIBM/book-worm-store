import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../../context/AppProviders'
import type { Order } from '../../types'
import PurchaseSuccess from './PurchaseSuccess'

const SAMPLE_ORDER: Order = {
  id: 'ord-test-success',
  userId: null,
  items: [
    {
      bookId: 'book-joy-of-minimalism',
      title: 'Joy of Minimalism',
      unitPrice: 149,
      quantity: 1,
    },
    {
      bookId: 'book-path-to-success',
      title: 'The Path to Success',
      unitPrice: 359,
      quantity: 1,
    },
  ],
  shippingAddress: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phoneCountryCode: '+91',
    phone: '9876543210',
    line1: '123 Street',
    city: 'Bangalore',
    pin: '560001',
    state: 'Karnataka',
    country: 'India',
  },
  subtotal: 508,
  tax: 60.96,
  deliveryCharges: 0,
  couponDiscount: 0,
  giftPointsRedeemed: 0,
  total: 568.96,
  paymentMethod: 'credit-card',
  cardLast4: '1111',
  status: 'confirmed',
  placedAt: '2024-07-21T10:00:00.000Z',
  cancellableUntil: '2024-07-23T10:00:00.000Z',
}

describe('PurchaseSuccess', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders checkmark, title, order meta, and continue shopping button', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <PurchaseSuccess order={SAMPLE_ORDER} />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(
      screen.getByRole('heading', {
        name: /your purchase of the following reads is successful/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('order-id')).toHaveTextContent('ord-test-success')
    expect(screen.getByTestId('payment-method')).toHaveTextContent(
      'Credit card ending 1111',
    )
    expect(screen.getByTestId('total-paid')).toHaveTextContent('₹568.96')
    expect(screen.getByTestId('continue-shopping-btn')).toBeInTheDocument()
  })

  it('renders cancelled status tag and notification when order is cancelled', () => {
    const cancelledOrder: Order = {
      ...SAMPLE_ORDER,
      status: 'cancelled',
    }

    render(
      <AppProviders>
        <MemoryRouter>
          <PurchaseSuccess order={cancelledOrder} />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByTestId('cancelled-tag')).toHaveTextContent('Cancelled')
    expect(screen.getByTestId('cancelled-notification')).toBeInTheDocument()
    expect(screen.queryByTestId('cancel-order-control')).not.toBeInTheDocument()
  })
})
