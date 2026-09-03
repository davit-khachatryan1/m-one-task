import type { User } from '../../types/user'

export const USERS_PAGE_SIZE = 5
export type SortDirection = 'asc' | 'desc'

export interface UserListState {
  searchText: string
  city: string
  sortDirection: SortDirection
  page: number
}

export interface UserListResult {
  items: User[]
  matchingCount: number
  page: number
  totalPages: number
}

export function normalizeSearchValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function parseListSearchParams(params: URLSearchParams): UserListState {
  const rawPage = params.get('page')
  const parsedPage = rawPage ? Number(rawPage) : 1

  return {
    searchText: params.get('q') ?? '',
    city: params.get('city') ?? '',
    sortDirection: params.get('sort') === 'desc' ? 'desc' : 'asc',
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  }
}

export function getAvailableCities(users: readonly User[]): string[] {
  return [...new Set(users.map((user) => user.address.city))].sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: 'base' }),
  )
}

export function deriveUserList(
  users: readonly User[],
  state: UserListState,
  pageSize = USERS_PAGE_SIZE,
): UserListResult {
  const normalizedQuery = normalizeSearchValue(state.searchText)
  const directionMultiplier = state.sortDirection === 'asc' ? 1 : -1

  const matchingUsers = users
    .filter((user) => {
      const matchesSearch =
        !normalizedQuery ||
        normalizeSearchValue(user.name).includes(normalizedQuery) ||
        normalizeSearchValue(user.email).includes(normalizedQuery)
      const matchesCity = !state.city || user.address.city === state.city

      return matchesSearch && matchesCity
    })
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }) *
        directionMultiplier,
    )

  const totalPages = Math.ceil(matchingUsers.length / pageSize)
  const page = totalPages === 0 ? 1 : Math.min(state.page, totalPages)
  const startIndex = (page - 1) * pageSize

  return {
    items: matchingUsers.slice(startIndex, startIndex + pageSize),
    matchingCount: matchingUsers.length,
    page,
    totalPages,
  }
}
