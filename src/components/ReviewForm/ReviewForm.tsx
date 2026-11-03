import { useState, type ReactElement } from 'react'
import { Button } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import { Review } from '../../types'
import { validateReview } from '../../utils/validation'
import RatingStars from '../RatingStars/RatingStars'
import './ReviewForm.scss'

export interface ReviewFormProps {
  bookId?: string
  onSubmit: (review: Omit<Review, 'id' | 'bookId' | 'createdAt'>) => void
  className?: string
}

const MAX_CHARS = 100

export const ReviewForm = ({
  onSubmit,
  className = '',
}: ReviewFormProps): ReactElement => {
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const trimmed = text.trim()
  const charCount = trimmed.length
  const errors = submitted ? validateReview(text, rating) : {}
  const isValid =
    trimmed.length > 0 && trimmed.length <= MAX_CHARS && rating >= 1 && rating <= 5

  const handleSubmit = () => {
    setSubmitted(true)
    if (!isValid) return

    onSubmit({
      userId: null,
      userName: 'Anonymous',
      rating: rating as 1 | 2 | 3 | 4 | 5,
      text: trimmed,
    })

    setText('')
    setRating(0)
    setSubmitted(false)
  }

  return (
    <div className={`review-form ${className}`.trim()}>
      <div className="review-form__header">
        <label className="review-form__label" htmlFor="review-textarea">
          Leave Your Review
        </label>
        <span
          className={`review-form__counter ${charCount > MAX_CHARS ? 'review-form__counter--over' : ''}`}
          aria-live="polite"
          aria-label={`${charCount} of ${MAX_CHARS} characters`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>

      <textarea
        id="review-textarea"
        className={`review-form__textarea ${errors.text ? 'review-form__textarea--error' : ''}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_CHARS + 50} // allow over-typing so counter goes red, then we block submit
        placeholder="Placeholder text"
        rows={5}
        aria-describedby={errors.text ? 'review-text-error' : undefined}
      />
      {errors.text && (
        <p id="review-text-error" className="review-form__error" role="alert">
          {errors.text}
        </p>
      )}

      <div className="review-form__footer">
        <div className="review-form__stars-wrap">
          <RatingStars
            value={rating}
            onChange={setRating}
            aria-label="Your rating"
          />
          {errors.rating && (
            <p className="review-form__error review-form__error--inline" role="alert">
              {errors.rating}
            </p>
          )}
        </div>

        <Button
          kind="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!isValid}
          renderIcon={ArrowRight}
          iconDescription="Submit review"
          className="review-form__submit"
        >
          Submit
        </Button>
      </div>
    </div>
  )
}

export default ReviewForm
