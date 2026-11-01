import type { ReactElement, ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { CartProvider } from './CartProvider'
import { OrdersProvider } from './OrdersProvider'
import { WishlistProvider } from './WishlistProvider'

/** All app-state providers. Orders sits inside Auth because cancelling refunds gift points. */
export const AppProviders = ({ children }: { children: ReactNode }): ReactElement => (
  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <OrdersProvider>{children}</OrdersProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
)
