import { Address } from '../types'

export interface AddressValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phoneCountryCode?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  pin?: string
  state?: string
  country?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PIN_REGEX = /^\d{6}$/
const PHONE_DIGITS_REGEX = /^\d{10}$/
const CARD_NUMBER_REGEX = /^\d{16}$/
const CVV_REGEX = /^\d{3,4}$/
const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/(\d{4})$/
const UPI_REGEX = /^[\w.-]+@[\w.-]+$/

/**
 * Validate shipping address form inputs.
 */
export function validateAddress(address: Partial<Address>): AddressValidationErrors {
  const errors: AddressValidationErrors = {}

  if (!address.firstName?.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!address.lastName?.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!address.email?.trim()) {
    errors.email = 'Email address is required'
  } else if (!EMAIL_REGEX.test(address.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (!address.phoneCountryCode?.trim()) {
    errors.phoneCountryCode = 'Country code is required'
  }

  const cleanPhone = (address.phone ?? '').replace(/\D/g, '')
  if (!cleanPhone) {
    errors.phone = 'Phone number is required'
  } else if (!PHONE_DIGITS_REGEX.test(cleanPhone)) {
    errors.phone = 'Please enter a 10-digit mobile number'
  }

  if (!address.line1?.trim()) {
    errors.line1 = 'Address line 1 is required'
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required'
  }

  const cleanPin = (address.pin ?? '').trim()
  if (!cleanPin) {
    errors.pin = 'PIN code is required'
  } else if (!PIN_REGEX.test(cleanPin)) {
    errors.pin = 'PIN code must be exactly 6 digits'
  }

  if (!address.state?.trim()) {
    errors.state = 'State is required'
  }

  if (!address.country?.trim()) {
    errors.country = 'Country is required'
  }

  return errors
}

export function isAddressValid(address: Partial<Address>): boolean {
  const errors = validateAddress(address)
  return Object.keys(errors).length === 0
}

export interface CardValidationInput {
  cardNumber: string
  cardHolder: string
  expiry: string
  cvv: string
}

export interface CardValidationErrors {
  cardNumber?: string
  cardHolder?: string
  expiry?: string
  cvv?: string
}

/**
 * Validate credit/debit card form.
 */
/** Luhn algorithm check for credit/debit card numbers. */
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13) return false
  let sum = 0
  let isOdd = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)
    if (isOdd) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isOdd = !isOdd
  }
  return sum % 10 === 0
}

export function validateCard(card: Partial<CardValidationInput>, now: Date = new Date()): CardValidationErrors {
  const errors: CardValidationErrors = {}
  const cleanNumber = (card.cardNumber ?? '').replace(/[-\s]/g, '')

  if (!cleanNumber) {
    errors.cardNumber = 'Card number is required'
  } else if (!CARD_NUMBER_REGEX.test(cleanNumber)) {
    errors.cardNumber = 'Card number must be 16 digits'
  } else if (!luhnCheck(cleanNumber)) {
    errors.cardNumber = 'Card number is invalid'
  }

  if (!card.cardHolder?.trim()) {
    errors.cardHolder = 'Cardholder name is required'
  }

  const expiry = (card.expiry ?? '').trim()
  if (!expiry) {
    errors.expiry = 'Expiry date is required'
  } else {
    const match = expiry.match(CARD_EXPIRY_REGEX)
    if (!match) {
      errors.expiry = 'Expiry must be in MM/YYYY format'
    } else {
      const month = parseInt(match[1], 10)
      const year = parseInt(match[2], 10)
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card is expired'
      }
    }
  }

  const cleanCvv = (card.cvv ?? '').trim()
  if (!cleanCvv) {
    errors.cvv = 'CVV is required'
  } else if (!CVV_REGEX.test(cleanCvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits'
  }

  return errors
}

/**
 * Validate UPI ID format.
 */
export function validateUpi(upiId: string): string | undefined {
  const trimmed = upiId.trim()
  if (!trimmed) {
    return 'UPI ID is required'
  }
  if (!UPI_REGEX.test(trimmed)) {
    return 'Please enter a valid UPI ID (e.g. name@okhdfcbank)'
  }
  return undefined
}

/**
 * Validate book review text and rating.
 */
export function validateReview(text: string, rating: number): { text?: string; rating?: string } {
  const errors: { text?: string; rating?: string } = {}
  const trimmed = text.trim()

  if (!trimmed) {
    errors.text = 'Review cannot be empty'
  } else if (trimmed.length > 100) {
    errors.text = `Review exceeds 100 characters (${trimmed.length}/100)`
  }

  if (rating < 1 || rating > 5) {
    errors.rating = 'Rating must be between 1 and 5'
  }

  return errors
}

export interface LoginValidationErrors {
  email?: string
  password?: string
}

/**
 * Validate the login form inputs (presence and e-mail format only).
 */
export function validateLogin(email: string, password: string): LoginValidationErrors {
  const errors: LoginValidationErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'Email address is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return errors
}
