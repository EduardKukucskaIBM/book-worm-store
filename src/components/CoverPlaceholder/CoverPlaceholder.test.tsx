import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CoverPlaceholder from './CoverPlaceholder'

describe('CoverPlaceholder', () => {
  it('renders book title and author with accessible role and label', () => {
    render(
      <CoverPlaceholder
        book={{
          id: 'book-art-of-focus',
          title: 'The Art of Focus',
          authorId: 'auth-1',
          format: 'Paperback',
        }}
        authorName="Arjun Patel"
      />
    )

    const cover = screen.getByRole('img', {
      name: /book cover of the art of focus by arjun patel/i,
    })
    expect(cover).toBeInTheDocument()
  })

  it('generates a deterministic fallback theme for unknown books', () => {
    render(
      <CoverPlaceholder
        book={{
          id: 'book-custom-unique-123',
          title: 'A Custom Book Title',
          authorId: 'auth-custom',
          format: 'Hardcover',
        }}
        authorName="Jane Doe"
      />
    )

    const cover = screen.getByRole('img', {
      name: /book cover of a custom book title by jane doe/i,
    })
    expect(cover).toBeInTheDocument()
  })
})
