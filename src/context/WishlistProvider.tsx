import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { STORAGE_KEYS } from '../config'
import { loadJSON, saveJSON } from '../utils/storage'
import { WishlistContext } from './WishlistContext'
import type { WishlistContextValue } from './WishlistContext'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export const WishlistProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [bookIds, setBookIds] = useState<string[]>(() => loadJSON<string[]>(STORAGE_KEYS.wishlist, [], isStringArray))

  useEffect(() => {
    saveJSON(STORAGE_KEYS.wishlist, bookIds)
  }, [bookIds])

  const isWishlisted = useCallback((bookId: string): boolean => bookIds.includes(bookId), [bookIds])

  const toggle = useCallback((bookId: string): void => {
    setBookIds((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]))
  }, [])

  const value = useMemo<WishlistContextValue>(() => ({ bookIds, isWishlisted, toggle }), [bookIds, isWishlisted, toggle])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
