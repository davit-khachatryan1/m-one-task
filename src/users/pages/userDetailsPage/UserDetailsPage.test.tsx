import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sampleUser } from '../../../test/fixtures'
import { UsersProvider } from '../../providers/usersProvider/UsersProvider'
import { USER_NAME_OVERRIDES_KEY } from '../../storage/userNameOverrides/userNameOverrides'
import UserDetailsPage from './UserDetailsPage'

function renderDetails() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [sampleUser],
    }),
  )

  render(
    <MemoryRouter initialEntries={['/users/1']}>
      <UsersProvider>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailsPage />} />
        </Routes>
      </UsersProvider>
    </MemoryRouter>,
  )
}

describe('UserDetailsPage editing', () => {
  it('validates an empty name, supports Cancel, and confirms a persisted save', async () => {
    const interaction = userEvent.setup()
    renderDetails()

    expect(await screen.findByRole('heading', { name: sampleUser.name, level: 1 })).toBeVisible()
    await interaction.click(screen.getByRole('button', { name: /edit name/i }))

    const nameInput = screen.getByRole('textbox', { name: 'Name' })
    await interaction.clear(nameInput)
    await interaction.click(screen.getByRole('button', { name: /save changes/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Name cannot be empty.')

    await interaction.type(nameInput, 'Temporary Name')
    await interaction.click(screen.getByRole('button', { name: 'Cancel' }))
    await interaction.click(screen.getByRole('button', { name: /edit name/i }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(sampleUser.name)

    await interaction.clear(screen.getByRole('textbox', { name: 'Name' }))
    await interaction.type(screen.getByRole('textbox', { name: 'Name' }), '  Leanne Updated  ')
    await interaction.click(screen.getByRole('button', { name: /save changes/i }))

    expect(screen.getByRole('status')).toHaveTextContent('Name changes saved on this device.')
    expect(screen.getByRole('heading', { name: 'Leanne Updated', level: 1 })).toBeVisible()
    expect(JSON.parse(window.localStorage.getItem(USER_NAME_OVERRIDES_KEY) ?? '')).toEqual({
      version: 1,
      names: { '1': 'Leanne Updated' },
    })
  })

  it('shows an error instead of success when local storage rejects the save', async () => {
    const interaction = userEvent.setup()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })
    renderDetails()

    await screen.findByRole('heading', { name: sampleUser.name, level: 1 })
    await interaction.click(screen.getByRole('button', { name: /edit name/i }))
    const nameInput = screen.getByRole('textbox', { name: 'Name' })
    await interaction.clear(nameInput)
    await interaction.type(nameInput, 'Leanne Updated')
    await interaction.click(screen.getByRole('button', { name: /save changes/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Your change was not saved.')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
