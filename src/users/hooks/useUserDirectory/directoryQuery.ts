export type UserSort = 'name-asc' | 'name-desc'

export const USERS_PAGE_SIZE = 10

export interface UserListState {
  searchText: string
  cityText: string
  sort: UserSort
  page: number
}

export interface UsersListQuery {
  search: string
  city: string
  sort: UserSort
  page: number
  pageSize: number
}

export function normalizeFilterValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function parseListSearchParams(params: URLSearchParams): UserListState {
  const rawPage = params.get('page')
  const parsedPage = rawPage ? Number(rawPage) : 1
  const rawSort = params.get('sort')

  return {
    searchText: params.get('search') ?? '',
    cityText: params.get('city') ?? '',
    sort: rawSort === 'name-desc' ? 'name-desc' : 'name-asc',
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  }
}

export function createUsersListQuery(
  state: Pick<UserListState, 'sort' | 'page'>,
  search: string,
  city: string,
): UsersListQuery {
  return {
    search: normalizeFilterValue(search),
    city: normalizeFilterValue(city),
    sort: state.sort,
    page: state.page,
    pageSize: USERS_PAGE_SIZE,
  }
}

export function getTotalPages(totalCount: number): number {
  return Math.ceil(totalCount / USERS_PAGE_SIZE)
}
