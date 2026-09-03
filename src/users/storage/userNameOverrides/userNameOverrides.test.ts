import { describe, expect, it } from 'vitest'
import { sampleUser } from '../../../test/fixtures'
import {
  mergeUserNameOverrides,
  persistUserNameOverride,
  readUserNameOverrides,
  USER_NAME_OVERRIDES_KEY,
} from './userNameOverrides'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('user name overrides', () => {
  it('ignores malformed or unsupported storage data', () => {
    const storage = new MemoryStorage()
    storage.setItem(USER_NAME_OVERRIDES_KEY, '{bad json')
    expect(readUserNameOverrides(storage)).toEqual({})

    storage.setItem(USER_NAME_OVERRIDES_KEY, JSON.stringify({ version: 2, names: { 1: 'New' } }))
    expect(readUserNameOverrides(storage)).toEqual({})
  })

  it('lets a local name override win without replacing other API fields', () => {
    const [mergedUser] = mergeUserNameOverrides([sampleUser], { '1': 'Updated Name' })

    expect(mergedUser?.name).toBe('Updated Name')
    expect(mergedUser?.email).toBe(sampleUser.email)
    expect(mergedUser?.address).toBe(sampleUser.address)
  })

  it('persists changes across storage reinitialization and removes redundant overrides', () => {
    const storage = new MemoryStorage()
    const saved = persistUserNameOverride({}, sampleUser.id, 'Updated Name', sampleUser.name, storage)

    expect(saved.ok).toBe(true)
    expect(readUserNameOverrides(storage)).toEqual({ '1': 'Updated Name' })

    const removed = persistUserNameOverride(
      readUserNameOverrides(storage),
      sampleUser.id,
      sampleUser.name,
      sampleUser.name,
      storage,
    )

    expect(removed).toEqual({ ok: true, overrides: {} })
    expect(readUserNameOverrides(storage)).toEqual({})
  })

  it('reports storage write failures without changing in-memory overrides', () => {
    const storage = new MemoryStorage()
    storage.setItem = () => {
      throw new Error('Storage blocked')
    }

    expect(
      persistUserNameOverride({}, sampleUser.id, 'Updated Name', sampleUser.name, storage),
    ).toEqual({
      ok: false,
      message: 'Local storage is unavailable. Your change was not saved.',
    })
  })
})
