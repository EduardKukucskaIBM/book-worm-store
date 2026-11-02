import { lazy } from 'react'

// Route components are code-split. Each layout wraps its <Outlet /> in <Suspense>
// with a Carbon loading state, so the header stays visible while a chunk loads.
export const Home = lazy(() => import('../pages/Home'))
export const ProductDetail = lazy(() => import('../pages/ProductDetail'))
export const Checkout = lazy(() => import('../pages/Checkout'))
export const Payment = lazy(() => import('../pages/Payment'))
export const Confirmation = lazy(() => import('../pages/Confirmation'))
export const Login = lazy(() => import('../pages/Login'))
export const Orders = lazy(() => import('../pages/Orders'))
export const Wishlist = lazy(() => import('../pages/Wishlist'))
export const Writers = lazy(() => import('../pages/Writers'))
export const NotFound = lazy(() => import('../pages/NotFound'))
