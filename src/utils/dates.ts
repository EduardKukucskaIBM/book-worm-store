import { BookFormat } from '../types'

/**
 * Add days to a date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add hours to a date.
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setTime(result.getTime() + hours * 60 * 60 * 1000)
  return result
}

/**
 * Format a date for display (e.g. "Mon, 21 Jul" or "21 Jul 2024").
 */
export function formatDate(
  dateInput: string | Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('en-IN', options).format(date)
}

/**
 * Format a date and time for display (e.g. "23 Jul 2024, 04:30 PM").
 */
export function formatDateTime(
  dateInput: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('en-IN', options).format(date)
}

/**
 * Get delivery date label for a book.
 * eBooks return "Instant download" per D6.
 * Physical books return formatted date e.g. "Mon, 21 Jul".
 */
export function getDeliveryDateLabel(
  book: { format: BookFormat; deliveryDays?: number },
  now: Date = new Date()
): string {
  if (book.format === 'eBook') {
    return 'Instant download'
  }
  const days = book.deliveryDays ?? 3
  const targetDate = addDays(now, days)
  return `Delivery by ${formatDate(targetDate)}`
}
