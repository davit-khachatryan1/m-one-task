import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeUser, sampleUser } from '../../test/fixtures'
import { useUsers } from '../hooks/useUsers/useUsers'
import { USER_NAME_OVERRIDES_KEY } from '../storage/userNameOverrides/userNameOverrides'
import { UsersProvider } from './UsersProvider'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((fulfill, fail) => {
    resolve = fulfill
    reject = fail
  })
  return { promise, resolve, reject }
}

function listResponse(users: ReturnType<typeof makeUser>[]) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(users),
  }
}

function ProviderHarness() {
  const { users, status, error, retry } = useUsers()

  return (
    <>
      <button type="button" onClick={retry}>
        Retry
      </button>
      <output>{status}</output>
      <p>{error}</p>
      <p>{users[0]?.name}</p>
    </>
  )
}

describe('UsersProvider request lifecycle', () => {
  it('fetches the full collection once on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse([sampleUser]))
    vi.stubGlobal('fetch', fetchMock)

    render(
      <UsersProvider>
        <ProviderHarness />
      </UsersProvider>,
    )

    expect(await screen.findByText(sampleUser.name)).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the newest response when a slow request is superseded by Retry', async () => {
    const first = deferred<ReturnType<typeof listResponse>>()
    const second = deferred<ReturnType<typeof listResponse>>()
    const firstUser = makeUser(1, 'First User', 'first@example.com', 'Yerevan')
    const secondUser = makeUser(2, 'Second User', 'second@example.com', 'Yerevan')
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()

    render(
      <UsersProvider>
        <ProviderHarness />
      </UsersProvider>,
    )

    const firstSignal = (fetchMock.mock.calls[0]?.[1] as RequestInit).signal as AbortSignal
    await interaction.click(screen.getByRole('button', { name: 'Retry' }))

    expect(firstSignal.aborted).toBe(true)

    await act(async () => second.resolve(listResponse([secondUser])))
    expect(await screen.findByText('Second User')).toBeVisible()

    await act(async () => first.resolve(listResponse([firstUser])))
    expect(screen.getByText('Second User')).toBeVisible()
    expect(screen.queryByText('First User')).not.toBeInTheDocument()
  })

  it('recovers after Retry following a failed initial request', async () => {
    const first = deferred<ReturnType<typeof listResponse>>()
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValueOnce(listResponse([sampleUser]))
    vi.stubGlobal('fetch', fetchMock)
    const interaction = userEvent.setup()

    render(
      <UsersProvider>
        <ProviderHarness />
      </UsersProvider>,
    )

    await act(async () => first.reject(new Error('Network down')))
    expect(await screen.findByText('Network down')).toBeVisible()

    await interaction.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText(sampleUser.name)).toBeVisible()
  })

  it('merges a local name override over the fresh API collection', async () => {
    window.localStorage.setItem(
      USER_NAME_OVERRIDES_KEY,
      JSON.stringify({ version: 1, names: { '1': 'Locally Saved Name' } }),
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(listResponse([sampleUser])))

    render(
      <UsersProvider>
        <ProviderHarness />
      </UsersProvider>,
    )

    expect(await screen.findByText('Locally Saved Name')).toBeVisible()
    expect(screen.queryByText(sampleUser.name)).not.toBeInTheDocument()
  })
})
