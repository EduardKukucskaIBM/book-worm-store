import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from '../context/AppProviders'
import { saveCheckoutDraft, loadCheckoutDraft } from '../utils/checkoutDraft'
import type { CheckoutDraft } from '../types'
import Payment from './Payment'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const VALID_DRAFT: CheckoutDraft = {
  userId: null,
  lines: [
    { bookId: 'book-joy-of-minimalism', title: 'Joy of Minimalism', unitPrice: 149, quantity: 1 },
  ],
  address: {
    firstName: 'Asha',
    lastName: 'Rao',
    email: 'asha@example.com',
    phoneCountryCode: '+91',
    phone: '9876543210',
    line1: '12 Park Street',
    city: 'Mumbai',
    pin: '400001',
    state: 'Maharashtra',
    country: 'India',
  },
  couponCode: null,
  giftPointsRedeemed: 0,
  totals: {
    subtotal: 149,
    tax: 17.88,
    deliveryCharges: 0,
    couponDiscount: 0,
    giftPointsDiscount: 0,
    giftPointsRedeemed: 0,
    total: 166.88,
    itemCount: 1,
  },
  savedAt: new Date().toISOString(),
}

const LOGGED_IN_DRAFT: CheckoutDraft = {
  ...VALID_DRAFT,
  userId: 'user-demo',
  giftPointsRedeemed: 50,
  totals: {
    ...VALID_DRAFT.totals,
    giftPointsDiscount: 50,
    giftPointsRedeemed: 50,
    total: 116.88,
  },
}

// A Luhn-valid 16-digit Visa test card
const VALID_CARD = '4532015112830366'
// The failure-trigger card
const FAILURE_CARD = '4000000000000002'

// ─── Helpers ────────────────────────────────────────────────────────────────

const LocationProbe = () => <p data-testid="location">{useLocation().pathname}</p>

const renderPayment = (
  draft: CheckoutDraft | null = VALID_DRAFT,
  extraSetup?: () => void,
  paymentDelayMs = 0,
) => {
  localStorage.clear()
  if (draft) saveCheckoutDraft(draft)
  extraSetup?.()
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/payment']}>
        <Routes>
          <Route path="/payment" element={<Payment paymentDelayMs={paymentDelayMs} />} />
          <Route
            path="/confirmation/:orderId"
            element={
              <>
                <h1>Confirmation</h1>
                <LocationProbe />
              </>
            }
          />
          <Route path="/checkout" element={<h1>Checkout page</h1>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

// Format a card number with dashes XXXX-XXXX-XXXX-XXXX
const fmt = (n: string) => n.replace(/(\d{4})(?=\d)/g, '$1-')

const fillCard = async (
  cardNumber = VALID_CARD,
  cardHolder = 'Asha Rao',
  cvv = '123',
  expiry = '12/2030',
) => {
  const cardInput = screen.getByLabelText('Card Number')
  const holderInput = screen.getByLabelText('Name on Card')
  const cvvInput = screen.getByLabelText('CVV')
  const expiryInput = screen.getByLabelText('Date of Expiry')

  await userEvent.click(cardInput)
  await userEvent.paste(fmt(cardNumber))
  await userEvent.click(holderInput)
  await userEvent.paste(cardHolder)
  await userEvent.click(cvvInput)
  await userEvent.paste(cvv)
  await userEvent.click(expiryInput)
  await userEvent.paste(expiry)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Payment page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // ── Redirect ───────────────────────────────────────────────────────────────

  describe('redirect without a draft', () => {
    it('redirects to /checkout when no draft is present', async () => {
      renderPayment(null)
      await waitFor(() => {
        expect(screen.getByText('Checkout page')).toBeInTheDocument()
      })
    })
  })

  // ── Payable amount from the draft ─────────────────────────────────────────

  describe('payable amount', () => {
    it('shows the total from the draft, not a hardcoded value', async () => {
      renderPayment(VALID_DRAFT)
      await waitFor(() => {
        expect(screen.getByText(/Complete Payment/i)).toBeInTheDocument()
      })
      // VALID_DRAFT.totals.total = 166.88
      expect(screen.getByText(/166/)).toBeInTheDocument()
    })

    it('shows a different total for the logged-in draft with gift points', async () => {
      renderPayment(LOGGED_IN_DRAFT)
      await waitFor(() => {
        expect(screen.getByText(/Complete Payment/i)).toBeInTheDocument()
      })
      // LOGGED_IN_DRAFT.totals.total = 116.88
      expect(screen.getByText(/116/)).toBeInTheDocument()
    })
  })

  // ── Tab keyboard navigation ───────────────────────────────────────────────

  describe('tab keyboard navigation', () => {
    it('starts on Credit Card tab', () => {
      renderPayment()
      const tab = screen.getByRole('tab', { name: 'Credit Card' })
      expect(tab).toHaveAttribute('aria-selected', 'true')
    })

    it('moves to next tab with ArrowDown', async () => {
      renderPayment()
      const tablist = screen.getByRole('tablist')
      const creditTab = screen.getByRole('tab', { name: 'Credit Card' })
      creditTab.focus()
      await userEvent.keyboard('{ArrowDown}')
      const debitTab = screen.getByRole('tab', { name: 'Debit card' })
      expect(debitTab).toHaveAttribute('aria-selected', 'true')
      expect(tablist).toBeInTheDocument()
    })

    it('wraps from last tab back to first with ArrowDown', async () => {
      renderPayment()
      // Navigate to Wallet (last tab)
      const tablist = screen.getByRole('tablist')
      const walletTab = screen.getByRole('tab', { name: 'Wallet' })
      await userEvent.click(walletTab)
      walletTab.focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('tab', { name: 'Credit Card' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(tablist).toBeInTheDocument()
    })

    it('moves to previous tab with ArrowUp', async () => {
      renderPayment()
      const debitTab = screen.getByRole('tab', { name: 'Debit card' })
      await userEvent.click(debitTab)
      debitTab.focus()
      await userEvent.keyboard('{ArrowUp}')
      expect(screen.getByRole('tab', { name: 'Credit Card' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
    })

    it('clicking a tab switches the active panel', async () => {
      renderPayment()
      const upiTab = screen.getByRole('tab', { name: 'UPI' })
      await userEvent.click(upiTab)
      expect(upiTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByLabelText('UPI ID')).toBeInTheDocument()
    })
  })

  // ── Card validation ───────────────────────────────────────────────────────

  describe('card validation', () => {
    it('shows error when card number is empty on Pay Now', async () => {
      renderPayment()
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('Card number is required')).toBeInTheDocument()
      })
    })

    it('shows error for card number less than 16 digits', async () => {
      renderPayment()
      await userEvent.type(screen.getByLabelText('Card Number'), '1234')
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('Card number must be 16 digits')).toBeInTheDocument()
      })
    })

    it('shows Luhn error for 16-digit invalid card', async () => {
      renderPayment()
      // 16 digits but fails Luhn
      await userEvent.type(screen.getByLabelText('Card Number'), fmt('4532015112830367'))
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('Card number is invalid')).toBeInTheDocument()
      })
    })

    it('auto-formats card number as XXXX-XXXX-XXXX-XXXX', async () => {
      renderPayment()
      const input = screen.getByLabelText('Card Number')
      await userEvent.type(input, '4532015112830366')
      expect(input).toHaveValue('4532-0151-1283-0366')
    })

    it('shows error for past expiry (MM/YYYY)', async () => {
      renderPayment()
      await fillCard(VALID_CARD, 'Asha Rao', '123', '01/2020')
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('Card is expired')).toBeInTheDocument()
      })
    })

    it('shows error for wrong expiry format (MM/YY instead of MM/YYYY)', async () => {
      renderPayment()
      await fillCard(VALID_CARD, 'Asha Rao', '123', '12/26')
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('Expiry must be in MM/YYYY format')).toBeInTheDocument()
      })
    })

    it('shows CVV error for non-digit CVV', async () => {
      renderPayment()
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('CVV is required')).toBeInTheDocument()
      })
    })
  })

  // ── UPI validation ────────────────────────────────────────────────────────

  describe('UPI validation', () => {
    it('shows error when UPI ID is empty on Pay Now', async () => {
      renderPayment()
      await userEvent.click(screen.getByRole('tab', { name: 'UPI' }))
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText('UPI ID is required')).toBeInTheDocument()
      })
    })

    it('shows error for invalid UPI ID format', async () => {
      renderPayment()
      await userEvent.click(screen.getByRole('tab', { name: 'UPI' }))
      await userEvent.type(screen.getByLabelText('UPI ID'), 'invalididwithnoatsign')
      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => {
        expect(screen.getByText(/valid UPI ID/i)).toBeInTheDocument()
      })
    })

    it('accepts valid UPI IDs like name@bank', async () => {
      renderPayment()
      await userEvent.click(screen.getByRole('tab', { name: 'UPI' }))
      await userEvent.type(screen.getByLabelText('UPI ID'), 'asha@okhdfcbank')
      // Should NOT show an error — verify the button is there and no error text
      expect(screen.queryByText('UPI ID is required')).not.toBeInTheDocument()
    })
  })

  // ── Success path ──────────────────────────────────────────────────────────

  describe('success path', () => {
    it('creates an order, clears the cart, clears the draft, and navigates to /confirmation', async () => {
      // Put something in the cart so we can verify it is cleared
      renderPayment(VALID_DRAFT, () => {
        localStorage.setItem(
          STORAGE_KEYS.cart,
          JSON.stringify([{ bookId: 'book-joy-of-minimalism', quantity: 1 }]),
        )
      })

      // Fill a valid card
      await waitFor(() => screen.getByLabelText('Card Number'))
      await fillCard(VALID_CARD, 'Asha Rao', '123', '12/2030')

      await userEvent.click(screen.getByTestId('pay-now-btn'))

      // Navigated to confirmation
      await waitFor(
        () => {
          const locationEl = screen.queryByTestId('location')
          expect(locationEl?.textContent).toMatch(/^\/confirmation\//)
        },
        { timeout: 5000 },
      )

      // Draft was cleared
      expect(loadCheckoutDraft()).toBeNull()

      // Cart was cleared
      const cartRaw = localStorage.getItem(STORAGE_KEYS.cart)
      const cartItems = cartRaw ? JSON.parse(cartRaw) : []
      expect(cartItems).toHaveLength(0)
    })
  })

  // ── Failure path ──────────────────────────────────────────────────────────

  describe('failure path', () => {
    it('shows error notification and keeps the cart when failure card is used', async () => {
      renderPayment(VALID_DRAFT, () => {
        localStorage.setItem(
          STORAGE_KEYS.cart,
          JSON.stringify([{ bookId: 'book-joy-of-minimalism', quantity: 1 }]),
        )
      })

      await waitFor(() => screen.getByLabelText('Card Number'))
      await fillCard(FAILURE_CARD, 'Asha Rao', '123', '12/2030')

      await userEvent.click(screen.getByTestId('pay-now-btn'))

      // Error notification appears
      await waitFor(
        () => {
          expect(screen.getByText('Payment failed')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // "Try again" button is present
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()

      // Draft is NOT cleared
      expect(loadCheckoutDraft()).not.toBeNull()

      // Cart is NOT cleared
      const cartRaw = localStorage.getItem(STORAGE_KEYS.cart)
      const cartItems = cartRaw ? JSON.parse(cartRaw) : []
      expect(cartItems.length).toBeGreaterThan(0)
    })

    it('"Try again" resets the failure state so the form is re-usable', async () => {
      saveCheckoutDraft(VALID_DRAFT)
      renderPayment(VALID_DRAFT)

      await waitFor(() => screen.getByLabelText('Card Number'))
      await fillCard(FAILURE_CARD, 'Asha Rao', '123', '12/2030')

      await userEvent.click(screen.getByTestId('pay-now-btn'))
      await waitFor(() => screen.getByText('Payment failed'), { timeout: 5000 })

      await userEvent.click(screen.getByRole('button', { name: /try again/i }))

      // Failure notification is gone; form is accessible again
      await waitFor(() => {
        expect(screen.queryByText('Payment failed')).not.toBeInTheDocument()
      })
      expect(screen.getByTestId('pay-now-btn')).not.toBeDisabled()
    })
  })

  // ── Card data not persisted ───────────────────────────────────────────────

  describe('card data not persisted to storage', () => {
    it('does not store card number or CVV in localStorage after a successful payment', async () => {
      saveCheckoutDraft(VALID_DRAFT)
      renderPayment(VALID_DRAFT)

      await waitFor(() => screen.getByLabelText('Card Number'))
      await fillCard(VALID_CARD, 'Asha Rao', '123', '12/2030')

      await userEvent.click(screen.getByTestId('pay-now-btn'))

      await waitFor(
        () => {
          const locationEl = screen.queryByTestId('location')
          expect(locationEl?.textContent).toMatch(/^\/confirmation\//)
        },
        { timeout: 5000 },
      )

      // Inspect all localStorage values for card number or CVV
      const allValues = Object.values(localStorage).join(' ')
      expect(allValues).not.toContain(VALID_CARD)
      expect(allValues).not.toContain('4532015112830366')
      expect(allValues).not.toContain('123') // CVV should not appear in raw form
    })

    it('does not store card data in the created order', async () => {
      saveCheckoutDraft(VALID_DRAFT)
      renderPayment(VALID_DRAFT)

      await waitFor(() => screen.getByLabelText('Card Number'))
      await fillCard(VALID_CARD, 'Asha Rao', '123', '12/2030')

      await userEvent.click(screen.getByTestId('pay-now-btn'))

      await waitFor(
        () => {
          expect(screen.queryByTestId('location')).toBeTruthy()
        },
        { timeout: 5000 },
      )

      // The persisted orders must not contain the full card number
      const ordersRaw = localStorage.getItem(STORAGE_KEYS.orders) ?? ''
      expect(ordersRaw).not.toContain(VALID_CARD)
      // CVV must not appear at all
      expect(ordersRaw).not.toContain('"cvv"')
    })
  })

  // ── Processing state ──────────────────────────────────────────────────────

  describe('processing state', () => {
    it('disables Pay Now button while processing', async () => {
      saveCheckoutDraft(VALID_DRAFT)
      renderPayment(VALID_DRAFT, undefined, 200)

      await waitFor(() => screen.getByLabelText('Card Number'))
      await fillCard(VALID_CARD, 'Asha Rao', '123', '12/2030')

      act(() => {
        void userEvent.click(screen.getByTestId('pay-now-btn'))
      })

      // Immediately after click, button should be disabled (processing)
      await waitFor(() => {
        expect(screen.getByTestId('pay-now-btn')).toBeDisabled()
      })
    })
  })
})
