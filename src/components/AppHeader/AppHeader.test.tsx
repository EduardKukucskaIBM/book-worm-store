import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'
import { AppProviders } from '../../context/AppProviders'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProviders>
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
  </AppProviders>
)

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders branding logo and main navigation links', () => {
    render(<AppHeader />, { wrapper })

    expect(screen.getByText('Book Worm')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /my orders/i })[0]).toHaveAttribute('href', '/orders')
    expect(screen.getAllByRole('link', { name: /my wishlist/i })[0]).toHaveAttribute('href', '/wishlist')
    expect(screen.getAllByRole('link', { name: /my writers/i })[0]).toHaveAttribute('href', '/writers')
  })

  it('badge shows the cart count when cart has items, and hides when empty', async () => {
    const TestComponent = () => {
      const { addItem } = useCart()
      return (
        <div>
          <AppHeader />
          <button onClick={() => addItem('book-art-of-focus', 2)}>Add 2</button>
          <button onClick={() => addItem('book-art-of-learning', 1)}>Add 1</button>
        </div>
      )
    }

    render(<TestComponent />, { wrapper })

    // Initially empty - badge not shown
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument()

    // Add items
    await userEvent.click(screen.getByRole('button', { name: /add 2/i }))
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('2')

    await userEvent.click(screen.getByRole('button', { name: /add 1/i }))
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('3')
  })

  it('guest sees login link', () => {
    render(<AppHeader />, { wrapper })

    const loginLink = screen.getByRole('link', { name: /log in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('logged-in user sees user menu with user name, email, and Logout button', async () => {
    const TestComponent = () => {
      const { login } = useAuth()
      return (
        <div>
          <AppHeader />
          <button onClick={() => void login('demo@bookworm.com', 'bookworm123')}>
            Log in as Demo
          </button>
        </div>
      )
    }

    render(<TestComponent />, { wrapper })

    // Log in
    await userEvent.click(screen.getByRole('button', { name: /log in as demo/i }))

    // User menu button is present and login link is gone
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument()
    const userButton = screen.getByRole('button', { name: /user menu for/i })
    expect(userButton).toBeInTheDocument()

    // Open user menu
    await userEvent.click(userButton)

    // User information and Logout button are visible
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument()
    expect(screen.getByText('demo@bookworm.com')).toBeInTheDocument()
    const logoutBtn = screen.getByRole('menuitem', { name: /logout/i })
    expect(logoutBtn).toBeInTheDocument()

    // Click logout
    await userEvent.click(logoutBtn)

    // User menu closes and guest login link reappears
    expect(screen.queryByRole('menuitem', { name: /logout/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })

  it('closes user menu on Escape key press', async () => {
    const TestComponent = () => {
      const { login } = useAuth()
      return (
        <div>
          <AppHeader />
          <button onClick={() => void login('demo@bookworm.com', 'bookworm123')}>
            Log in as Demo
          </button>
        </div>
      )
    }

    render(<TestComponent />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: /log in as demo/i }))

    const userButton = screen.getByRole('button', { name: /user menu for/i })
    await userEvent.click(userButton)
    expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument()

    // Press Escape
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menuitem', { name: /logout/i })).not.toBeInTheDocument()
  })

  it('toggles mobile side navigation on hamburger button click', async () => {
    render(<AppHeader />, { wrapper })

    const menuButton = screen.getByRole('button', { name: /open navigation/i })
    expect(menuButton).toBeInTheDocument()

    await userEvent.click(menuButton)
    expect(screen.getByRole('button', { name: /close navigation/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /close navigation/i }))
    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument()
  })
})
