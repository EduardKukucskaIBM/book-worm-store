import type { ReactElement } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Theme } from '@carbon/react'
import router from './router'

const App = (): ReactElement => (
  <Theme theme="g100">
    <RouterProvider router={router} />
  </Theme>
)

export default App
