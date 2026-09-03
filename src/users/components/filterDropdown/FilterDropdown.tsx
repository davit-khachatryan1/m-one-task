import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export interface FilterOption<Value extends string> {
  value: Value
  label: string
}

interface FilterDropdownProps<Value extends string> {
  id: string
  label: string
  value: Value
  options: readonly FilterOption<Value>[]
  onChange: (value: Value) => void
}

const TYPEAHEAD_RESET_MS = 500

export function FilterDropdown<Value extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps<Value>) {
  const generatedId = useId()
  const labelId = `${id}-label-${generatedId}`
  const listboxId = `${id}-listbox-${generatedId}`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLLIElement | null>>([])
  const typeaheadBufferRef = useRef('')
  const typeaheadTimerRef = useRef<number | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [activeIndex, isOpen])

  useEffect(
    () => () => {
      if (typeaheadTimerRef.current !== undefined) {
        window.clearTimeout(typeaheadTimerRef.current)
      }
    },
    [],
  )

  const openDropdown = (initialIndex = selectedIndex) => {
    setActiveIndex(initialIndex)
    setIsOpen(true)
  }

  const closeDropdown = (restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) {
      triggerRef.current?.focus()
    }
  }

  const selectOption = (index: number) => {
    const option = options[index]
    if (!option) {
      return
    }

    onChange(option.value)
    closeDropdown(true)
  }

  const moveActiveOption = (direction: 1 | -1) => {
    if (options.length === 0) {
      return
    }

    setActiveIndex((currentIndex) =>
      (currentIndex + direction + options.length) % options.length,
    )
  }

  const runTypeahead = (character: string) => {
    if (typeaheadTimerRef.current !== undefined) {
      window.clearTimeout(typeaheadTimerRef.current)
    }

    typeaheadBufferRef.current += character.toLocaleLowerCase()
    typeaheadTimerRef.current = window.setTimeout(() => {
      typeaheadBufferRef.current = ''
    }, TYPEAHEAD_RESET_MS)

    const startIndex = isOpen ? activeIndex + 1 : selectedIndex + 1
    const findMatchingIndex = (query: string) =>
      Array.from({ length: options.length }, (_, offset) =>
        (startIndex + offset) % options.length,
      ).find((index) => options[index]?.label.toLocaleLowerCase().startsWith(query))

    let matchingIndex = findMatchingIndex(typeaheadBufferRef.current)
    if (matchingIndex === undefined && typeaheadBufferRef.current.length > 1) {
      typeaheadBufferRef.current = character.toLocaleLowerCase()
      matchingIndex = findMatchingIndex(typeaheadBufferRef.current)
    }

    if (matchingIndex === undefined) {
      return
    }

    setActiveIndex(matchingIndex)
    if (!isOpen) {
      const matchingOption = options[matchingIndex]
      if (matchingOption) {
        onChange(matchingOption.value)
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      runTypeahead(event.key)
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (isOpen) {
          moveActiveOption(1)
        } else {
          openDropdown()
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen) {
          moveActiveOption(-1)
        } else {
          openDropdown()
        }
        break
      case 'Home':
        event.preventDefault()
        if (isOpen) {
          setActiveIndex(0)
        } else {
          openDropdown(0)
        }
        break
      case 'End':
        event.preventDefault()
        if (isOpen) {
          setActiveIndex(Math.max(0, options.length - 1))
        } else {
          openDropdown(Math.max(0, options.length - 1))
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (isOpen) {
          selectOption(activeIndex)
        } else {
          openDropdown()
        }
        break
      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          closeDropdown(true)
        }
        break
      case 'Tab':
        if (isOpen) {
          closeDropdown()
        }
        break
      default:
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span
        id={labelId}
        className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </span>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-autocomplete="none"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        aria-activedescendant={isOpen ? `${listboxId}-option-${activeIndex}` : undefined}
        className="flex h-10 w-full items-center rounded-lg border border-neutral-300 bg-white text-left text-sm font-medium text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:border-neutral-600 dark:focus:border-brand-400"
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
      >
        <span className="min-w-0 flex-1 truncate px-3">{selectedOption?.label ?? ''}</span>
        <span className="flex h-full w-10 shrink-0 items-center justify-center rounded-r-lg border-l border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
          <ChevronDown
            className={`transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
            size={16}
          />
        </span>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          className="absolute top-full right-0 left-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-xl shadow-neutral-950/10 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/40"
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <li
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                id={`${listboxId}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none ${
                  isActive
                    ? 'bg-brand-50 text-brand-900 dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-200'
                }`}
                onClick={() => selectOption(index)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <span className="grid h-4 w-4 shrink-0 place-items-center text-brand-700 dark:text-brand-400">
                  {isSelected ? <Check aria-hidden="true" size={15} strokeWidth={2.5} /> : null}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
