import type { ReactElement } from 'react'
import { BookFormat } from '../../types'
import { getDeliveryDateLabel } from '../../utils/dates'
import './DeliveryDate.scss'

export interface DeliveryDateProps {
  book: { format: BookFormat; deliveryDays?: number }
  className?: string
  now?: Date
}

export const DeliveryDate = ({
  book,
  className = '',
  now,
}: DeliveryDateProps): ReactElement => {
  const label = getDeliveryDateLabel(book, now)

  return (
    <span className={`delivery-date ${className}`.trim()}>
      {label}
    </span>
  )
}

export default DeliveryDate
