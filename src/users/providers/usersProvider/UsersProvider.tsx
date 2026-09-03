import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fetchUsers } from '../../api/fetchUsers/fetchUsers'
import {
  mergeUserNameOverrides,
  persistUserNameOverride,
  readUserNameOverrides,
} from '../../storage/userNameOverrides/userNameOverrides'
import type { User } from '../../types/user'
import { UsersContext, type SaveNameResult, type UsersLoadStatus } from './UsersContext'

interface UsersProviderProps {
  children: ReactNode
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to load users.'
}

export function UsersProvider({ children }: UsersProviderProps) {
  const [baseUsers, setBaseUsers] = useState<User[]>([])
  const [overrides, setOverrides] = useState(readUserNameOverrides)
  const [status, setStatus] = useState<UsersLoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const activeController = useRef<AbortController | null>(null)
  const requestSequence = useRef(0)

  const beginRequest = useCallback(() => {
    activeController.current?.abort()

    const controller = new AbortController()
    const requestId = requestSequence.current + 1
    requestSequence.current = requestId
    activeController.current = controller

    void fetchUsers(controller.signal)
      .then((users) => {
        if (controller.signal.aborted || requestSequence.current !== requestId) {
          return
        }

        setBaseUsers(users)
        setStatus('success')
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || requestSequence.current !== requestId) {
          return
        }

        setBaseUsers([])
        setError(getErrorMessage(requestError))
        setStatus('error')
      })

    return controller
  }, [])

  useEffect(() => {
    const controller = beginRequest()
    return () => controller.abort()
  }, [beginRequest])

  const retry = useCallback(() => {
    setStatus('loading')
    setError(null)
    beginRequest()
  }, [beginRequest])

  const users = useMemo(
    () => mergeUserNameOverrides(baseUsers, overrides),
    [baseUsers, overrides],
  )

  const saveName = useCallback(
    (userId: number, name: string): SaveNameResult => {
      const baseUser = baseUsers.find((user) => user.id === userId)

      if (!baseUser) {
        return { ok: false, message: 'This user is no longer available.' }
      }

      const result = persistUserNameOverride(overrides, userId, name, baseUser.name)

      if (!result.ok) {
        return result
      }

      setOverrides(result.overrides)
      return { ok: true }
    },
    [baseUsers, overrides],
  )

  const value = useMemo(
    () => ({ status, users, error, retry, saveName }),
    [error, retry, saveName, status, users],
  )

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}
