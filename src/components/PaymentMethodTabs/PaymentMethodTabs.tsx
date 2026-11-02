import type { ReactElement, KeyboardEvent } from 'react'
import type { PaymentMethod } from '../../types'
import { PAYMENT_TABS } from './paymentTabs'
import './PaymentMethodTabs.scss'

export interface PaymentMethodTabsProps {
  activeTab: PaymentMethod
  onTabChange: (tab: PaymentMethod) => void
}

export const PaymentMethodTabs = ({
  activeTab,
  onTabChange,
}: PaymentMethodTabsProps): ReactElement => {
  const tabIds = PAYMENT_TABS.map((t) => t.id)
  const activeIndex = tabIds.indexOf(activeTab)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (activeIndex + 1) % PAYMENT_TABS.length
      onTabChange(PAYMENT_TABS[next].id)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (activeIndex - 1 + PAYMENT_TABS.length) % PAYMENT_TABS.length
      onTabChange(PAYMENT_TABS[prev].id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onTabChange(PAYMENT_TABS[0].id)
    } else if (e.key === 'End') {
      e.preventDefault()
      onTabChange(PAYMENT_TABS[PAYMENT_TABS.length - 1].id)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Payment method"
      aria-orientation="vertical"
      className="payment-method-tabs"
      onKeyDown={handleKeyDown}
    >
      {PAYMENT_TABS.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            id={`payment-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`payment-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`payment-method-tabs__tab${isActive ? ' payment-method-tabs__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default PaymentMethodTabs
