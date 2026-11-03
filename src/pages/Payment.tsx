import { type ReactElement, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@carbon/react'
import { Purchase } from '@carbon/icons-react'

import type { PaymentMethod } from '../types'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { loadCheckoutDraft, clearCheckoutDraft } from '../utils/checkoutDraft'
import { formatMoney } from '../utils/money'
import { validateCard, validateUpi } from '../utils/validation'
import { processPayment } from '../api/payment'

import { PaymentMethodTabs } from '../components/PaymentMethodTabs/PaymentMethodTabs'
import { CardForm } from '../components/CardForm/CardForm'
import type { CardFormData } from '../components/CardForm/CardForm'
import { UpiForm } from '../components/UpiForm/UpiForm'
import type { UpiFormData } from '../components/UpiForm/UpiForm'
import { WalletForm } from '../components/WalletForm/WalletForm'
import type { WalletFormData } from '../components/WalletForm/WalletForm'
import { PaymentStatus } from '../components/PaymentStatus/PaymentStatus'
import type { PaymentState } from '../components/PaymentStatus/PaymentStatus'

import './Payment.scss'

/** Card number that triggers the simulated failure path. */
const FAILURE_CARD = '4000000000000002'

const EMPTY_CARD: CardFormData = { cardNumber: '', cardHolder: '', cvv: '', expiry: '' }
const EMPTY_UPI: UpiFormData = { upiId: '' }
const EMPTY_WALLET: WalletFormData = { walletName: '' }

export interface PaymentProps {
  paymentDelayMs?: number
}

export const Payment = ({ paymentDelayMs = 1500 }: PaymentProps): ReactElement => {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { addOrder } = useOrders()

  const draft = loadCheckoutDraft()

  // Redirect to /checkout if there is no valid draft
  useEffect(() => {
    if (!draft) {
      navigate('/checkout', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTab, setActiveTab] = useState<PaymentMethod>('credit-card')
  const [cardData, setCardData] = useState<CardFormData>(EMPTY_CARD)
  const [upiData, setUpiData] = useState<UpiFormData>(EMPTY_UPI)
  const [walletData, setWalletData] = useState<WalletFormData>(EMPTY_WALLET)

  const [cardErrors, setCardErrors] = useState<ReturnType<typeof validateCard>>({})
  const [upiError, setUpiError] = useState<string | undefined>()
  const [walletError, setWalletError] = useState<string | undefined>()

  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [failureMessage, setFailureMessage] = useState<string | undefined>()

  // Ref for focusing the first invalid field
  const formRef = useRef<HTMLDivElement>(null)

  if (!draft) {
    // Will redirect via useEffect; render nothing in the meantime
    return <div />
  }

  const total = draft.totals.total

  const focusFirstInvalid = (): void => {
    if (!formRef.current) return
    const firstInvalid = formRef.current.querySelector<HTMLElement>(
      '[aria-invalid="true"], [data-invalid="true"]',
    )
    firstInvalid?.focus()
  }

  const validate = (): boolean => {
    if (activeTab === 'credit-card' || activeTab === 'debit-card') {
      const raw = cardData.cardNumber.replace(/-/g, '')
      const errors = validateCard({ ...cardData, cardNumber: raw })
      setCardErrors(errors)
      if (Object.keys(errors).length > 0) {
        setTimeout(focusFirstInvalid, 0)
        return false
      }
      return true
    }

    if (activeTab === 'upi') {
      const err = validateUpi(upiData.upiId)
      setUpiError(err)
      if (err) {
        setTimeout(focusFirstInvalid, 0)
        return false
      }
      return true
    }

    // wallet
    if (!walletData.walletName) {
      setWalletError('Please select a wallet')
      return false
    }
    setWalletError(undefined)
    return true
  }

  const handlePay = async (): Promise<void> => {
    if (!validate()) return

    setPaymentState('processing')
    setFailureMessage(undefined)

    const cleanCardNumber = cardData.cardNumber.replace(/-/g, '')
    const simulateFailure = cleanCardNumber === FAILURE_CARD

    try {
      const response = await processPayment(
        {
          method: activeTab,
          amount: total,
          ...(activeTab === 'credit-card' || activeTab === 'debit-card'
            ? {
                cardDetails: {
                  // We pass only last 4 digits for the order record; never store full number
                  cardNumber: `****${cleanCardNumber.slice(-4)}`,
                  cardHolder: cardData.cardHolder,
                  expiry: cardData.expiry,
                  cvv: '',
                },
              }
            : {}),
          ...(activeTab === 'upi' ? { upiId: upiData.upiId } : {}),
          ...(activeTab === 'wallet' ? { walletName: walletData.walletName } : {}),
          simulateFailure,
        },
        paymentDelayMs,
      )

      if (!response.success) {
        setPaymentState('failure')
        setFailureMessage(response.message)
        return
      }

      // Success path — build the order, clear cart and draft, navigate
      const order = addOrder({
        userId: draft.userId,
        items: draft.lines,
        shippingAddress: draft.address,
        subtotal: draft.totals.subtotal,
        tax: draft.totals.tax,
        deliveryCharges: draft.totals.deliveryCharges,
        couponCode: draft.couponCode ?? undefined,
        couponDiscount: draft.totals.couponDiscount,
        giftPointsRedeemed: draft.giftPointsRedeemed,
        total: draft.totals.total,
        paymentMethod: activeTab,
        cardLast4:
          activeTab === 'credit-card' || activeTab === 'debit-card'
            ? cleanCardNumber.slice(-4)
            : undefined,
        status: 'confirmed',
        estimatedDelivery: undefined,
      })

      clearCart()
      clearCheckoutDraft()
      setPaymentState('success')
      navigate(`/confirmation/${order.id}`)
    } catch {
      setPaymentState('failure')
      setFailureMessage('An unexpected error occurred. Please try again.')
    }
  }

  const handleRetry = (): void => {
    setPaymentState('idle')
    setFailureMessage(undefined)
  }

  const isProcessing = paymentState === 'processing'

  return (
    <div className="payment-card" ref={formRef}>
      {/* Card header */}
      <div className="payment-card__header">
        <h1 className="payment-card__title">Complete Payment</h1>
        <span className="payment-card__amount">
          Payable Amount: {formatMoney(total)}
        </span>
      </div>

      {/* Card body: tabs + active form */}
      <div className="payment-card__body">
        <PaymentMethodTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="payment-card__form-panel">
          {(activeTab === 'credit-card' || activeTab === 'debit-card') && (
            <CardForm
              variant={activeTab}
              data={cardData}
              errors={cardErrors}
              onChange={setCardData}
            />
          )}

          {activeTab === 'upi' && (
            <UpiForm data={upiData} error={upiError} onChange={setUpiData} />
          )}

          {activeTab === 'wallet' && (
            <WalletForm data={walletData} error={walletError} onChange={setWalletData} />
          )}

          <PaymentStatus
            state={paymentState}
            errorMessage={failureMessage}
            onRetry={handleRetry}
          />

          <div className="payment-card__footer">
            <Button
              renderIcon={Purchase}
              onClick={() => void handlePay()}
              disabled={isProcessing}
              data-testid="pay-now-btn"
            >
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
