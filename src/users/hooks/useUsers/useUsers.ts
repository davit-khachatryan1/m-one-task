import { useContext } from 'react'
import {
  UsersContext,
  type UsersContextValue,
} from '../../providers/usersProvider/UsersContext'

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext)

  if (!context) {
    throw new Error('useUsers must be used inside a UsersProvider.')
  }

  return context
}
