import { describe, expect, it } from 'vitest'
import { calculatePricing, getCouponDiscount, maxRedeemablePoints } from './pricing'
import booksData from '../data/books.json'
import { Book } from '../types'

describe('pricing utilities', () => {
  const books = booksData as Book[]
  const joyOfMinimalism = books.find((b) => b.id === 'book-joy-of-minimalism')!
  const pathToSuccess = books.find((b) => b.id === 'book-path-to-success')!

  describe('getCouponDiscount', () => {
    it('returns 100 for BOOKWORM100 code regardless of case and trimming', () => {
      expect(getCouponDiscount('BOOKWORM100')).toBe(100)
      expect(getCouponDiscount('bookworm100')).toBe(100)
      expect(getCouponDiscount('  BOOKWORM100  ')).toBe(100)
    })

    it('returns 0 for invalid or empty coupon codes', () => {
      expect(getCouponDiscount('')).toBe(0)
      expect(getCouponDiscount(undefined)).toBe(0)
      expect(getCouponDiscount(null)).toBe(0)
      expect(getCouponDiscount('INVALID_CODE')).toBe(0)
      expect(getCouponDiscount('DISCOUNT50')).toBe(0)
    })
  })

  describe('maxRedeemablePoints', () => {
    it('returns 0 for guests or missing balance', () => {
      expect(maxRedeemablePoints(null, 500)).toBe(0)
      expect(maxRedeemablePoints(undefined, 500)).toBe(0)
      expect(maxRedeemablePoints(0, 500)).toBe(0)
    })

    it('caps points at payable amount if balance is higher', () => {
      // 250 points available, but payable is 100.50 -> max 100 points
      expect(maxRedeemablePoints(250, 100.5)).toBe(100)
    })

    it('caps points at balance if payable is higher', () => {
      // 250 points available, payable is 600 -> max 250 points
      expect(maxRedeemablePoints(250, 600)).toBe(250)
    })

    it('returns 0 if payable amount is 0 or negative', () => {
      expect(maxRedeemablePoints(250, 0)).toBe(0)
      expect(maxRedeemablePoints(250, -10)).toBe(0)
    })
  })

  describe('calculatePricing', () => {
    it('calculates 12% tax and rounds to 2 decimal places', () => {
      // 1 item @ 399
      const result = calculatePricing([{ unitPrice: 399, quantity: 1 }])
      expect(result.subtotal).toBe(399)
      // 399 * 0.12 = 47.88
      expect(result.tax).toBe(47.88)
      expect(result.deliveryCharges).toBe(0)
      expect(result.couponDiscount).toBe(0)
      expect(result.giftPointsDiscount).toBe(0)
      expect(result.total).toBe(446.88)
      expect(result.itemCount).toBe(1)
    })

    it('accurately calculates design cart items: Joy of Minimalism (₹149) + The Path to Success (₹359) = ₹508 subtotal, 12% tax = ₹60.96, ₹100 coupon = ₹468.96', () => {
      expect(joyOfMinimalism.price).toBe(149)
      expect(pathToSuccess.price).toBe(359)

      const items = [
        { price: joyOfMinimalism.price, quantity: 1 },
        { price: pathToSuccess.price, quantity: 1 },
      ]
      const result = calculatePricing(items, 'BOOKWORM100')
      expect(result.subtotal).toBe(508)
      expect(result.tax).toBe(60.96)
      expect(result.couponDiscount).toBe(100)
      expect(result.total).toBe(468.96)
      expect(result.itemCount).toBe(2)
    })

    it('applies gift points redemption and enforces points cap', () => {
      const items = [{ unitPrice: 200, quantity: 1 }]
      // Subtotal = 200, Tax = 24, Payable = 224
      // User has 250 points, requests 50 points
      const result = calculatePricing(items, null, 50, 250)
      expect(result.subtotal).toBe(200)
      expect(result.tax).toBe(24)
      expect(result.giftPointsRedeemed).toBe(50)
      expect(result.giftPointsDiscount).toBe(50)
      expect(result.total).toBe(174)
    })

    it('caps gift points at the remaining payable amount after coupon', () => {
      // Subtotal = 100, Tax = 12, Total before coupon = 112
      // Coupon = 100 -> Remaining payable = 12
      // User requests 50 points with 250 balance -> capped at 12
      const items = [{ unitPrice: 100, quantity: 1 }]
      const result = calculatePricing(items, 'BOOKWORM100', 50, 250)
      expect(result.subtotal).toBe(100)
      expect(result.tax).toBe(12)
      expect(result.couponDiscount).toBe(100)
      expect(result.giftPointsRedeemed).toBe(12)
      expect(result.giftPointsDiscount).toBe(12)
      expect(result.total).toBe(0)
    })

    it('handles empty cart gracefully', () => {
      const result = calculatePricing([])
      expect(result.subtotal).toBe(0)
      expect(result.tax).toBe(0)
      expect(result.total).toBe(0)
      expect(result.itemCount).toBe(0)
    })

    it('prevents total from becoming negative even if discounts exceed payable', () => {
      const items = [{ unitPrice: 50, quantity: 1 }]
      // 50 + 6 (tax) = 56 payable
      // Coupon gives up to 100, but is capped at 56
      const result = calculatePricing(items, 'BOOKWORM100')
      expect(result.subtotal).toBe(50)
      expect(result.tax).toBe(6)
      expect(result.couponDiscount).toBe(56)
      expect(result.total).toBe(0)
    })
  })
})
