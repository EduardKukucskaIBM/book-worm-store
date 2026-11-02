import type { ReactElement } from 'react'
import { Button } from '@carbon/react'
import { TrashCan } from '@carbon/icons-react'
import type { Author, Category, CartLine } from '../../types'
import BookCard from '../BookCard/BookCard'
import QuantityStepper from '../QuantityStepper/QuantityStepper'
import './CartList.scss'

export interface CartListProps {
  lines: CartLine[]
  authorsMap?: Map<string, Author>
  categoriesMap?: Map<string, Category>
  onQuantityChange: (bookId: string, quantity: number) => void
  onRemove: (bookId: string) => void
}

export const CartList = ({
  lines,
  authorsMap,
  categoriesMap,
  onQuantityChange,
  onRemove,
}: CartListProps): ReactElement => (
  <ul className="cart-list" aria-label="Cart items">
    {lines.map(({ book, quantity }) => {
      const categories = book.categoryIds
        .map((id) => categoriesMap?.get(id))
        .filter((c): c is Category => Boolean(c))

      return (
        <li key={book.id} className="cart-list__item">
          <BookCard
            book={book}
            variant="cart"
            authorName={authorsMap?.get(book.authorId)?.name}
            categories={categories}
          >
            <div className="cart-list__controls">
              <QuantityStepper
                id={`quantity-${book.id}`}
                title={book.title}
                value={quantity}
                onChange={(next) => onQuantityChange(book.id, next)}
              />
              <Button
                kind="ghost"
                size="sm"
                renderIcon={TrashCan}
                aria-label={`Remove ${book.title} from cart`}
                onClick={() => onRemove(book.id)}
              >
                Remove
              </Button>
            </div>
          </BookCard>
        </li>
      )
    })}
  </ul>
)

export default CartList
