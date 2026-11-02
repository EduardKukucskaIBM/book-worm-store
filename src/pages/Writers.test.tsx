import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProviders } from '../context/AppProviders'
import Writers from './Writers'

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderWriters = () => {
  localStorage.clear()
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/writers']}>
        <Routes>
          <Route path="/writers" element={<Writers />} />
          <Route
            path="/"
            element={<div><h1>Home Catalogue</h1></div>}
          />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Writers page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the page heading "My Writers"', async () => {
    renderWriters()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my writers/i })).toBeInTheDocument()
    })
  })

  it('renders the writers grid', async () => {
    renderWriters()
    await waitFor(() => {
      expect(screen.getByTestId('writers-grid')).toBeInTheDocument()
    })
  })

  it('renders author cards with names', async () => {
    renderWriters()
    await waitFor(() => {
      // Should show several authors from the mock data
      expect(screen.getByText('Arjun Patel')).toBeInTheDocument()
      expect(screen.getByText('James Wright')).toBeInTheDocument()
    })
  })

  it('renders author book counts', async () => {
    renderWriters()
    await waitFor(() => {
      // Arjun Patel has 2 books
      const arjunCard = screen.getByTestId('writer-card-auth-1')
      expect(arjunCard).toHaveTextContent('2 books')
    })
  })

  it('renders an author with 1 book using singular "book"', async () => {
    renderWriters()
    await waitFor(() => {
      // Raj Patel has 1 book
      const rajCard = screen.getByTestId('writer-card-auth-2')
      expect(rajCard).toHaveTextContent('1 book')
      expect(rajCard).not.toHaveTextContent('1 books')
    })
  })

  it('renders initials avatar for each author', async () => {
    renderWriters()
    await waitFor(() => {
      // Arjun Patel → "AP"
      const arjunCard = screen.getByTestId('writer-card-auth-1')
      expect(arjunCard).toHaveTextContent('AP')
    })
  })

  it('links each author card to /?author=<id>', async () => {
    renderWriters()
    await waitFor(() => {
      const arjunCard = screen.getByTestId('writer-card-auth-1')
      expect(arjunCard).toHaveAttribute('href', '/?author=auth-1')
    })
  })

  it('sorts authors alphabetically by name', async () => {
    renderWriters()
    await waitFor(() => {
      const cards = screen.getAllByTestId(/^writer-card-/)
      const names = cards.map((c) => c.getAttribute('aria-label')?.split(',')[0] ?? '')
      // Verify sorted order
      const sorted = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sorted)
    })
  })

  it('accessible: authors list has aria-label "Authors"', async () => {
    renderWriters()
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /authors/i })).toBeInTheDocument()
    })
  })
})
