import { ArrowLeft, CheckCircle2, CircleAlert, LoaderCircle, UserRoundX } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PageState } from '../../../shared/ui/pageState/PageState'
import { EditNameForm } from '../../components/editNameForm/EditNameForm'
import { UserDetailsGrid } from '../../components/userDetailsGrid/UserDetailsGrid'
import { UserProfileHeader } from '../../components/userProfileHeader/UserProfileHeader'
import { useUsers } from '../../hooks/useUsers/useUsers'
import type { User } from '../../types/user/user'

function getReturnPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('fromList' in state)) {
    return '/users'
  }

  const fromList = state.fromList
  return typeof fromList === 'string' && /^\/users(?:\?|$)/.test(fromList) ? fromList : '/users'
}

function UserDetails({ user, returnPath }: { user: User; returnPath: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  return (
    <>
      <Link
        to={returnPath}
        className="mb-4 inline-flex items-center gap-2 rounded-md text-sm font-medium text-neutral-600 transition hover:text-neutral-950 hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 motion-reduce:transition-none dark:text-neutral-300 dark:hover:text-white dark:focus-visible:ring-offset-neutral-950"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to users
      </Link>

      <UserProfileHeader
        user={user}
        isEditing={isEditing}
        onEdit={() => {
          setSaveStatus(null)
          setIsEditing(true)
        }}
      />

      {saveStatus ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300" role="status">
          <CheckCircle2 aria-hidden="true" size={18} />
          {saveStatus}
        </p>
      ) : null}

      {isEditing ? (
        <EditNameForm
          user={user}
          onCancel={() => setIsEditing(false)}
          onSaved={() => {
            setSaveStatus('Name changes saved on this device.')
            setIsEditing(false)
          }}
        />
      ) : null}

      <UserDetailsGrid user={user} />
    </>
  )
}

export default function UserDetailsPage() {
  const { status, users, error, retry } = useUsers()
  const { userId } = useParams()
  const location = useLocation()
  const parsedUserId = Number(userId)
  const user = Number.isInteger(parsedUserId)
    ? users.find((candidate) => candidate.id === parsedUserId)
    : undefined
  const returnPath = getReturnPath(location.state)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {status === 'loading' ? (
        <PageState
          headingLevel={1}
          title="Loading user"
          description="Loading user data…"
          icon={<LoaderCircle className="animate-spin motion-reduce:animate-none" size={22} />}
          busy
        />
      ) : null}

      {status === 'error' ? (
        <PageState
          headingLevel={1}
          title="Unable to load user"
          description={error ?? 'Unable to load this user.'}
          icon={<CircleAlert size={22} />}
          tone="error"
          action={
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-neutral-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-900"
            >
              Try again
            </button>
          }
        />
      ) : null}

      {status === 'success' && !user ? (
        <PageState
          headingLevel={1}
          title="User not found"
          description="There is no user with this identifier."
          icon={<UserRoundX size={22} />}
          action={
            <Link
              to={returnPath}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-neutral-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-900"
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Back to users
            </Link>
          }
        />
      ) : null}

      {status === 'success' && user ? (
        <UserDetails key={user.id} user={user} returnPath={returnPath} />
      ) : null}
    </main>
  )
}
