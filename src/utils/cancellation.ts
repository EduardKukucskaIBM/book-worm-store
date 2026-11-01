import { OrderStatus } from '../types'

export interface CancellableOrderInput {
  status: OrderStatus
  cancellableUntil: string
}

/**
 * Check if an order is eligible for cancellation.
 * An order can be cancelled if status is 'confirmed' and current time is before `cancellableUntil`.
 */
export function canCancel(order: CancellableOrderInput, now: Date = new Date()): boolean {
  if (order.status !== 'confirmed') {
    return false
  }
  const deadlineTime = new Date(order.cancellableUntil).getTime()
  const currentTime = new Date(now).getTime()
  return currentTime < deadlineTime
}

/**
 * Calculate the time remaining before the cancellation window closes.
 */
export function getCancellationTimeRemaining(
  cancellableUntil: string,
  now: Date = new Date()
): { hours: number; minutes: number; expired: boolean } {
  const deadlineTime = new Date(cancellableUntil).getTime()
  const currentTime = new Date(now).getTime()
  const diffMs = deadlineTime - currentTime

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, expired: true }
  }

  const totalMinutes = Math.floor(diffMs / (60 * 1000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return { hours, minutes, expired: false }
}
