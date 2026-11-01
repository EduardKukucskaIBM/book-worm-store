import type { ReactElement } from 'react'
import { formatMoney } from '../../utils/money'
import './PriceTag.scss'

export interface PriceTagProps {
  price: number
  includeDecimals?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const PriceTag = ({
  price,
  includeDecimals = false,
  className = '',
  size = 'md',
}: PriceTagProps): ReactElement => {
  return (
    <span className={`price-tag price-tag--${size} ${className}`.trim()}>
      {formatMoney(price, includeDecimals)}
    </span>
  )
}

export default PriceTag
