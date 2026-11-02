import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Link, RouterProvider, useNavigate } from 'react-router-dom'
import RootLayout from '../../router/RootLayout'

const Page = ({ name }: { name: string }) => {
  const navigate = useNavigate()
  return (
    <div>
      <p>{name}</p>
      <Link to="/books/b">other book</Link>
      <button onClick={() => navigate('/?category=fantasy')}>filter</button>
      <button onClick={() => navigate('/?category=fantasy&sort=newest', { replace: true })}>
        refine
      </button>
    </div>
  )
}

// Same structure as the app: ScrollToTop lives in the root layout and survives navigation
const setup = (initial: string) => {
  const router = createMemoryRouter(
    [
      {
        element: <RootLayout />,
        children: [
          { path: '/', element: <Page name="home" /> },
          { path: '/books/:id', element: <Page name="book" /> },
        ],
      },
    ],
    { initialEntries: [initial] },
  )
  return render(<RouterProvider router={router} />)
}

describe('ScrollToTop (via RootLayout)', () => {
  let scrollTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollTo = vi.fn()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not scroll on first render', () => {
    setup('/books/a')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top when the pathname changes (e.g. clicking a related book)', async () => {
    setup('/books/a')
    expect(screen.getByText('book')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'other book' }))

    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('keeps the scroll position when only the query string changes (catalogue filters)', async () => {
    setup('/')

    await userEvent.click(screen.getByRole('button', { name: 'filter' }))
    await userEvent.click(screen.getByRole('button', { name: 'refine' }))

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
