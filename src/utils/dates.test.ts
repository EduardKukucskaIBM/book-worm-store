import { describe, expect, it } from 'vitest'
import { addDays, addHours, formatDate, getDeliveryDateLabel } from './dates'

describe('dates utilities', () => {
  const mockNow = new Date('2024-07-15T10:00:00.000Z')

  describe('getDeliveryDateLabel', () => {
    it('returns "Instant download" for eBooks per D6', () => {
      const book = { format: 'eBook' as const }
      expect(getDeliveryDateLabel(book, mockNow)).toBe('Instant download')
    })

    it('returns formatted delivery date for physical books', () => {
      const book = { format: 'Paperback' as const, deliveryDays: 3 }
      // 15 July + 3 days = 18 July (Thu)
      const label = getDeliveryDateLabel(book, mockNow)
      expect(label).toMatch(/^Delivery by /)
      expect(label).toContain('18')
      expect(label).toContain('Jul')
    })

    it('uses default 3 days if deliveryDays is not provided for physical book', () => {
      const book = { format: 'Hardcover' as const }
      const label = getDeliveryDateLabel(book, mockNow)
      expect(label).toMatch(/^Delivery by /)
      expect(label).toContain('18')
      expect(label).toContain('Jul')
    })
  })

  describe('formatDate', () => {
    it('formats ISO string correctly', () => {
      const formatted = formatDate('2024-07-21T10:00:00.000Z')
      expect(formatted).toContain('21')
      expect(formatted).toContain('Jul')
    })
  })

  describe('addDays and addHours', () => {
    it('adds days correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const nextDay = addDays(date, 5)
      expect(nextDay.getUTCDate()).toBe(6)
    })

    it('adds hours correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const nextTime = addHours(date, 48)
      expect(nextTime.getUTCDate()).toBe(3)
    })
  })
})
