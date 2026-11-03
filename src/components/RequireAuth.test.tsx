import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from '../context/AppProviders'
import RequireAuth from './RequireAuth'

const LoginProbe = () => {
  const { pathname, search } = useLocation()
  return <p data-testid="login">{pathname + search}</p>
}

const renderAt = (path: string) =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <h1>Orders page</h1>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginProbe />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects a guest from /orders to /login?redirect=/orders', () => {
    renderAt('/orders')

    expect(screen.queryByRole('heading', { name: 'Orders page' })).not.toBeInTheDocument()
    expect(screen.getByTestId('login')).toHaveTextContent('/login?redirect=/orders')
  })

  it('renders the protected page for a logged-in user', () => {
    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ id: 'user-demo', name: 'Alex Morgan', email: 'demo@bookworm.com', giftPoints: 250 }),
    )

    renderAt('/orders')

    expect(screen.getByRole('heading', { name: 'Orders page' })).toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })
})
