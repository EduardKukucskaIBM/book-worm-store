import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookFormat, CatalogueFilters, SortOption } from '../types'

export interface ParsedFilters extends CatalogueFilters {
  priceRangeRaw?: string
}

export interface UseCatalogueFiltersResult {
  filters: CatalogueFilters
  rawFilters: {
    category: string
    publisher: string
    author: string
    q: string
    language: string
    format: string
    priceRange: string
    sort: string
  }
  hasActiveFilters: boolean
  activeFilterCount: number
  setFilter: (key: string, value: string | undefined) => void
  setFilters: (newFilters: Record<string, string | undefined>) => void
  clearFilter: (key: string) => void
  clearAllFilters: () => void
}

function parsePriceRange(raw?: string | null): [number, number] | undefined {
  if (!raw || raw === 'all') return undefined
  if (raw === '0-200' || raw === 'under-200') return [0, 200]
  if (raw === '200-400') return [200, 400]
  if (raw === '400-600') return [400, 600]
  if (raw === '600+' || raw === '600-10000' || raw === 'above-600') return [600, 10000]

  const parts = raw.split('-').map((p) => Number(p.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]]
  }
  return undefined
}

export function useCatalogueFilters(): UseCatalogueFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawCategory = searchParams.get('category') ?? 'all'
  const rawPublisher = searchParams.get('publisher') ?? 'all'
  const rawAuthor = searchParams.get('author') ?? 'all'
  const rawQ = searchParams.get('q') ?? ''
  const rawLanguage = searchParams.get('language') ?? 'all'
  const rawFormat = searchParams.get('format') ?? 'all'
  const rawPriceRange = searchParams.get('priceRange') ?? searchParams.get('price') ?? 'all'
  const rawSort = searchParams.get('sort') ?? 'relevance'

  const filters = useMemo<CatalogueFilters>(() => {
    const result: CatalogueFilters = {}

    if (rawCategory && rawCategory !== 'all') {
      result.category = rawCategory
    }
    if (rawPublisher && rawPublisher !== 'all') {
      result.publisher = rawPublisher
    }
    if (rawAuthor && rawAuthor !== 'all') {
      result.author = rawAuthor
    }
    if (rawQ && rawQ.trim()) {
      result.q = rawQ.trim()
    }
    if (rawLanguage && rawLanguage !== 'all') {
      result.language = rawLanguage
    }
    if (rawFormat && rawFormat !== 'all') {
      result.format = rawFormat as BookFormat
    }
    const parsedPrice = parsePriceRange(rawPriceRange)
    if (parsedPrice) {
      result.priceRange = parsedPrice
    }
    if (rawSort && rawSort !== 'relevance') {
      result.sort = rawSort as SortOption
    }

    return result
  }, [rawCategory, rawPublisher, rawAuthor, rawQ, rawLanguage, rawFormat, rawPriceRange, rawSort])

  const hasActiveFilters = useMemo(() => {
    return (
      (rawCategory !== 'all' && Boolean(rawCategory)) ||
      (rawPublisher !== 'all' && Boolean(rawPublisher)) ||
      (rawAuthor !== 'all' && Boolean(rawAuthor)) ||
      Boolean(rawQ && rawQ.trim()) ||
      (rawLanguage !== 'all' && Boolean(rawLanguage)) ||
      (rawFormat !== 'all' && Boolean(rawFormat)) ||
      (rawPriceRange !== 'all' && Boolean(rawPriceRange)) ||
      (rawSort !== 'relevance' && Boolean(rawSort))
    )
  }, [rawCategory, rawPublisher, rawAuthor, rawQ, rawLanguage, rawFormat, rawPriceRange, rawSort])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (rawCategory !== 'all' && Boolean(rawCategory)) count++
    if (rawPublisher !== 'all' && Boolean(rawPublisher)) count++
    if (rawAuthor !== 'all' && Boolean(rawAuthor)) count++
    if (rawQ && rawQ.trim()) count++
    if (rawLanguage !== 'all' && Boolean(rawLanguage)) count++
    if (rawFormat !== 'all' && Boolean(rawFormat)) count++
    if (rawPriceRange !== 'all' && Boolean(rawPriceRange)) count++
    if (rawSort !== 'relevance' && Boolean(rawSort)) count++
    return count
  }, [rawCategory, rawPublisher, rawAuthor, rawQ, rawLanguage, rawFormat, rawPriceRange, rawSort])

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (!value || value === 'all' || (key === 'sort' && value === 'relevance') || (key === 'q' && !value.trim())) {
          next.delete(key)
        } else {
          next.set(key, value.trim ? value.trim() : value)
        }
        return next
      })
    },
    [setSearchParams]
  )

  const setFilters = useCallback(
    (newFilters: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(newFilters)) {
          if (!value || value === 'all' || (key === 'sort' && value === 'relevance') || (key === 'q' && !value.trim())) {
            next.delete(key)
          } else {
            next.set(key, value.trim ? value.trim() : value)
          }
        }
        return next
      })
    },
    [setSearchParams]
  )

  const clearFilter = useCallback(
    (key: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete(key)
        return next
      })
    },
    [setSearchParams]
  )

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    filters,
    rawFilters: {
      category: rawCategory,
      publisher: rawPublisher,
      author: rawAuthor,
      q: rawQ,
      language: rawLanguage,
      format: rawFormat,
      priceRange: rawPriceRange,
      sort: rawSort,
    },
    hasActiveFilters,
    activeFilterCount,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
  }
}
