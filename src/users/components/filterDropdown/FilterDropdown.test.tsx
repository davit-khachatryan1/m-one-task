import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { FilterDropdown } from './FilterDropdown'

const options = [
  { value: '', label: 'All cities' },
  { value: 'Gwenborough', label: 'Gwenborough' },
  { value: 'Roscoeview', label: 'Roscoeview' },
] as const

type OptionValue = (typeof options)[number]['value']

function TestDropdown() {
  const [value, setValue] = useState<OptionValue>('')

  return (
    <>
      <FilterDropdown
        id="test-city"
        label="City"
        value={value}
        options={options}
        onChange={setValue}
      />
      <button type="button">Outside</button>
    </>
  )
}

describe('FilterDropdown', () => {
  it('selects an option by click, closes, and restores trigger focus', async () => {
    const interaction = userEvent.setup()
    render(<TestDropdown />)

    const trigger = screen.getByRole('combobox', { name: 'City' })
    await interaction.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox', { name: 'City' })).toBeVisible()

    await interaction.click(screen.getByRole('option', { name: 'Gwenborough' }))

    expect(trigger).toHaveTextContent('Gwenborough')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes without changing the value after an outside click', async () => {
    const interaction = userEvent.setup()
    render(<TestDropdown />)

    const trigger = screen.getByRole('combobox', { name: 'City' })
    await interaction.click(trigger)
    await interaction.click(screen.getByRole('button', { name: 'Outside' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveTextContent('All cities')
  })

  it('supports arrow navigation and Enter selection', async () => {
    const interaction = userEvent.setup()
    render(<TestDropdown />)

    const trigger = screen.getByRole('combobox', { name: 'City' })
    await interaction.click(trigger)
    await interaction.keyboard('[ArrowDown][Enter]')

    expect(trigger).toHaveTextContent('Gwenborough')
    expect(trigger).toHaveFocus()
  })

  it('supports Home, End, Space, Escape, and Tab behavior', async () => {
    const interaction = userEvent.setup()
    render(<TestDropdown />)

    const trigger = screen.getByRole('combobox', { name: 'City' })
    trigger.focus()
    await interaction.keyboard('[End][Enter]')
    expect(trigger).toHaveTextContent('Roscoeview')

    await interaction.keyboard(' ')
    expect(screen.getByRole('listbox')).toBeVisible()
    await interaction.keyboard('[Home][Escape]')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await interaction.keyboard(' ')
    await interaction.tab()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus()
  })

  it('supports typeahead while closed and while open', async () => {
    const interaction = userEvent.setup()
    render(<TestDropdown />)

    const trigger = screen.getByRole('combobox', { name: 'City' })
    trigger.focus()
    await interaction.keyboard('g')
    expect(trigger).toHaveTextContent('Gwenborough')

    await interaction.keyboard(' ')
    await interaction.keyboard('r[Enter]')
    expect(trigger).toHaveTextContent('Roscoeview')
  })
})
