import { CircleAlert, Inbox, LoaderCircle, RotateCcw, SearchX } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageState } from '../../../shared/ui/pageState/PageState'
import { DirectoryToolbar } from '../../components/directoryToolbar/DirectoryToolbar'
import { Pagination } from '../../components/pagination/Pagination'
import { UsersCardGrid } from '../../components/usersCardGrid/UsersCardGrid'
import { useUserDirectory } from '../../hooks/useUserDirectory/useUserDirectory'
import { useUsers } from '../../hooks/useUsers/useUsers'

const primaryButtonClassName =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-neutral-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-900'

export default function UsersListPage() {
  const { status, users: allUsers, error, retry } = useUsers()
  const location = useLocation()
  const directory = useUserDirectory({ users: allUsers, isReady: status === 'success' })
  const fromList = `${location.pathname}${location.search}`
  const isInitialLoad = status === 'idle' || status === 'loading'
  const hasFilters = Boolean(
    directory.state.searchText.trim() || directory.state.cityText.trim(),
  )

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
          Users
        </h1>
        {status === 'success' ? (
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400" aria-live="polite">
            {directory.totalCount === 0
              ? 'No results'
              : `${directory.totalCount} ${directory.totalCount === 1 ? 'user' : 'users'}`}
          </p>
        ) : null}
      </header>

      {isInitialLoad ? (
        <PageState
          title="Loading users"
          description="Loading user data…"
          icon={<LoaderCircle className="animate-spin motion-reduce:animate-none" size={22} />}
          busy
        />
      ) : null}

      {status === 'error' ? (
        <PageState
          title="Unable to load users"
          description={error ?? 'Unable to load users.'}
          icon={<CircleAlert size={22} />}
          tone="error"
          action={
            <button className={primaryButtonClassName} type="button" onClick={retry}>
              <RotateCcw aria-hidden="true" size={16} />
              Try again
            </button>
          }
        />
      ) : null}

      {status === 'success' ? (
        <>
          <DirectoryToolbar
            searchText={directory.state.searchText}
            cityText={directory.state.cityText}
            sort={directory.state.sort}
            onSearchChange={directory.setSearchText}
            onCityChange={directory.setCityText}
            onSortChange={directory.setSort}
          />

          <div className="mt-5">
            {directory.users.length > 0 ? (
              <UsersCardGrid users={directory.users} fromList={fromList} />
            ) : (
              <PageState
                compact
                title={hasFilters ? 'No matching users' : 'No users available'}
                description={
                  hasFilters
                    ? 'Try a different search term or city, or clear the active filters.'
                    : 'No users were returned.'
                }
                icon={hasFilters ? <SearchX size={22} /> : <Inbox size={22} />}
                action={
                  hasFilters ? (
                    <button
                      className={primaryButtonClassName}
                      type="button"
                      onClick={directory.clearFilters}
                    >
                      Clear filters
                    </button>
                  ) : undefined
                }
              />
            )}
          </div>

          <Pagination
            page={directory.state.page}
            totalPages={directory.totalPages}
            onPageChange={directory.goToPage}
          />
        </>
      ) : null}
    </main>
  )
}
