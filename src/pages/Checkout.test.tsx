import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from '../context/AppProviders'
import { loadCheckoutDraft } from '../utils/checkoutDraft'
import Checkout from './Checkout'

const JOY = 'book-joy-of-minimalism'
const PATH = 'book-path-to-success'
const VANISHING = 'book-vanishing-house'

const demoUser = {
  id: 'user-demo',
  name: 'Alex Morgan',
  email: 'demo@bookworm.com',
  giftPoints: 250,
  savedAddress: {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'demo@bookworm.com',
    phoneCountryCode: '+91',
    phone: '9876543210',
    line1: '42 MG Road, Indiranagar',
    line2: 'Apartment 304, Green Heights',
    city: 'Bengaluru',
    pin: '560038',
    state: 'Karnataka',
    country: 'India',
  },
}

const seedCart = (...entries: Array<[string, number]>): void => {
  localStorage.setItem(
    STORAGE_KEYS.cart,
    JSON.stringify(entries.map(([bookId, quantity]) => ({ bookId, quantity }))),
  )
}

const LocationProbe = () => <p data-testid="location">{useLocation().pathname}</p>

const renderCheckout = (options: { loggedIn?: boolean; cart?: Array<[string, number]> } = {}) => {
  seedCart(...(options.cart ?? [[JOY, 1], [PATH, 1]]))
  if (options.loggedIn) localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(demoUser))
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/payment"
            element={
              <>
                <h1>Payment page</h1>
                <LocationProbe />
              </>
            }
          />
          <Route path="/login" element={<h1>Login page</h1>} />
          <Route path="/" element={<h1>Catalogue</h1>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

const waitForLines = async (): Promise<void> => {
  await screen.findByTestId(`book-card-${JOY}`)
}

const total = (): string => screen.getByTestId('summary-total').textContent ?? ''

const fillValidAddress = async (): Promise<void> => {
  const fields: Array<[string, string]> = [
    ['First Name', 'Asha'],
    ['Last Name', 'Rao'],
    ['Address line 1', '12 Park Street'],
    ['E-mail', 'asha@example.com'],
    ['City', 'Mumbai'],
    ['PIN', '400001'],
    ['Mobile number', '9876501234'],
    ['State', 'Maharashtra'],
  ]
  for (const [label, text] of fields) {
    fireEvent.change(screen.getByLabelText(label), { target: { value: text } })
  }
}

describe('Checkout page (ST7)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('layout and totals', () => {
    it('shows the breadcrumb, page title, cart lines and the 12% tax total', async () => {
      renderCheckout()
      await waitForLines()

      expect(screen.getByRole('heading', { level: 1, name: 'Shopping Cart' })).toBeInTheDocument()
      const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
      expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
      expect(within(crumbs).getByText('Shopping Cart')).toBeInTheDocument()

      expect(screen.getByTestId(`book-card-${PATH}`)).toBeInTheDocument()
      expect(screen.getByText('Price (2 items)')).toBeInTheDocument()
      expect(screen.getByTestId('summary-price')).toHaveTextContent('₹508.00')
      expect(screen.getByText('Tax (12%)')).toBeInTheDocument()
      expect(screen.getByTestId('summary-tax')).toHaveTextContent('₹60.96')
      expect(screen.getByTestId('summary-delivery')).toHaveTextContent('Free')
      expect(screen.getByTestId('summary-discount')).toHaveTextContent('₹0.00')
      expect(total()).toBe('₹568.96')
      expect(screen.getByRole('button', { name: 'Pay Now' })).toBeInTheDocument()
    })

    it('renders the decorative illustration panel as hidden from assistive tech', async () => {
      renderCheckout()
      await waitForLines()
      expect(screen.getByTestId('price-summary-illustration')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('cart lines', () => {
    it('updates the totals live when the quantity changes', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Increase quantity of Joy of Minimalism' }))

      expect(screen.getByText('Price (3 items)')).toBeInTheDocument()
      expect(screen.getByTestId('summary-price')).toHaveTextContent('₹657.00')
      expect(screen.getByTestId('summary-tax')).toHaveTextContent('₹78.84')
      expect(total()).toBe('₹735.84')

      await user.click(screen.getByRole('button', { name: 'Decrease quantity of Joy of Minimalism' }))
      expect(total()).toBe('₹568.96')
    })

    it('never lets the quantity drop below 1', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      const decrease = screen.getByRole('button', { name: 'Decrease quantity of Joy of Minimalism' })
      await user.click(decrease)

      expect(screen.getByLabelText('Quantity of Joy of Minimalism')).toHaveValue(1)
      expect(screen.getByText('Price (2 items)')).toBeInTheDocument()
    })

    it('removes a line and updates the totals', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Remove Joy of Minimalism from cart' }))

      expect(screen.queryByTestId(`book-card-${JOY}`)).not.toBeInTheDocument()
      expect(screen.getByText('Price (1 item)')).toBeInTheDocument()
      expect(screen.getByTestId('summary-price')).toHaveTextContent('₹359.00')
      expect(total()).toBe('₹402.08')
    })

    it('shows the empty state with a catalogue link when the cart is empty', async () => {
      renderCheckout({ cart: [] })

      const empty = await screen.findByTestId('cart-empty')
      expect(within(empty).getByText('Your cart is empty')).toBeInTheDocument()
      expect(within(empty).getByRole('link', { name: 'Browse the catalogue' })).toHaveAttribute('href', '/')
      expect(screen.queryByRole('button', { name: 'Pay Now' })).not.toBeInTheDocument()
    })

    it('switches to the empty state after the last line is removed', async () => {
      const user = userEvent.setup()
      renderCheckout({ cart: [[JOY, 1]] })
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Remove Joy of Minimalism from cart' }))

      expect(await screen.findByTestId('cart-empty')).toBeInTheDocument()
    })
  })

  describe('coupon', () => {
    it('applies BOOKWORM100 (case-insensitive) and reduces the total by ₹100', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByLabelText('Coupon code'))
      await user.paste('bookworm100')
      await user.click(screen.getByRole('button', { name: 'Apply' }))

      expect(screen.getByTestId('coupon-applied')).toHaveTextContent('BOOKWORM100')
      expect(screen.getByTestId('summary-discount')).toHaveTextContent('₹100.00')
      expect(total()).toBe('₹468.96')
    })

    it('shows a clear error for an invalid code and leaves the total unchanged', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByLabelText('Coupon code'))
      await user.paste('SAVE50')
      await user.click(screen.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText('This coupon code is not valid')).toBeInTheDocument()
      expect(screen.queryByTestId('coupon-applied')).not.toBeInTheDocument()
      expect(total()).toBe('₹568.96')
    })

    it('asks for a code when Apply is pressed with an empty field', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(await screen.findByText('Enter a coupon code')).toBeInTheDocument()
    })

    it('removes an applied coupon', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByLabelText('Coupon code'))
      await user.paste('BOOKWORM100')
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      expect(total()).toBe('₹468.96')

      await user.click(screen.getByRole('button', { name: /remove coupon/i }))

      expect(screen.queryByTestId('coupon-applied')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Coupon code')).toBeInTheDocument()
      expect(screen.getByTestId('summary-discount')).toHaveTextContent('₹0.00')
      expect(total()).toBe('₹568.96')
    })
  })

  describe('guest vs logged-in', () => {
    it('shows the login prompt, linking to /login?redirect=/checkout, only to guests', async () => {
      renderCheckout()
      await waitForLines()

      const prompt = screen.getByTestId('login-prompt')
      expect(prompt).toHaveTextContent('Log in for saved address, gift points and order history')
      expect(within(prompt).getByRole('link', { name: 'Log in' })).toHaveAttribute(
        'href',
        '/login?redirect=/checkout',
      )
      // The cart is untouched by the prompt.
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) ?? '[]')).toHaveLength(2)
    })

    it('hides the login prompt for a logged-in user', async () => {
      renderCheckout({ loggedIn: true })
      await waitForLines()
      expect(screen.queryByTestId('login-prompt')).not.toBeInTheDocument()
    })

    it('hides gift points and "Use Saved Address" from guests', async () => {
      renderCheckout()
      await waitForLines()

      expect(screen.queryByTestId('gift-points')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Use Saved Address')).not.toBeInTheDocument()
    })

    it('shows the gift-point balance to a logged-in user', async () => {
      renderCheckout({ loggedIn: true })
      await waitForLines()

      expect(screen.getByTestId('gift-points')).toBeInTheDocument()
      expect(screen.getByTestId('gift-points-balance')).toHaveTextContent('250')
    })
  })

  describe('gift points', () => {
    it('redeems up to the balance when the payable amount is larger (1 point = ₹1)', async () => {
      const user = userEvent.setup()
      renderCheckout({ loggedIn: true })
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Redeem max' }))

      expect(screen.getByTestId('summary-points')).toHaveTextContent('₹250.00')
      expect(total()).toBe('₹318.96')
    })

    it('caps redemption at floor(payable) when the order is cheaper than the balance', async () => {
      const user = userEvent.setup()
      renderCheckout({ loggedIn: true, cart: [[VANISHING, 1]] })
      await screen.findByTestId(`book-card-${VANISHING}`)

      // ₹99 + 12% tax = ₹110.88 -> at most 110 points
      expect(screen.getByText('Up to 110 points on this order')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Redeem max' }))

      expect(screen.getByTestId('summary-points')).toHaveTextContent('₹110.00')
      expect(total()).toBe('₹0.88')
    })

    it('lowers the redeemable cap when a coupon reduces the payable amount', async () => {
      const user = userEvent.setup()
      renderCheckout({ loggedIn: true, cart: [[VANISHING, 1]] })
      await screen.findByTestId(`book-card-${VANISHING}`)

      await user.click(screen.getByLabelText('Coupon code'))
      await user.paste('BOOKWORM100')
      await user.click(screen.getByRole('button', { name: 'Apply' }))

      // payable is now ₹10.88 -> 10 points
      expect(screen.getByText('Up to 10 points on this order')).toBeInTheDocument()
    })
  })

  describe('address form', () => {
    it('offers "Use Saved Address" to a logged-in user; ticking it fills and locks the fields', async () => {
      const user = userEvent.setup()
      renderCheckout({ loggedIn: true })
      await waitForLines()

      expect(screen.getByLabelText('First Name')).toHaveValue('')
      await user.click(screen.getByLabelText('Use Saved Address'))

      expect(screen.getByLabelText('First Name')).toHaveValue('Alex')
      expect(screen.getByLabelText('First Name')).toHaveAttribute('readonly')
      expect(screen.getByLabelText('Last Name')).toHaveValue('Morgan')
      expect(screen.getByLabelText('Address line 1')).toHaveValue('42 MG Road, Indiranagar')
      expect(screen.getByLabelText('Address line 2 (optional)')).toHaveValue('Apartment 304, Green Heights')
      expect(screen.getByLabelText('E-mail')).toHaveValue('demo@bookworm.com')
      expect(screen.getByLabelText('City')).toHaveValue('Bengaluru')
      expect(screen.getByLabelText('PIN')).toHaveValue('560038')
      expect(screen.getByLabelText('Mobile number')).toHaveValue('9876543210')
      expect(screen.getByLabelText('State')).toHaveValue('Karnataka')
      expect(screen.getByLabelText('Country')).toBeDisabled()
      expect(screen.getByLabelText('Country')).toHaveValue('India')
    })

    it('unlocks the fields again when "Use Saved Address" is unticked', async () => {
      const user = userEvent.setup()
      renderCheckout({ loggedIn: true })
      await waitForLines()

      await user.click(screen.getByLabelText('Use Saved Address'))
      await user.click(screen.getByLabelText('Use Saved Address'))

      expect(screen.getByLabelText('First Name')).not.toHaveAttribute('readonly')
      expect(screen.getByLabelText('First Name')).toHaveValue('')
    })

    it('defaults to +91 and India', async () => {
      renderCheckout()
      await waitForLines()

      expect(screen.getByLabelText('Country code')).toHaveValue('+91')
      expect(screen.getByLabelText('Country')).toHaveValue('India')
    })

    it('validates a field inline on blur', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      expect(screen.queryByText('PIN code must be exactly 6 digits')).not.toBeInTheDocument()
      await user.type(screen.getByLabelText('PIN'), '123')
      await user.tab()

      expect(await screen.findByText('PIN code must be exactly 6 digits')).toBeInTheDocument()
      // Untouched fields stay quiet until Pay Now.
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument()
    })

    it('requires address line 1 but not line 2', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Pay Now' }))

      expect(await screen.findByText('Address line 1 is required')).toBeInTheDocument()
      expect(screen.queryByText(/address line 2 is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Pay Now', () => {
    it('blocks an invalid form, shows all errors and focuses the first invalid field', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByRole('button', { name: 'Pay Now' }))

      expect(await screen.findByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Last name is required')).toBeInTheDocument()
      expect(screen.getByText('Email address is required')).toBeInTheDocument()
      expect(screen.getByText('City is required')).toBeInTheDocument()
      expect(screen.getByText('PIN code is required')).toBeInTheDocument()
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
      expect(screen.getByText('State is required')).toBeInTheDocument()

      expect(screen.getByLabelText('First Name')).toHaveFocus()
      expect(screen.queryByRole('heading', { name: 'Payment page' })).not.toBeInTheDocument()
      expect(loadCheckoutDraft()).toBeNull()
    })

    it('focuses the first invalid field in DOM order, not the first field', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await user.click(screen.getByLabelText('First Name'))
      await user.paste('Asha')
      await user.click(screen.getByLabelText('Last Name'))
      await user.paste('Rao')
      await user.click(screen.getByRole('button', { name: 'Pay Now' }))

      expect(await screen.findByText('Address line 1 is required')).toBeInTheDocument()
      expect(screen.getByLabelText('Address line 1')).toHaveFocus()
    })

    it('saves the checkout draft and navigates to /payment when the form is valid', async () => {
      const user = userEvent.setup()
      renderCheckout()
      await waitForLines()

      await fillValidAddress()
      await user.click(screen.getByLabelText('Coupon code'))
      await user.paste('BOOKWORM100')
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      await user.click(screen.getByRole('button', { name: 'Increase quantity of The Path to Success' }))
      await user.click(screen.getByRole('button', { name: 'Pay Now' }))

      expect(await screen.findByRole('heading', { name: 'Payment page' })).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/payment')

      const draft = loadCheckoutDraft()
      expect(draft).not.toBeNull()
      expect(draft?.userId).toBeNull()
      expect(draft?.lines).toEqual([
        { bookId: JOY, title: 'Joy of Minimalism', unitPrice: 149, quantity: 1 },
        { bookId: PATH, title: 'The Path to Success', unitPrice: 359, quantity: 2 },
      ])
      expect(draft?.address).toMatchObject({
        firstName: 'Asha',
        lastName: 'Rao',
        email: 'asha@example.com',
        line1: '12 Park Street',
        city: 'Mumbai',
        pin: '400001',
        phoneCountryCode: '+91',
        phone: '9876501234',
        state: 'Maharashtra',
        country: 'India',
      })
      expect(draft?.couponCode).toBe('BOOKWORM100')
      expect(draft?.giftPointsRedeemed).toBe(0)
      // subtotal 149 + 718 = 867, tax 104.04, coupon 100 -> 871.04
      expect(draft?.totals).toMatchObject({ subtotal: 867, tax: 104.04, couponDiscount: 100, total: 871.04, itemCount: 3 })
    })

    it('saves the saved address and redeemed points for a logged-in user', async () => {
      const user = userEvent.setup()
      renderCheckout({ loggedIn: true })
      await waitForLines()

      await user.click(screen.getByLabelText('Use Saved Address'))
      await user.click(screen.getByRole('button', { name: 'Redeem max' }))
      await user.click(screen.getByRole('button', { name: 'Pay Now' }))

      expect(await screen.findByRole('heading', { name: 'Payment page' })).toBeInTheDocument()
      const draft = loadCheckoutDraft()
      expect(draft?.userId).toBe('user-demo')
      expect(draft?.address.line1).toBe('42 MG Road, Indiranagar')
      expect(draft?.address.pin).toBe('560038')
      expect(draft?.giftPointsRedeemed).toBe(250)
      expect(draft?.totals.total).toBe(318.96)
    })
  })

  describe('You may also like', () => {
    it('lists recommendations and never includes books already in the cart', async () => {
      renderCheckout()
      await waitForLines()

      const shelf = await screen.findByRole('region', { name: 'You may also like' })
      const cards = within(shelf).getAllByTestId(/^book-card-/)
      expect(cards.length).toBeGreaterThan(0)
      expect(within(shelf).queryByTestId(`book-card-${JOY}`)).not.toBeInTheDocument()
      expect(within(shelf).queryByTestId(`book-card-${PATH}`)).not.toBeInTheDocument()
    })

    it('excludes a top-ranked book while it is in the cart and offers it once removed', async () => {
      const user = userEvent.setup()
      // book-lost-kitten is the #1 guest recommendation.
      renderCheckout({ cart: [[JOY, 1], ['book-lost-kitten', 1]] })
      await waitForLines()
      const shelf = await screen.findByRole('region', { name: 'You may also like' })
      expect(within(shelf).queryByTestId('book-card-book-lost-kitten')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Remove The Lost Kitten from cart' }))

      await waitFor(() => {
        expect(
          within(screen.getByRole('region', { name: 'You may also like' })).getByTestId('book-card-book-lost-kitten'),
        ).toBeInTheDocument()
      })
    })  })
})
