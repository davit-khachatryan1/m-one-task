import type { ReactNode } from 'react'

interface PageStateProps {
  title: string
  description: string
  icon: ReactNode
  action?: ReactNode
  headingLevel?: 1 | 2
  tone?: 'neutral' | 'error'
  compact?: boolean
  busy?: boolean
}

export function PageState({
  title,
  description,
  icon,
  action,
  headingLevel = 2,
  tone = 'neutral',
  compact = false,
  busy = false,
}: PageStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <section
      className={`mx-auto flex rounded-xl border bg-white dark:bg-neutral-900 ${
        compact
          ? 'mt-5 w-full flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:text-left'
          : 'my-10 max-w-xl flex-col items-center px-6 py-12 text-center'
      } ${tone === 'error' ? 'border-red-200 dark:border-red-900/70' : 'border-neutral-200 dark:border-neutral-800'}`}
      role={tone === 'error' ? 'alert' : undefined}
      aria-live={busy ? 'polite' : undefined}
      aria-busy={busy || undefined}
    >
      <div className={`flex ${compact ? 'items-start gap-4' : 'flex-col items-center'}`}>
        <span
          className={`${compact ? 'shrink-0' : 'mb-4'} grid h-10 w-10 place-items-center rounded-lg ${
            tone === 'error'
              ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
              : 'border border-neutral-200 bg-accent text-neutral-950 dark:border-neutral-700'
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div>
          <Heading className="text-lg font-semibold text-neutral-950 dark:text-white">
            {title}
          </Heading>
          <p className="mt-1 max-w-lg text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        </div>
      </div>
      {action ? (
        <div className={compact ? 'sm:ml-auto sm:shrink-0' : 'mt-6'}>{action}</div>
      ) : null}
    </section>
  )
}
