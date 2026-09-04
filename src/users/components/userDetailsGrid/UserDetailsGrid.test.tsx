import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleUser } from '../../../test/fixtures'
import { UserDetailsGrid } from './UserDetailsGrid'

describe('UserDetailsGrid', () => {
  it('groups every term and definition directly within the description list', () => {
    render(<UserDetailsGrid user={sampleUser} />)

    const descriptionItems = [
      ...screen.getAllByRole('term'),
      ...screen.getAllByRole('definition'),
    ]

    expect(descriptionItems).toHaveLength(12)
    expect(descriptionItems.every((item) => {
      const parent = item.parentElement
      return parent?.tagName === 'DL' || (parent?.tagName === 'DIV' && parent.parentElement?.tagName === 'DL')
    })).toBe(true)
  })
})
