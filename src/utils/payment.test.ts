import { describe, expect, it } from 'vitest'
import { formatPaymentMethod } from './payment'

describe('formatPaymentMethod', () => {
  it('formats credit card with last 4 digits', () => {
    expect(formatPaymentMethod('credit-card', '1111')).toBe('Credit card ending 1111')
  })

  it('formats credit card without last 4 digits', () => {
    expect(formatPaymentMethod('credit-card')).toBe('Credit card')
  })

  it('formats debit card with last 4 digits', () => {
    expect(formatPaymentMethod('debit-card', '4321')).toBe('Debit card ending 4321')
  })

  it('formats debit card without last 4 digits', () => {
    expect(formatPaymentMethod('debit-card')).toBe('Debit card')
  })

  it('formats upi', () => {
    expect(formatPaymentMethod('upi')).toBe('UPI')
  })

  it('formats wallet', () => {
    expect(formatPaymentMethod('wallet')).toBe('Wallet')
  })
})
