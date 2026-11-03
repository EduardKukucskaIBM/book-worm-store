import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressForm } from './AddressForm'
import type { Address } from '../../types'

const EMPTY_ADDRESS: Address = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCountryCode: '+91',
  phone: '',
  line1: '',
  city: '',
  pin: '',
  state: '',
  country: 'India',
}

const VALID_ADDRESS: Address = {
  firstName: 'Asha',
  lastName: 'Rao',
  email: 'asha@example.com',
  phoneCountryCode: '+91',
  phone: '9876543210',
  line1: '12 Park Street',
  city: 'Mumbai',
  pin: '400001',
  state: 'Maharashtra',
  country: 'India',
}

describe('AddressForm', () => {
  it('renders all address form inputs', () => {
    render(<AddressForm value={EMPTY_ADDRESS} onChange={vi.fn()} />)

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address line 1/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address line 2/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pin/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country$/i)).toBeInTheDocument()
  })

  it('shows validation errors when fields are blurred with invalid data', async () => {
    const user = userEvent.setup()
    render(<AddressForm value={EMPTY_ADDRESS} onChange={vi.fn()} />)

    const emailInput = screen.getByLabelText(/e-mail/i)
    await user.click(emailInput)
    await user.tab()

    expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
  })

  it('shows all validation errors when showAllErrors is true', () => {
    render(<AddressForm value={EMPTY_ADDRESS} onChange={vi.fn()} showAllErrors />)

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/address line 1 is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/city is required/i)).toBeInTheDocument()
    expect(screen.getByText(/pin code is required/i)).toBeInTheDocument()
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
    expect(screen.getByText(/state is required/i)).toBeInTheDocument()
  })

  it('does not display the saved-address checkbox when savedAddress is not provided', () => {
    render(<AddressForm value={EMPTY_ADDRESS} onChange={vi.fn()} />)
    expect(screen.queryByLabelText(/use saved address/i)).not.toBeInTheDocument()
  })

  it('displays the saved-address checkbox only when savedAddress is provided and notifies on toggle', async () => {
    const user = userEvent.setup()
    const handleUseSavedChange = vi.fn()

    render(
      <AddressForm
        value={EMPTY_ADDRESS}
        onChange={vi.fn()}
        savedAddress={VALID_ADDRESS}
        useSaved={false}
        onUseSavedChange={handleUseSavedChange}
      />,
    )

    const checkbox = screen.getByLabelText(/use saved address/i)
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(handleUseSavedChange).toHaveBeenCalledWith(true)
  })

  it('locks inputs and suppresses validation errors when useSaved is true with savedAddress', () => {
    render(
      <AddressForm
        value={VALID_ADDRESS}
        onChange={vi.fn()}
        savedAddress={VALID_ADDRESS}
        useSaved={true}
        showAllErrors
      />,
    )

    expect(screen.getByLabelText(/first name/i)).toHaveAttribute('readonly')
    expect(screen.getByLabelText(/country$/i)).toBeDisabled()
    expect(screen.queryByText(/is required/i)).not.toBeInTheDocument()
  })

  it('calls onChange with updated field value when an input changes', () => {
    const handleChange = vi.fn()
    render(<AddressForm value={EMPTY_ADDRESS} onChange={handleChange} />)

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Priya' } })
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Priya' }))
  })
})
