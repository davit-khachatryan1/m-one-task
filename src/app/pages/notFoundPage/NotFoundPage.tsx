import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageState } from '../../../shared/ui/pageState/PageState'

export function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageState
        headingLevel={1}
        title="Page not found"
        description="The page you requested does not exist or may have moved."
        icon={<FileQuestion size={22} />}
        action={
          <Link
            to="/users"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-neutral-950 shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-neutral-950"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Back to users
          </Link>
        }
      />
    </main>
  )
}
