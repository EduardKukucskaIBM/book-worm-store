export type ID = string

export type BookFormat = 'Paperback' | 'Hardcover' | 'eBook'

export interface Author {
  id: ID
  name: string
  bio: string
  photoUrl?: string
  bookIds: ID[]
}

export interface Publisher {
  id: ID
  name: string
  logoUrl?: string
}

export interface Category {
  id: ID
  name: string
  parentId?: ID
  slug: string
}

export interface Review {
  id: ID
  bookId: ID
  userId: ID | null
  userName: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  createdAt: string
}

export interface Book {
  id: ID
  title: string
  description: string
  longDescription?: string
  authorId: ID
  publisherId: ID
  categoryIds: ID[]
  format: BookFormat
  language: string
  price: number
  coverUrl?: string
  backCoverUrl?: string
  isbn?: string
  rating: number
  ratingCount: number
  copiesSold: number
  isBestseller: boolean
  publishedAt: string
  deliveryDays?: number
  relatedBookIds: ID[]
  reviews?: Review[]
}

export interface CartItem {
  bookId: ID
  quantity: number
}

export interface Address {
  firstName: string
  lastName: string
  email: string
  phoneCountryCode: string
  phone: string
  line1: string
  line2?: string
  city: string
  pin: string
  state: string
  country: string
}

export interface User {
  id: ID
  name: string
  email: string
  savedAddress?: Address
  giftPoints: number
}

export type PaymentMethod = 'credit-card' | 'debit-card' | 'upi' | 'wallet'
export type OrderStatus = 'confirmed' | 'cancelled' | 'delivered'

export interface OrderItem {
  bookId: ID
  title: string
  unitPrice: number
  quantity: number
}

export interface Order {
  id: ID
  userId: ID | null
  items: OrderItem[]
  shippingAddress: Address
  subtotal: number
  tax: number
  deliveryCharges: number
  couponCode?: string
  couponDiscount: number
  giftPointsRedeemed: number
  total: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  placedAt: string
  cancellableUntil: string
  estimatedDelivery?: string
}

export interface CartLine {
  book: Book
  quantity: number
}

export interface PriceBreakdown {
  subtotal: number
  tax: number
  deliveryCharges: number
  couponDiscount: number
  giftPointsDiscount: number
  giftPointsRedeemed: number
  total: number
  itemCount: number
}

/** Snapshot written by Checkout (ST7) when "Pay Now" succeeds; read by Payment (ST8). */
export interface CheckoutDraft {
  userId: ID | null
  lines: OrderItem[]
  address: Address
  couponCode: string | null
  giftPointsRedeemed: number
  totals: PriceBreakdown
  savedAt: string
}

export type SortOption =
  | 'relevance'
  | 'price-low-high'
  | 'price-high-low'
  | 'rating-high-low'
  | 'newest'
  | 'bestselling'

export interface CatalogueFilters {
  category?: string
  publisher?: string
  author?: string
  q?: string
  language?: string
  format?: BookFormat
  priceRange?: [number, number]
  sort?: SortOption
}

export interface BookWithDetails extends Book {
  author?: Author
  publisher?: Publisher
  categories?: Category[]
}
