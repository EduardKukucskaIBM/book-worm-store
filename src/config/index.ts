/** Tax rate applied to subtotal (12 %). */
export const TAX_RATE = 0.12

/** Hours after placement within which an order can be cancelled. */
export const CANCEL_WINDOW_HOURS = 48

/** INR value of one gift point (1 point = ₹1). */
export const POINT_VALUE_INR = 1

/** Flat delivery charge in INR (0 = free). */
export const DELIVERY_CHARGE = 0

/** Valid coupon codes mapped to their INR discount. */
export const COUPONS: Record<string, number> = {
  BOOKWORM100: 100,
}
