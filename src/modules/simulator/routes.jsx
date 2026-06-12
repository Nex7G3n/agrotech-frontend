import { SimulatorPage } from './pages/SimulatorPage'
import { SimulationCasesPage } from './pages/SimulationCasesPage'

export const simulatorRoutes = [
  {
    path: '/simulator',
    element: <SimulatorPage />,
  },
  {
    path: '/control-cases',
    element: <SimulationCasesPage />,
  },
]
