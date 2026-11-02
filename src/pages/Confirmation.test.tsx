import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from '../context/AppProviders'
import type { Order, User } from '../types'
import Confirmation from './Confirmation'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const DEMO_USER: User = {
  id: 'user-demo',
  name: 'Alex Morgan',
  email: 'demo@bookworm.com',
  giftPoints: 250,
}

const OTHER_USER: User = {
  id: 'user-other',
  name: 'Sam Taylor',
  email: 'sam@example.com',
  giftPoints: 100,
}

const GUEST_ORDER: Order = {
  id: 'ord-guest-123',
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
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    phoneCountryCode: '+91',
    phone: '9876543210',
    line1: '12 Park Street',
    city: 'Mumbai',
    pin: '400001',
    state: 'Maharashtra',
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
  estimatedDelivery: '2024-07-25T10:00:00.000Z',
}

const USER_ORDER_WITH_POINTS: Order = {
  id: 'ord-user-456',
  userId: 'user-demo',
  items: [
    {
      bookId: 'book-joy-of-minimalism',
      title: 'Joy of Minimalism',
      unitPrice: 149,
      quantity: 1,
    },
  ],
  shippingAddress: {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'demo@bookworm.com',
    phoneCountryCode: '+91',
    phone: '9876543210',
    line1: '42 MG Road',
    city: 'Bengaluru',
    pin: '560038',
    state: 'Karnataka',
    country: 'India',
  },
  subtotal: 149,
  tax: 17.88,
  deliveryCharges: 0,
  couponDiscount: 0,
  giftPointsRedeemed: 50,
  total: 116.88,
  paymentMethod: 'debit-card',
  cardLast4: '4321',
  status: 'confirmed',
  placedAt: '2024-07-21T10:00:00.000Z',
  cancellableUntil: '2024-07-23T10:00:00.000Z',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const LocationProbe = () => <p data-testid="location">{useLocation().pathname}</p>

const renderConfirmation = ({
  orderId = 'ord-guest-123',
  user = null,
  orders = [GUEST_ORDER],
  cancelledIds = [] as string[],
  giftPointAdjustments = {} as Record<string, number>,
  now,
}: {
  orderId?: string
  user?: User | null
  orders?: Order[]
  cancelledIds?: string[]
  giftPointAdjustments?: Record<string, number>
  now?: Date
} = {}) => {
  localStorage.clear()
  if (user) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user))
  }
  if (Object.keys(giftPointAdjustments).length > 0) {
    localStorage.setItem(
      STORAGE_KEYS.giftPointAdjustments,
      JSON.stringify(giftPointAdjustments),
    )
  }
  localStorage.setItem(
    STORAGE_KEYS.orders,
    JSON.stringify({ created: orders, cancelledIds }),
  )

  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[`/confirmation/${orderId}`]}>
        <Routes>
          <Route path="/confirmation/:orderId" element={<Confirmation now={now} />} />
          <Route
            path="/"
            element={
              <div>
                <h1>Home Catalogue</h1>
                <LocationProbe />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Confirmation page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('renders the order', () => {
    it('displays purchase success card with heading, order details, and purchased books', async () => {
      renderConfirmation({
        orderId: 'ord-guest-123',
        orders: [GUEST_ORDER],
        now: new Date('2024-07-21T12:00:00.000Z'),
      })

      // Wait for catalogue to load
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: /your purchase of the following reads is successful/i,
          }),
        ).toBeInTheDocument()
      })

      // Order ID
      expect(screen.getByTestId('order-id')).toHaveTextContent('ord-guest-123')

      // Payment method with last 4 digits
      expect(screen.getByTestId('payment-method')).toHaveTextContent(
        'Credit card ending 1111',
      )

      // Total paid
      expect(screen.getByTestId('total-paid')).toHaveTextContent('₹568.96')

      // Check purchased books are rendered as summary cards
      expect(screen.getAllByText('Joy of Minimalism').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('The Path to Success').length).toBeGreaterThanOrEqual(1)

      // Delivery info / date
      expect(screen.getAllByText(/delivery by/i).length).toBeGreaterThanOrEqual(1)
    })

    it('renders debit card and UPI payment methods properly', async () => {
      const upiOrder: Order = {
        ...GUEST_ORDER,
        id: 'ord-upi-789',
        paymentMethod: 'upi',
        cardLast4: undefined,
      }

      renderConfirmation({
        orderId: 'ord-upi-789',
        orders: [upiOrder],
      })

      await waitFor(() => {
        expect(screen.getByTestId('payment-method')).toHaveTextContent('UPI')
      })
    })
  })

  describe('not found / authorization states', () => {
    it('shows "Order not found" EmptyState for an unknown order id', async () => {
      renderConfirmation({
        orderId: 'non-existent-order-id',
        orders: [GUEST_ORDER],
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /order not found/i })).toBeInTheDocument()
      })
      expect(screen.getByRole('link', { name: /back to catalogue/i })).toBeInTheDocument()
    })

    it('shows "Order not found" when a guest attempts to view another user order', async () => {
      renderConfirmation({
        orderId: 'ord-user-456',
        user: null, // Guest
        orders: [USER_ORDER_WITH_POINTS],
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /order not found/i })).toBeInTheDocument()
      })
    })

    it('shows "Order not found" when another user attempts to view user order', async () => {
      renderConfirmation({
        orderId: 'ord-user-456',
        user: OTHER_USER,
        orders: [USER_ORDER_WITH_POINTS],
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /order not found/i })).toBeInTheDocument()
      })
    })

    it('allows the order owner to view their order', async () => {
      renderConfirmation({
        orderId: 'ord-user-456',
        user: DEMO_USER,
        orders: [USER_ORDER_WITH_POINTS],
      })

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: /your purchase of the following reads is successful/i,
          }),
        ).toBeInTheDocument()
      })
      expect(screen.getByTestId('order-id')).toHaveTextContent('ord-user-456')
    })
  })

  describe('cancellation within 48-hour window', () => {
    it('shows cancel control with deadline, opens Carbon modal, and cancels the order', async () => {
      const user = userEvent.setup()
      renderConfirmation({
        orderId: 'ord-user-456',
        user: DEMO_USER,
        orders: [USER_ORDER_WITH_POINTS],
        now: new Date('2024-07-21T14:00:00.000Z'), // 4 hours after order
      })

      await waitFor(() => {
        expect(screen.getByTestId('cancel-order-control')).toBeInTheDocument()
      })

      expect(screen.getByText(/you can cancel until/i)).toBeInTheDocument()
      const cancelBtn = screen.getByTestId('cancel-order-btn')
      expect(cancelBtn).toBeEnabled()

      // Click Cancel order -> opens modal
      await user.click(cancelBtn)

      expect(screen.getByRole('heading', { name: 'Cancel order' })).toBeInTheDocument()
      expect(
        screen.getByText(/50 redeemed gift points will be refunded/i),
      ).toBeInTheDocument()

      // Confirm modal cancellation inside the modal dialog
      const modal = screen.getByRole('dialog', { name: 'Cancel order' })
      const confirmBtn = within(modal).getByRole('button', { name: 'Cancel order' })
      await user.click(confirmBtn)

      // Shows Cancelled notification and status tag
      await waitFor(() => {
        expect(screen.getByTestId('cancelled-tag')).toHaveTextContent('Cancelled')
        expect(screen.getByTestId('cancelled-notification')).toBeInTheDocument()
      })

      // Cancel button should no longer be displayed
      expect(screen.queryByTestId('cancel-order-control')).not.toBeInTheDocument()

      // Check gift points refunded in adjustments
      const adjustments = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.giftPointAdjustments) || '{}',
      )
      expect(adjustments['user-demo']).toBe(50) // +50 refunded
    })

    it('keeps order active if modal is closed or dismissed', async () => {
      const user = userEvent.setup()
      renderConfirmation({
        orderId: 'ord-guest-123',
        orders: [GUEST_ORDER],
        now: new Date('2024-07-21T14:00:00.000Z'),
      })

      await waitFor(() => {
        expect(screen.getByTestId('cancel-order-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('cancel-order-btn'))
      expect(screen.getByRole('heading', { name: 'Cancel order' })).toBeInTheDocument()

      // Click "Keep order" secondary button
      const keepBtn = screen.getByRole('button', { name: /keep order/i })
      await user.click(keepBtn)

      // Modal closed, order still confirmed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByTestId('cancelled-tag')).not.toBeInTheDocument()
      expect(screen.getByTestId('cancel-order-btn')).toBeInTheDocument()
    })
  })

  describe('cancellation window expired (after 48h)', () => {
    it('disables cancel button and displays window closed message', async () => {
      renderConfirmation({
        orderId: 'ord-guest-123',
        orders: [GUEST_ORDER],
        now: new Date('2024-07-24T12:00:00.000Z'), // > 48h after placedAt (74h)
      })

      await waitFor(() => {
        expect(
          screen.getByText('The 48-hour cancellation window has closed'),
        ).toBeInTheDocument()
      })

      const cancelBtn = screen.getByTestId('cancel-order-btn')
      expect(cancelBtn).toBeDisabled()
    })
  })

  describe('continue shopping button', () => {
    it('navigates home when clicking "Continue your Shopping"', async () => {
      const user = userEvent.setup()
      renderConfirmation({
        orderId: 'ord-guest-123',
        orders: [GUEST_ORDER],
      })

      await waitFor(() => {
        expect(screen.getByTestId('continue-shopping-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('continue-shopping-btn'))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /home catalogue/i })).toBeInTheDocument()
        expect(screen.getByTestId('location')).toHaveTextContent('/')
      })
    })
  })
})
