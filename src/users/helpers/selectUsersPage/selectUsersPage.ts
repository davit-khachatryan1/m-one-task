import type { UsersListQuery } from '../../hooks/useUserDirectory/directoryQuery'
import type { User } from '../../types/user/user'

export interface UsersPageResult {
  users: User[]
  totalCount: number
}

export function selectUsersPage(users: User[], query: UsersListQuery): UsersPageResult {
  const search = query.search.toLowerCase()
  const city = query.city.toLowerCase()

  const filtered = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    const matchesCity = !city || user.address.city.toLowerCase().includes(city)

    return matchesSearch && matchesCity
  })

  const sorted = [...filtered].sort((a, b) =>
    query.sort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
  )

  const start = (query.page - 1) * query.pageSize

  return {
    users: sorted.slice(start, start + query.pageSize),
    totalCount: sorted.length,
  }
}
