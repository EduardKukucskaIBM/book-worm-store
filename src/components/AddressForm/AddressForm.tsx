import { useState } from 'react'
import type { ReactElement } from 'react'
import { Checkbox, Select, SelectItem, TextInput } from '@carbon/react'
import type { Address } from '../../types'
import { addressFieldId } from '../../utils/address'
import { validateAddress } from '../../utils/validation'
import type { AddressValidationErrors } from '../../utils/validation'
import './AddressForm.scss'

const COUNTRY_CODES = ['+91', '+1', '+44', '+65', '+971'] as const
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Singapore', 'United Arab Emirates'] as const

type Field = keyof AddressValidationErrors

export interface AddressFormProps {
  value: Address
  onChange: (next: Address) => void
  /** Show every error regardless of blur (set after "Pay Now" was pressed). */
  showAllErrors?: boolean
  /** Provided only for a logged-in user with a saved address; enables the checkbox. */
  savedAddress?: Address
  useSaved?: boolean
  onUseSavedChange?: (checked: boolean) => void
}

export const AddressForm = ({
  value,
  onChange,
  showAllErrors = false,
  savedAddress,
  useSaved = false,
  onUseSavedChange,
}: AddressFormProps): ReactElement => {
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const locked = useSaved && Boolean(savedAddress)
  const errors = locked ? {} : validateAddress(value)

  const errorFor = (field: Field): string | undefined =>
    touched[field] || showAllErrors ? errors[field] : undefined

  const update = (field: keyof Address, next: string): void => onChange({ ...value, [field]: next })
  const markTouched = (field: Field): void => setTouched((prev) => ({ ...prev, [field]: true }))

  // Plain render helper (not a component) so inputs keep focus between renders.
  const text = (
    field: Exclude<Field, 'phoneCountryCode' | 'country'>,
    label: string,
    options: { placeholder?: string; autoComplete?: string; inputMode?: 'numeric' | 'email'; maxLength?: number; hideLabel?: boolean } = {},
  ): ReactElement => {
    const error = errorFor(field)
    return (
      <TextInput
        id={addressFieldId(field)}
        labelText={label}
        hideLabel={options.hideLabel}
        placeholder={options.placeholder ?? label}
        autoComplete={options.autoComplete}
        inputMode={options.inputMode}
        maxLength={options.maxLength}
        value={value[field] ?? ''}
        readOnly={locked}
        invalid={Boolean(error)}
        invalidText={error}
        onChange={(e) => update(field, e.target.value)}
        onBlur={() => markTouched(field)}
      />
    )
  }

  const select = (
    field: 'phoneCountryCode' | 'country',
    label: string,
    options: readonly string[],
    hideLabel = false,
  ): ReactElement => {
    const error = errorFor(field)
    return (
      <Select
        id={addressFieldId(field)}
        labelText={label}
        hideLabel={hideLabel}
        value={value[field]}
        disabled={locked}
        invalid={Boolean(error)}
        invalidText={error}
        onChange={(e) => update(field, e.target.value)}
        onBlur={() => markTouched(field)}
      >
        {options.map((option) => (
          <SelectItem key={option} value={option} text={option} />
        ))}
      </Select>
    )
  }

  return (
    <form className="address-form" noValidate aria-label="Delivery address" onSubmit={(e) => e.preventDefault()}>
      {savedAddress && (
        <Checkbox
          id="use-saved-address"
          className="address-form__saved"
          labelText="Use Saved Address"
          checked={useSaved}
          onChange={(_event, { checked }) => onUseSavedChange?.(checked)}
        />
      )}

      <div className="address-form__grid">
        <div className="address-form__first">{text('firstName', 'First Name', { autoComplete: 'given-name' })}</div>
        <div className="address-form__last">{text('lastName', 'Last Name', { autoComplete: 'family-name' })}</div>
        <div className="address-form__address">
          {text('line1', 'Address line 1', { placeholder: 'Address Line 1', autoComplete: 'address-line1' })}
          {text('line2', 'Address line 2 (optional)', { placeholder: 'Address Line 2', autoComplete: 'address-line2' })}
        </div>

        <div className="address-form__email">
          {text('email', 'E-mail', { placeholder: 'e-mail', autoComplete: 'email', inputMode: 'email' })}
        </div>
        <div className="address-form__city">{text('city', 'City', { autoComplete: 'address-level2' })}</div>
        <div className="address-form__pin">
          {text('pin', 'PIN', { placeholder: '000000', autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 })}
        </div>

        <div className="address-form__phone" role="group" aria-labelledby="address-phone-label">
          <span className="address-form__group-label" id="address-phone-label">
            Phone Number
          </span>
          <div className="address-form__phone-row">
            <div className="address-form__phone-code">{select('phoneCountryCode', 'Country code', COUNTRY_CODES, true)}</div>
            <div className="address-form__phone-number">
              {text('phone', 'Mobile number', {
                placeholder: '1234567890',
                autoComplete: 'tel-national',
                inputMode: 'numeric',
                maxLength: 15,
                hideLabel: true,
              })}
            </div>
          </div>
        </div>
        <div className="address-form__state">{text('state', 'State', { autoComplete: 'address-level1' })}</div>
        <div className="address-form__country">{select('country', 'Country', COUNTRIES)}</div>
      </div>
    </form>
  )
}

export default AddressForm
