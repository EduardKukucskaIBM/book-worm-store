import type { ReactElement } from 'react'
import { Book } from '../../types'
import RatingStars from '../RatingStars/RatingStars'
import './BookMeta.scss'

export interface BookMetaProps {
  book: Pick<Book, 'language' | 'rating' | 'copiesSold'>
  className?: string
}

export const BookMeta = ({ book, className = '' }: BookMetaProps): ReactElement => {
  return (
    <div className={`book-meta ${className}`.trim()} aria-label="Book metadata">
      <div className="book-meta__item">
        <span className="book-meta__icon" aria-hidden="true">
          {/* Language icon – simple SVG */}
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.2A5.8 5.8 0 0 1 13.8 8 5.8 5.8 0 0 1 8 13.8 5.8 5.8 0 0 1 2.2 8 5.8 5.8 0 0 1 8 2.2zm-1.3.8c-.7 1-1.2 2.4-1.3 3.5H4.1a5 5 0 0 1 2.6-3.5zm2.6 0a5 5 0 0 1 2.6 3.5h-1.3C10.5 5.4 10 4 9.3 3zm-2.8 0c.8.8 1.3 2 1.5 3.5H8.1C8 5 7.5 3.8 6.7 3zM4.1 7.5h1.5c0 .17.01.33.02.5H4.1v-.5zm1.5.5v.5H4.1v-.5h1.5zm.1 1H4.4a5 5 0 0 0 2.6 3.5c-.7-1-1.2-2.3-1.3-3.5zm4.8 0h-1.5c-.1 1.2-.6 2.5-1.3 3.5a5 5 0 0 0 2.8-3.5zm-2.5 0H7.9c.1 1.5.6 2.7 1.4 3.5.8-.8 1.3-2 1.4-3.5zm1.4-1H7.9V7.5h1.5l-.01.5zm0-.5H7.9V7H9.5l.01.5zm-1.5-1H6.6C6.7 5.2 7.2 4 8 3.2c.8.8 1.3 2 1.4 3.3z"/>
          </svg>
        </span>
        <span className="book-meta__label">Language</span>
        <span className="book-meta__value">{book.language}</span>
      </div>

      <div className="book-meta__divider" aria-hidden="true" />

      <div className="book-meta__item">
        <span className="book-meta__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.13L8 10.4l-3.71 1.95.71-4.13L2 5.35l4.15-.6z"/>
          </svg>
        </span>
        <span className="book-meta__label">Rating</span>
        <RatingStars value={book.rating} className="book-meta__stars" aria-label={`Rated ${book.rating} out of 5`} />
      </div>

      <div className="book-meta__divider" aria-hidden="true" />

      <div className="book-meta__item">
        <span className="book-meta__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm.75-9v3.69l2.53 2.53-1.06 1.06-2.97-2.97V5h1.5z"/>
          </svg>
        </span>
        <span className="book-meta__label">Sells</span>
        <span className="book-meta__value">{book.copiesSold.toLocaleString('en-IN')} copies sold</span>
      </div>
    </div>
  )
}

export default BookMeta
