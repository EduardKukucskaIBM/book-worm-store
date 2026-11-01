import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../context/AppProviders'
import Home from '../pages/Home'

describe('Home page smoke test', () => {
  it('renders the Home catalogue page', async () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </AppProviders>,
    )
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Bestsellers this Month')).toBeInTheDocument()
    })
  })
})
