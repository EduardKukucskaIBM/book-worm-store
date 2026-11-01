import usersData from '../data/users.json'
import { User } from '../types'

export async function getDemoUser(): Promise<User> {
  const demo = (usersData as User[])[0]
  return { ...demo }
}

export async function login(email: string, password?: string): Promise<User> {
  void password
  const normalized = email.trim().toLowerCase()
  const found = (usersData as User[]).find((u) => u.email.toLowerCase() === normalized)
  if (found) {
    return { ...found }
  }

  // Fallback mock user for arbitrary emails
  return {
    id: `user-${Date.now()}`,
    name: normalized.split('@')[0] || 'Member',
    email: normalized,
    giftPoints: 0,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const user = (usersData as User[]).find((u) => u.id === id)
  return user ? { ...user } : null
}
