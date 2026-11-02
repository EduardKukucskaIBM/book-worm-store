import { type ReactElement, useId } from 'react'
import { TextInput } from '@carbon/react'
import './UpiForm.scss'

export interface UpiFormData {
  upiId: string
}

export interface UpiFormProps {
  data: UpiFormData
  error?: string
  onChange: (data: UpiFormData) => void
}

export const UpiForm = ({ data, error, onChange }: UpiFormProps): ReactElement => {
  const uid = useId()

  return (
    <div
      id="payment-panel-upi"
      role="tabpanel"
      aria-labelledby="payment-tab-upi"
      className="upi-form"
    >
      <div className="upi-form__field">
        <TextInput
          id={`${uid}-upiId`}
          labelText="UPI ID"
          placeholder="name@bank"
          value={data.upiId}
          invalid={!!error}
          invalidText={error}
          onChange={(e) => onChange({ upiId: e.target.value })}
        />
      </div>
    </div>
  )
}

export default UpiForm
