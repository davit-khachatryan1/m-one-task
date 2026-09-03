import { CircleAlert, Inbox, LoaderCircle, RotateCcw, SearchX } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageState } from '../../../shared/ui/pageState/PageState'
import { DirectoryToolbar } from '../../components/directoryToolbar/DirectoryToolbar'
import { Pagination } from '../../components/pagination/Pagination'
import { UsersTable } from '../../components/usersTable/UsersTable'
import { useUserDirectory } from '../../hooks/useUserDirectory/useUserDirectory'
import { useUsers } from '../../hooks/useUsers/useUsers'

const primaryButtonClassName =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition hover:bg-brand-800 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-900'

export default function UsersListPage() {
  const { status, users, error, retry } = useUsers()
  const location = useLocation()
  const directory = useUserDirectory(users, status)
  const fromList = `${location.pathname}${location.search}`

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
          Users
        </h1>
        {status === 'success' && users.length > 0 ? (
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400" aria-live="polite">
            {directory.result.matchingCount === 0
              ? 'No results'
              : directory.result.matchingCount === users.length
              ? `${users.length} ${users.length === 1 ? 'user' : 'users'}`
              : `${directory.result.matchingCount} of ${users.length} users`}
          </p>
        ) : null}
      </header>

      {status === 'loading' ? (
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

      {status === 'success' && users.length === 0 ? (
        <PageState
          title="No users available"
          description="No users were returned."
          icon={<Inbox size={22} />}
        />
      ) : null}

      {status === 'success' && users.length > 0 ? (
        <>
          <DirectoryToolbar
            searchText={directory.state.searchText}
            city={directory.state.city}
            sortDirection={directory.state.sortDirection}
            cities={directory.cities}
            onSearchChange={directory.setSearchText}
            onCityChange={directory.setCity}
            onSortChange={directory.setSortDirection}
          />

          {directory.result.items.length === 0 ? (
            <PageState
              compact
              title="No matching users"
              description="Try a different search term or city, or clear the active filters."
              icon={<SearchX size={22} />}
              action={
                <button
                  className={primaryButtonClassName}
                  type="button"
                  onClick={directory.clearFilters}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="mt-5">
              <UsersTable users={directory.result.items} fromList={fromList} />
            </div>
          )}

          <Pagination
            page={directory.result.page}
            totalPages={directory.result.totalPages}
            onPageChange={directory.goToPage}
          />
        </>
      ) : null}
    </main>
  )
}
