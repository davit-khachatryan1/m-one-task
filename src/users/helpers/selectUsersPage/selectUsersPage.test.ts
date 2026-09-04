import { describe, expect, it } from 'vitest'
import { makeUser } from '../../../test/fixtures'
import { selectUsersPage } from './selectUsersPage'

const baseQuery = { search: '', city: '', sort: 'name-asc' as const, page: 1, pageSize: 10 }

const users = [
  makeUser(1, 'Leanne Graham', 'Sincere@april.biz', 'Gwenborough'),
  makeUser(2, 'Ervin Howell', 'Shanna@melissa.tv', 'Wisokyburgh'),
  makeUser(3, 'Clementine Bauch', 'Nathan@yesenia.net', 'McKenziehaven'),
]

describe('selectUsersPage', () => {
  it('matches search against name or email, case-insensitively', () => {
    expect(selectUsersPage(users, { ...baseQuery, search: 'ervin' }).users).toEqual([users[1]])
    expect(selectUsersPage(users, { ...baseQuery, search: 'YESENIA' }).users).toEqual([users[2]])
  })

  it('matches city as a case-insensitive substring', () => {
    expect(selectUsersPage(users, { ...baseQuery, city: 'kenzie' }).users).toEqual([users[2]])
  })

  it('combines search and city filters', () => {
    expect(
      selectUsersPage(users, { ...baseQuery, search: 'leanne', city: 'wisoky' }).users,
    ).toEqual([])
  })

  it('sorts by name in both directions', () => {
    expect(selectUsersPage(users, baseQuery).users.map((user) => user.name)).toEqual([
      'Clementine Bauch',
      'Ervin Howell',
      'Leanne Graham',
    ])
    expect(
      selectUsersPage(users, { ...baseQuery, sort: 'name-desc' }).users.map((user) => user.name),
    ).toEqual(['Leanne Graham', 'Ervin Howell', 'Clementine Bauch'])
  })

  it('paginates only once the filtered result exceeds the page size', () => {
    const eleven = Array.from({ length: 11 }, (_, index) =>
      makeUser(index + 1, `User ${String(index + 1).padStart(2, '0')}`, `user${index}@x.com`, 'City'),
    )

    const firstPage = selectUsersPage(eleven, { ...baseQuery, pageSize: 10, page: 1 })
    expect(firstPage.users).toHaveLength(10)
    expect(firstPage.totalCount).toBe(11)

    const secondPage = selectUsersPage(eleven, { ...baseQuery, pageSize: 10, page: 2 })
    expect(secondPage.users).toHaveLength(1)
    expect(secondPage.users[0]?.name).toBe('User 11')

    const tenOnly = eleven.slice(0, 10)
    expect(selectUsersPage(tenOnly, { ...baseQuery, pageSize: 10, page: 1 }).totalCount).toBe(10)
  })

  it('reports the filtered total count, not the page slice length', () => {
    const result = selectUsersPage(users, { ...baseQuery, pageSize: 1, page: 1 })
    expect(result.users).toHaveLength(1)
    expect(result.totalCount).toBe(3)
  })
})
