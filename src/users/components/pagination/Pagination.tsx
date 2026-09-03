import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const buttonClassName =
  'inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:disabled:hover:bg-neutral-900 dark:focus-visible:ring-offset-neutral-950'

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="mt-6 flex items-center justify-between gap-3 sm:justify-end" aria-label="User pages">
      <button
        className={buttonClassName}
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden="true" size={16} />
        Previous
      </button>
      <span className="min-w-24 text-center text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite">
        Page <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{page}</strong> of{' '}
        {totalPages}
      </span>
      <button
        className={buttonClassName}
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight aria-hidden="true" size={16} />
      </button>
    </nav>
  )
}
