import { useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { Button, DismissibleTag, TextInput } from '@carbon/react'
import { getCouponDiscount } from '../../utils/pricing'
import { formatMoney } from '../../utils/money'
import './CouponInput.scss'

export interface CouponInputProps {
  /** Currently applied (normalised, upper-case) coupon code, or `null`. */
  appliedCode: string | null
  onApply: (code: string) => void
  onRemove: () => void
}

export const CouponInput = ({ appliedCode, onApply, onRemove }: CouponInputProps): ReactElement => {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | undefined>()

  if (appliedCode) {
    return (
      <div className="coupon-input coupon-input--applied" data-testid="coupon-applied">
        <DismissibleTag
          type="green"
          size="md"
          text={`${appliedCode} applied (−${formatMoney(getCouponDiscount(appliedCode), false)})`}
          title="Remove coupon"
          dismissTooltipLabel="Remove coupon"
          onClose={() => {
            setCode('')
            setError(undefined)
            onRemove()
          }}
        />
      </div>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const normalised = code.trim().toUpperCase()
    if (!normalised) {
      setError('Enter a coupon code')
      return
    }
    if (getCouponDiscount(normalised) <= 0) {
      setError('This coupon code is not valid')
      return
    }
    setError(undefined)
    setCode('')
    onApply(normalised)
  }

  return (
    <form className="coupon-input" noValidate onSubmit={handleSubmit}>
      <TextInput
        id="coupon-code"
        className="coupon-input__field"
        labelText="Coupon code"
        hideLabel
        placeholder="Apply Coupon"
        autoComplete="off"
        value={code}
        invalid={Boolean(error)}
        invalidText={error}
        onChange={(e) => {
          setCode(e.target.value)
          if (error) setError(undefined)
        }}
      />
      <Button type="submit" size="md" className="coupon-input__apply">
        Apply
      </Button>
    </form>
  )
}

export default CouponInput
