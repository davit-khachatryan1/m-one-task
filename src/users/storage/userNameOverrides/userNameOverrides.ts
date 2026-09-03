import type { User } from '../../types/user'

export const USER_NAME_OVERRIDES_KEY = 'user-name-overrides:v1'

export type UserNameOverrides = Record<string, string>

interface StoredUserNameOverrides {
  version: 1
  names: UserNameOverrides
}

export type SaveOverrideResult =
  | { ok: true; overrides: UserNameOverrides }
  | { ok: false; message: string }

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isValidNames(value: unknown): value is UserNameOverrides {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  return Object.entries(value).every(
    ([userId, name]) => /^\d+$/.test(userId) && typeof name === 'string' && name.trim().length > 0,
  )
}

export function readUserNameOverrides(
  storage: Storage | null = getBrowserStorage(),
): UserNameOverrides {
  if (!storage) {
    return {}
  }

  try {
    const rawValue = storage.getItem(USER_NAME_OVERRIDES_KEY)

    if (!rawValue) {
      return {}
    }

    const parsed: unknown = JSON.parse(rawValue)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      parsed.version !== 1 ||
      !('names' in parsed) ||
      !isValidNames(parsed.names)
    ) {
      return {}
    }

    return { ...parsed.names }
  } catch {
    return {}
  }
}

export function persistUserNameOverride(
  currentOverrides: UserNameOverrides,
  userId: number,
  nextName: string,
  baseName: string,
  storage: Storage | null = getBrowserStorage(),
): SaveOverrideResult {
  if (!storage) {
    return { ok: false, message: 'Local storage is unavailable. Your change was not saved.' }
  }

  const overrides = { ...currentOverrides }
  const userKey = String(userId)

  if (nextName === baseName) {
    delete overrides[userKey]
  } else {
    overrides[userKey] = nextName
  }

  const storedValue: StoredUserNameOverrides = { version: 1, names: overrides }

  try {
    storage.setItem(USER_NAME_OVERRIDES_KEY, JSON.stringify(storedValue))
    return { ok: true, overrides }
  } catch {
    return { ok: false, message: 'Local storage is unavailable. Your change was not saved.' }
  }
}

export function mergeUserNameOverrides(
  users: readonly User[],
  overrides: UserNameOverrides,
): User[] {
  return users.map((user) => {
    const nameOverride = overrides[String(user.id)]
    return nameOverride ? { ...user, name: nameOverride } : user
  })
}
