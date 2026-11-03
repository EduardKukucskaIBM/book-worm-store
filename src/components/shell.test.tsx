import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PageLayout } from './PageLayout/PageLayout'
import { BackdropLayout } from './BackdropLayout/BackdropLayout'
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs'
import { EmptyState } from './EmptyState/EmptyState'
import { AppProviders } from '../context/AppProviders'
import { ShoppingCart } from '@carbon/icons-react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProviders>
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
  </AppProviders>
)

describe('PageLayout', () => {
  it('renders AppHeader, main content, and optional breadcrumbs', () => {
    render(
      <PageLayout
        breadcrumb={<nav data-testid="test-breadcrumb">Home / Books</nav>}
      >
        <div data-testid="page-content">Page Content</div>
      </PageLayout>,
      { wrapper },
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('test-breadcrumb')).toHaveTextContent('Home / Books')
    expect(screen.getByTestId('page-content')).toHaveTextContent('Page Content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })
})

describe('BackdropLayout', () => {
  it('renders AppHeader and centred card content in main landmark', () => {
    render(
      <BackdropLayout>
        <div data-testid="card-content">Card Content</div>
      </BackdropLayout>,
      { wrapper },
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toHaveTextContent('Card Content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })
})

describe('Breadcrumbs', () => {
  it('renders breadcrumb items with navigation links and current page', () => {
    const items = [
      { label: 'Home', to: '/' },
      { label: 'Non-fiction', to: '/?category=non-fiction' },
      { label: 'The Art of Focus', isCurrent: true },
    ]

    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Non-fiction' })).toHaveAttribute('href', '/?category=non-fiction')
    expect(screen.getByText('The Art of Focus')).toBeInTheDocument()
    // Current page is not a link
    expect(screen.queryByRole('link', { name: 'The Art of Focus' })).not.toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders title, description, icon and action link', () => {
    render(
      <MemoryRouter>
        <EmptyState
          title="Your cart is empty"
          description="Explore our catalogue to find your next great read."
          icon={ShoppingCart}
          action={{ label: 'Browse books', to: '/' }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /your cart is empty/i })).toBeInTheDocument()
    expect(screen.getByText(/explore our catalogue/i)).toBeInTheDocument()
    const actionLink = screen.getByRole('link', { name: /browse books/i })
    expect(actionLink).toHaveAttribute('href', '/')
  })

  it('renders clickable action button when onClick is provided', async () => {
    let clicked = false
    render(
      <EmptyState
        title="No results found"
        description="Try adjusting your filters"
        action={{ label: 'Reset filters', onClick: () => { clicked = true } }}
      />,
    )

    const btn = screen.getByRole('button', { name: /reset filters/i })
    await userEvent.click(btn)
    expect(clicked).toBe(true)
  })
})
