import type { ReactElement } from 'react'
import { NumberInput } from '@carbon/react'
import './QuantityStepper.scss'

export interface QuantityStepperProps {
  id: string
  /** Book title; used in the accessible names of the input and the - / + buttons. */
  title: string
  value: number
  onChange: (quantity: number) => void
  min?: number
}

export const QuantityStepper = ({
  id,
  title,
  value,
  onChange,
  min = 1,
}: QuantityStepperProps): ReactElement => (
  <NumberInput
    id={id}
    className="quantity-stepper"
    label={`Quantity of ${title}`}
    hideLabel
    min={min}
    step={1}
    value={value}
    translateWithId={(messageId) =>
      messageId === 'increment.number'
        ? `Increase quantity of ${title}`
        : `Decrease quantity of ${title}`
    }
    onChange={(_event, state) => {
      const next = Math.floor(Number(state.value))
      if (Number.isFinite(next) && next >= min) onChange(next)
    }}
  />
)

export default QuantityStepper
