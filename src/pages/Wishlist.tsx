import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Button } from '@carbon/react'
import { ShoppingCart, TrashCan } from '@carbon/icons-react'
import { getBooks } from '../api/books'
import { getAuthors } from '../api/authors'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { EmptyState } from '../components/EmptyState/EmptyState'
import BookCard from '../components/BookCard/BookCard'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import type { Author, Book } from '../types'
import './Wishlist.scss'

const Wishlist = (): ReactElement => {
  const { bookIds, toggle } = useWishlist()
  const { addItem } = useCart()

  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [allAuthors, setAllAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void Promise.all([getBooks(), getAuthors()]).then(([books, authors]) => {
      if (!active) return
      setAllBooks(books)
      setAllAuthors(authors)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const authorsMap = new Map(allAuthors.map((a) => [a.id, a]))
  const wishlistBooks = allBooks.filter((b) => bookIds.includes(b.id))

  return (
    <div className="wishlist-page" data-testid="wishlist-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Wishlist', isCurrent: true },
        ]}
      />
      <h1 className="wishlist-page__title">My Wishlist</h1>

      {!loading && wishlistBooks.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save books you love to find them easily later."
          action={{ label: 'Browse catalogue', to: '/' }}
          data-testid="wishlist-empty"
        />
      ) : (
        <ul className="wishlist-page__grid" aria-label="Wishlist books" data-testid="wishlist-grid">
          {wishlistBooks.map((book) => {
            const author = book.authorId ? authorsMap.get(book.authorId) : undefined
            return (
              <li key={book.id}>
                <BookCard
                  book={book}
                  authorName={author?.name}
                  variant="wishlist"
                >
                  <Button
                    kind="primary"
                    size="sm"
                    renderIcon={ShoppingCart}
                    onClick={() => addItem(book.id)}
                    data-testid={`wishlist-add-to-cart-${book.id}`}
                  >
                    Add to cart
                  </Button>
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={TrashCan}
                    onClick={() => toggle(book.id)}
                    data-testid={`wishlist-remove-${book.id}`}
                  >
                    Remove
                  </Button>
                </BookCard>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Wishlist
