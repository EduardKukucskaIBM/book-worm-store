import seedOrdersData from '../data/orders.json'
import { CANCEL_WINDOW_HOURS } from '../config'
import { Address, Order, OrderItem, OrderStatus, PaymentMethod } from '../types'
import { addDays, addHours } from '../utils/dates'
import { canCancel } from '../utils/cancellation'

interface SeedOrderRecord {
  id: string
  userId: string | null
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
  offsetHoursPlaced?: number
  offsetDaysDelivery?: number
}

/**
 * Generate seeded orders with dynamic dates relative to `now`.
 */
export function generateSeedOrders(now: Date = new Date()): Order[] {
  return (seedOrdersData as SeedOrderRecord[]).map((seed) => {
    const offsetHours = seed.offsetHoursPlaced ?? -2
    const placedDate = addHours(now, offsetHours)
    const cancellableUntilDate = addHours(placedDate, CANCEL_WINDOW_HOURS)
    const deliveryDate = seed.offsetDaysDelivery !== undefined ? addDays(now, seed.offsetDaysDelivery) : undefined

    return {
      id: seed.id,
      userId: seed.userId,
      items: seed.items,
      shippingAddress: seed.shippingAddress,
      subtotal: seed.subtotal,
      tax: seed.tax,
      deliveryCharges: seed.deliveryCharges,
      couponCode: seed.couponCode,
      couponDiscount: seed.couponDiscount,
      giftPointsRedeemed: seed.giftPointsRedeemed,
      total: seed.total,
      paymentMethod: seed.paymentMethod,
      status: seed.status,
      placedAt: placedDate.toISOString(),
      cancellableUntil: cancellableUntilDate.toISOString(),
      estimatedDelivery: deliveryDate ? deliveryDate.toISOString() : undefined,
    }
  })
}

// In-memory runtime orders store initialized from seed
let runtimeOrders: Order[] = generateSeedOrders()

export function resetOrders(now: Date = new Date()): void {
  runtimeOrders = generateSeedOrders(now)
}

export async function getOrders(userId?: string | null): Promise<Order[]> {
  if (userId !== undefined) {
    return runtimeOrders.filter((o) => o.userId === userId)
  }
  return [...runtimeOrders]
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const order = runtimeOrders.find((o) => o.id === orderId)
  return order ? { ...order } : null
}

export type NewOrderInput = Omit<Order, 'id' | 'placedAt' | 'cancellableUntil'>

/** Pure order factory: adds id, placedAt and the 48h cancel deadline. */
export function buildOrder(orderInput: NewOrderInput, now: Date = new Date()): Order {
  const cancellableUntilDate = addHours(now, CANCEL_WINDOW_HOURS)

  return {
    ...orderInput,
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    placedAt: now.toISOString(),
    cancellableUntil: cancellableUntilDate.toISOString(),
  }
}

export async function createOrder(orderInput: NewOrderInput, now: Date = new Date()): Promise<Order> {
  const newOrder = buildOrder(orderInput, now)
  runtimeOrders.unshift(newOrder)
  return newOrder
}

export async function cancelOrder(orderId: string, now: Date = new Date()): Promise<Order> {
  const order = runtimeOrders.find((o) => o.id === orderId)
  if (!order) {
    throw new Error(`Order ${orderId} not found`)
  }

  if (!canCancel(order, now)) {
    throw new Error(`Order ${orderId} is no longer eligible for cancellation`)
  }

  order.status = 'cancelled'
  return { ...order }
}
