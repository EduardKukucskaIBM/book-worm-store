import { createContext, useContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue {
  /** Logged-in user with the persisted gift-point adjustments applied, or `null` for guests. */
  user: User | null
  isAuthenticated: boolean
  /** Mock login against users.json. Rejects with an `Error` carrying a user-facing message. */
  login: (email: string, password: string) => Promise<User>
  /** Ends the session. Cart, orders and wishlist are untouched. */
  logout: () => void
  /** Adds `delta` (negative to spend) to a user's gift points; persisted on top of the seed balance. */
  adjustGiftPoints: (userId: string, delta: number) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within an AuthProvider')
  return value
}
