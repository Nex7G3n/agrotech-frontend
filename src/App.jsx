import { RouterProvider } from 'react-router-dom'
import { router } from './app/router/AppRouter'
import { AuthProvider } from './modules/auth/context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
