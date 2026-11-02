import type { ReactElement } from 'react'
import { Button } from '@carbon/react'
import { Purchase } from '@carbon/icons-react'
import type { PriceBreakdown } from '../../types'
import { formatMoney } from '../../utils/money'
import CouponInput from '../CouponInput/CouponInput'
import GiftPointsRedeem from '../GiftPointsRedeem/GiftPointsRedeem'
import './PriceSummary.scss'

export interface PriceSummaryGiftPoints {
  balance: number
  max: number
  onChange: (points: number) => void
}

export interface PriceSummaryProps {
  /** Output of `calculatePricing` — the single source of truth for every figure shown. */
  pricing: PriceBreakdown
  appliedCoupon: string | null
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  /** Only passed for a logged-in user; guests never see the control. */
  giftPoints?: PriceSummaryGiftPoints
  onPay: () => void
}

const Row = ({ label, value, testId }: { label: string; value: string; testId?: string }): ReactElement => (
  <div className="price-summary__row">
    <dt>{label}</dt>
    <dd data-testid={testId}>{value}</dd>
  </div>
)

export const PriceSummary = ({
  pricing,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  giftPoints,
  onPay,
}: PriceSummaryProps): ReactElement => (
  <section className="price-summary" aria-labelledby="price-summary-title">
    {/* Decorative, CSS-generated (D7); hidden below 672px */}
    <div className="price-summary__illustration" aria-hidden="true" data-testid="price-summary-illustration">
      <span className="price-summary__book price-summary__book--one" />
      <span className="price-summary__book price-summary__book--two" />
      <span className="price-summary__book price-summary__book--three" />
      <span className="price-summary__dot price-summary__dot--one" />
      <span className="price-summary__dot price-summary__dot--two" />
      <span className="price-summary__dot price-summary__dot--three" />
    </div>

    <div className="price-summary__body">
      <h2 id="price-summary-title" className="price-summary__title">
        Grand Total
      </h2>

      <dl className="price-summary__rows">
        <Row
          label={`Price (${pricing.itemCount} ${pricing.itemCount === 1 ? 'item' : 'items'})`}
          value={formatMoney(pricing.subtotal)}
          testId="summary-price"
        />
        <Row label="Tax (12%)" value={formatMoney(pricing.tax)} testId="summary-tax" />
        <Row
          label="Delivery Charges"
          value={pricing.deliveryCharges === 0 ? 'Free' : formatMoney(pricing.deliveryCharges)}
          testId="summary-delivery"
        />
      </dl>

      <hr className="price-summary__divider" />

      <CouponInput appliedCode={appliedCoupon} onApply={onApplyCoupon} onRemove={onRemoveCoupon} />

      <dl className="price-summary__rows">
        <Row label="Discount" value={formatMoney(pricing.couponDiscount)} testId="summary-discount" />
        {pricing.giftPointsRedeemed > 0 && (
          <Row
            label={`Gift points (${pricing.giftPointsRedeemed})`}
            value={formatMoney(pricing.giftPointsDiscount)}
            testId="summary-points"
          />
        )}
      </dl>

      {giftPoints && (
        <GiftPointsRedeem
          balance={giftPoints.balance}
          max={giftPoints.max}
          value={pricing.giftPointsRedeemed}
          onChange={giftPoints.onChange}
        />
      )}

      <hr className="price-summary__divider" />

      <dl className="price-summary__rows">
        <div className="price-summary__row price-summary__row--total">
          <dt>Total Amount</dt>
          <dd data-testid="summary-total">{formatMoney(pricing.total)}</dd>
        </div>
      </dl>

      <div className="price-summary__pay">
        <Button kind="primary" size="lg" renderIcon={Purchase} onClick={onPay}>
          Pay Now
        </Button>
      </div>
    </div>
  </section>
)

export default PriceSummary
