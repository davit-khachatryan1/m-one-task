import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { UsersRouteLayout } from '../../users/pages/usersRouteLayout/UsersRouteLayout'
import { AppShell } from '../components/appShell/AppShell'
import { NotFoundPage } from '../pages/notFoundPage/NotFoundPage'

const UsersListPage = lazy(() => import('../../users/pages/usersListPage/UsersListPage'))
const UserDetailsPage = lazy(() => import('../../users/pages/userDetailsPage/UserDetailsPage'))

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UsersRouteLayout />}>
          <Route index element={<UsersListPage />} />
          <Route path=":userId" element={<UserDetailsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
