import { useState } from 'react'
import type { ReactElement } from 'react'
import { Button, Modal, InlineNotification } from '@carbon/react'
import { useOrders } from '../../context/OrdersContext'
import type { Order } from '../../types'
import { canCancel } from '../../utils/cancellation'
import { formatDateTime } from '../../utils/dates'
import './CancelOrderControl.scss'

export interface CancelOrderControlProps {
  order: Order
  now?: Date
  onCancelled?: (updatedOrder: Order) => void
  className?: string
}

export const CancelOrderControl = ({
  order,
  now = new Date(),
  onCancelled,
  className = '',
}: CancelOrderControlProps): ReactElement | null => {
  const { cancelOrder } = useOrders()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (order.status === 'cancelled') {
    return null
  }

  const isEligible = canCancel(order, now)
  const formattedDeadline = formatDateTime(order.cancellableUntil)

  const handleConfirmCancel = (): void => {
    try {
      const updatedOrder = cancelOrder(order.id, now)
      setIsModalOpen(false)
      setError(null)
      onCancelled?.(updatedOrder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order')
    }
  }

  return (
    <div
      className={`cancel-order-control ${className}`.trim()}
      data-testid="cancel-order-control"
    >
      <p
        className={`cancel-order-control__info ${
          !isEligible ? 'cancel-order-control__info--expired' : ''
        }`.trim()}
      >
        {isEligible
          ? `You can cancel until ${formattedDeadline}`
          : 'The 48-hour cancellation window has closed'}
      </p>

      <Button
        kind="danger--ghost"
        size="md"
        disabled={!isEligible}
        onClick={() => setIsModalOpen(true)}
        data-testid="cancel-order-btn"
      >
        Cancel order
      </Button>

      {isModalOpen && (
        <Modal
          open
          modalHeading="Cancel order"
          primaryButtonText="Cancel order"
          secondaryButtonText="Keep order"
          danger
          onRequestClose={() => {
            setIsModalOpen(false)
            setError(null)
          }}
          onRequestSubmit={handleConfirmCancel}
          data-testid="cancel-order-modal"
        >
          <p>
            Are you sure you want to cancel this order? This action cannot be undone.
            {order.giftPointsRedeemed > 0 && (
              <span>
                {' '}
                Your {order.giftPointsRedeemed} redeemed gift point
                {order.giftPointsRedeemed > 1 ? 's' : ''} will be refunded to your account.
              </span>
            )}
          </p>
          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              lowContrast
              hideCloseButton
              className="cancel-order-control__error"
            />
          )}
        </Modal>
      )}
    </div>
  )
}

export default CancelOrderControl
