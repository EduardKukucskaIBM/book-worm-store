import usersData from '../data/users.json'
import { User } from '../types'

/** users.json record: a `User` plus the mock-only plain-text password. */
interface UserRecord extends User {
  password: string
}

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'

const records = usersData as UserRecord[]

/** Strip the password so it never leaves the API layer. */
function toUser(record: UserRecord): User {
  const copy: Partial<UserRecord> = { ...record }
  delete copy.password
  return copy as User
}

export async function getDemoUser(): Promise<User> {
  return toUser(records[0])
}

/** Demo account credentials, shown as a hint on /login. */
export function getDemoCredentials(): { email: string; password: string } {
  return { email: records[0].email, password: records[0].password }
}

/** Mock login against users.json. Rejects with `INVALID_CREDENTIALS_MESSAGE` on mismatch. */
export async function login(email: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase()
  const found = records.find((u) => u.email.toLowerCase() === normalized)
  if (!found || found.password !== password) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }
  return toUser(found)
}

export async function getUserById(id: string): Promise<User | null> {
  const record = records.find((u) => u.id === id)
  return record ? toUser(record) : null
}
