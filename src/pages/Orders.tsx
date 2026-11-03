import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { SkeletonPlaceholder } from '@carbon/react'
import { getAuthors } from '../api/authors'
import { getBooks } from '../api/books'
import { getCategories } from '../api/categories'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { OrderCard } from '../components/OrderCard/OrderCard'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import type { Author, Book, Category } from '../types'
import './Orders.scss'

export interface OrdersProps {
  navigationDelayMs?: number
}

export const Orders = ({ navigationDelayMs }: OrdersProps): ReactElement => {
  const { user } = useAuth()
  const { getOrdersForUser } = useOrders()

  const [catalogue, setCatalogue] = useState<{
    books: Book[]
    authors: Author[]
    categories: Category[]
  }>({ books: [], authors: [], categories: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void Promise.all([getBooks(), getAuthors(), getCategories()]).then(
      ([books, authors, categories]) => {
        if (!active) return
        setCatalogue({ books, authors, categories })
        setLoading(false)
      },
    )
    return () => {
      active = false
    }
  }, [])

  // user is guaranteed by RequireAuth, but guard defensively
  const orders = user ? getOrdersForUser(user.id) : []
  // newest first – already seeded newest-first, but sort to be safe
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  )

  if (loading) {
    return (
      <div className="orders-page orders-page--loading" aria-busy="true">
        <SkeletonPlaceholder className="orders-page__skeleton" />
      </div>
    )
  }

  return (
    <div className="orders-page" data-testid="orders-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Orders', isCurrent: true },
        ]}
      />
      <h1 className="orders-page__title">My Orders</h1>

      {sortedOrders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="You haven't placed any orders. Start exploring the catalogue."
          action={{ label: 'Browse catalogue', to: '/' }}
          data-testid="orders-empty"
        />
      ) : (
        <ul className="orders-page__list" aria-label="Order history">
          {sortedOrders.map((order) => (
            <li key={order.id} className="orders-page__item">
              <OrderCard
                order={order}
                books={catalogue.books}
                authors={catalogue.authors}
                categories={catalogue.categories}
                navigationDelayMs={navigationDelayMs}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Orders
