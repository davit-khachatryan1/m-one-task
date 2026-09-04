import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getInitials } from '../../helpers/getInitials/getInitials'
import type { User } from '../../types/user/user'

interface UsersCardGridProps {
  users: readonly User[]
  fromList: string
}

const termClassName = 'text-xs font-medium text-neutral-500 dark:text-neutral-400'
const definitionClassName = 'min-w-0 truncate text-sm text-neutral-700 dark:text-neutral-300'

export function UsersCardGrid({ users, fromList }: UsersCardGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Users">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:bg-neutral-50 motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-accent text-sm font-semibold text-neutral-950 dark:border-neutral-700"
              aria-hidden="true"
            >
              {getInitials(user.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-white">
                {user.name}
              </span>
              <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
                @{user.username}
              </span>
            </span>
          </div>

          <dl className="mt-5 grid gap-3">
            <div className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2">
              <dt className={termClassName}>Email</dt>
              <dd className={definitionClassName}>
                <a
                  className="hover:text-neutral-950 hover:underline hover:underline-offset-2 dark:hover:text-white"
                  href={`mailto:${user.email}`}
                >
                  {user.email}
                </a>
              </dd>
            </div>
            <div className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2">
              <dt className={termClassName}>City</dt>
              <dd className={definitionClassName}>{user.address.city}</dd>
            </div>
            <div className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2">
              <dt className={termClassName}>Company</dt>
              <dd className={definitionClassName}>{user.company.name}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-5">
            <Link
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-medium text-neutral-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-900"
              to={`/users/${user.id}`}
              state={{ fromList }}
              aria-label={`View details for ${user.name}`}
            >
              Details
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
