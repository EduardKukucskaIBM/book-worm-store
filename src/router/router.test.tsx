import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './index'
import { AppProviders } from '../context/AppProviders'
import { saveCheckoutDraft } from '../utils/checkoutDraft'
import type { CheckoutDraft } from '../types'

const renderRoute = (initialPath: string) => {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  })

  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('App Router with Shell Layouts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the header ("Book Worm" and cart button) and catalogue page with real data on "/"', async () => {
    renderRoute('/')

    // Header elements are present
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()

    // Page content is lazy-loaded, then rendered inside the layout with real data
    expect(await screen.findByTestId('home-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
      expect(screen.getAllByTestId('book-card-book-lost-kitten').length).toBeGreaterThan(0)
    })
  })

  it('renders the header ("Book Worm" and cart button) on "/books/book-art-of-focus"', async () => {
    renderRoute('/books/book-art-of-focus')

    // Header elements are present
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()

    // Product detail page content is rendered inside the layout
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'The Art of Focus' })
      ).toBeInTheDocument()
    })
  })

  it('renders the header on BackdropLayout routes like "/payment"', async () => {
    // Provide a valid draft so the Payment page does not redirect
    const draft: CheckoutDraft = {
      userId: null,
      lines: [{ bookId: 'book-joy-of-minimalism', title: 'Joy of Minimalism', unitPrice: 149, quantity: 1 }],
      address: {
        firstName: 'A', lastName: 'B', email: 'a@b.com', phoneCountryCode: '+91',
        phone: '9876543210', line1: 'Line 1', city: 'City', pin: '560001',
        state: 'Karnataka', country: 'India',
      },
      couponCode: null,
      giftPointsRedeemed: 0,
      totals: { subtotal: 149, tax: 17.88, deliveryCharges: 0, couponDiscount: 0, giftPointsDiscount: 0, giftPointsRedeemed: 0, total: 166.88, itemCount: 1 },
      savedAt: new Date().toISOString(),
    }
    saveCheckoutDraft(draft)
    renderRoute('/payment')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /complete payment/i })).toBeInTheDocument()
    })
  })

  it('renders the header on BackdropLayout routes like "/confirmation/order-1"', async () => {
    renderRoute('/confirmation/order-1')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order not found/i })).toBeInTheDocument()
    })
  })
})
