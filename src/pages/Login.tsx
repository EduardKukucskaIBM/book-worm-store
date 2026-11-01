import { useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { Button, InlineNotification, PasswordInput, Stack, TextInput, Tile } from '@carbon/react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { getDemoCredentials } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { getSafeRedirect } from '../utils/redirect'
import { validateLogin } from '../utils/validation'
import type { LoginValidationErrors } from '../utils/validation'
import './Login.scss'

const Login = (): ReactElement => {
  const { isAuthenticated, login } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirect'))
  const demo = getDemoCredentials()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginValidationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in (or just signed in): go where ?redirect= says, else home.
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setFormError(null)

    const validation = validateLogin(email, password)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    try {
      await login(email, password)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed')
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <Tile className="login-page__card">
        <form noValidate onSubmit={(e) => void handleSubmit(e)}>
          <Stack gap={6}>
            <h1 className="login-page__title">Log in</h1>

            <Tile className="login-page__hint" data-testid="demo-hint">
              <p>
                <strong>Demo account</strong>
              </p>
              <p>
                Email: <code>{demo.email}</code>
              </p>
              <p>
                Password: <code>{demo.password}</code>
              </p>
            </Tile>

            {formError && (
              <InlineNotification
                kind="error"
                title="Login failed"
                subtitle={formError}
                hideCloseButton
                lowContrast
              />
            )}

            <TextInput
              id="login-email"
              labelText="Email"
              type="email"
              autoComplete="username"
              value={email}
              invalid={Boolean(errors.email)}
              invalidText={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              id="login-password"
              labelText="Password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(errors.password)}
              invalidText={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </Stack>
        </form>
      </Tile>
    </main>
  )
}

export default Login
