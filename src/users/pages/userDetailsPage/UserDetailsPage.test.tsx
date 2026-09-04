import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { makeUser, sampleUser } from '../../../test/fixtures'
import { UsersProvider } from '../../providers/usersProvider/UsersProvider'
import { USER_NAME_OVERRIDES_KEY } from '../../storage/userNameOverrides/userNameOverrides'
import UserDetailsPage from './UserDetailsPage'

function renderDetails(users = [sampleUser]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => users,
    }),
  )

  const router = createMemoryRouter(
    [
      {
        path: '/users/:userId',
        element: (
          <UsersProvider>
            <UserDetailsPage />
          </UsersProvider>
        ),
      },
    ],
    { initialEntries: ['/users/1'] },
  )

  render(<RouterProvider router={router} />)
  return router
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

  it('resets editing state and the draft when the selected user changes', async () => {
    const interaction = userEvent.setup()
    const secondUser = makeUser(2, 'Ervin Howell', 'ervin@example.com', 'Wisokyburgh')
    const router = renderDetails([sampleUser, secondUser])

    await screen.findByRole('heading', { name: sampleUser.name, level: 1 })
    await interaction.click(screen.getByRole('button', { name: /edit name/i }))
    const nameInput = screen.getByRole('textbox', { name: 'Name' })
    await interaction.clear(nameInput)
    await interaction.type(nameInput, 'Unsaved draft')

    await act(() => router.navigate('/users/2'))

    expect(await screen.findByRole('heading', { name: secondUser.name, level: 1 })).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()

    await interaction.click(screen.getByRole('button', { name: /edit name/i }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(secondUser.name)
  })
})
