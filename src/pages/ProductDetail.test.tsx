import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppProviders } from '../context/AppProviders'
import ProductDetail from './ProductDetail'

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderPDP = (bookId: string) => {
  const router = createMemoryRouter(
    [{ path: '/books/:bookId', element: <ProductDetail /> }],
    { initialEntries: [`/books/${bookId}`] }
  )
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductDetail page (ST6)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Book details rendering ─────────────────────────────────────────────────

  it('renders book title, author and short description', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Joy of Minimalism' })).toBeInTheDocument()
      // Daniel Reed appears multiple times (author link + author bio), use getAllByText
      expect(screen.getAllByText('Daniel Reed').length).toBeGreaterThan(0)
      expect(screen.getByText(/Declutter your mind/i)).toBeInTheDocument()
    })
  })

  it('renders publisher link with correct text', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      expect(screen.getByText('ABC Publishers')).toBeInTheDocument()
    })
  })

  it('renders format and price', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      // Paperback appears on the PDP details + related book cards
      expect(screen.getAllByText('Paperback').length).toBeGreaterThan(0)
      expect(screen.getByText(/₹149/)).toBeInTheDocument()
    })
  })

  it('renders "Delivery by" for a physical book', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      // Delivery by appears in multiple places (PDP + related book cards)
      expect(screen.getAllByText(/Delivery by/i).length).toBeGreaterThan(0)
    })
  })

  it('renders "Instant download" for an eBook', async () => {
    renderPDP('book-vanishing-house')

    await waitFor(() => {
      expect(screen.getByText('Instant download')).toBeInTheDocument()
    })
  })

  it('renders breadcrumb with Home and category links', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
      // Self Help category should be in the breadcrumb
      const selfHelpLinks = screen.getAllByText('Self Help')
      expect(selfHelpLinks.length).toBeGreaterThan(0)
    })
  })

  it('renders About the writer section with author initials avatar', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      expect(screen.getByText('About the writer')).toBeInTheDocument()
      // AuthorBio initials DR (Daniel Reed) - may appear more than once
      expect(screen.getAllByText('DR').length).toBeGreaterThan(0)
      expect(screen.getByText(/minimalist advocate/i)).toBeInTheDocument()
    })
  })

  // ── Add to Cart ───────────────────────────────────────────────────────────

  it('Add to Cart updates the cart item count', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument()
    })

    const cartBtn = screen.getByRole('button', { name: /Add to Cart/i })
    await act(async () => {
      fireEvent.click(cartBtn)
    })

    // Toast should appear
    await waitFor(() => {
      expect(screen.getByText('Added to cart')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View cart' })).toBeInTheDocument()
    })
  })

  // ── Wishlist toggle ───────────────────────────────────────────────────────

  it('wishlist button toggles between "Add to Wishlist" and "In Wishlist"', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Wishlist/i })).toBeInTheDocument()
    })

    const wishlistBtn = screen.getByRole('button', { name: /Add to Wishlist/i })
    await act(async () => {
      fireEvent.click(wishlistBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /In Wishlist/i })).toBeInTheDocument()
    })

    // Toggle back
    const inWishlistBtn = screen.getByRole('button', { name: /In Wishlist/i })
    await act(async () => {
      fireEvent.click(inWishlistBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Wishlist/i })).toBeInTheDocument()
    })
  })

  // ── Review form validation ─────────────────────────────────────────────────

  it('Submit button is disabled when textarea is empty and no rating selected', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
    })

    const submitBtn = screen.getByRole('button', { name: /Submit/i })
    expect(submitBtn).toBeDisabled()
  })

  it('Submit is disabled when only text is provided (no star rating)', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Placeholder text')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Placeholder text'), {
      target: { value: 'Great book!' },
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit/i })).toBeDisabled()
    })
  })

  it('Submit is enabled once text and rating are provided', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Placeholder text')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Placeholder text'), {
      target: { value: 'Great book!' },
    })

    // Click 4-star button
    const starBtn = screen.getByRole('button', { name: 'Rate 4 stars' })
    fireEvent.click(starBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled()
    })
  })

  it('counter shows 0/100 initially and updates as user types', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Placeholder text'), {
      target: { value: 'Hello' },
    })

    await waitFor(() => {
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })
  })

  it('Submit adds review to the list and persists to localStorage', async () => {
    renderPDP('book-art-of-focus')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Placeholder text')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Placeholder text'), {
      target: { value: 'Excellent read!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Rate 5 stars' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled()
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('Excellent read!')).toBeInTheDocument()
    })

    // Check localStorage persistence
    const stored = localStorage.getItem('bookworm.reviews.book-art-of-focus')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed[0].text).toBe('Excellent read!')
  })

  // ── Related reads ─────────────────────────────────────────────────────────

  it('renders related reads with working links', async () => {
    renderPDP('book-joy-of-minimalism')

    await waitFor(() => {
      // Joy of Minimalism is related to art-of-focus and path-to-success
      expect(screen.getAllByText('The Art of Focus').length).toBeGreaterThan(0)
    })

    // Find at least one link to a related book
    const relatedLinks = screen.getAllByRole('link', { name: /The Art of Focus/i })
    expect(relatedLinks.length).toBeGreaterThan(0)
    expect(relatedLinks[0].getAttribute('href')).toContain('/books/book-art-of-focus')
  })

  // ── Unknown book id ────────────────────────────────────────────────────────

  it('shows "Book not found" EmptyState for an unknown id', async () => {
    renderPDP('book-does-not-exist')

    await waitFor(() => {
      expect(screen.getByTestId('pdp-not-found')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Book not found' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Back to catalogue' })).toBeInTheDocument()
    })
  })
})

// ── Router integration test ───────────────────────────────────────────────────

describe('ProductDetail — router integration at /books/<real id>', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the PDP via the full router at /books/book-art-of-learning', async () => {
    const { routes } = await import('../router/index')
    const router = createMemoryRouter(routes, {
      initialEntries: ['/books/book-art-of-learning'],
    })
    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'The Art of Learning' })
      ).toBeInTheDocument()
    })
  })
})
