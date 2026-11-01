import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Route guard: guests are sent to /login?redirect=<current path>, which the
 * login page honours after a successful login.
 */
interface RequireAuthProps {
  children: ReactElement
}

const RequireAuth = ({ children }: RequireAuthProps): ReactElement => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // "/" is legal in a query string; keep it readable (…?redirect=/orders).
    const target = encodeURIComponent(location.pathname + location.search).replace(/%2F/gi, '/')
    return <Navigate to={`/login?redirect=${target}`} replace />
  }

  return children
}

export default RequireAuth
