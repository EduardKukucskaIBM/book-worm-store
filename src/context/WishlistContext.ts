import { createContext, useContext } from 'react'

export interface WishlistContextValue {
  /** Wishlisted book ids, in the order they were added. */
  bookIds: string[]
  isWishlisted: (bookId: string) => boolean
  /** Adds the book if absent, removes it if present. */
  toggle: (bookId: string) => void
}

export const WishlistContext = createContext<WishlistContextValue | null>(null)

export function useWishlist(): WishlistContextValue {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used within a WishlistProvider')
  return value
}
