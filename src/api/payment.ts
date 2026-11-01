import { PaymentMethod } from '../types'

export interface ProcessPaymentInput {
  method: PaymentMethod
  amount: number
  cardDetails?: {
    cardNumber: string
    cardHolder: string
    expiry: string
    cvv: string
  }
  upiId?: string
  walletName?: string
  simulateFailure?: boolean
}

export interface PaymentResponse {
  success: boolean
  transactionId: string
  method: PaymentMethod
  amount: number
  message?: string
}

/**
 * Process a mock payment transaction.
 */
export async function processPayment(
  input: ProcessPaymentInput,
  delayMs = 400
): Promise<PaymentResponse> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  if (input.simulateFailure) {
    return {
      success: false,
      transactionId: `tx-failed-${Date.now()}`,
      method: input.method,
      amount: input.amount,
      message: 'Payment was declined by issuing bank or gateway. Please retry or choose another payment method.',
    }
  }

  return {
    success: true,
    transactionId: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    method: input.method,
    amount: input.amount,
    message: 'Payment received successfully',
  }
}
