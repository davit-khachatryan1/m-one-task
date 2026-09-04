import { Search } from 'lucide-react'
import type { SortDirection } from '../../hooks/useUserDirectory/directoryQuery'
import { FilterDropdown } from '../filterDropdown/FilterDropdown'
import type { FilterOption } from '../filterDropdown/FilterDropdown'

interface DirectoryToolbarProps {
  searchText: string
  city: string
  sortDirection: SortDirection
  cities: readonly string[]
  onSearchChange: (value: string) => void
  onCityChange: (value: string) => void
  onSortChange: (value: SortDirection) => void
}

const inputClassName =
  'h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:hover:border-neutral-600 dark:focus:border-brand-500'

const sortOptions: readonly FilterOption<SortDirection>[] = [
  { value: 'asc', label: 'Name: A–Z' },
  { value: 'desc', label: 'Name: Z–A' },
]

export function DirectoryToolbar({
  searchText,
  city,
  sortDirection,
  cities,
  onSearchChange,
  onCityChange,
  onSortChange,
}: DirectoryToolbarProps) {
  const cityOptions: readonly FilterOption<string>[] = [
    { value: '', label: 'All cities' },
    ...cities.map((cityOption) => ({ value: cityOption, label: cityOption })),
  ]

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

      <FilterDropdown
        id="city-filter"
        label="City"
        value={city}
        options={cityOptions}
        onChange={onCityChange}
      />

      <FilterDropdown
        id="name-sort"
        label="Sort"
        value={sortDirection}
        options={sortOptions}
        onChange={onSortChange}
      />
    </section>
  )
}
