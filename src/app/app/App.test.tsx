import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sampleUser } from '../../test/fixtures'
import { App } from './App'
import { ThemeProvider } from '../providers/ThemeProvider'

function renderApp(initialEntry: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('application routes', () => {
  it('redirects the root route to the lazy user directory', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [sampleUser],
    })
    vi.stubGlobal('fetch', fetchMock)

    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Users', level: 1 })).toBeVisible()
    expect(await screen.findByText(sampleUser.name)).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('renders an unknown route without mounting the users provider', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderApp('/missing')

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeVisible()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('preserves the originating list state through detail navigation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [sampleUser],
      }),
    )
    const interaction = userEvent.setup()
    renderApp('/users?city=Gwenborough')

    await interaction.click(
      await screen.findByRole('link', { name: `View details for ${sampleUser.name}` }),
    )
    expect(await screen.findByRole('heading', { name: sampleUser.name, level: 1 })).toBeVisible()

    await interaction.click(screen.getByRole('link', { name: 'Back to users' }))

    expect(await screen.findByRole('combobox', { name: 'City' })).toHaveTextContent(
      'Gwenborough',
    )
  })
})
