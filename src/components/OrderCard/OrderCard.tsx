import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Tag, ToastNotification } from '@carbon/react'
import { ShoppingCart } from '@carbon/icons-react'
import type { Author, Book, Category, Order } from '../../types'
import { formatDate } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { formatPaymentMethod } from '../../utils/payment'
import { useCart } from '../../context/CartContext'
import BookCard from '../BookCard/BookCard'
import CancelOrderControl from '../CancelOrderControl/CancelOrderControl'
import './OrderCard.scss'

export interface OrderCardProps {
  order: Order
  books?: Book[]
  authors?: Author[]
  categories?: Category[]
  now?: Date
  onCancelled?: (updatedOrder: Order) => void
}

const STATUS_TAG: Record<Order['status'], { type: 'green' | 'red' | 'blue'; label: string }> = {
  confirmed: { type: 'blue', label: 'Confirmed' },
  cancelled: { type: 'red', label: 'Cancelled' },
  delivered: { type: 'green', label: 'Delivered' },
}

export const OrderCard = ({
  order,
  books = [],
  authors = [],
  categories = [],
  now = new Date(),
  onCancelled,
}: OrderCardProps): ReactElement => {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [toastVisible, setToastVisible] = useState(false)

  const booksMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])
  const authorsMap = useMemo(() => new Map(authors.map((a) => [a.id, a])), [authors])
  const categoriesMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const formattedDate = formatDate(order.placedAt, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const paymentLabel = formatPaymentMethod(order.paymentMethod, order.cardLast4)
  const statusTag = STATUS_TAG[order.status]

  const handleBuyAllAgain = (): void => {
    order.items.forEach((item) => addItem(item.bookId, item.quantity))
    setToastVisible(true)
    setTimeout(() => {
      setToastVisible(false)
      void navigate('/checkout')
    }, 1500)
  }

  return (
    <article className="order-card" data-testid={`order-card-${order.id}`}>
      {toastVisible && (
        <div className="order-card__toast-wrapper">
          <ToastNotification
            kind="success"
            title="Added to cart"
            subtitle="All items from this order have been added to your cart."
            timeout={1500}
            onClose={() => setToastVisible(false)}
            data-testid="buy-all-again-toast"
          />
        </div>
      )}

      <header className="order-card__header">
        <div className="order-card__meta">
          <div className="order-card__meta-row">
            <span className="order-card__label">Order:</span>
            <Link
              to={`/confirmation/${order.id}`}
              className="order-card__id-link"
              data-testid={`order-id-link-${order.id}`}
            >
              {order.id}
            </Link>
          </div>
          <div className="order-card__meta-row">
            <span className="order-card__label">Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="order-card__meta-row">
            <span className="order-card__label">Items:</span>
            <span>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
          </div>
          <div className="order-card__meta-row">
            <span className="order-card__label">Total:</span>
            <strong data-testid={`order-total-${order.id}`}>{formatMoney(order.total)}</strong>
          </div>
          <div className="order-card__meta-row">
            <span className="order-card__label">Payment:</span>
            <span>{paymentLabel}</span>
          </div>
        </div>
        <Tag type={statusTag.type} size="md" data-testid={`order-status-${order.id}`}>
          {statusTag.label}
        </Tag>
      </header>

      <div className="order-card__items" data-testid={`order-items-${order.id}`}>
        {order.items.map((item) => {
          const matchedBook = booksMap.get(item.bookId)
          const book: Book = matchedBook ?? {
            id: item.bookId,
            title: item.title,
            description: '',
            authorId: '',
            publisherId: '',
            categoryIds: [],
            format: 'Paperback',
            language: 'English',
            price: item.unitPrice,
            rating: 0,
            ratingCount: 0,
            copiesSold: 0,
            isBestseller: false,
            publishedAt: order.placedAt,
            relatedBookIds: [],
          }
          const author = book.authorId ? authorsMap.get(book.authorId) : undefined
          const bookCategories = book.categoryIds
            .map((id) => categoriesMap.get(id))
            .filter((c): c is Category => Boolean(c))

          return (
            <BookCard
              key={item.bookId}
              book={book}
              authorName={author?.name}
              categories={bookCategories}
              variant="order"
              now={now}
            >
              <Button
                kind="ghost"
                size="sm"
                renderIcon={ShoppingCart}
                onClick={() => {
                  addItem(item.bookId, item.quantity)
                  setToastVisible(true)
                  setTimeout(() => {
                    setToastVisible(false)
                    void navigate('/checkout')
                  }, 1500)
                }}
                data-testid={`buy-again-${item.bookId}`}
              >
                Buy it again
              </Button>
            </BookCard>
          )
        })}
      </div>

      <footer className="order-card__footer">
        <CancelOrderControl order={order} now={now} onCancelled={onCancelled} />
        <Button
          kind="secondary"
          size="md"
          renderIcon={ShoppingCart}
          onClick={handleBuyAllAgain}
          data-testid={`buy-all-again-${order.id}`}
        >
          Buy all again
        </Button>
      </footer>
    </article>
  )
}

export default OrderCard
