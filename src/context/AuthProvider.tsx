import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { login as apiLogin } from '../api/auth'
import { STORAGE_KEYS } from '../config'
import type { User } from '../types'
import { loadJSON, removeItem, saveJSON } from '../utils/storage'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

function isStoredUser(value: unknown): value is User | null {
  if (value === null) return true
  const v = value as Partial<User>
  return typeof v === 'object' && typeof v.id === 'string' && typeof v.email === 'string' && typeof v.giftPoints === 'number'
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((n) => typeof n === 'number')
  )
}

export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  // The session stores the seed user; gift-point changes are kept separately and applied on top.
  const [sessionUser, setSessionUser] = useState<User | null>(() =>
    loadJSON<User | null>(STORAGE_KEYS.session, null, isStoredUser),
  )
  const [adjustments, setAdjustments] = useState<Record<string, number>>(() =>
    loadJSON<Record<string, number>>(STORAGE_KEYS.giftPointAdjustments, {}, isNumberRecord),
  )

  useEffect(() => {
    if (sessionUser) saveJSON(STORAGE_KEYS.session, sessionUser)
    else removeItem(STORAGE_KEYS.session)
  }, [sessionUser])

  useEffect(() => {
    saveJSON(STORAGE_KEYS.giftPointAdjustments, adjustments)
  }, [adjustments])

  const user = useMemo<User | null>(
    () =>
      sessionUser
        ? { ...sessionUser, giftPoints: Math.max(0, sessionUser.giftPoints + (adjustments[sessionUser.id] ?? 0)) }
        : null,
    [sessionUser, adjustments],
  )

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const loggedIn = await apiLogin(email, password)
    setSessionUser(loggedIn)
    return loggedIn
  }, [])

  const logout = useCallback((): void => setSessionUser(null), [])

  const adjustGiftPoints = useCallback((userId: string, delta: number): void => {
    setAdjustments((prev) => ({ ...prev, [userId]: (prev[userId] ?? 0) + delta }))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout, adjustGiftPoints }),
    [user, login, logout, adjustGiftPoints],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
