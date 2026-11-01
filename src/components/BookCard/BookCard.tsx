import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Book, Category } from '../../types'
import CoverPlaceholder from '../CoverPlaceholder/CoverPlaceholder'
import AuthorLink from '../AuthorLink/AuthorLink'
import CategoryTags from '../CategoryTags/CategoryTags'
import PriceTag from '../PriceTag/PriceTag'
import DeliveryDate from '../DeliveryDate/DeliveryDate'
import './BookCard.scss'

export interface BookCardProps {
  book: Book
  authorName?: string
  categories?: Category[]
  variant?: 'catalogue' | 'related' | 'summary' | 'cart' | 'order' | 'wishlist'
  className?: string
  now?: Date
}

export const BookCard = ({
  book,
  authorName,
  categories = [],
  variant = 'catalogue',
  className = '',
  now,
}: BookCardProps): ReactElement => {
  return (
    <article
      className={`book-card book-card--${variant} ${className}`.trim()}
      data-testid={`book-card-${book.id}`}
    >
      <div className="book-card__cover-wrapper">
        <Link
          to={`/books/${encodeURIComponent(book.id)}`}
          className="book-card__cover-link"
          tabIndex={-1}
          aria-hidden="true"
        >
          <CoverPlaceholder book={book} authorName={authorName} size="md" />
        </Link>
      </div>

      <div className="book-card__content">
        <div className="book-card__header">
          <h3 className="book-card__title">
            <Link
              to={`/books/${encodeURIComponent(book.id)}`}
              className="book-card__title-link"
            >
              {book.title}
            </Link>
          </h3>
          <AuthorLink
            authorId={book.authorId}
            authorName={authorName}
            className="book-card__author"
          />
        </div>

        <p className="book-card__blurb" title={book.description}>
          {book.description}
        </p>

        <div className="book-card__meta">
          <span className="book-card__format">{book.format}</span>
          {categories.length > 0 && (
            <CategoryTags categories={categories} className="book-card__categories" />
          )}
        </div>

        <div className="book-card__footer">
          <PriceTag price={book.price} className="book-card__price" />
          <DeliveryDate book={book} now={now} className="book-card__delivery" />
        </div>
      </div>
    </article>
  )
}

export default BookCard
