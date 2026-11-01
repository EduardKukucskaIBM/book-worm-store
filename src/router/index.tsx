import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import PageLayout from '../components/PageLayout/PageLayout'
import BackdropLayout from '../components/BackdropLayout/BackdropLayout'
import RequireAuth from '../components/RequireAuth'

import Home from '../pages/Home'
import ProductDetail from '../pages/ProductDetail'
import Checkout from '../pages/Checkout'
import Payment from '../pages/Payment'
import Confirmation from '../pages/Confirmation'
import Login from '../pages/Login'
import Orders from '../pages/Orders'
import Wishlist from '../pages/Wishlist'
import Writers from '../pages/Writers'
import NotFound from '../pages/NotFound'

export const routes: RouteObject[] = [
  {
    element: <PageLayout />,
    children: [
      { path: '/', element: <Home /> },
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
]

const router = createBrowserRouter(routes)

export default router
