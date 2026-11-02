import type { PaymentMethod } from '../../types'

export interface PaymentTab {
  id: PaymentMethod
  label: string
}

export const PAYMENT_TABS: PaymentTab[] = [
  { id: 'credit-card', label: 'Credit Card' },
  { id: 'debit-card', label: 'Debit card' },
  { id: 'upi', label: 'UPI' },
  { id: 'wallet', label: 'Wallet' },
]
