import { type ReactElement, useId } from 'react'
import { RadioButtonGroup, RadioButton } from '@carbon/react'
import { WALLET_OPTIONS } from './walletOptions'
import type { WalletName } from './walletOptions'
import './WalletForm.scss'

export interface WalletFormData {
  walletName: WalletName | ''
}

export interface WalletFormProps {
  data: WalletFormData
  error?: string
  onChange: (data: WalletFormData) => void
}

export const WalletForm = ({ data, error, onChange }: WalletFormProps): ReactElement => {
  const uid = useId()

  return (
    <div
      id="payment-panel-wallet"
      role="tabpanel"
      aria-labelledby="payment-tab-wallet"
      className="wallet-form"
    >
      <RadioButtonGroup
        legendText="Choose a wallet"
        name={`${uid}-wallet`}
        valueSelected={data.walletName || undefined}
        onChange={(value) => onChange({ walletName: value as WalletName })}
        orientation="vertical"
      >
        {WALLET_OPTIONS.map((wallet) => (
          <RadioButton key={wallet} labelText={wallet} value={wallet} id={`${uid}-wallet-${wallet}`} />
        ))}
      </RadioButtonGroup>
      {error && (
        <p className="wallet-form__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default WalletForm
