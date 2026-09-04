import { describe, expect, it } from 'vitest'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('returns up to two initials and ignores repeated whitespace', () => {
    expect(getInitials('Prince')).toBe('P')
    expect(getInitials('Leanne Graham')).toBe('LG')
    expect(getInitials('  Mary   Jane Watson  ')).toBe('MJ')
    expect(getInitials('alice bob')).toBe('AB')
    expect(getInitials('')).toBe('')
  })
})
