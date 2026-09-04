import { describe, expect, it, vi } from 'vitest'
import { sampleUser } from '../../../test/fixtures'
import { fetchUsers } from './fetchUsers'

function response(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(payload),
  }
}

describe('fetchUsers', () => {
  it('fetches the full users collection with no query parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([sampleUser]))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    await expect(fetchUsers(controller.signal)).resolves.toEqual([sampleUser])

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(requestUrl).toBe('https://jsonplaceholder.typicode.com/users')
    expect(requestInit.signal).toBe(controller.signal)
  })

  it('rejects on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() }),
    )

    await expect(fetchUsers(new AbortController().signal)).rejects.toThrow('HTTP 500')
  })

  it('validates every user in the list response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([{ id: 1 }])))

    await expect(fetchUsers(new AbortController().signal)).rejects.toThrow('unexpected response')
  })

  it('rejects a non-array response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({})))

    await expect(fetchUsers(new AbortController().signal)).rejects.toThrow('unexpected response')
  })
})
