import { createContext, useContext } from 'react'
import type { CartItem, CartLine } from '../types'

export interface CartContextValue {
  items: CartItem[]
  /** Cart lines joined with book data. Lines appear once the catalogue has loaded. */
  lines: CartLine[]
  /** Total quantity across all lines (header badge). */
  itemCount: number
  /** Adds `quantity` (default 1) of a book, incrementing an existing line. */
  addItem: (bookId: string, quantity?: number) => void
  /** Sets a line's quantity; values below 1 are clamped to 1 (use `removeItem` to delete). */
  setQuantity: (bookId: string, quantity: number) => void
  removeItem: (bookId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within a CartProvider')
  return value
}
