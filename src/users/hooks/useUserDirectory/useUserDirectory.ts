import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { UsersLoadStatus } from '../../providers/UsersContext'
import type { User } from '../../types/user/user'
import {
  deriveUserList,
  getAvailableCities,
  parseListSearchParams,
  type SortDirection,
} from './directoryQuery'

export function useUserDirectory(users: readonly User[], status: UsersLoadStatus) {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => parseListSearchParams(searchParams), [searchParams])
  const cities = useMemo(() => getAvailableCities(users), [users])
  const result = useMemo(() => deriveUserList(users, state), [state, users])

  useEffect(() => {
    if (status !== 'success') {
      return
    }

    const currentPage = searchParams.get('page')
    const expectedPage = result.page > 1 ? String(result.page) : null
    const sort = searchParams.get('sort')
    const city = searchParams.get('city')
    const query = searchParams.get('q')
    const invalidSort = sort !== null && sort !== 'desc'
    const invalidCity = city !== null && !cities.includes(city)
    const emptyQuery = query !== null && !query.trim()

    if (currentPage === expectedPage && !invalidSort && !invalidCity && !emptyQuery) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (expectedPage) {
      nextParams.set('page', expectedPage)
    } else {
      nextParams.delete('page')
    }

    if (invalidSort) nextParams.delete('sort')
    if (invalidCity) nextParams.delete('city')
    if (emptyQuery) nextParams.delete('q')

    setSearchParams(nextParams, { replace: true })
  }, [cities, result.page, searchParams, setSearchParams, status])

  function updateFilter(key: 'q' | 'city' | 'sort', value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (!value || (key === 'q' && !value.trim()) || (key === 'sort' && value === 'asc')) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    nextParams.delete('page')
    setSearchParams(nextParams, { replace: true })
  }

  function goToPage(page: number) {
    const nextParams = new URLSearchParams(searchParams)

    if (page <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(page))
    }

    setSearchParams(nextParams)
  }

  return {
    state,
    cities,
    result,
    setSearchText: (value: string) => updateFilter('q', value),
    setCity: (value: string) => updateFilter('city', value),
    setSortDirection: (value: SortDirection) => updateFilter('sort', value),
    goToPage,
    clearFilters: () => setSearchParams({}, { replace: true }),
  }
}
