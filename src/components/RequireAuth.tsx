import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Route guard that redirects unauthenticated users to /login.
 * In ST3 this will read from AuthContext; for now it always allows access
 * so that placeholder routing works during scaffold.
 */
interface RequireAuthProps {
  children: ReactElement
}

const RequireAuth = ({ children }: RequireAuthProps): ReactElement => {
  const location = useLocation()
  // ST3 will replace `false` with the real `isAuthenticated` from AuthContext.
  const isAuthenticated = false

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}

export default RequireAuth
