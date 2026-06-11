import { ProtectedRoute } from './ProtectedRoute'
import { dashboardRoutes } from '../../modules/dashboard/routes'
import { adminRoutes } from '../../modules/admin/routes'
import { AppShell } from '../../shared/layouts/AppShell'

export const privateRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [...dashboardRoutes],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AppShell />,
        children: [...adminRoutes],
      },
    ],
  },
]
