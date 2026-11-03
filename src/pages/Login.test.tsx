import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getDemoCredentials } from '../api/auth'
import { AppProviders } from '../context/AppProviders'
import Login from './Login'

const demo = getDemoCredentials()

const renderLogin = (path = '/login') =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<h1>Orders page</h1>} />
          <Route path="/" element={<h1>Home page</h1>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the demo credentials as a hint', () => {
    renderLogin()
    const hint = screen.getByTestId('demo-hint')
    expect(hint).toHaveTextContent(demo.email)
    expect(hint).toHaveTextContent(demo.password)
  })

  it('shows inline validation errors for empty fields', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Email address is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('shows an error for wrong credentials and stays on the page', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), demo.email)
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Home page' })).not.toBeInTheDocument()
  })

  it('goes to ?redirect= after a successful login', async () => {
    renderLogin('/login?redirect=/orders')
    await userEvent.type(screen.getByLabelText('Email'), demo.email)
    await userEvent.type(screen.getByLabelText('Password'), demo.password)
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('heading', { name: 'Orders page' })).toBeInTheDocument()
  })

  it('goes home when there is no redirect, and ignores external redirects', async () => {
    renderLogin('/login?redirect=//evil.example')
    await userEvent.type(screen.getByLabelText('Email'), demo.email)
    await userEvent.type(screen.getByLabelText('Password'), demo.password)
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('heading', { name: 'Home page' })).toBeInTheDocument()
  })
})
