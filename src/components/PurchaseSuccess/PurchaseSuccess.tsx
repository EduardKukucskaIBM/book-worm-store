import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Button, Tag, InlineNotification } from '@carbon/react'
import { CheckmarkFilled, Book as BookIcon } from '@carbon/icons-react'
import type { Author, Book, Category, Order } from '../../types'
import { formatDate } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { formatPaymentMethod } from '../../utils/payment'
import BookCard from '../BookCard/BookCard'
import CancelOrderControl from '../CancelOrderControl/CancelOrderControl'
import './PurchaseSuccess.scss'

export interface PurchaseSuccessProps {
  order: Order
  books?: Book[]
  authors?: Author[]
  categories?: Category[]
  now?: Date
  className?: string
  onOrderCancelled?: (updatedOrder: Order) => void
}

export const PurchaseSuccess = ({
  order,
  books = [],
  authors = [],
  categories = [],
  now = new Date(),
  className = '',
  onOrderCancelled,
}: PurchaseSuccessProps): ReactElement => {
  const booksMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])
  const authorsMap = useMemo(() => new Map(authors.map((a) => [a.id, a])), [authors])
  const categoriesMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const formattedPlacedDate = formatDate(order.placedAt, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const paymentLabel = formatPaymentMethod(order.paymentMethod, order.cardLast4)
  const isCancelled = order.status === 'cancelled'

  return (
    <div
      className={`purchase-success ${className}`.trim()}
      data-testid="purchase-success-card"
    >
      <header className="purchase-success__header">
        <CheckmarkFilled size={48} className="purchase-success__icon" aria-hidden="true" />
        <h1 className="purchase-success__title">
          Your purchase of the following reads is successful
        </h1>
      </header>

      <div className="purchase-success__meta" data-testid="order-meta">
        <div className="purchase-success__meta-item">
          <span>Order ID:</span>
          <strong data-testid="order-id">{order.id}</strong>
        </div>
        <div className="purchase-success__meta-item">
          <span>Date:</span>
          <strong>{formattedPlacedDate}</strong>
        </div>
        <div className="purchase-success__meta-item">
          <span>Payment:</span>
          <strong data-testid="payment-method">{paymentLabel}</strong>
        </div>
        <div className="purchase-success__meta-item">
          <span>Total Paid:</span>
          <strong data-testid="total-paid">{formatMoney(order.total)}</strong>
        </div>
        {isCancelled && (
          <Tag type="red" size="md" data-testid="cancelled-tag">
            Cancelled
          </Tag>
        )}
      </div>

      {isCancelled && (
        <InlineNotification
          kind="info"
          title="Order cancelled"
          subtitle="This order has been cancelled and any redeemed gift points have been refunded."
          lowContrast
          hideCloseButton
          className="purchase-success__notification"
          data-testid="cancelled-notification"
        />
      )}

      <div className="purchase-success__books-grid" data-testid="purchased-books-grid">
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
              variant="summary"
              now={now}
            />
          )
        })}
      </div>

      <div className="purchase-success__cancel-wrapper">
        <CancelOrderControl
          order={order}
          now={now}
          onCancelled={onOrderCancelled}
        />
      </div>

      <footer className="purchase-success__footer">
        <Button
          as={Link}
          to="/"
          kind="primary"
          renderIcon={BookIcon}
          size="lg"
          className="purchase-success__continue-btn"
          data-testid="continue-shopping-btn"
        >
          Continue your Shopping
        </Button>
      </footer>
    </div>
  )
}

export default PurchaseSuccess
