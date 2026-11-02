import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { SkeletonPlaceholder } from '@carbon/react'
import { getAuthors } from '../api/authors'
import { getBooks } from '../api/books'
import { getCategories } from '../api/categories'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PurchaseSuccess } from '../components/PurchaseSuccess/PurchaseSuccess'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import type { Author, Book, Category, Order } from '../types'
import './Confirmation.scss'

export interface ConfirmationProps {
  now?: Date
}

export const Confirmation = ({ now }: ConfirmationProps): ReactElement => {
  const { orderId } = useParams<{ orderId: string }>()
  const { user } = useAuth()
  const { getOrder } = useOrders()

  const [catalogue, setCatalogue] = useState<{
    books: Book[]
    authors: Author[]
    categories: Category[]
  }>({
    books: [],
    authors: [],
    categories: [],
  })
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

  const order: Order | undefined = orderId ? getOrder(orderId) : undefined

  // Unknown order id, or an order belonging to another user -> EmptyState "Order not found"
  const isForbiddenOrNotFound =
    !order || (order.userId !== null && (!user || user.id !== order.userId))

  if (isForbiddenOrNotFound) {
    return (
      <div
        className="confirmation-page confirmation-page--not-found"
        data-testid="confirmation-not-found"
      >
        <EmptyState
          title="Order not found"
          description="We couldn't find the order you are looking for."
          action={{ label: 'Back to catalogue', to: '/' }}
          data-testid="order-not-found"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="confirmation-page confirmation-page--loading" aria-busy="true">
        <SkeletonPlaceholder className="confirmation-page__skeleton" />
      </div>
    )
  }

  return (
    <div className="confirmation-page" data-testid="confirmation-page">
      <PurchaseSuccess
        order={order}
        books={catalogue.books}
        authors={catalogue.authors}
        categories={catalogue.categories}
        now={now}
      />
    </div>
  )
}

export default Confirmation
