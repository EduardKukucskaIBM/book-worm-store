import { TAX_RATE, COUPONS, DELIVERY_CHARGE, POINT_VALUE_INR } from '../config'
import { PriceBreakdown } from '../types'
import { round2 } from './money'

export interface ItemPricingInput {
  price?: number
  unitPrice?: number
  quantity: number
}

/**
 * Validate coupon code and return its INR discount amount.
 * Coupon codes are matched case-insensitively.
 */
export function getCouponDiscount(couponCode?: string | null): number {
  if (!couponCode) return 0
  const normalized = couponCode.trim().toUpperCase()
  return COUPONS[normalized] ?? 0
}

/**
 * Compute the maximum gift points that can be redeemed.
 * 1 point = ₹1, capped at the user's balance and floor(payableBeforePoints).
 * Guests or non-authenticated users get 0.
 */
export function maxRedeemablePoints(
  userGiftPoints: number | undefined | null,
  payableBeforePoints: number
): number {
  if (userGiftPoints === undefined || userGiftPoints === null || userGiftPoints <= 0) {
    return 0
  }
  const maxAffordable = Math.max(0, Math.floor(payableBeforePoints))
  return Math.min(Math.floor(userGiftPoints), maxAffordable)
}

/**
 * Single source of truth for cart, checkout, payment and order pricing.
 */
export function calculatePricing(
  items: ItemPricingInput[],
  couponCode?: string | null,
  giftPointsToRedeem = 0,
  userGiftPointsBalance?: number | null
): PriceBreakdown {
  const itemCount = items.reduce((sum, item) => sum + (item.quantity > 0 ? item.quantity : 0), 0)

  const rawSubtotal = items.reduce((sum, item) => {
    const unitPrice = item.unitPrice ?? item.price ?? 0
    return sum + unitPrice * Math.max(0, item.quantity)
  }, 0)
  const subtotal = round2(rawSubtotal)

  const tax = round2(subtotal * TAX_RATE)
  const deliveryCharges = DELIVERY_CHARGE

  const payableBeforeCoupon = round2(subtotal + tax + deliveryCharges)

  const rawCouponDiscount = getCouponDiscount(couponCode)
  const couponDiscount = Math.min(rawCouponDiscount, payableBeforeCoupon)

  const payableBeforePoints = Math.max(0, round2(payableBeforeCoupon - couponDiscount))

  const allowedMaxPoints = maxRedeemablePoints(
    userGiftPointsBalance !== undefined ? userGiftPointsBalance : giftPointsToRedeem,
    payableBeforePoints
  )

  const actualPointsRedeemed = Math.min(
    Math.max(0, Math.floor(giftPointsToRedeem)),
    allowedMaxPoints
  )

  const giftPointsDiscount = actualPointsRedeemed * POINT_VALUE_INR

  const total = Math.max(0, round2(payableBeforePoints - giftPointsDiscount))

  return {
    subtotal,
    tax,
    deliveryCharges,
    couponDiscount,
    giftPointsDiscount,
    giftPointsRedeemed: actualPointsRedeemed,
    total,
    itemCount,
  }
}
