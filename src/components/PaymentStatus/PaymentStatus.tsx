import type { ReactElement } from 'react'
import { InlineLoading, InlineNotification, Button } from '@carbon/react'
import './PaymentStatus.scss'

export type PaymentState = 'idle' | 'processing' | 'success' | 'failure'

export interface PaymentStatusProps {
  state: PaymentState
  errorMessage?: string
  onRetry?: () => void
}

export const PaymentStatus = ({
  state,
  errorMessage,
  onRetry,
}: PaymentStatusProps): ReactElement | null => {
  if (state === 'idle') return null

  if (state === 'processing') {
    return (
      <div className="payment-status payment-status--processing">
        <InlineLoading description="Processing payment…" status="active" />
      </div>
    )
  }

  if (state === 'failure') {
    return (
      <div className="payment-status payment-status--failure">
        <InlineNotification
          kind="error"
          title="Payment failed"
          subtitle={errorMessage ?? 'Your payment could not be processed. Please try again.'}
          lowContrast={false}
          hideCloseButton
        />
        {onRetry && (
          <Button kind="ghost" size="sm" onClick={onRetry} className="payment-status__retry">
            Try again
          </Button>
        )}
      </div>
    )
  }

  // 'success' — handled by redirect in parent; render nothing here
  return null
}

export default PaymentStatus
