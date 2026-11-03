import type { ReactElement } from 'react'
import { Button, NumberInput } from '@carbon/react'
import { formatMoney } from '../../utils/money'
import { POINT_VALUE_INR } from '../../config'
import './GiftPointsRedeem.scss'

export interface GiftPointsRedeemProps {
  /** The user's available gift points. */
  balance: number
  /** Most points that can be redeemed on this order (from `maxRedeemablePoints`). */
  max: number
  /** Points currently redeemed. */
  value: number
  onChange: (points: number) => void
}

export const GiftPointsRedeem = ({ balance, max, value, onChange }: GiftPointsRedeemProps): ReactElement => (
  <section className="gift-points" aria-label="Gift points" data-testid="gift-points">
    <p className="gift-points__balance">
      Gift points available: <strong data-testid="gift-points-balance">{balance}</strong>
      <span className="gift-points__rate"> (1 point = {formatMoney(POINT_VALUE_INR, false)})</span>
    </p>
    <div className="gift-points__controls">
      <NumberInput
        id="gift-points-input"
        className="gift-points__input"
        label="Points to redeem"
        helperText={`Up to ${max} points on this order`}
        min={0}
        max={max}
        step={1}
        size="md"
        value={value}
        disabled={max === 0}
        onChange={(_event, state) => {
          const next = Math.floor(Number(state.value))
          if (Number.isFinite(next)) onChange(Math.min(Math.max(next, 0), max))
        }}
      />
      <Button
        kind="tertiary"
        size="md"
        className="gift-points__max"
        disabled={max === 0}
        onClick={() => onChange(value === max ? 0 : max)}
      >
        {value === max && max > 0 ? 'Clear' : 'Redeem max'}
      </Button>
    </div>
  </section>
)

export default GiftPointsRedeem
