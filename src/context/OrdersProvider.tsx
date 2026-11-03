import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { buildOrder, generateSeedOrders } from '../api/orders'
import type { NewOrderInput } from '../api/orders'
import { STORAGE_KEYS } from '../config'
import type { Order } from '../types'
import { canCancel } from '../utils/cancellation'
import { loadJSON, saveJSON } from '../utils/storage'
import { useAuth } from './AuthContext'
import { OrdersContext } from './OrdersContext'
import type { OrdersContextValue } from './OrdersContext'

/**
 * Only new orders and cancellations are persisted. Seed orders are regenerated
 * relative to "now" on every load (so the demo always has an order inside the 48h
 * window); a cancelled seed order is remembered by id.
 */
interface StoredOrders {
  created: Order[]
  cancelledIds: string[]
}

function isStoredOrders(value: unknown): value is StoredOrders {
  const v = value as Partial<StoredOrders> | null
  return (
    typeof v === 'object' &&
    v !== null &&
    Array.isArray(v.created) &&
    v.created.every((o) => typeof o === 'object' && o !== null && typeof o.id === 'string') &&
    Array.isArray(v.cancelledIds) &&
    v.cancelledIds.every((id) => typeof id === 'string')
  )
}

const EMPTY: StoredOrders = { created: [], cancelledIds: [] }

export const OrdersProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const { adjustGiftPoints } = useAuth()
  const [seeds] = useState<Order[]>(() => generateSeedOrders())
  const [stored, setStored] = useState<StoredOrders>(() => loadJSON(STORAGE_KEYS.orders, EMPTY, isStoredOrders))

  useEffect(() => {
    saveJSON(STORAGE_KEYS.orders, stored)
  }, [stored])

  const orders = useMemo<Order[]>(
    () =>
      [...stored.created, ...seeds]
        .map((o): Order => (stored.cancelledIds.includes(o.id) ? { ...o, status: 'cancelled' } : o))
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [stored, seeds],
  )

  const getOrdersForUser = useCallback((userId: string | null): Order[] => orders.filter((o) => o.userId === userId), [orders])

  const getOrder = useCallback((orderId: string): Order | undefined => orders.find((o) => o.id === orderId), [orders])

  const addOrder = useCallback(
    (input: NewOrderInput, now: Date = new Date()): Order => {
      const order = buildOrder(input, now)
      setStored((prev) => ({ ...prev, created: [order, ...prev.created] }))
      if (order.userId && order.giftPointsRedeemed > 0) {
        adjustGiftPoints(order.userId, -order.giftPointsRedeemed)
      }
      return order
    },
    [adjustGiftPoints],
  )

  const cancelOrder = useCallback(
    (orderId: string, now: Date = new Date()): Order => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) throw new Error(`Order ${orderId} not found`)
      if (!canCancel(order, now)) throw new Error(`Order ${orderId} is no longer eligible for cancellation`)

      setStored((prev) => ({ ...prev, cancelledIds: [...prev.cancelledIds, orderId] }))
      if (order.userId && order.giftPointsRedeemed > 0) {
        adjustGiftPoints(order.userId, order.giftPointsRedeemed)
      }
      return { ...order, status: 'cancelled' }
    },
    [orders, adjustGiftPoints],
  )

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, getOrdersForUser, getOrder, addOrder, cancelOrder }),
    [orders, getOrdersForUser, getOrder, addOrder, cancelOrder],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
