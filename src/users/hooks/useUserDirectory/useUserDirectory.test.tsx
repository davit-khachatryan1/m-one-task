import { act, renderHook } from '@testing-library/react'
import { useEffect, type ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeUser, sampleUser } from '../../../test/fixtures'
import { useUserDirectory } from './useUserDirectory'

let latestSearch = ''

function LocationSpy() {
  const location = useLocation()

  useEffect(() => {
    latestSearch = location.search
  })

  return null
}

function createWrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationSpy />
        {children}
      </MemoryRouter>
    )
  }
}

const elevenUsers = [
  sampleUser,
  ...Array.from({ length: 10 }, (_, index) =>
    makeUser(index + 2, `User ${index + 2}`, `user${index + 2}@example.com`, 'City'),
  ),
]

describe('useUserDirectory', () => {
  beforeEach(() => {
    latestSearch = ''
  })

  it('parses URL state and derives the current page from the given users', () => {
    const { result } = renderHook(
      () => useUserDirectory({ users: elevenUsers, isReady: true }),
      { wrapper: createWrapper('/users?search=User&sort=name-desc&page=1') },
    )

    expect(result.current.state).toEqual({
      searchText: 'User',
      cityText: '',
      sort: 'name-desc',
      page: 1,
    })
    expect(result.current.totalCount).toBe(10)
    expect(result.current.totalPages).toBe(1)
  })

  it('clamps an out-of-range page down to the last valid page and rewrites the URL', () => {
    const { result } = renderHook(
      () => useUserDirectory({ users: elevenUsers, isReady: true }),
      { wrapper: createWrapper('/users?page=99') },
    )

    expect(latestSearch).toBe('?page=2')
    expect(result.current.state.page).toBe(2)
    expect(result.current.users).toHaveLength(1)
  })

  it('drops an invalid sort value from the URL', () => {
    renderHook(() => useUserDirectory({ users: elevenUsers, isReady: true }), {
      wrapper: createWrapper('/users?sort=sideways'),
    })

    expect(latestSearch).toBe('')
  })

  it('does not clamp the page while the collection has not loaded yet', () => {
    const { result } = renderHook(() => useUserDirectory({ users: [], isReady: false }), {
      wrapper: createWrapper('/users?page=99'),
    })

    expect(latestSearch).toBe('?page=99')
    expect(result.current.state.page).toBe(99)
  })

  it('setSearchText updates the URL and resets the page', () => {
    const { result } = renderHook(
      () => useUserDirectory({ users: elevenUsers, isReady: true }),
      { wrapper: createWrapper('/users?page=2') },
    )

    act(() => result.current.setSearchText('leanne'))

    expect(latestSearch).toBe('?search=leanne')
  })

  it('setSort updates the URL and resets the page', () => {
    const { result } = renderHook(
      () => useUserDirectory({ users: elevenUsers, isReady: true }),
      { wrapper: createWrapper('/users?page=2') },
    )

    act(() => result.current.setSort('name-desc'))

    expect(latestSearch).toBe('?sort=name-desc')
  })

  it('goToPage sets the page parameter', () => {
    const { result } = renderHook(
      () => useUserDirectory({ users: elevenUsers, isReady: true }),
      { wrapper: createWrapper('/users') },
    )

    act(() => result.current.goToPage(2))

    expect(latestSearch).toBe('?page=2')
  })

  it('clearFilters removes every list-control parameter', () => {
    const { result } = renderHook(
      () => useUserDirectory({ users: elevenUsers, isReady: true }),
      { wrapper: createWrapper('/users?search=a&city=b&sort=name-desc&page=2') },
    )

    act(() => result.current.clearFilters())

    expect(latestSearch).toBe('')
  })
})
