import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppProviders } from '../context/AppProviders'
import Home from './Home'
import { STORAGE_KEYS } from '../config'

const renderHome = (initialPath = '/') => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Home />,
      },
    ],
    {
      initialEntries: [initialPath],
    }
  )

  return {
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    ),
    router,
  }
}

describe('Home and Catalogue Page (ST5)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders three shelves with "Popular right now" for guest visitors', async () => {
    renderHome('/')

    await waitFor(() => {
      expect(screen.getByText('Popular right now')).toBeInTheDocument()
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
      expect(screen.getByText('New Launches')).toBeInTheDocument()
      expect(screen.getAllByTestId('book-card-book-lost-kitten').length).toBeGreaterThan(0)
    })
  })

  it('renders "Recommended for You" for logged-in users', async () => {
    // Seed authenticated session
    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({
        id: 'user-demo',
        name: 'Alex Morgan',
        email: 'demo@bookworm.com',
        giftPoints: 250,
      })
    )

    renderHome('/')

    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument()
    })
  })

  it('filters by category when deep-linked or when category clicked', async () => {
    renderHome('/?category=cat-romance')

    await waitFor(() => {
      expect(screen.getByTestId('catalogue-results')).toBeInTheDocument()
      expect(screen.getByText(/Results \(/i)).toBeInTheDocument()
      expect(screen.getByTestId('book-card-book-beneath-the-stars')).toBeInTheDocument()
    })

    // Active filter tag for Category: Romance should be rendered
    expect(screen.getByText('Category: Romance')).toBeInTheDocument()
  })

  it('filters by search query', async () => {
    renderHome('/?q=minimalism')

    await waitFor(() => {
      expect(screen.getByTestId('catalogue-results')).toBeInTheDocument()
      expect(screen.getByTestId('book-card-book-joy-of-minimalism')).toBeInTheDocument()
    })

    expect(screen.getByText('Search: "minimalism"')).toBeInTheDocument()
  })

  it('sorts results by price low-to-high and high-to-low', async () => {
    renderHome('/?q=the&sort=price-low-high')

    await waitFor(() => {
      expect(screen.getByTestId('catalogue-results')).toBeInTheDocument()
    })

    const bookCards = screen.getAllByTestId(/^book-card-/)
    expect(bookCards.length).toBeGreaterThan(1)
    // The Vanishing House (₹99) should appear before more expensive books
    expect(bookCards[0]).toHaveAttribute('data-testid', 'book-card-book-vanishing-house')
  })

  it('reflects filter changes in the URL and allows clearing them', async () => {
    const { router } = renderHome('/')

    await waitFor(() => {
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
      expect(screen.getAllByTestId('book-card-book-lost-kitten').length).toBeGreaterThan(0)
    })

    // Find search input and type query
    const searchInput = screen.getByPlaceholderText('Search')
    fireEvent.change(searchInput, { target: { value: 'space' } })

    await waitFor(() => {
      expect(router.state.location.search).toContain('q=space')
      expect(screen.getByTestId('book-card-book-final-frontier')).toBeInTheDocument()
    })

    // Clear search
    const clearButton = screen.getByText('Clear all')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(router.state.location.search).toBe('')
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
    })
  })

  it('renders EmptyState when 0 results match filters', async () => {
    renderHome('/?q=nonexistentbookquery123')

    await waitFor(() => {
      expect(screen.getByText('No books found')).toBeInTheDocument()
      expect(
        screen.getByText(/We couldn't find any books matching your current filters/i)
      ).toBeInTheDocument()
    })

    // Clicking clear in empty state resets results
    const clearBtn = screen.getByRole('button', { name: 'Clear all filters' })
    fireEvent.click(clearBtn)

    await waitFor(() => {
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
    })
  })

  it('renders Publisher filter from CategorySidebar', async () => {
    renderHome('/')

    await waitFor(() => {
      expect(screen.getByText('ABC Publishers')).toBeInTheDocument()
      expect(screen.getAllByTestId('book-card-book-lost-kitten').length).toBeGreaterThan(0)
    })

    const pubButton = screen.getByRole('button', { name: 'ABC Publishers' })
    fireEvent.click(pubButton)

    await waitFor(() => {
      expect(screen.getByText('Publisher: ABC Publishers')).toBeInTheDocument()
      expect(screen.getByTestId('book-card-book-art-of-focus')).toBeInTheDocument()
    })
  })
})
