import { useState, type ReactElement } from 'react'
import { Button, ToastNotification } from '@carbon/react'
import { ShoppingCart, Bookmark, BookmarkFilled } from '@carbon/icons-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import './ProductActions.scss'

export interface ProductActionsProps {
  bookId: string
  className?: string
}

export const ProductActions = ({ bookId, className = '' }: ProductActionsProps): ReactElement => {
  const { addItem } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const [toastVisible, setToastVisible] = useState(false)

  const wishlisted = isWishlisted(bookId)

  const handleAddToCart = () => {
    addItem(bookId)
    setToastVisible(true)
  }

  const handleWishlist = () => {
    toggle(bookId)
  }

  return (
    <div className={`product-actions ${className}`.trim()}>
      <div className="product-actions__buttons">
        <Button
          kind="primary"
          size="lg"
          renderIcon={ShoppingCart}
          iconDescription="Add to cart"
          onClick={handleAddToCart}
          className="product-actions__cart-btn"
        >
          Add to Cart
        </Button>

        <Button
          kind="secondary"
          size="lg"
          renderIcon={wishlisted ? BookmarkFilled : Bookmark}
          iconDescription={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlist}
          className="product-actions__wishlist-btn"
        >
          {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
        </Button>
      </div>

      {toastVisible && (
        <div className="product-actions__toast-wrap" role="status" aria-live="polite">
          <ToastNotification
            kind="success"
            title="Added to cart"
            subtitle="Item added successfully"
            timeout={4000}
            onClose={() => setToastVisible(false)}
            lowContrast={false}
            className="product-actions__toast"
          />
          <div className="product-actions__toast-links">
            <Link to="/checkout" className="product-actions__toast-link">
              View cart
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductActions
