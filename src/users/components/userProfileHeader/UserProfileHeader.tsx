import { Pencil } from 'lucide-react'
import { getInitials } from '../../helpers/getInitials/getInitials'
import type { User } from '../../types/user/user'

interface UserProfileHeaderProps {
  user: User
  isEditing: boolean
  onEdit: () => void
}

export function UserProfileHeader({ user, isEditing, onEdit }: UserProfileHeaderProps) {
  return (
    <header className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-accent text-base font-semibold text-neutral-950 dark:border-neutral-700"
          aria-hidden="true"
        >
          {getInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            @{user.username}
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-neutral-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto dark:focus-visible:ring-offset-neutral-900"
          >
            <Pencil aria-hidden="true" size={16} />
            Edit name
          </button>
        ) : null}
      </div>
    </header>
  )
}
