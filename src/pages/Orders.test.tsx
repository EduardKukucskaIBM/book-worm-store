import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from '../context/AppProviders'
import RequireAuth from '../components/RequireAuth'
import type { Order, User } from '../types'
import Orders from './Orders'

// ─── Fixtures ───────────────────────────────────────────────────────────────
// Use a non-demo user so seed orders from orders.json don't contaminate tests

const TEST_USER: User = {
  id: 'user-test-orders',
  name: 'Test User',
  email: 'test@example.com',
  giftPoints: 0,
}

// Use dynamic dates so the cancel window tests are always correct regardless of when the suite runs
const REAL_NOW = new Date()
const FIXED_PAST = new Date('2024-07-21T12:00:00.000Z')

const RECENT_ORDER: Order = {
  id: 'ord-test-recent',
  userId: 'user-test-orders',
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
  giftPointsRedeemed: 0,
  total: 166.88,
  paymentMethod: 'credit-card',
  cardLast4: '1111',
  status: 'confirmed',
  // 2 hours ago → within 48h window (relative to real now)
  placedAt: new Date(REAL_NOW.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  cancellableUntil: new Date(REAL_NOW.getTime() + 46 * 60 * 60 * 1000).toISOString(),
}

const OLDER_ORDER: Order = {
  id: 'ord-test-older',
  userId: 'user-test-orders',
  items: [
    {
      bookId: 'book-art-of-focus',
      title: 'The Art of Focus',
      unitPrice: 399,
      quantity: 1,
    },
  ],
  shippingAddress: RECENT_ORDER.shippingAddress,
  subtotal: 399,
  tax: 47.88,
  deliveryCharges: 0,
  couponDiscount: 0,
  giftPointsRedeemed: 0,
  total: 446.88,
  paymentMethod: 'upi',
  status: 'delivered',
  // placed 3 days ago, cancel window already closed
  placedAt: new Date(REAL_NOW.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  cancellableUntil: new Date(REAL_NOW.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
}

const CANCELLED_ORDER: Order = {
  ...RECENT_ORDER,
  id: 'ord-test-cancelled',
  status: 'cancelled',
  // placed 5 days ago – well outside window
  placedAt: new Date(FIXED_PAST.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  cancellableUntil: new Date(FIXED_PAST.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const LocationProbe = () => <p data-testid="location">{useLocation().pathname}</p>

const renderOrders = ({
  user = TEST_USER,
  orders = [RECENT_ORDER],
  navigationDelayMs = 50,
}: { user?: User | null; orders?: Order[]; navigationDelayMs?: number } = {}) => {
  localStorage.clear()
  if (user) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user))
  }
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify({ created: orders, cancelledIds: [] }))

  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<Orders navigationDelayMs={navigationDelayMs} />} />
          <Route
            path="/login"
            element={
              <div>
                <h1>Login Page</h1>
                <LocationProbe />
              </div>
            }
          />
          <Route
            path="/checkout"
            element={
              <div>
                <h1>Checkout</h1>
                <LocationProbe />
              </div>
            }
          />
          <Route path="/" element={<div><h1>Home</h1></div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Orders page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('guest redirect', () => {
    it('redirects guests from /orders to /login?redirect=/orders', async () => {
      // RequireAuth wraps Orders in the real router; simulate via no session
      localStorage.clear()
      render(
        <AppProviders>
          <MemoryRouter initialEntries={['/orders']}>
            <Routes>
              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <Orders />
                  </RequireAuth>
                }
              />
              <Route
                path="/login"
                element={<div><h1>Login Page</h1><LocationProbe /></div>}
              />
            </Routes>
          </MemoryRouter>
        </AppProviders>,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
      })
    })
  })

  describe('renders order list', () => {
    it('renders the page heading "My Orders"', async () => {
      renderOrders()
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /my orders/i })).toBeInTheDocument()
      })
    })

    it('shows EmptyState when user has no orders', async () => {
      renderOrders({ orders: [] })
      await waitFor(() => {
        expect(screen.getByTestId('orders-empty')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /browse catalogue/i })).toBeInTheDocument()
      })
    })

    it('renders an OrderCard for each order', async () => {
      renderOrders({ orders: [RECENT_ORDER, OLDER_ORDER] })
      await waitFor(() => {
        expect(screen.getByTestId(`order-card-${RECENT_ORDER.id}`)).toBeInTheDocument()
        expect(screen.getByTestId(`order-card-${OLDER_ORDER.id}`)).toBeInTheDocument()
      })
    })

    it('displays orders newest first', async () => {
      // OLDER_ORDER is placed 3 days ago, RECENT_ORDER is 2 hours ago
      renderOrders({ orders: [OLDER_ORDER, RECENT_ORDER] })
      await waitFor(() => {
        const cards = screen.getAllByTestId(/^order-card-/)
        // first card should be the recent one
        expect(cards[0]).toHaveAttribute('data-testid', `order-card-${RECENT_ORDER.id}`)
        expect(cards[1]).toHaveAttribute('data-testid', `order-card-${OLDER_ORDER.id}`)
      })
    })

    it('shows Confirmed status tag for a confirmed order', async () => {
      renderOrders({ orders: [RECENT_ORDER] })
      await waitFor(() => {
        expect(screen.getByTestId(`order-status-${RECENT_ORDER.id}`)).toHaveTextContent(
          'Confirmed',
        )
      })
    })

    it('shows Delivered status tag for a delivered order', async () => {
      renderOrders({ orders: [OLDER_ORDER] })
      await waitFor(() => {
        expect(screen.getByTestId(`order-status-${OLDER_ORDER.id}`)).toHaveTextContent('Delivered')
      })
    })

    it('shows Cancelled status tag for a cancelled order', async () => {
      renderOrders({ orders: [CANCELLED_ORDER] })
      await waitFor(() => {
        expect(screen.getByTestId(`order-status-${CANCELLED_ORDER.id}`)).toHaveTextContent(
          'Cancelled',
        )
      })
    })

    it('links order ID to /confirmation/:orderId', async () => {
      renderOrders({ orders: [RECENT_ORDER] })
      await waitFor(() => {
        const link = screen.getByTestId(`order-id-link-${RECENT_ORDER.id}`)
        expect(link).toHaveAttribute('href', `/confirmation/${RECENT_ORDER.id}`)
      })
    })

    it('renders the order total', async () => {
      renderOrders({ orders: [RECENT_ORDER] })
      await waitFor(() => {
        expect(screen.getByTestId(`order-total-${RECENT_ORDER.id}`)).toHaveTextContent('₹166.88')
      })
    })
  })

  describe('Buy it again', () => {
    it('"Buy it again" adds item to cart and navigates to /checkout', async () => {
      // Use an order with a book that is unique in this render
      const singleItemOrder: Order = {
        ...RECENT_ORDER,
        id: 'ord-single-item',
        items: [
          {
            bookId: 'book-art-of-focus',
            title: 'The Art of Focus',
            unitPrice: 399,
            quantity: 1,
          },
        ],
      }
      renderOrders({ orders: [singleItemOrder], navigationDelayMs: 20 })

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByTestId('orders-page')).toBeInTheDocument()
      })

      const buyAgainBtn = screen.getByTestId('buy-again-book-art-of-focus')
      fireEvent.click(buyAgainBtn)

      // Toast should appear
      expect(screen.getByTestId('buy-all-again-toast')).toBeInTheDocument()

      // Should navigate to checkout after toast
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument()
      })
    })

    it('"Buy all again" adds all order items to cart and navigates to /checkout', async () => {
      const multiOrder: Order = {
        ...RECENT_ORDER,
        id: 'ord-multi',
        items: [
          {
            bookId: 'book-joy-of-minimalism',
            title: 'Joy of Minimalism',
            unitPrice: 149,
            quantity: 1,
          },
          {
            bookId: 'book-art-of-focus',
            title: 'The Art of Focus',
            unitPrice: 399,
            quantity: 2,
          },
        ],
      }
      renderOrders({ orders: [multiOrder], navigationDelayMs: 20 })

      await waitFor(() => {
        expect(screen.getByTestId('orders-page')).toBeInTheDocument()
      })

      const buyAllBtn = screen.getByTestId('buy-all-again-ord-multi')
      fireEvent.click(buyAllBtn)

      expect(screen.getByTestId('buy-all-again-toast')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument()
      })
    })
  })

  describe('CancelOrderControl in orders', () => {
    it('shows cancel button for a confirmed order within 48h window', async () => {
      renderOrders({ orders: [RECENT_ORDER] })

      await waitFor(() => {
        expect(screen.getByTestId('cancel-order-control')).toBeInTheDocument()
        expect(screen.getByTestId('cancel-order-btn')).toBeEnabled()
      })
    })

    it('does not show CancelOrderControl for a cancelled order', async () => {
      renderOrders({ orders: [CANCELLED_ORDER] })

      await waitFor(() => {
        expect(screen.getByTestId(`order-card-${CANCELLED_ORDER.id}`)).toBeInTheDocument()
      })

      // CancelOrderControl returns null for cancelled orders
      expect(screen.queryByTestId('cancel-order-control')).not.toBeInTheDocument()
    })

    it('shows disabled cancel button for a delivered order (window closed)', async () => {
      renderOrders({ orders: [OLDER_ORDER] })

      await waitFor(() => {
        // CancelOrderControl renders for non-cancelled orders, but the button is disabled
        // because canCancel returns false when the window has expired
        expect(screen.getByTestId('cancel-order-control')).toBeInTheDocument()
        expect(screen.getByTestId('cancel-order-btn')).toBeDisabled()
      })
    })
  })
})
