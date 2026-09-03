import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '../../components/themeToggle/ThemeToggle'
import { useTheme } from '../../hooks/useTheme/useTheme'
import { ThemeProvider } from './ThemeProvider'
import {
  initializeTheme,
  persistThemePreference,
  readThemePreference,
  THEME_STORAGE_KEY,
} from '../../theme/theme'

function createMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList
}

function ThemeProbe() {
  const { theme } = useTheme()
  return <span>{theme}</span>
}

describe('application theme', () => {
  it('uses the system preference when no explicit preference is stored', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => createMediaQueryList(true)))

    expect(initializeTheme()).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('reacts to system changes until the user chooses an explicit theme', () => {
    let listener: ((event: MediaQueryListEvent) => void) | null = null
    const mediaQuery = createMediaQueryList(false)
    mediaQuery.addEventListener = vi.fn((eventName, callback) => {
      if (eventName === 'change') {
        listener = callback as (event: MediaQueryListEvent) => void
      }
    })
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )
    expect(screen.getByText('light')).toBeVisible()

    act(() => listener?.({ matches: true } as MediaQueryListEvent))

    expect(screen.getByText('dark')).toBeVisible()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('persists an explicit toggle and restores it in a new provider', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => createMediaQueryList(false)))
    const interaction = userEvent.setup()
    const firstRender = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    await interaction.click(screen.getByRole('button', { name: 'Switch to dark mode' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? '')).toEqual({
      version: 1,
      preference: 'dark',
    })

    firstRender.unmount()
    document.documentElement.classList.remove('dark')
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(await screen.findByRole('button', { name: 'Switch to light mode' })).toBeVisible()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('falls back safely for malformed or unavailable storage', () => {
    const malformedStorage = { getItem: () => '{bad json' }
    const unavailableReader = {
      getItem: () => {
        throw new Error('Blocked')
      },
    }
    const unavailableWriter = {
      setItem: () => {
        throw new Error('Blocked')
      },
    }

    expect(readThemePreference(malformedStorage)).toBeNull()
    expect(readThemePreference(unavailableReader)).toBeNull()
    expect(persistThemePreference('dark', unavailableWriter)).toBe(false)
  })
})
