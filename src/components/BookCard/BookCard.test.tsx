import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookCard from './BookCard'
import { Book } from '../../types'

const mockBook: Book = {
  id: 'book-art-of-focus',
  title: 'The Art of Focus',
  description: 'Master deep concentration and eliminate modern digital distractions.',
  authorId: 'auth-1',
  publisherId: 'pub-abc',
  categoryIds: ['cat-non-fiction', 'cat-self-help'],
  format: 'Paperback',
  language: 'English',
  price: 399,
  rating: 4.8,
  ratingCount: 145,
  copiesSold: 145,
  isBestseller: true,
  publishedAt: '2024-03-15T08:00:00.000Z',
  deliveryDays: 3,
  relatedBookIds: [],
}

const mockCategories = [
  { id: 'cat-non-fiction', name: 'Non-Fiction', slug: 'non-fiction' },
  { id: 'cat-self-help', name: 'Self Help', slug: 'self-help' },
]

describe('BookCard (catalogue variant)', () => {
  it('renders title, author link, blurb, format, category tags, price, and delivery date', () => {
    render(
      <MemoryRouter>
        <BookCard
          book={mockBook}
          authorName="Arjun Patel"
          categories={mockCategories}
        />
      </MemoryRouter>
    )

    // Title links to /books/book-art-of-focus
    const titleLink = screen.getByRole('link', { name: 'The Art of Focus' })
    expect(titleLink).toHaveAttribute('href', '/books/book-art-of-focus')

    // Author link
    const authorLink = screen.getByRole('link', { name: 'Arjun Patel' })
    expect(authorLink).toHaveAttribute('href', '/?author=auth-1')

    // Blurb
    expect(
      screen.getByText('Master deep concentration and eliminate modern digital distractions.')
    ).toBeInTheDocument()

    // Format
    expect(screen.getByText('Paperback')).toBeInTheDocument()

    // Category tags
    expect(screen.getByRole('link', { name: 'Non-Fiction' })).toHaveAttribute(
      'href',
      '/?category=non-fiction'
    )
    expect(screen.getByRole('link', { name: 'Self Help' })).toHaveAttribute(
      'href',
      '/?category=self-help'
    )

    // Price
    expect(screen.getByText('₹399')).toBeInTheDocument()

    // Delivery date
    expect(screen.getByText(/Delivery by/i)).toBeInTheDocument()
  })

  it('renders "Instant download" for eBooks', () => {
    const ebook: Book = {
      ...mockBook,
      id: 'book-vanishing-house',
      format: 'eBook',
      deliveryDays: undefined,
    }

    render(
      <MemoryRouter>
        <BookCard book={ebook} authorName="Clara Nelson" />
      </MemoryRouter>
    )

    expect(screen.getByText('Instant download')).toBeInTheDocument()
  })
})
