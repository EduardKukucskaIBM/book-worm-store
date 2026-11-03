import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { getBooks } from '../api/books'
import { STORAGE_KEYS } from '../config'
import type { Book, CartItem, CartLine } from '../types'
import { loadJSON, saveJSON } from '../utils/storage'
import { CartContext } from './CartContext'
import type { CartContextValue } from './CartContext'

function isCartItems(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (i) => typeof i === 'object' && i !== null && typeof i.bookId === 'string' && Number.isInteger(i.quantity) && i.quantity >= 1,
    )
  )
}

const clampQuantity = (quantity: number): number => (Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1)

export const CartProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [items, setItems] = useState<CartItem[]>(() => loadJSON<CartItem[]>(STORAGE_KEYS.cart, [], isCartItems))
  const [books, setBooks] = useState<Map<string, Book>>(() => new Map())

  useEffect(() => {
    saveJSON(STORAGE_KEYS.cart, items)
  }, [items])

  // Load book data lazily: only once the cart actually has something to show.
  const hasItems = items.length > 0
  useEffect(() => {
    if (!hasItems || books.size > 0) return
    let active = true
    void getBooks().then((list) => {
      if (active) setBooks(new Map(list.map((b) => [b.id, b])))
    })
    return () => {
      active = false
    }
  }, [hasItems, books.size])

  const addItem = useCallback((bookId: string, quantity = 1): void => {
    const amount = clampQuantity(quantity)
    setItems((prev) =>
      prev.some((i) => i.bookId === bookId)
        ? prev.map((i) => (i.bookId === bookId ? { ...i, quantity: i.quantity + amount } : i))
        : [...prev, { bookId, quantity: amount }],
    )
  }, [])

  const setQuantity = useCallback((bookId: string, quantity: number): void => {
    const next = clampQuantity(quantity)
    setItems((prev) => prev.map((i) => (i.bookId === bookId ? { ...i, quantity: next } : i)))
  }, [])

  const removeItem = useCallback((bookId: string): void => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId))
  }, [])

  const clearCart = useCallback((): void => setItems([]), [])

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((i) => {
        const book = books.get(i.bookId)
        return book ? [{ book, quantity: i.quantity }] : []
      }),
    [items, books],
  )

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value = useMemo<CartContextValue>(
    () => ({ items, lines, itemCount, addItem, setQuantity, removeItem, clearCart }),
    [items, lines, itemCount, addItem, setQuantity, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
