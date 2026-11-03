import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppProviders } from './AppProviders'
import { useWishlist } from './WishlistContext'

const wrapper = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles a book on and off', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    expect(result.current.isWishlisted('book-a')).toBe(false)

    act(() => result.current.toggle('book-a'))
    expect(result.current.isWishlisted('book-a')).toBe(true)
    expect(result.current.bookIds).toEqual(['book-a'])

    act(() => result.current.toggle('book-a'))
    expect(result.current.bookIds).toEqual([])
  })

  it('lists books in the order they were added and persists them', () => {
    const first = renderHook(() => useWishlist(), { wrapper })
    act(() => first.result.current.toggle('book-b'))
    act(() => first.result.current.toggle('book-a'))
    first.unmount()

    const second = renderHook(() => useWishlist(), { wrapper })
    expect(second.result.current.bookIds).toEqual(['book-b', 'book-a'])
  })
})
