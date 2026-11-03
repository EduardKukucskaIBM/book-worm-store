import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '../../context/AppProviders'
import type { Order } from '../../types'
import CancelOrderControl from './CancelOrderControl'

const TEST_ORDER: Order = {
  id: 'ord-test-1',
  userId: null,
  items: [
    {
      bookId: 'book-joy-of-minimalism',
      title: 'Joy of Minimalism',
      unitPrice: 149,
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
  subtotal: 149,
  tax: 17.88,
  deliveryCharges: 0,
  couponDiscount: 0,
  giftPointsRedeemed: 20,
  total: 146.88,
  paymentMethod: 'credit-card',
  status: 'confirmed',
  placedAt: '2024-07-21T10:00:00.000Z',
  cancellableUntil: '2024-07-23T10:00:00.000Z',
}

describe('CancelOrderControl', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders cancellation deadline when eligible', () => {
    render(
      <AppProviders>
        <CancelOrderControl
          order={TEST_ORDER}
          now={new Date('2024-07-21T12:00:00.000Z')}
        />
      </AppProviders>,
    )

    expect(screen.getByText(/you can cancel until/i)).toBeInTheDocument()
    expect(screen.getByTestId('cancel-order-btn')).toBeEnabled()
  })

  it('renders disabled state when 48-hour window has expired', () => {
    render(
      <AppProviders>
        <CancelOrderControl
          order={TEST_ORDER}
          now={new Date('2024-07-24T12:00:00.000Z')}
        />
      </AppProviders>,
    )

    expect(
      screen.getByText('The 48-hour cancellation window has closed'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('cancel-order-btn')).toBeDisabled()
  })

  it('returns null when order is already cancelled', () => {
    const { container } = render(
      <AppProviders>
        <CancelOrderControl
          order={{ ...TEST_ORDER, status: 'cancelled' }}
          now={new Date('2024-07-21T12:00:00.000Z')}
        />
      </AppProviders>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('opens modal on click and triggers onCancelled callback on confirm', async () => {
    const user = userEvent.setup()
    const handleCancelled = vi.fn()

    localStorage.setItem(
      'bookworm.orders',
      JSON.stringify({ created: [TEST_ORDER], cancelledIds: [] }),
    )

    render(
      <AppProviders>
        <CancelOrderControl
          order={TEST_ORDER}
          now={new Date('2024-07-21T12:00:00.000Z')}
          onCancelled={handleCancelled}
        />
      </AppProviders>,
    )

    await user.click(screen.getByTestId('cancel-order-btn'))
    expect(screen.getByRole('heading', { name: 'Cancel order' })).toBeInTheDocument()

    // Confirm cancel in modal
    const modal = screen.getByRole('dialog', { name: 'Cancel order' })
    await user.click(within(modal).getByRole('button', { name: 'Cancel order' }))
    expect(handleCancelled).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ord-test-1', status: 'cancelled' }),
    )
  })
})
