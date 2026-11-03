import type { ReactElement } from 'react'
import { Book } from '../../types'
import { CoverPlaceholder } from '../CoverPlaceholder/CoverPlaceholder'
import './BookGallery.scss'

export interface BookGalleryProps {
  book: Pick<Book, 'id' | 'title' | 'authorId' | 'format' | 'longDescription' | 'isbn'>
  authorName?: string
  className?: string
}

export const BookGallery = ({
  book,
  authorName,
  className = '',
}: BookGalleryProps): ReactElement => {
  const initials = authorName
    ? authorName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'BW'

  return (
    <div className={`book-gallery ${className}`.trim()} role="group" aria-label="Book gallery">
      {/* Front cover */}
      <div className="book-gallery__front">
        <CoverPlaceholder book={book} authorName={authorName} size="lg" />
      </div>

      {/* Back cover – shows long description */}
      <div className="book-gallery__back" role="group" aria-label={`Back cover of ${book.title}`}>
        <div className="book-gallery__back-inner">
          {book.longDescription && (
            <blockquote className="book-gallery__back-quote">
              {book.longDescription}
            </blockquote>
          )}
          {book.longDescription && authorName && (
            <div className="book-gallery__back-author-section">
              <p className="book-gallery__back-about-label">About the Author</p>
              <p className="book-gallery__back-author-bio">
                {authorName} is the author of this book.
              </p>
            </div>
          )}
          <div className="book-gallery__back-footer">
            <div className="book-gallery__back-initials" aria-hidden="true">
              {initials}
            </div>
            <div className="book-gallery__back-isbn-wrap">
              {book.isbn && (
                <p className="book-gallery__back-isbn">ISBN {book.isbn}</p>
              )}
              {/* Simple barcode lines */}
              <svg
                className="book-gallery__back-barcode"
                viewBox="0 0 60 20"
                aria-hidden="true"
                width="80"
                height="28"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <rect
                    key={i}
                    x={i * 3}
                    y={0}
                    width={i % 3 === 0 ? 2 : 1}
                    height={20}
                    fill="currentColor"
                    opacity={0.8}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookGallery
