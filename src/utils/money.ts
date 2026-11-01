/**
 * Round a number to 2 decimal places using standard rounding.
 */
export function round2(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

/**
 * Format a number as Indian Rupee (INR).
 * Example: 299 -> "₹299.00" or "₹299" based on options
 */
export function formatMoney(amount: number, includeDecimals = true): string {
  const rounded = round2(amount)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return formatter.format(rounded)
}
