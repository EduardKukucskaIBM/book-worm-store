import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import PageLayout from '../components/PageLayout/PageLayout'
import BackdropLayout from '../components/BackdropLayout/BackdropLayout'
import RequireAuth from '../components/RequireAuth'
import RootLayout from './RootLayout'
import {
  Home,
  ProductDetail,
  Checkout,
  Payment,
  Confirmation,
  Login,
  Orders,
  Wishlist,
  Writers,
  NotFound,
} from './lazyPages'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        // Home owns its spacing so the category sidebar can sit flush against the viewport edge
        element: <PageLayout fullBleed />,
        children: [{ path: '/', element: <Home /> }],
      },
      {
        element: <PageLayout />,
        children: [
          { path: '/books/:bookId', element: <ProductDetail /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/login', element: <Login /> },
          {
            path: '/orders',
            element: (
              <RequireAuth>
                <Orders />
              </RequireAuth>
            ),
          },
          { path: '/wishlist', element: <Wishlist /> },
          { path: '/writers', element: <Writers /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        element: <BackdropLayout />,
        children: [
          { path: '/payment', element: <Payment /> },
          { path: '/confirmation/:orderId', element: <Confirmation /> },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default router
