import { authRoutes } from '../../modules/auth/routes'
import { HomeRedirect, PublicOnlyRoute } from './RouteGuards'

export const publicRoutes = [
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    element: <PublicOnlyRoute />,
    children: authRoutes,
  },
]
