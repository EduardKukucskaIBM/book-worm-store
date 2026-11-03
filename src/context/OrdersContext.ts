import { createContext, useContext } from 'react'
import type { Order } from '../types'
import type { NewOrderInput } from '../api/orders'

export interface OrdersContextValue {
  /** Seeded + newly placed orders, newest first. */
  orders: Order[]
  /** Orders belonging to a user (`null` = guest orders). */
  getOrdersForUser: (userId: string | null) => Order[]
  getOrder: (orderId: string) => Order | undefined
  /** Persists a new order; spends the user's redeemed gift points. */
  addOrder: (input: NewOrderInput, now?: Date) => Order
  /** Cancels an eligible order and refunds its gift points. Throws if missing or past the window. */
  cancelOrder: (orderId: string, now?: Date) => Order
}

export const OrdersContext = createContext<OrdersContextValue | null>(null)

export function useOrders(): OrdersContextValue {
  const value = useContext(OrdersContext)
  if (!value) throw new Error('useOrders must be used within an OrdersProvider')
  return value
}
