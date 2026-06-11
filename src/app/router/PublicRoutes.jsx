import { authRoutes } from '../../modules/auth/routes'

const homeRoute = {
  path: '/',
  element: <div style={{ padding: '2rem' }}>Redirige a login o landing pública</div>,
}

export const publicRoutes = [homeRoute, ...authRoutes]
