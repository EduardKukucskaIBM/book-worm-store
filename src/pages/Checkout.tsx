import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { SkeletonText, Tile } from '@carbon/react'
import { ShoppingCart } from '@carbon/icons-react'
import { getAuthors, getBooks, getCategories } from '../api'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { EmptyState } from '../components/EmptyState/EmptyState'
import AddressForm from '../components/AddressForm/AddressForm'
import BookShelf from '../components/BookShelf/BookShelf'
import CartList from '../components/CartList/CartList'
import LoginPrompt from '../components/LoginPrompt/LoginPrompt'
import PriceSummary from '../components/PriceSummary/PriceSummary'
import { useAuth, useCart } from '../context'
import { useRecommendations } from '../hooks'
import type { Address, Author, Book, Category, CheckoutDraft } from '../types'
import { ADDRESS_FIELD_ORDER, EMPTY_ADDRESS, addressFieldId } from '../utils/address'
import { saveCheckoutDraft } from '../utils/checkoutDraft'
import { calculatePricing, maxRedeemablePoints } from '../utils/pricing'
import { validateAddress } from '../utils/validation'
import './Checkout.scss'

const BREADCRUMB = [{ label: 'Home', to: '/' }, { label: 'Shopping Cart', isCurrent: true }]

const Checkout = (): ReactElement => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { items, lines, setQuantity, removeItem } = useCart()

  const [catalogue, setCatalogue] = useState<{ books: Book[]; authors: Author[]; categories: Category[] }>({
    books: [],
    authors: [],
    categories: [],
  })
  const [catalogueLoaded, setCatalogueLoaded] = useState(false)

  const [manualAddress, setManualAddress] = useState<Address>(EMPTY_ADDRESS)
  const [useSaved, setUseSaved] = useState(false)
  const [showAllErrors, setShowAllErrors] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [requestedPoints, setRequestedPoints] = useState(0)

  useEffect(() => {
    let active = true
    void Promise.all([getBooks(), getAuthors(), getCategories()]).then(([books, authors, categories]) => {
      if (!active) return
      setCatalogue({ books, authors, categories })
      setCatalogueLoaded(true)
    })
    return () => {
      active = false
    }
  }, [])

  const authorsMap = useMemo(() => new Map(catalogue.authors.map((a) => [a.id, a])), [catalogue.authors])
  const categoriesMap = useMemo(() => new Map(catalogue.categories.map((c) => [c.id, c])), [catalogue.categories])

  // "You may also like": same ranking as the Home shelf, minus anything already in the cart.
  const candidates = useMemo(() => {
    const inCart = new Set(items.map((i) => i.bookId))
    return catalogue.books.filter((b) => !inCart.has(b.id))
  }, [catalogue.books, items])
  const { recommendations } = useRecommendations(candidates, 3)

  const savedAddress = isAuthenticated ? user?.savedAddress : undefined
  const usingSaved = useSaved && Boolean(savedAddress)
  const address: Address = usingSaved && savedAddress ? savedAddress : manualAddress

  // Pricing util (ST2) is the single source of truth for every figure on this page.
  const pricingLines = lines.map((l) => ({ price: l.book.price, quantity: l.quantity }))
  const balance = user?.giftPoints ?? 0
  const maxPoints = maxRedeemablePoints(balance, calculatePricing(pricingLines, appliedCoupon, 0, balance).total)
  const pricing = calculatePricing(pricingLines, appliedCoupon, requestedPoints, balance)

  const handlePay = (): void => {
    const errors = validateAddress(address)
    const firstInvalid = ADDRESS_FIELD_ORDER.find((field) => errors[field])
    if (firstInvalid) {
      setShowAllErrors(true)
      document.getElementById(addressFieldId(firstInvalid))?.focus()
      return
    }

    const draft: CheckoutDraft = {
      userId: user?.id ?? null,
      lines: lines.map((l) => ({
        bookId: l.book.id,
        title: l.book.title,
        unitPrice: l.book.price,
        quantity: l.quantity,
      })),
      address: { ...address, line2: address.line2?.trim() || undefined },
      couponCode: appliedCoupon,
      giftPointsRedeemed: pricing.giftPointsRedeemed,
      totals: pricing,
      savedAt: new Date().toISOString(),
    }
    saveCheckoutDraft(draft)
    navigate('/payment')
  }

  // Cart items whose book is not in the catalogue can never be shown; treat them as an empty cart once loaded.
  const hasKnownItems = items.some((i) => catalogue.books.some((b) => b.id === i.bookId))
  const isEmpty = items.length === 0 || (catalogueLoaded && !hasKnownItems)
  const cartIsLoading = !isEmpty && lines.length === 0

  return (
    <div className="checkout" data-testid="checkout-page">
      <Breadcrumbs items={BREADCRUMB} />
      <h1 className="checkout__title">Shopping Cart</h1>

      {isEmpty ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add a few books to your cart and they will show up here."
          action={{ label: 'Browse the catalogue', to: '/' }}
          data-testid="cart-empty"
        />
      ) : cartIsLoading ? (
        <Tile className="checkout__tile" aria-busy="true">
          <SkeletonText heading width="40%" />
          <SkeletonText paragraph lineCount={4} />
        </Tile>
      ) : (
        <>
          {!isAuthenticated && <LoginPrompt />}

          <Tile className="checkout__tile checkout__cart">
            <CartList
              lines={lines}
              authorsMap={authorsMap}
              categoriesMap={categoriesMap}
              onQuantityChange={setQuantity}
              onRemove={removeItem}
            />
          </Tile>

          <div className="checkout__columns">
            <Tile className="checkout__tile checkout__address">
              <h2 className="checkout__section-title">Address</h2>
              <AddressForm
                value={address}
                onChange={setManualAddress}
                showAllErrors={showAllErrors}
                savedAddress={savedAddress}
                useSaved={usingSaved}
                onUseSavedChange={setUseSaved}
              />
            </Tile>

            <Tile className="checkout__tile checkout__summary">
              <PriceSummary
                pricing={pricing}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
                onRemoveCoupon={() => setAppliedCoupon(null)}
                giftPoints={isAuthenticated ? { balance, max: maxPoints, onChange: setRequestedPoints } : undefined}
                onPay={handlePay}
              />
            </Tile>
          </div>

          <div className="checkout__recommendations">
            <BookShelf
              title="You may also like"
              books={recommendations}
              authorsMap={authorsMap}
              categoriesMap={categoriesMap}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Checkout
