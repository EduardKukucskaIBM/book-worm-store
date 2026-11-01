import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './index'
import { AppProviders } from '../context/AppProviders'

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

    // Page content is rendered inside the layout with real data
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
      expect(screen.getAllByTestId('book-card-book-lost-kitten').length).toBeGreaterThan(0)
    })
  })

  it('renders the header ("Book Worm" and cart button) on "/books/1"', () => {
    renderRoute('/books/1')

    // Header elements are present
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()

    // Product detail page content is rendered inside the layout
    expect(screen.getByRole('heading', { name: /product detail/i })).toBeInTheDocument()
  })

  it('renders the header on BackdropLayout routes like "/payment"', () => {
    renderRoute('/payment')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /payment/i })).toBeInTheDocument()
  })

  it('renders the header on BackdropLayout routes like "/confirmation/order-1"', () => {
    renderRoute('/confirmation/order-1')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping cart/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /purchase confirmation/i })).toBeInTheDocument()
  })
})
