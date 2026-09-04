import { Search } from 'lucide-react'
import type { UserSort } from '../../hooks/useUserDirectory/directoryQuery'
import { FilterDropdown } from '../filterDropdown/FilterDropdown'
import type { FilterOption } from '../filterDropdown/FilterDropdown'

interface DirectoryToolbarProps {
  searchText: string
  cityText: string
  sort: UserSort
  onSearchChange: (value: string) => void
  onCityChange: (value: string) => void
  onSortChange: (value: UserSort) => void
}

const inputClassName =
  'h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-[#9DC0BC] focus:border-brand-500 motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-brand-500'

const sortOptions: readonly FilterOption<UserSort>[] = [
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
]

export function DirectoryToolbar({
  searchText,
  cityText,
  sort,
  onSearchChange,
  onCityChange,
  onSortChange,
}: DirectoryToolbarProps) {
  return (
    <section
      className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-[minmax(16rem,1fr)_13rem_12rem] dark:border-neutral-800 dark:bg-neutral-900"
      aria-label="User filters"
    >
      <div>
        <label htmlFor="user-search" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Search
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-neutral-400"
            aria-hidden="true"
          >
            <Search size={17} />
          </span>
          <input
            id="user-search"
            type="search"
            value={searchText}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder="Search by name or email"
            className={`${inputClassName} pr-10 pl-10`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="city-filter" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          City
        </label>
        <input
          id="city-filter"
          type="search"
          value={cityText}
          onChange={(event) => onCityChange(event.currentTarget.value)}
          placeholder="Filter by city"
          className={inputClassName}
        />
      </div>

      <FilterDropdown
        id="name-sort"
        label="Sort"
        value={sort}
        options={sortOptions}
        onChange={onSortChange}
      />
    </section>
  )
}
