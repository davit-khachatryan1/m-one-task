import { describe, expect, it } from 'vitest'
import {
  createUsersListQuery,
  getTotalPages,
  normalizeFilterValue,
  parseListSearchParams,
} from './directoryQuery'

describe('user directory query', () => {
  it('normalizes surrounding and repeated whitespace without changing case', () => {
    expect(normalizeFilterValue('  Leanne    Graham  ')).toBe('Leanne Graham')
  })

  it('parses descriptive browser parameters independently from API names', () => {
    expect(
      parseListSearchParams(
        new URLSearchParams('search=Leanne&city=Gwenborough&sort=name-desc&page=3'),
      ),
    ).toEqual({
      searchText: 'Leanne',
      cityText: 'Gwenborough',
      sort: 'name-desc',
      page: 3,
    })
  })

  it('falls back safely for invalid sort and page parameters', () => {
    expect(parseListSearchParams(new URLSearchParams('sort=sideways&page=-3'))).toEqual({
      searchText: '',
      cityText: '',
      sort: 'name-asc',
      page: 1,
    })
  })

  it('creates a normalized client-side query with the fixed page size', () => {
    expect(
      createUsersListQuery(
        { sort: 'name-desc', page: 2 },
        '  Leanne   Graham ',
        ' Gwenborough ',
      ),
    ).toEqual({
      search: 'Leanne Graham',
      city: 'Gwenborough',
      sort: 'name-desc',
      page: 2,
      pageSize: 10,
    })
  })

  it('calculates page boundaries from the filtered total', () => {
    expect(getTotalPages(0)).toBe(0)
    expect(getTotalPages(10)).toBe(1)
    expect(getTotalPages(11)).toBe(2)
  })
})
