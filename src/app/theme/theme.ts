export const THEME_STORAGE_KEY = 'app-theme:v1'
export const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | null

interface StoredThemePreference {
  version: 1
  preference: Theme
}

type ThemeStorageReader = Pick<Storage, 'getItem'>
type ThemeStorageWriter = Pick<Storage, 'setItem'>

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

export function readThemePreference(
  storage: ThemeStorageReader | null = getBrowserStorage(),
): ThemePreference {
  if (!storage) {
    return null
  }

  try {
    const rawValue = storage.getItem(THEME_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed: unknown = JSON.parse(rawValue)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      parsed.version !== 1 ||
      !('preference' in parsed) ||
      (parsed.preference !== 'light' && parsed.preference !== 'dark')
    ) {
      return null
    }

    return parsed.preference
  } catch {
    return null
  }
}

export function persistThemePreference(
  preference: Theme,
  storage: ThemeStorageWriter | null = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false
  }

  const value: StoredThemePreference = { version: 1, preference }

  try {
    storage.setItem(THEME_STORAGE_KEY, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function getSystemTheme(mediaQuery?: Pick<MediaQueryList, 'matches'> | null): Theme {
  const query =
    mediaQuery ??
    (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DARK_MODE_QUERY)
      : null)

  return query?.matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference, systemTheme: Theme): Theme {
  return preference ?? systemTheme
}

export function applyTheme(theme: Theme, root?: HTMLElement): void {
  const documentRoot = root ?? (typeof document !== 'undefined' ? document.documentElement : null)

  if (!documentRoot) {
    return
  }

  documentRoot.classList.toggle('dark', theme === 'dark')
  documentRoot.style.colorScheme = theme
}

export function initializeTheme(): Theme {
  const theme = resolveTheme(readThemePreference(), getSystemTheme())
  applyTheme(theme)
  return theme
}
