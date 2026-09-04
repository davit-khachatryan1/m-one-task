import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { selectUsersPage } from '../../helpers/selectUsersPage/selectUsersPage'
import type { User } from '../../types/user/user'
import {
  createUsersListQuery,
  getTotalPages,
  parseListSearchParams,
  type UserSort,
} from './directoryQuery'

interface UseUserDirectoryOptions {
  users: User[]
  isReady: boolean
}

export function useUserDirectory({ users, isReady }: UseUserDirectoryOptions) {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => parseListSearchParams(searchParams), [searchParams])
  const query = useMemo(
    () => createUsersListQuery(state, state.searchText, state.cityText),
    [state],
  )

  const totalCount = useMemo(() => selectUsersPage(users, query).totalCount, [users, query])
  const totalPages = getTotalPages(totalCount)
  const isPageInvalid = isReady && state.page > Math.max(totalPages, 1)
  const effectivePage = Math.max(1, Math.min(state.page, Math.max(totalPages, 1)))

  const pageUsers = useMemo(
    () => selectUsersPage(users, { ...query, page: effectivePage }).users,
    [users, query, effectivePage],
  )

  useEffect(() => {
    const rawPage = searchParams.get('page')
    const rawSort = searchParams.get('sort')
    const hasInvalidPage = rawPage !== null && String(state.page) !== rawPage
    const hasInvalidSort = rawSort !== null && rawSort !== 'name-asc' && rawSort !== 'name-desc'

    if (!hasInvalidPage && !hasInvalidSort && !isPageInvalid) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (hasInvalidSort) nextParams.delete('sort')

    if (isPageInvalid) {
      const safePage = Math.max(totalPages, 1)
      if (safePage === 1) nextParams.delete('page')
      else nextParams.set('page', String(safePage))
    } else if (hasInvalidPage) {
      nextParams.delete('page')
    }

    setSearchParams(nextParams, { replace: true })
  }, [isPageInvalid, searchParams, setSearchParams, state.page, totalPages])

  function updateFilter(key: 'search' | 'city', value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (!value.trim()) nextParams.delete(key)
    else nextParams.set(key, value)

    nextParams.delete('page')
    setSearchParams(nextParams, { replace: true })
  }

  function setSort(sort: UserSort) {
    const nextParams = new URLSearchParams(searchParams)

    if (sort === 'name-asc') nextParams.delete('sort')
    else nextParams.set('sort', sort)

    nextParams.delete('page')
    setSearchParams(nextParams, { replace: true })
  }

  function goToPage(page: number) {
    const nextParams = new URLSearchParams(searchParams)

    if (page <= 1) nextParams.delete('page')
    else nextParams.set('page', String(page))

    setSearchParams(nextParams)
  }

  return {
    state,
    users: pageUsers,
    totalCount,
    totalPages,
    setSearchText: (value: string) => updateFilter('search', value),
    setCityText: (value: string) => updateFilter('city', value),
    setSort,
    goToPage,
    clearFilters: () => setSearchParams({}, { replace: true }),
  }
}
