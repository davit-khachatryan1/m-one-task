import { UsersRound } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '../themeToggle/ThemeToggle'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-neutral-950 transition-colors motion-reduce:transition-none dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/users"
            className="inline-flex items-center gap-2.5 rounded-lg text-base font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 dark:text-white dark:focus-visible:ring-offset-neutral-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-neutral-950">
              <UsersRound aria-hidden="true" size={17} />
            </span>
            Users
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <Outlet />
    </div>
  )
}
