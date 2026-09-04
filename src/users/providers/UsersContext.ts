import { createContext } from 'react'
import type { User } from '../types/user/user'

export type UsersLoadStatus = 'loading' | 'success' | 'error'
export type SaveNameResult = { ok: true } | { ok: false; message: string }

export interface UsersContextValue {
  status: UsersLoadStatus
  users: User[]
  error: string | null
  retry: () => void
  saveName: (userId: number, name: string) => SaveNameResult
}

export const UsersContext = createContext<UsersContextValue | null>(null)
