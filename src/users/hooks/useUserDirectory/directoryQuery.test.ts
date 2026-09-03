import { describe, expect, it } from 'vitest'
import { makeUser } from '../../../test/fixtures'
import {
  deriveUserList,
  getAvailableCities,
  normalizeSearchValue,
  parseListSearchParams,
} from './directoryQuery'

const users = [
  makeUser(1, 'Leanne Graham', 'Sincere@april.biz', 'Gwenborough'),
  makeUser(2, 'Ana Bell', 'ana@example.com', 'London'),
  makeUser(3, 'Zoë Carter', 'zoe@example.com', 'Gwenborough'),
]

describe('user directory query', () => {
  it('normalizes case and repeated whitespace when searching names or emails', () => {
    expect(normalizeSearchValue('  LEANNE    Graham  ')).toBe('leanne graham')

    const nameResult = deriveUserList(users, {
      searchText: '  LEANNE    graham ',
      city: '',
      sortDirection: 'asc',
      page: 1,
    })
    const emailResult = deriveUserList(users, {
      searchText: '  APRIL.BIZ ',
      city: '',
      sortDirection: 'asc',
      page: 1,
    })

    expect(nameResult.items.map((user) => user.id)).toEqual([1])
    expect(emailResult.items.map((user) => user.id)).toEqual([1])
  })

  it('filters by one city and sorts names in both directions', () => {
    const ascending = deriveUserList(users, {
      searchText: '',
      city: 'Gwenborough',
      sortDirection: 'asc',
      page: 1,
    })
    const descending = deriveUserList(users, {
      searchText: '',
      city: 'Gwenborough',
      sortDirection: 'desc',
      page: 1,
    })

    expect(ascending.items.map((user) => user.name)).toEqual(['Leanne Graham', 'Zoë Carter'])
    expect(descending.items.map((user) => user.name)).toEqual(['Zoë Carter', 'Leanne Graham'])
    expect(getAvailableCities(users)).toEqual(['Gwenborough', 'London'])
  })

  it('paginates and clamps a page that is no longer available', () => {
    const largerSet = Array.from({ length: 7 }, (_, index) =>
      makeUser(index + 1, `User ${index + 1}`, `user${index + 1}@example.com`, 'Yerevan'),
    )
    const result = deriveUserList(
      largerSet,
      { searchText: '', city: '', sortDirection: 'asc', page: 99 },
      5,
    )

    expect(result.page).toBe(2)
    expect(result.totalPages).toBe(2)
    expect(result.items).toHaveLength(2)
  })

  it('normalizes invalid URL values to supported defaults', () => {
    const state = parseListSearchParams(
      new URLSearchParams('q=Leanne&city=Gwenborough&sort=sideways&page=-3'),
    )

    expect(state).toEqual({
      searchText: 'Leanne',
      city: 'Gwenborough',
      sortDirection: 'asc',
      page: 1,
    })
  })
})
