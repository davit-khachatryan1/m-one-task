import { Save, X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useUsers } from '../../hooks/useUsers/useUsers'
import type { User } from '../../types/user/user'

interface EditNameFormProps {
  user: User
  onCancel: () => void
  onSaved: () => void
}

export function EditNameForm({ user, onCancel, onSaved }: EditNameFormProps) {
  const { saveName } = useUsers()
  const idPrefix = useId()
  const titleId = `${idPrefix}-title`
  const nameInputId = `${idPrefix}-name`
  const nameErrorId = `${idPrefix}-name-error`
  const [draftName, setDraftName] = useState(user.name)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = draftName.trim()

    if (!trimmedName) {
      setValidationError('Name cannot be empty.')
      setSaveError(null)
      return
    }

    const result = saveName(user.id, trimmedName)

    if (!result.ok) {
      setSaveError(result.message)
      return
    }

    onSaved()
  }

  return (
    <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" aria-labelledby={titleId}>
      <div className="mb-5">
        <h2 id={titleId} className="text-base font-semibold text-neutral-950 dark:text-white">
          Edit display name
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          This change is saved locally in this browser.
        </p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor={nameInputId} className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Name
        </label>
        <input
          id={nameInputId}
          value={draftName}
          onChange={(event) => {
            setDraftName(event.currentTarget.value)
            setValidationError(null)
            setSaveError(null)
          }}
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 aria-invalid:border-red-500 motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:border-neutral-600 dark:focus:border-brand-500"
          aria-invalid={validationError ? 'true' : undefined}
          aria-describedby={validationError ? nameErrorId : undefined}
          autoFocus
        />
        {validationError ? (
          <p id={nameErrorId} className="mt-2 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {validationError}
          </p>
        ) : null}
        {saveError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" role="alert">
            {saveError}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:ring-offset-neutral-950"
          >
            <X aria-hidden="true" size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-neutral-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-950"
          >
            <Save aria-hidden="true" size={16} />
            Save changes
          </button>
        </div>
      </form>
    </section>
  )
}
