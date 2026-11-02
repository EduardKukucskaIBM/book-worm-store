import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@carbon/icons-react'
import './LoginPrompt.scss'

export const LoginPrompt = (): ReactElement => (
  <aside className="login-prompt" aria-label="Log in (optional)" data-testid="login-prompt">
    <UserAvatar size={20} className="login-prompt__icon" aria-hidden="true" />
    <p className="login-prompt__text">
      Log in for saved address, gift points and order history.{' '}
      <Link to="/login?redirect=/checkout" className="login-prompt__link">
        Log in
      </Link>
    </p>
  </aside>
)

export default LoginPrompt
