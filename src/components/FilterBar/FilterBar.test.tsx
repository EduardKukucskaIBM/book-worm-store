import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  it('renders search input and dropdown selects for language, format, price range, and sort', () => {
    render(
      <FilterBar
        searchQuery="minimalism"
        selectedLanguage="all"
        selectedFormat="Paperback"
        selectedPriceRange="200-400"
        selectedSort="price-low-high"
        onSearchChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onFormatChange={vi.fn()}
        onPriceRangeChange={vi.fn()}
        onSortChange={vi.fn()}
      />
    )

    expect(screen.getByPlaceholderText('Search')).toHaveValue('minimalism')
    expect(screen.getByLabelText('Language')).toHaveValue('all')
    expect(screen.getByLabelText('Format (Paperback, ebook etc)')).toHaveValue('Paperback')
    expect(screen.getByLabelText('Price Range')).toHaveValue('200-400')
    expect(screen.getByLabelText('Sort by')).toHaveValue('price-low-high')
  })

  it('triggers change handlers when user interacts with inputs', () => {
    const handleSearch = vi.fn()
    const handleFormat = vi.fn()

    render(
      <FilterBar
        searchQuery=""
        selectedLanguage="all"
        selectedFormat="all"
        selectedPriceRange="all"
        selectedSort="relevance"
        onSearchChange={handleSearch}
        onLanguageChange={vi.fn()}
        onFormatChange={handleFormat}
        onPriceRangeChange={vi.fn()}
        onSortChange={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'focus' },
    })
    expect(handleSearch).toHaveBeenCalledWith('focus')

    fireEvent.change(screen.getByLabelText('Format (Paperback, ebook etc)'), {
      target: { value: 'eBook' },
    })
    expect(handleFormat).toHaveBeenCalledWith('eBook')
  })
})
