import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

describe('ST1 scaffold smoke test', () => {
  it('renders the Home page placeholder', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /home \/ catalogue/i })).toBeInTheDocument()
  })
})
