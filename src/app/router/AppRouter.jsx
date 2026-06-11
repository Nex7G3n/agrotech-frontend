import { createBrowserRouter } from 'react-router-dom'
import { publicRoutes } from './PublicRoutes'
import { privateRoutes } from './PrivateRoutes'

export const router = createBrowserRouter([...publicRoutes, ...privateRoutes])
