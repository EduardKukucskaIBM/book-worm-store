import { PaymentMethod } from '../types'

/**
 * Format payment method for display.
 * E.g. "Credit card ending 1111", "Debit card ending 4321", "UPI", "Wallet"
 */
export function formatPaymentMethod(method: PaymentMethod, cardLast4?: string): string {
  switch (method) {
    case 'credit-card':
      return cardLast4 ? `Credit card ending ${cardLast4}` : 'Credit card'
    case 'debit-card':
      return cardLast4 ? `Debit card ending ${cardLast4}` : 'Debit card'
    case 'upi':
      return 'UPI'
    case 'wallet':
      return 'Wallet'
    default:
      return method
  }
}
