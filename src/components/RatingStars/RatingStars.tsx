import type { ReactElement } from 'react'
import { Star, StarFilled } from '@carbon/icons-react'
import './RatingStars.scss'

export interface RatingStarsProps {
  /** Current rating value (1–5). For display mode use a float, for input use an integer. */
  value: number
  /** When provided, becomes an interactive star-rating input (1–5). */
  onChange?: (rating: number) => void
  className?: string
  /** Label prefix for screen-readers (e.g. "Rating: 4 out of 5") */
  'aria-label'?: string
}

export const RatingStars = ({
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel,
}: RatingStarsProps): ReactElement => {
  const isInput = typeof onChange === 'function'

  const label = ariaLabel ?? `Rating: ${value} out of 5`

  if (isInput) {
    return (
      <div
        className={`rating-stars rating-stars--input ${className}`.trim()}
        role="group"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value
          return (
            <button
              key={star}
              type="button"
              className={`rating-stars__btn ${filled ? 'rating-stars__btn--filled' : ''}`.trim()}
              onClick={() => onChange(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              aria-pressed={star === value}
            >
              {filled ? (
                <StarFilled size={20} aria-hidden="true" />
              ) : (
                <Star size={20} aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`rating-stars rating-stars--display ${className}`.trim()}
      aria-label={label}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value)
        return (
          <span key={star} className="rating-stars__icon" aria-hidden="true">
            {filled ? (
              <StarFilled size={16} />
            ) : (
              <Star size={16} />
            )}
          </span>
        )
      })}
    </div>
  )
}

export default RatingStars
