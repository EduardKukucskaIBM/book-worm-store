import type { ReactElement } from 'react'
import { DismissibleTag, Button } from '@carbon/react'
import { Category, Publisher, Author } from '../../types'
import './ActiveFilterTags.scss'

export interface ActiveFilterTagsProps {
  category?: string
  publisher?: string
  author?: string
  q?: string
  language?: string
  format?: string
  priceRange?: string
  sort?: string
  categories?: Category[]
  publishers?: Publisher[]
  authors?: Author[]
  onRemoveFilter: (key: string) => void
  onClearAll: () => void
  className?: string
}

export const ActiveFilterTags = ({
  category,
  publisher,
  author,
  q,
  language,
  format,
  priceRange,
  sort,
  categories = [],
  publishers = [],
  authors = [],
  onRemoveFilter,
  onClearAll,
  className = '',
}: ActiveFilterTagsProps): ReactElement | null => {
  const tags: { key: string; text: string }[] = []

  if (category && category !== 'all') {
    const matched = categories.find((c) => c.id === category || c.slug === category)
    tags.push({ key: 'category', text: `Category: ${matched ? matched.name : category}` })
  }

  if (publisher && publisher !== 'all') {
    const matched = publishers.find((p) => p.id === publisher)
    tags.push({ key: 'publisher', text: `Publisher: ${matched ? matched.name : publisher}` })
  }

  if (author && author !== 'all') {
    const matched = authors.find((a) => a.id === author)
    tags.push({ key: 'author', text: `Author: ${matched ? matched.name : author}` })
  }

  if (q && q.trim()) {
    tags.push({ key: 'q', text: `Search: "${q.trim()}"` })
  }

  if (language && language !== 'all') {
    tags.push({ key: 'language', text: `Language: ${language}` })
  }

  if (format && format !== 'all') {
    tags.push({ key: 'format', text: `Format: ${format}` })
  }

  if (priceRange && priceRange !== 'all') {
    let label = priceRange
    if (priceRange === '0-200') label = 'Under ₹200'
    else if (priceRange === '200-400') label = '₹200 - ₹400'
    else if (priceRange === '400-600') label = '₹400 - ₹600'
    else if (priceRange === '600+') label = 'Above ₹600'
    tags.push({ key: 'priceRange', text: `Price: ${label}` })
  }

  if (sort && sort !== 'relevance') {
    let label = sort
    if (sort === 'price-low-high') label = 'Price: Low to High'
    else if (sort === 'price-high-low') label = 'Price: High to Low'
    else if (sort === 'rating-high-low') label = 'Customer Rating'
    else if (sort === 'newest') label = 'Newest'
    else if (sort === 'bestselling') label = 'Bestselling'
    tags.push({ key: 'sort', text: `Sort: ${label}` })
  }

  if (tags.length === 0) return null

  return (
    <div className={`active-filter-tags ${className}`.trim()} aria-label="Active filters">
      <div className="active-filter-tags__list">
        {tags.map((tag) => (
          <DismissibleTag
            key={tag.key}
            type="cool-gray"
            text={tag.text}
            onClose={() => onRemoveFilter(tag.key)}
            className="active-filter-tags__tag"
          />
        ))}
      </div>
      <Button
        kind="ghost"
        size="sm"
        onClick={onClearAll}
        className="active-filter-tags__clear"
      >
        Clear all
      </Button>
    </div>
  )
}

export default ActiveFilterTags
