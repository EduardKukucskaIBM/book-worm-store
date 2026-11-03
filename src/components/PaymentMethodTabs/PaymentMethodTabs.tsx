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

  // Select the tab and move keyboard focus with it (WAI-ARIA tabs pattern)
  const selectTab = (index: number): void => {
    const tab = PAYMENT_TABS[index]
    onTabChange(tab.id)
    document.getElementById(`payment-tab-${tab.id}`)?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      selectTab((activeIndex + 1) % PAYMENT_TABS.length)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      selectTab((activeIndex - 1 + PAYMENT_TABS.length) % PAYMENT_TABS.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      selectTab(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      selectTab(PAYMENT_TABS.length - 1)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Payment method"
      aria-orientation="vertical"
      className="payment-method-tabs"
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
            onKeyDown={handleKeyDown}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default PaymentMethodTabs
