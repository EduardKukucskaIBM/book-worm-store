import { describe, expect, it } from 'vitest'
import { canCancel, getCancellationTimeRemaining } from './cancellation'
import { addHours } from './dates'

describe('cancellation utilities', () => {
  const basePlacedAt = new Date('2024-07-01T12:00:00.000Z')
  // 48h cancel window
  const cancellableUntil = addHours(basePlacedAt, 48).toISOString() // 2024-07-03T12:00:00.000Z

  describe('canCancel', () => {
    it('returns true when evaluated at exactly 47h 59m (1 minute before deadline)', () => {
      // 47 hours and 59 minutes after placement: 2024-07-03T11:59:00.000Z
      const evaluationTime = new Date('2024-07-03T11:59:00.000Z')
      const order = {
        status: 'confirmed' as const,
        cancellableUntil,
      }
      expect(canCancel(order, evaluationTime)).toBe(true)
    })

    it('returns false when evaluated at exactly 48h 01m (1 minute after deadline)', () => {
      // 48 hours and 1 minute after placement: 2024-07-03T12:01:00.000Z
      const evaluationTime = new Date('2024-07-03T12:01:00.000Z')
      const order = {
        status: 'confirmed' as const,
        cancellableUntil,
      }
      expect(canCancel(order, evaluationTime)).toBe(false)
    })

    it('returns false when evaluated at exact deadline (48h 00m)', () => {
      const evaluationTime = new Date('2024-07-03T12:00:00.000Z')
      const order = {
        status: 'confirmed' as const,
        cancellableUntil,
      }
      expect(canCancel(order, evaluationTime)).toBe(false)
    })

    it('returns false if order status is not confirmed regardless of time', () => {
      const earlyTime = new Date('2024-07-01T13:00:00.000Z') // 1 hour after placement
      expect(canCancel({ status: 'cancelled', cancellableUntil }, earlyTime)).toBe(false)
      expect(canCancel({ status: 'delivered', cancellableUntil }, earlyTime)).toBe(false)
    })
  })

  describe('getCancellationTimeRemaining', () => {
    it('correctly calculates remaining hours and minutes when within window', () => {
      // 45 hours and 30 minutes after placement -> 2 hours 30 mins remaining
      const evaluationTime = new Date('2024-07-03T09:30:00.000Z')
      const remaining = getCancellationTimeRemaining(cancellableUntil, evaluationTime)
      expect(remaining.hours).toBe(2)
      expect(remaining.minutes).toBe(30)
      expect(remaining.expired).toBe(false)
    })

    it('returns expired = true when past deadline', () => {
      const evaluationTime = new Date('2024-07-03T13:00:00.000Z')
      const remaining = getCancellationTimeRemaining(cancellableUntil, evaluationTime)
      expect(remaining.hours).toBe(0)
      expect(remaining.minutes).toBe(0)
      expect(remaining.expired).toBe(true)
    })
  })
})
