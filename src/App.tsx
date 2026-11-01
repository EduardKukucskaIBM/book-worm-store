import type { ReactElement } from 'react'
import { Theme } from '@carbon/react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './context'
import router from './router'

const App = (): ReactElement => (
  <Theme theme="g100">
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </Theme>
)

export default App
