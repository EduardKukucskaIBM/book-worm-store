import { type ReactElement, useId } from 'react'
import { TextInput, PasswordInput } from '@carbon/react'
import type { CardValidationErrors } from '../../utils/validation'
import './CardForm.scss'

export interface CardFormData {
  cardNumber: string
  cardHolder: string
  cvv: string
  expiry: string
}

export interface CardFormProps {
  data: CardFormData
  errors: CardValidationErrors
  onChange: (data: CardFormData) => void
  variant: 'credit-card' | 'debit-card'
}

/** Format raw digits as XXXX-XXXX-XXXX-XXXX */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1-')
}

/** Format raw digits as MM/YYYY */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export const CardForm = ({ data, errors, onChange, variant }: CardFormProps): ReactElement => {
  const uid = useId()
  const panelId = `payment-panel-${variant}`

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={`payment-tab-${variant}`}
      className="card-form"
    >
      <div className="card-form__row">
        <div className="card-form__field">
          <TextInput
            id={`${uid}-cardNumber`}
            labelText="Card Number"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            value={data.cardNumber}
            invalid={!!errors.cardNumber}
            invalidText={errors.cardNumber}
            maxLength={19}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value)
              onChange({ ...data, cardNumber: formatted })
            }}
          />
        </div>
        <div className="card-form__field">
          <TextInput
            id={`${uid}-cardHolder`}
            labelText="Name on Card"
            placeholder="Name"
            value={data.cardHolder}
            invalid={!!errors.cardHolder}
            invalidText={errors.cardHolder}
            onChange={(e) => onChange({ ...data, cardHolder: e.target.value })}
          />
        </div>
      </div>
      <div className="card-form__row">
        <div className="card-form__field">
          <PasswordInput
            id={`${uid}-cvv`}
            labelText="CVV"
            placeholder="XXX"
            value={data.cvv}
            invalid={!!errors.cvv}
            invalidText={errors.cvv}
            maxLength={4}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
              onChange({ ...data, cvv: digits })
            }}
          />
        </div>
        <div className="card-form__field">
          <TextInput
            id={`${uid}-expiry`}
            labelText="Date of Expiry"
            placeholder="MM/YYYY"
            value={data.expiry}
            invalid={!!errors.expiry}
            invalidText={errors.expiry}
            maxLength={7}
            onChange={(e) => {
              const formatted = formatExpiry(e.target.value)
              onChange({ ...data, expiry: formatted })
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default CardForm
