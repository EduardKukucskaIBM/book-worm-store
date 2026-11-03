import { describe, expect, it } from 'vitest'
import { getRecommendations } from './recommendations'
import { Book, Order, User } from '../types'

describe('recommendations utility', () => {
  const mockBooks: Book[] = [
    {
      id: 'b1',
      title: 'Focus Mastery',
      description: 'Desc',
      authorId: 'a1',
      publisherId: 'p1',
      categoryIds: ['cat-self-help'],
      format: 'Paperback',
      language: 'English',
      price: 299,
      rating: 4.8,
      ratingCount: 100,
      copiesSold: 500,
      isBestseller: true,
      publishedAt: '2024-01-01',
      relatedBookIds: [],
    },
    {
      id: 'b2',
      title: 'Mind Power',
      description: 'Desc',
      authorId: 'a1',
      publisherId: 'p1',
      categoryIds: ['cat-self-help'],
      format: 'Paperback',
      language: 'English',
      price: 199,
      rating: 4.5,
      ratingCount: 50,
      copiesSold: 200,
      isBestseller: false,
      publishedAt: '2024-02-01',
      relatedBookIds: [],
    },
    {
      id: 'b3',
      title: 'Galactic Horizon',
      description: 'Desc',
      authorId: 'a2',
      publisherId: 'p2',
      categoryIds: ['cat-sci-fi'],
      format: 'Hardcover',
      language: 'English',
      price: 399,
      rating: 4.9,
      ratingCount: 80,
      copiesSold: 300,
      isBestseller: true,
      publishedAt: '2024-03-01',
      relatedBookIds: [],
    },
    {
      id: 'b4',
      title: 'Cooking Joy',
      description: 'Desc',
      authorId: 'a3',
      publisherId: 'p3',
      categoryIds: ['cat-cooking'],
      format: 'Paperback',
      language: 'English',
      price: 250,
      rating: 4.2,
      ratingCount: 40,
      copiesSold: 100,
      isBestseller: false,
      publishedAt: '2024-04-01',
      relatedBookIds: [],
    },
  ]

  const mockUser: User = {
    id: 'u1',
    name: 'Alice',
    email: 'alice@example.com',
    giftPoints: 100,
  }

  it('falls back to bestsellers for guests (null user)', () => {
    const recs = getRecommendations(null, [], mockBooks, 2)
    expect(recs.length).toBe(2)
    expect(recs.every((b) => b.isBestseller)).toBe(true)
  })

  it('falls back to bestsellers for logged in user with no past orders', () => {
    const recs = getRecommendations(mockUser, [], mockBooks, 2)
    expect(recs.length).toBe(2)
    expect(recs.every((b) => b.isBestseller)).toBe(true)
  })

  it('recommends books based on past order categories and author overlap, excluding purchased books', () => {
    // User bought b1 (author a1, category cat-self-help, publisher p1)
    const userOrders: Order[] = [
      {
        id: 'ord-1',
        userId: 'u1',
        items: [{ bookId: 'b1', title: 'Focus Mastery', unitPrice: 299, quantity: 1 }],
        shippingAddress: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          phoneCountryCode: '+91',
          phone: '9876543210',
          line1: '123 Test St',
          city: 'Bengaluru',
          pin: '560001',
          state: 'Karnataka',
          country: 'India',
        },
        subtotal: 299,
        tax: 35.88,
        deliveryCharges: 0,
        couponDiscount: 0,
        giftPointsRedeemed: 0,
        total: 334.88,
        paymentMethod: 'credit-card',
        status: 'confirmed',
        placedAt: '2024-01-01',
        cancellableUntil: '2024-01-03',
      },
    ]

    const recs = getRecommendations(mockUser, userOrders, mockBooks, 2)
    // b1 is purchased, so it should be excluded
    expect(recs.find((b) => b.id === 'b1')).toBeUndefined()
    // b2 shares author a1, category cat-self-help, and publisher p1 -> highest score
    expect(recs[0].id).toBe('b2')
  })
})
