import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '../../types/user'

interface UsersTableProps {
  users: readonly User[]
  fromList: string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join('')
}

const mobileLabelClassName =
  'text-xs font-medium text-neutral-500 md:hidden dark:text-neutral-400'

export function UsersTable({ users, fromList }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="block w-full border-collapse md:table md:table-fixed">
        <caption className="sr-only">Users</caption>
        <colgroup className="hidden md:table-column-group">
          <col className="w-[25%]" />
          <col className="w-[24%]" />
          <col className="w-[16%]" />
          <col className="w-[22%]" />
          <col className="w-[13%]" />
        </colgroup>
        <thead className="hidden border-b border-neutral-200 bg-neutral-50 md:table-header-group dark:border-neutral-800 dark:bg-neutral-900/80">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-600 lg:px-5 dark:text-neutral-300" scope="col">
              Name
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-600 lg:px-5 dark:text-neutral-300" scope="col">
              Email
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-600 lg:px-5 dark:text-neutral-300" scope="col">
              City
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-600 lg:px-5 dark:text-neutral-300" scope="col">
              Company
            </th>
            <th className="px-3 py-3 lg:px-5" scope="col">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-neutral-200 md:table-row-group dark:divide-neutral-800">
          {users.map((user) => (
            <tr
              key={user.id}
              className="grid gap-3 p-4 transition hover:bg-neutral-50 motion-reduce:transition-none md:table-row md:p-0 dark:hover:bg-neutral-800/50"
            >
              <td className="block overflow-hidden md:table-cell md:px-3 md:py-4 lg:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-neutral-100 text-sm font-semibold text-brand-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-brand-400"
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
              </td>
              <td className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 overflow-hidden md:table-cell md:px-3 md:py-4 lg:px-5">
                <span className={mobileLabelClassName}>Email</span>
                <a
                  className="block truncate text-sm text-neutral-700 hover:text-brand-700 hover:underline hover:underline-offset-2 dark:text-neutral-300 dark:hover:text-brand-300"
                  href={`mailto:${user.email}`}
                >
                  {user.email}
                </a>
              </td>
              <td className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 overflow-hidden md:table-cell md:px-3 md:py-4 lg:px-5">
                <span className={mobileLabelClassName}>City</span>
                <span className="block truncate text-sm text-neutral-700 dark:text-neutral-300">
                  {user.address.city}
                </span>
              </td>
              <td className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 overflow-hidden md:table-cell md:px-3 md:py-4 lg:px-5">
                <span className={mobileLabelClassName}>Company</span>
                <span className="block truncate text-sm text-neutral-700 dark:text-neutral-300">
                  {user.company.name}
                </span>
              </td>
              <td className="block md:table-cell md:px-3 md:py-4 md:text-right lg:px-5">
                <Link
                  className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:text-brand-300 dark:hover:text-brand-200 dark:focus-visible:ring-offset-neutral-900"
                  to={`/users/${user.id}`}
                  state={{ fromList }}
                  aria-label={`View details for ${user.name}`}
                >
                  Details
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
