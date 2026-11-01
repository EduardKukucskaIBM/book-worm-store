import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode, ReactElement } from 'react'
import { useCatalogueFilters } from './useCatalogueFilters'

const createWrapper = (initialPath = '/') => {
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  }
}

describe('useCatalogueFilters', () => {
  it('parses initial search parameters from URL', () => {
    const { result } = renderHook(() => useCatalogueFilters(), {
      wrapper: createWrapper('/?category=romance&format=Paperback&priceRange=200-400&sort=price-low-high'),
    })

    expect(result.current.hasActiveFilters).toBe(true)
    expect(result.current.filters.category).toBe('romance')
    expect(result.current.filters.format).toBe('Paperback')
    expect(result.current.filters.priceRange).toEqual([200, 400])
    expect(result.current.filters.sort).toBe('price-low-high')
  })

  it('updates filters when setFilter is called', () => {
    const { result } = renderHook(() => useCatalogueFilters(), {
      wrapper: createWrapper('/'),
    })

    expect(result.current.hasActiveFilters).toBe(false)

    act(() => {
      result.current.setFilter('q', 'quantum')
    })

    expect(result.current.filters.q).toBe('quantum')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('clears all filters when clearAllFilters is called', () => {
    const { result } = renderHook(() => useCatalogueFilters(), {
      wrapper: createWrapper('/?category=romance&q=love'),
    })

    expect(result.current.hasActiveFilters).toBe(true)

    act(() => {
      result.current.clearAllFilters()
    })

    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.filters).toEqual({})
  })
})
