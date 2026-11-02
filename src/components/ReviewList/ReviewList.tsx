import type { ReactElement } from 'react'
import { Review } from '../../types'
import RatingStars from '../RatingStars/RatingStars'
import './ReviewList.scss'

export interface ReviewListProps {
  reviews: Review[]
  className?: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export const ReviewList = ({ reviews, className = '' }: ReviewListProps): ReactElement => {
  if (reviews.length === 0) {
    return (
      <p className={`review-list review-list--empty ${className}`.trim()}>
        No reviews yet. Be the first to review!
      </p>
    )
  }

  return (
    <ul className={`review-list ${className}`.trim()} aria-label="Customer reviews">
      {reviews.map((review) => (
        <li key={review.id} className="review-list__item" data-testid={`review-${review.id}`}>
          <div className="review-list__item-header">
            <span className="review-list__reviewer">{review.userName}</span>
            <time
              className="review-list__date"
              dateTime={review.createdAt}
            >
              {formatDate(review.createdAt)}
            </time>
          </div>
          <p className="review-list__text">{review.text}</p>
          <RatingStars
            value={review.rating}
            className="review-list__stars"
            aria-label={`Rated ${review.rating} out of 5`}
          />
        </li>
      ))}
    </ul>
  )
}

export default ReviewList
