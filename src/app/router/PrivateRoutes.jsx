import { ProtectedRoute } from './ProtectedRoute'
import { dashboardRoutes } from '../../modules/dashboard/routes'
import { adminRoutes } from '../../modules/admin/routes'
import { predictionRoutes } from '../../modules/prediction/routes'
import { historicalRoutes } from '../../modules/historical/routes'
import { simulatorRoutes } from '../../modules/simulator/routes'
import { recommendationRoutes } from '../../modules/recommendation/routes'
import { reportsRoutes } from '../../modules/reports/routes'
import { alertsRoutes } from '../../modules/alerts/routes'
import { AppShell } from '../../shared/layouts/AppShell'

export const privateRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          ...dashboardRoutes,
          ...predictionRoutes,
          ...historicalRoutes,
          ...simulatorRoutes,
          ...recommendationRoutes,
          ...reportsRoutes,
          ...alertsRoutes,
        ],
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
