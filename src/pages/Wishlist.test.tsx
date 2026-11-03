import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from '../context/AppProviders'
import Wishlist from './Wishlist'

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderWishlist = ({ wishlist = [] as string[] } = {}) => {
  localStorage.clear()
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist))

  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/wishlist']}>
        <Routes>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/" element={<div><h1>Home Catalogue</h1></div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Wishlist page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the page heading "My Wishlist"', async () => {
    renderWishlist()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my wishlist/i })).toBeInTheDocument()
    })
  })

  it('shows EmptyState with catalogue link when wishlist is empty', async () => {
    renderWishlist({ wishlist: [] })
    await waitFor(() => {
      expect(screen.getByTestId('wishlist-empty')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /browse catalogue/i })).toBeInTheDocument()
    })
  })

  it('renders wishlisted books', async () => {
    renderWishlist({ wishlist: ['book-art-of-focus'] })
    // Wait for the async catalogue load + wishlist grid to appear
    await waitFor(
      () => {
        expect(screen.getByTestId('wishlist-grid')).toBeInTheDocument()
        // getAllByText because BookCard renders title in multiple places (heading + cover aria-label)
        expect(screen.getAllByText('The Art of Focus').length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })

  it('shows "Add to cart" button for each wishlisted book', async () => {
    renderWishlist({ wishlist: ['book-art-of-focus'] })
    await waitFor(() => {
      expect(
        screen.getByTestId('wishlist-add-to-cart-book-art-of-focus'),
      ).toBeInTheDocument()
    })
  })

  it('"Add to cart" adds the book to the cart', async () => {
    const user = userEvent.setup()
    renderWishlist({ wishlist: ['book-art-of-focus'] })

    await waitFor(() => {
      expect(screen.getByTestId('wishlist-add-to-cart-book-art-of-focus')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('wishlist-add-to-cart-book-art-of-focus'))

    // Cart should now contain the book
    await waitFor(() => {
      const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) ?? '[]') as Array<{
        bookId: string
        quantity: number
      }>
      expect(cart.some((item) => item.bookId === 'book-art-of-focus')).toBe(true)
    })
  })

  it('"Remove" button removes the book from the wishlist', async () => {
    const user = userEvent.setup()
    renderWishlist({ wishlist: ['book-art-of-focus'] })

    await waitFor(() => {
      expect(screen.getByTestId('wishlist-remove-book-art-of-focus')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('wishlist-remove-book-art-of-focus'))

    // After removal, the grid should be gone and empty state shown
    await waitFor(() => {
      expect(screen.getByTestId('wishlist-empty')).toBeInTheDocument()
    })
  })

  it('renders multiple wishlisted books in a grid', async () => {
    renderWishlist({ wishlist: ['book-art-of-focus', 'book-art-of-learning'] })
    await waitFor(
      () => {
        expect(screen.getAllByText('The Art of Focus').length).toBeGreaterThan(0)
        expect(screen.getAllByText('The Art of Learning').length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })

  it('works for guests (no login required)', async () => {
    // No session in localStorage → guest access
    localStorage.clear()
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(['book-art-of-focus']))

    await act(async () => {
      render(
        <AppProviders>
          <MemoryRouter initialEntries={['/wishlist']}>
            <Routes>
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </MemoryRouter>
        </AppProviders>,
      )
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my wishlist/i })).toBeInTheDocument()
    })
  })
})
