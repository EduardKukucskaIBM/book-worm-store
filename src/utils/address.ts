import type { Address } from '../types'
import type { AddressValidationErrors } from './validation'

/** An empty form value; country defaults to India and the phone code to +91. */
export const EMPTY_ADDRESS: Address = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCountryCode: '+91',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  pin: '',
  state: '',
  country: 'India',
}

/** Address fields in DOM order, used to focus the first invalid field. */
export const ADDRESS_FIELD_ORDER: ReadonlyArray<keyof AddressValidationErrors> = [
  'firstName',
  'lastName',
  'line1',
  'line2',
  'email',
  'city',
  'pin',
  'phoneCountryCode',
  'phone',
  'state',
  'country',
]

export function addressFieldId(field: keyof AddressValidationErrors): string {
  return `address-${field}`
}
