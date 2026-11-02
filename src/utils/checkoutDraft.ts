import { STORAGE_KEYS } from '../config'
import type { CheckoutDraft } from '../types'
import { loadJSON, removeItem, saveJSON } from './storage'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isCheckoutDraft(value: unknown): value is CheckoutDraft {
  if (!isObject(value)) return false
  const totals = value.totals
  return (
    Array.isArray(value.lines) &&
    value.lines.length > 0 &&
    isObject(value.address) &&
    isObject(totals) &&
    typeof totals.total === 'number' &&
    typeof value.giftPointsRedeemed === 'number'
  )
}

function isDraftOrNull(value: unknown): value is CheckoutDraft | null {
  return value === null || isCheckoutDraft(value)
}

/** Persist the checkout draft that the Payment page (ST8) reads. */
export function saveCheckoutDraft(draft: CheckoutDraft): void {
  saveJSON(STORAGE_KEYS.checkoutDraft, draft)
}

/** Returns the saved draft, or `null` when none exists or the stored data is invalid. */
export function loadCheckoutDraft(): CheckoutDraft | null {
  return loadJSON<CheckoutDraft | null>(STORAGE_KEYS.checkoutDraft, null, isDraftOrNull)
}

export function clearCheckoutDraft(): void {
  removeItem(STORAGE_KEYS.checkoutDraft)
}
