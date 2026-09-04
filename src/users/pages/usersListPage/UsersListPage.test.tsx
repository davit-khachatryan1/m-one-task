import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { makeUser, sampleUser } from '../../../test/fixtures'
import { UsersProvider } from '../../providers/UsersProvider'
import UsersListPage from './UsersListPage'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

describe('UsersListPage request states', () => {
  it('recovers from a failed request when Retry succeeds', async () => {
    const users = [
      sampleUser,
      makeUser(2, 'Ervin Howell', 'ervin@example.com', 'Wisokyburgh'),
      makeUser(3, 'Clementine Bauch', 'clementine@example.com', 'McKenziehaven'),
      makeUser(4, 'Patricia Lebsack', 'patricia@example.com', 'South Elvis'),
      makeUser(5, 'Chelsey Dietrich', 'chelsey@example.com', 'Roscoeview'),
    ]
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => users,
      })
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/users']}>
        <UsersProvider>
          <UsersListPage />
        </UsersProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /unable to load users/i })).toBeVisible()
    expect(screen.getByText('Network unavailable')).toBeVisible()

    await interaction.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText(sampleUser.name)).toBeVisible()
    expect(screen.getByRole('list', { name: 'Users' })).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText(sampleUser.email)).toBeVisible()
    expect(screen.getByText(sampleUser.address.city)).toBeVisible()
    expect(screen.getByText(sampleUser.company.name)).toBeVisible()
    expect(
      screen.getByRole('link', { name: `View details for ${sampleUser.name}` }),
    ).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('moves keyboard focus through the labeled list controls in order', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [sampleUser],
      }),
    )
    const interaction = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/users']}>
        <UsersProvider>
          <UsersListPage />
        </UsersProvider>
      </MemoryRouter>,
    )

    await screen.findByText(sampleUser.name)
    await interaction.tab()
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveFocus()
    await interaction.tab()
    expect(screen.getByRole('combobox', { name: 'City' })).toHaveFocus()
    await interaction.tab()
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveFocus()
  })

  it('updates URL state after city and sort option selection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [sampleUser],
      }),
    )
    const interaction = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/users']}>
        <UsersProvider>
          <UsersListPage />
        </UsersProvider>
        <LocationProbe />
      </MemoryRouter>,
    )

    await screen.findByText(sampleUser.name)
    await interaction.click(screen.getByRole('combobox', { name: 'City' }))
    await interaction.click(screen.getByRole('option', { name: sampleUser.address.city }))
    expect(screen.getByTestId('location')).toHaveTextContent('/users?city=Gwenborough')

    await interaction.click(screen.getByRole('combobox', { name: 'Sort' }))
    await interaction.click(screen.getByRole('option', { name: 'Name: Z–A' }))
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/users?city=Gwenborough&sort=desc',
    )
  })
})
