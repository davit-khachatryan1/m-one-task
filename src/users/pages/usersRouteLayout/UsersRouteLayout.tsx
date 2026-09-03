import { LoaderCircle } from 'lucide-react'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { UsersProvider } from '../../providers/usersProvider/UsersProvider'

export function UsersRouteLayout() {
  return (
    <UsersProvider>
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div
              className="flex min-h-72 items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                  size={20}
                />
                Loading page…
              </span>
            </div>
          </main>
        }
      >
        <Outlet />
      </Suspense>
    </UsersProvider>
  )
}
