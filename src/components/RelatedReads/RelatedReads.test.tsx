import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RelatedReads from './RelatedReads'
import type { Book } from '../../types'
import booksData from '../../data/books.json'

describe('RelatedReads', () => {
  it('shows "No related reads yet" instead of rendering nothing when there are no items', () => {
    render(<RelatedReads items={[]} />)

    expect(screen.getByRole('heading', { name: 'Related Reads' })).toBeInTheDocument()
    expect(screen.getByText('No related reads yet')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('lists the related books when there are some', () => {
    const book = (booksData as unknown as Book[])[0]
    render(
      <MemoryRouter>
        <RelatedReads items={[{ book, authorName: 'Someone' }]} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('No related reads yet')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Related books' })).toBeInTheDocument()
  })
})
