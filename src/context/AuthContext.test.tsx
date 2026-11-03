import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { getDemoCredentials, INVALID_CREDENTIALS_MESSAGE } from '../api/auth'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from './AppProviders'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'

const wrapper = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>
const demo = getDemoCredentials()

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts as a guest', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs in with the demo credentials from users.json', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(() => result.current.login(demo.email, demo.password))

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('demo@bookworm.com')
    expect(result.current.user?.giftPoints).toBe(250)
  })

  it('matches the email case-insensitively and ignores surrounding spaces', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(() => result.current.login('  DEMO@bookworm.com ', demo.password))
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('rejects a wrong password and an unknown email', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.login(demo.email, 'wrong')).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE)
    await expect(result.current.login('nobody@example.com', demo.password)).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('never exposes or stores the password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(() => result.current.login(demo.email, demo.password))

    expect(result.current.user).not.toHaveProperty('password')
    expect(localStorage.getItem(STORAGE_KEYS.session)).not.toContain(demo.password)
  })

  it('logs out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(() => result.current.login(demo.email, demo.password))

    act(() => result.current.logout())

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull()
  })

  it('persists the session across a page refresh', async () => {
    const first = renderHook(() => useAuth(), { wrapper })
    await act(() => first.result.current.login(demo.email, demo.password))
    first.unmount()

    const second = renderHook(() => useAuth(), { wrapper })
    expect(second.result.current.user?.email).toBe('demo@bookworm.com')
  })

  it('persists gift-point changes on top of the seed balance', async () => {
    const first = renderHook(() => useAuth(), { wrapper })
    await act(() => first.result.current.login(demo.email, demo.password))
    act(() => first.result.current.adjustGiftPoints('user-demo', -50))
    expect(first.result.current.user?.giftPoints).toBe(200)
    first.unmount()

    const second = renderHook(() => useAuth(), { wrapper })
    expect(second.result.current.user?.giftPoints).toBe(200)
  })

  it('keeps the cart across login and logout', async () => {
    const { result } = renderHook(() => ({ auth: useAuth(), cart: useCart() }), { wrapper })

    act(() => result.current.cart.addItem('book-joy-of-minimalism', 2))
    act(() => result.current.cart.addItem('book-path-to-success'))
    const before = result.current.cart.items

    await act(() => result.current.auth.login(demo.email, demo.password))
    expect(result.current.auth.isAuthenticated).toBe(true)
    expect(result.current.cart.items).toEqual(before)
    expect(result.current.cart.itemCount).toBe(3)

    act(() => result.current.auth.logout())
    expect(result.current.auth.isAuthenticated).toBe(false)
    expect(result.current.cart.items).toEqual(before)

    // The cart-with-book-data lines are still resolved after the round trip.
    await waitFor(() => expect(result.current.cart.lines).toHaveLength(2))
  })
})
