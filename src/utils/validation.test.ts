import { describe, expect, it } from 'vitest'
import {
  isAddressValid,
  validateAddress,
  validateCard,
  validateReview,
  validateUpi,
} from './validation'

describe('validation utilities', () => {
  describe('validateAddress', () => {
    it('passes for a valid complete address', () => {
      const address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneCountryCode: '+91',
        phone: '9876543210',
        line1: '123 MG Road',
        city: 'Bengaluru',
        pin: '560001',
        state: 'Karnataka',
        country: 'India',
      }
      expect(isAddressValid(address)).toBe(true)
      expect(validateAddress(address)).toEqual({})
    })

    it('returns errors for missing required fields and invalid PIN/email', () => {
      const errors = validateAddress({
        firstName: '',
        email: 'invalid-email',
        pin: '123',
        phone: '123',
      })
      expect(errors.firstName).toBeDefined()
      expect(errors.lastName).toBeDefined()
      expect(errors.email).toBeDefined()
      expect(errors.pin).toBeDefined()
      expect(errors.phone).toBeDefined()
      expect(errors.line1).toBeDefined()
      expect(errors.city).toBeDefined()
    })
  })

  describe('validateCard', () => {
    const fixedNow = new Date('2024-06-01')

    it('passes for valid 16-digit card and future expiry in MM/YYYY format', () => {
      // 4532015112830366 is a known Luhn-valid Visa test card
      const card = {
        cardNumber: '4532015112830366',
        cardHolder: 'John Doe',
        expiry: '12/2026',
        cvv: '123',
      }
      const errors = validateCard(card, fixedNow)
      expect(Object.keys(errors).length).toBe(0)
    })

    it('accepts card number with dashes (XXXX-XXXX-XXXX-XXXX)', () => {
      const card = {
        cardNumber: '4532-0151-1283-0366',
        cardHolder: 'John Doe',
        expiry: '12/2026',
        cvv: '123',
      }
      const errors = validateCard(card, fixedNow)
      expect(errors.cardNumber).toBeUndefined()
    })

    it('rejects cards that fail the Luhn check', () => {
      const card = {
        cardNumber: '4532015112830367', // last digit changed
        cardHolder: 'John Doe',
        expiry: '12/2026',
        cvv: '123',
      }
      const errors = validateCard(card, fixedNow)
      expect(errors.cardNumber).toBe('Card number is invalid')
    })

    it('detects expired cards (MM/YYYY) and invalid CVVs', () => {
      const card = {
        cardNumber: '123',
        cardHolder: '',
        expiry: '05/2024', // Expired relative to 2024-06
        cvv: '1',
      }
      const errors = validateCard(card, fixedNow)
      expect(errors.cardNumber).toBeDefined()
      expect(errors.cardHolder).toBeDefined()
      expect(errors.expiry).toBeDefined()
      expect(errors.cvv).toBeDefined()
    })

    it('rejects old MM/YY format', () => {
      const card = {
        cardNumber: '4532015112830366',
        cardHolder: 'John Doe',
        expiry: '12/26',
        cvv: '123',
      }
      const errors = validateCard(card, fixedNow)
      expect(errors.expiry).toBe('Expiry must be in MM/YYYY format')
    })
  })

  describe('validateUpi', () => {
    it('accepts valid UPI IDs', () => {
      expect(validateUpi('user@okhdfcbank')).toBeUndefined()
      expect(validateUpi('john.doe@upi')).toBeUndefined()
    })

    it('rejects invalid UPI IDs', () => {
      expect(validateUpi('')).toBeDefined()
      expect(validateUpi('invalidupi')).toBeDefined()
    })
  })

  describe('validateReview', () => {
    it('passes for valid review text <= 100 characters and 1-5 rating', () => {
      const errors = validateReview('A fantastic and insightful read!', 5)
      expect(Object.keys(errors).length).toBe(0)
    })

    it('rejects reviews longer than 100 characters', () => {
      const longText = 'A'.repeat(101)
      const errors = validateReview(longText, 4)
      expect(errors.text).toBeDefined()
    })

    it('rejects empty reviews and out of range ratings', () => {
      const errors = validateReview('', 0)
      expect(errors.text).toBeDefined()
      expect(errors.rating).toBeDefined()
    })
  })
})
