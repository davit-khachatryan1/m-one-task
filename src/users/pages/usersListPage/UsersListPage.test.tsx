import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { makeUser, sampleUser } from '../../../test/fixtures'
import { UsersProvider } from '../../providers/UsersProvider'
import type { User } from '../../types/user/user'
import UsersListPage from './UsersListPage'

const elevenUsers = [
  sampleUser,
  makeUser(2, 'Ervin Howell', 'ervin@example.com', 'Wisokyburgh'),
  makeUser(3, 'Clementine Bauch', 'clementine@example.com', 'McKenziehaven'),
  makeUser(4, 'Patricia Lebsack', 'patricia@example.com', 'South Elvis'),
  makeUser(5, 'Chelsey Dietrich', 'chelsey@example.com', 'Roscoeview'),
  makeUser(6, 'Mrs. Dennis Schulist', 'dennis@example.com', 'South Christy'),
  makeUser(7, 'Kurtis Weissnat', 'kurtis@example.com', 'Howemouth'),
  makeUser(8, 'Nicholas Runolfsdottir', 'nicholas@example.com', 'Aliyaview'),
  makeUser(9, 'Glenna Reichert', 'glenna@example.com', 'Bartholomebury'),
  makeUser(10, 'Clementina DuBuque', 'clementina@example.com', 'Lebsackbury'),
  makeUser(11, 'Zzz Last User', 'eleventh@example.com', 'Yerevan'),
]

function listResponse(users: User[]) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(users),
  }
}

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function renderList(initialEntry = '/users') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <UsersProvider>
        <UsersListPage />
      </UsersProvider>
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('UsersListPage client-side directory', () => {
  it('recovers from a failed request and renders a full page of users', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(listResponse(elevenUsers))
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()

    renderList()

    expect(await screen.findByRole('heading', { name: /unable to load users/i })).toBeVisible()
    expect(screen.getByText('Network unavailable')).toBeVisible()

    await interaction.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText(sampleUser.name)).toBeVisible()
    expect(screen.getByRole('list', { name: 'Users' })).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(screen.getByText(sampleUser.email)).toBeVisible()
    expect(screen.getByText(sampleUser.address.city)).toBeVisible()
    expect(screen.getByText(sampleUser.company.name)).toBeVisible()
    expect(
      screen.getByRole('link', { name: `View details for ${sampleUser.name}` }),
    ).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('moves keyboard focus through search, city, and sort controls in order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(listResponse([sampleUser])))
    const interaction = userEvent.setup()

    renderList()

    await screen.findByText(sampleUser.name)
    await interaction.tab()
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveFocus()
    await interaction.tab()
    expect(screen.getByRole('searchbox', { name: 'City' })).toHaveFocus()
    await interaction.tab()
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveFocus()
  })

  it('filters by search instantly with no additional request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(elevenUsers))
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()
    renderList()
    await screen.findByText(sampleUser.name)

    const search = screen.getByRole('searchbox', { name: 'Search' })
    await interaction.type(search, 'Leanne Graham')

    expect(search).toHaveValue('Leanne Graham')
    expect(screen.getByTestId('location')).toHaveTextContent('/users?search=Leanne+Graham')
    expect(screen.getByText(sampleUser.name)).toBeVisible()
    expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('filters by a city substring and resets to page one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(elevenUsers))
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()
    renderList('/users?page=2')
    await screen.findByText('Zzz Last User')

    await interaction.type(screen.getByRole('searchbox', { name: 'City' }), 'kenzie')

    expect(screen.getByTestId('location')).toHaveTextContent('/users?city=kenzie')
    expect(await screen.findByText('Clementine Bauch')).toBeVisible()
    expect(screen.queryByText(sampleUser.name)).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('changes sort order instantly', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(elevenUsers))
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()
    renderList()
    await screen.findByText(sampleUser.name)

    await interaction.click(screen.getByRole('combobox', { name: 'Sort' }))
    await interaction.click(screen.getByRole('option', { name: 'Name: Z–A' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/users?sort=name-desc')
    const items = screen.getAllByRole('listitem')
    expect(within(items[0] as HTMLElement).getByText('Zzz Last User')).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('paginates once the collection exceeds the page size', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(elevenUsers))
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()
    renderList()

    expect(await screen.findByRole('navigation', { name: 'User pages' })).toHaveTextContent(
      'Page 1 of 2',
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    await interaction.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Zzz Last User')).toBeVisible()
    expect(screen.getByTestId('location')).toHaveTextContent('/users?page=2')
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('normalizes an out-of-range page to the last valid page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(elevenUsers))
    vi.stubGlobal('fetch', fetchMock)
    renderList('/users?page=99')

    expect(await screen.findByText('Zzz Last User')).toBeVisible()
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/users?page=2'),
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('hides pagination controls when the whole collection fits on one page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(elevenUsers.slice(0, 10)))
    vi.stubGlobal('fetch', fetchMock)
    renderList()

    await screen.findByText(sampleUser.name)
    expect(screen.queryByRole('navigation', { name: 'User pages' })).not.toBeInTheDocument()
  })
})
