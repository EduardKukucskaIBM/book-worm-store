import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { getDemoCredentials } from '../api/auth'
import type { NewOrderInput } from '../api/orders'
import { STORAGE_KEYS } from '../config'
import { AppProviders } from './AppProviders'
import { useAuth } from './AuthContext'
import { useOrders } from './OrdersContext'

const wrapper = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>
const demo = getDemoCredentials()

const address = {
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'demo@bookworm.com',
  phoneCountryCode: '+91',
  phone: '9876543210',
  line1: '42 MG Road',
  city: 'Bengaluru',
  pin: '560038',
  state: 'Karnataka',
  country: 'India',
}

const makeOrder = (overrides: Partial<NewOrderInput> = {}): NewOrderInput => ({
  userId: 'user-demo',
  items: [{ bookId: 'book-joy-of-minimalism', title: 'Joy of Minimalism', unitPrice: 149, quantity: 1 }],
  shippingAddress: address,
  subtotal: 149,
  tax: 17.88,
  deliveryCharges: 0,
  couponDiscount: 0,
  giftPointsRedeemed: 0,
  total: 166.88,
  paymentMethod: 'upi',
  status: 'confirmed',
  ...overrides,
})

describe('OrdersContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exposes the seeded orders for the demo user, newest first', () => {
    const { result } = renderHook(() => useOrders(), { wrapper })
    const mine = result.current.getOrdersForUser('user-demo')
    expect(mine.map((o) => o.id)).toEqual(['ord-seed-recent', 'ord-seed-past'])
  })

  it('persists new orders (guest and user) across a refresh', () => {
    const first = renderHook(() => useOrders(), { wrapper })
    let guestId = ''
    act(() => {
      guestId = first.result.current.addOrder(makeOrder({ userId: null })).id
      first.result.current.addOrder(makeOrder())
    })
    first.unmount()

    const second = renderHook(() => useOrders(), { wrapper })
    expect(second.result.current.getOrder(guestId)?.userId).toBeNull()
    expect(second.result.current.getOrdersForUser(null)).toHaveLength(1)
    expect(second.result.current.getOrdersForUser('user-demo')).toHaveLength(3)
  })

  it('spends redeemed gift points when an order is placed', async () => {
    const { result } = renderHook(() => ({ auth: useAuth(), orders: useOrders() }), { wrapper })
    await act(() => result.current.auth.login(demo.email, demo.password))

    act(() => {
      result.current.orders.addOrder(makeOrder({ giftPointsRedeemed: 60 }))
    })

    expect(result.current.auth.user?.giftPoints).toBe(190)
  })

  it('cancelOrder marks the order cancelled and refunds gift points', async () => {
    const { result } = renderHook(() => ({ auth: useAuth(), orders: useOrders() }), { wrapper })
    await act(() => result.current.auth.login(demo.email, demo.password))

    let id = ''
    act(() => {
      id = result.current.orders.addOrder(makeOrder({ giftPointsRedeemed: 60 })).id
    })
    expect(result.current.auth.user?.giftPoints).toBe(190)

    act(() => {
      result.current.orders.cancelOrder(id)
    })

    expect(result.current.orders.getOrder(id)?.status).toBe('cancelled')
    expect(result.current.auth.user?.giftPoints).toBe(250)
  })

  it('persists cancellation and the refund across a refresh', async () => {
    const first = renderHook(() => ({ auth: useAuth(), orders: useOrders() }), { wrapper })
    await act(() => first.result.current.auth.login(demo.email, demo.password))
    let id = ''
    act(() => {
      id = first.result.current.orders.addOrder(makeOrder({ giftPointsRedeemed: 40 })).id
    })
    act(() => {
      first.result.current.orders.cancelOrder(id)
    })
    first.unmount()

    const second = renderHook(() => ({ auth: useAuth(), orders: useOrders() }), { wrapper })
    expect(second.result.current.orders.getOrder(id)?.status).toBe('cancelled')
    expect(second.result.current.auth.user?.giftPoints).toBe(250)
  })

  it('can cancel the seeded in-window order, and that survives a refresh', () => {
    const first = renderHook(() => useOrders(), { wrapper })
    act(() => {
      first.result.current.cancelOrder('ord-seed-recent')
    })
    first.unmount()

    const second = renderHook(() => useOrders(), { wrapper })
    expect(second.result.current.getOrder('ord-seed-recent')?.status).toBe('cancelled')
  })

  it('refuses to cancel outside the 48h window, or a missing order', () => {
    const { result } = renderHook(() => useOrders(), { wrapper })
    const in49h = new Date(Date.now() + 49 * 60 * 60 * 1000)

    expect(() => result.current.cancelOrder('ord-seed-recent', in49h)).toThrow(/no longer eligible/)
    expect(() => result.current.cancelOrder('ord-seed-past')).toThrow(/no longer eligible/)
    expect(() => result.current.cancelOrder('nope')).toThrow(/not found/)
  })

  it('stores only created orders and cancelled ids, not the seeds', () => {
    const { result } = renderHook(() => useOrders(), { wrapper })
    act(() => {
      result.current.addOrder(makeOrder())
    })
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) ?? 'null')
    expect(raw.created).toHaveLength(1)
    expect(raw.cancelledIds).toEqual([])
  })
})
