import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAuthorById,
  getAuthors,
  getBestsellers,
  getBookById,
  getBooks,
  getCategories,
  getDemoUser,
  getNewLaunches,
  getOrderById,
  getOrders,
  getPublisherById,
  getPublishers,
  getRelatedBooks,
  processPayment,
  resetOrders,
} from './index'
import { generateSeedOrders } from './orders'
import { canCancel } from '../utils/cancellation'

describe('API layer & Mock Data integrity', () => {
  beforeEach(() => {
    resetOrders()
  })

  describe('Dataset counts and constraints', () => {
    it('has at least 18 books across at least 6 categories and 4 publishers with INR prices 99-499', async () => {
      const books = await getBooks()
      expect(books.length).toBeGreaterThanOrEqual(18)

      const categories = await getCategories()
      expect(categories.length).toBeGreaterThanOrEqual(6)

      const publishers = await getPublishers()
      expect(publishers.length).toBeGreaterThanOrEqual(4)

      // Check all 9 titles from designs exist
      const designTitles = [
        'The Art of Focus',
        'The Art of Learning',
        'The Path to Success',
        'The Midnight Hour',
        'Beneath the Stars',
        'The Final Frontier',
        'Joy of Minimalism',
        'The Vanishing House',
        'The Lost Kitten',
      ]

      for (const title of designTitles) {
        const found = books.some((b) => b.title.toLowerCase() === title.toLowerCase())
        expect(found, `Expected book titled "${title}" to exist in books dataset`).toBe(true)
      }

      // Check price range 99-499
      for (const book of books) {
        expect(book.price).toBeGreaterThanOrEqual(99)
        expect(book.price).toBeLessThanOrEqual(499)
      }
    })
  })

  describe('Books API', () => {
    it('filters books by category (including parent category mapping)', async () => {
      const nonFictionBooks = await getBooks({ category: 'non-fiction' })
      expect(nonFictionBooks.length).toBeGreaterThan(0)
      for (const book of nonFictionBooks) {
        expect(book.categoryIds.some((c) => c.startsWith('cat-') || c === 'non-fiction')).toBe(true)
      }
    })

    it('filters books by publisher, format and search query', async () => {
      const abcBooks = await getBooks({ publisher: 'pub-abc' })
      expect(abcBooks.every((b) => b.publisherId === 'pub-abc')).toBe(true)

      const ebooks = await getBooks({ format: 'eBook' })
      expect(ebooks.every((b) => b.format === 'eBook')).toBe(true)

      const searchResults = await getBooks({ q: 'focus' })
      expect(searchResults.some((b) => b.title === 'The Art of Focus')).toBe(true)
    })

    it('sorts books by price low to high and high to low', async () => {
      const lowToHigh = await getBooks({ sort: 'price-low-high' })
      for (let i = 0; i < lowToHigh.length - 1; i++) {
        expect(lowToHigh[i].price).toBeLessThanOrEqual(lowToHigh[i + 1].price)
      }

      const highToLow = await getBooks({ sort: 'price-high-low' })
      for (let i = 0; i < highToLow.length - 1; i++) {
        expect(highToLow[i].price).toBeGreaterThanOrEqual(highToLow[i + 1].price)
      }
    })

    it('getBookById returns joined author, publisher, categories, and reviews', async () => {
      const book = await getBookById('book-art-of-focus')
      expect(book).not.toBeNull()
      expect(book?.author?.name).toBe('Arjun Patel')
      expect(book?.publisher?.name).toBe('ABC Publishers')
      expect(book?.categories?.length).toBeGreaterThan(0)
      expect(Array.isArray(book?.reviews)).toBe(true)
    })

    it('getRelatedBooks returns related items', async () => {
      const related = await getRelatedBooks('book-art-of-focus', 3)
      expect(related.length).toBeLessThanOrEqual(3)
      expect(related.every((b) => b.id !== 'book-art-of-focus')).toBe(true)
    })

    it('getBestsellers and getNewLaunches return expected subsets', async () => {
      const bestsellers = await getBestsellers(5)
      expect(bestsellers.length).toBeLessThanOrEqual(5)
      expect(bestsellers.every((b) => b.isBestseller)).toBe(true)

      const newLaunches = await getNewLaunches(4)
      expect(newLaunches.length).toBe(4)
    })
  })

  describe('Authors & Publishers API', () => {
    it('returns authors and individual author by id', async () => {
      const authors = await getAuthors()
      expect(authors.length).toBeGreaterThanOrEqual(10)

      const author = await getAuthorById('auth-1')
      expect(author?.name).toBe('Arjun Patel')
    })

    it('returns publishers and individual publisher by id', async () => {
      const publishers = await getPublishers()
      expect(publishers.length).toBeGreaterThanOrEqual(4)

      const publisher = await getPublisherById('pub-abc')
      expect(publisher?.name).toBe('ABC Publishers')
    })
  })

  describe('Auth & Demo User', () => {
    it('returns demo user with 250 gift points and saved address', async () => {
      const demoUser = await getDemoUser()
      expect(demoUser.email).toBe('demo@bookworm.com')
      expect(demoUser.giftPoints).toBe(250)
      expect(demoUser.savedAddress).toBeDefined()
      expect(demoUser.savedAddress?.city).toBe('Bengaluru')
    })
  })

  describe('Orders API & dynamic seed generation', () => {
    it('generates seeded orders relative to now: one within 48h cancel window, one older', () => {
      const fixedNow = new Date('2024-08-01T12:00:00.000Z')
      const seeded = generateSeedOrders(fixedNow)

      expect(seeded.length).toBeGreaterThanOrEqual(2)

      const recentOrder = seeded.find((o) => o.id === 'ord-seed-recent')
      const pastOrder = seeded.find((o) => o.id === 'ord-seed-past')

      expect(recentOrder).toBeDefined()
      expect(pastOrder).toBeDefined()

      // Recent order contains Joy of Minimalism and The Path to Success with subtotal 508
      expect(recentOrder!.subtotal).toBe(508)
      expect(recentOrder!.items.map((i) => i.title)).toContain('Joy of Minimalism')
      expect(recentOrder!.items.map((i) => i.title)).toContain('The Path to Success')

      // Recent order: placed 2 hours before fixedNow, cancellableUntil is 46h in the future
      expect(canCancel(recentOrder!, fixedNow)).toBe(true)

      // Past order: placed 72 hours before fixedNow, status delivered or past window
      expect(canCancel(pastOrder!, fixedNow)).toBe(false)
    })

    it('retrieves orders for a user and by orderId', async () => {
      const orders = await getOrders('user-demo')
      expect(orders.length).toBeGreaterThanOrEqual(2)

      const order = await getOrderById('ord-seed-recent')
      expect(order).not.toBeNull()
      expect(order?.userId).toBe('user-demo')
    })
  })

  describe('Payment API', () => {
    it('successfully processes simulated payment', async () => {
      const res = await processPayment(
        {
          method: 'credit-card',
          amount: 468.96,
        },
        0
      )
      expect(res.success).toBe(true)
      expect(res.transactionId).toMatch(/^tx-/)
    })

    it('handles simulated payment failure', async () => {
      const res = await processPayment(
        {
          method: 'upi',
          amount: 500,
          simulateFailure: true,
        },
        0
      )
      expect(res.success).toBe(false)
      expect(res.message).toBeDefined()
    })
  })
})
