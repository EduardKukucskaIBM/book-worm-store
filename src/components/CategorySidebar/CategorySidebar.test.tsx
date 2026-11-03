import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CategorySidebar from './CategorySidebar'

const mockCategories = [
  { id: 'cat-romance', name: 'Romance', slug: 'romance' },
  { id: 'cat-mystery', name: 'Mystery', slug: 'mystery' },
]

const mockPublishers = [
  { id: 'pub-abc', name: 'ABC Publishers' },
  { id: 'pub-horizon', name: 'Horizon House' },
]

describe('CategorySidebar', () => {
  it('renders "All", category list, and publishers group', () => {
    render(
      <CategorySidebar
        categories={mockCategories}
        publishers={mockPublishers}
        onSelectCategory={vi.fn()}
        onSelectPublisher={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Romance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mystery' })).toBeInTheDocument()
    expect(screen.getByText('Publishers')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ABC Publishers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Horizon House' })).toBeInTheDocument()
  })

  it('marks active item with active class and aria-current', () => {
    render(
      <CategorySidebar
        categories={mockCategories}
        publishers={mockPublishers}
        selectedCategory="cat-romance"
        onSelectCategory={vi.fn()}
        onSelectPublisher={vi.fn()}
      />
    )

    const romanceBtn = screen.getByRole('button', { name: 'Romance' })
    expect(romanceBtn).toHaveAttribute('aria-current', 'true')
    expect(romanceBtn).toHaveClass('category-sidebar__item--active')

    const allBtn = screen.getByRole('button', { name: 'All' })
    expect(allBtn).not.toHaveAttribute('aria-current')
  })

  it('calls onSelectCategory and onSelectPublisher when clicked', () => {
    const handleSelectCategory = vi.fn()
    const handleSelectPublisher = vi.fn()

    render(
      <CategorySidebar
        categories={mockCategories}
        publishers={mockPublishers}
        onSelectCategory={handleSelectCategory}
        onSelectPublisher={handleSelectPublisher}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Romance' }))
    expect(handleSelectCategory).toHaveBeenCalledWith('cat-romance')

    fireEvent.click(screen.getByRole('button', { name: 'ABC Publishers' }))
    expect(handleSelectPublisher).toHaveBeenCalledWith('pub-abc')
  })
})
