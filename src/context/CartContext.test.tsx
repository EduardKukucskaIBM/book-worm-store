import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from './AppProviders'
import { useCart } from './CartContext'

const wrapper = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) ?? 'null')

/** Runs cart mutations, then lets the provider's async catalogue load settle inside act(). */
const run = (fn: () => void) =>
  act(async () => {
    fn()
  })

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.itemCount).toBe(0)
  })

  it('adds an item and increments an existing line', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await run(() => result.current.addItem('book-joy-of-minimalism'))
    await run(() => result.current.addItem('book-joy-of-minimalism'))
    await run(() => result.current.addItem('book-path-to-success', 3))

    expect(result.current.items).toEqual([
      { bookId: 'book-joy-of-minimalism', quantity: 2 },
      { bookId: 'book-path-to-success', quantity: 3 },
    ])
    expect(result.current.itemCount).toBe(5)
  })

  it('sets quantity and never goes below 1', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    await run(() => result.current.addItem('book-joy-of-minimalism'))

    await run(() => result.current.setQuantity('book-joy-of-minimalism', 4))
    expect(result.current.items[0].quantity).toBe(4)

    await run(() => result.current.setQuantity('book-joy-of-minimalism', 0))
    expect(result.current.items[0].quantity).toBe(1)

    await run(() => result.current.setQuantity('book-joy-of-minimalism', -5))
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('removes an item and clears the cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    await run(() => result.current.addItem('book-joy-of-minimalism'))
    await run(() => result.current.addItem('book-path-to-success'))

    await run(() => result.current.removeItem('book-joy-of-minimalism'))
    expect(result.current.items.map((i) => i.bookId)).toEqual(['book-path-to-success'])

    await run(() => result.current.clearCart())
    expect(result.current.items).toEqual([])
    expect(result.current.itemCount).toBe(0)
  })

  it('exposes lines joined with book data once the catalogue has loaded', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    await run(() => result.current.addItem('book-joy-of-minimalism', 2))

    await waitFor(() => expect(result.current.lines).toHaveLength(1))
    expect(result.current.lines[0].book.title).toBe('Joy of Minimalism')
    expect(result.current.lines[0].book.price).toBe(149)
    expect(result.current.lines[0].quantity).toBe(2)
  })

  it('persists to localStorage', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    await run(() => result.current.addItem('book-path-to-success', 2))

    expect(stored()).toEqual([{ bookId: 'book-path-to-success', quantity: 2 }])
  })

  it('survives a page refresh (remount reads localStorage)', async () => {
    const first = renderHook(() => useCart(), { wrapper })
    await run(() => first.result.current.addItem('book-path-to-success', 2))
    first.unmount()

    const second = renderHook(() => useCart(), { wrapper })
    expect(second.result.current.items).toEqual([{ bookId: 'book-path-to-success', quantity: 2 }])
    await waitFor(() => expect(second.result.current.lines).toHaveLength(1))
  })

  it('ignores corrupt stored data', () => {
    localStorage.setItem(STORAGE_KEYS.cart, '{not json')
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
  })

  it('ignores stored data with invalid quantities', () => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ bookId: 'x', quantity: 0 }]))
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
  })
})
