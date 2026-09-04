import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useUsers } from './useUsers'

describe('useUsers', () => {
  it('throws when called outside a UsersProvider', () => {
    expect(() => renderHook(() => useUsers())).toThrow(
      'useUsers must be used inside a UsersProvider.',
    )
  })
})
