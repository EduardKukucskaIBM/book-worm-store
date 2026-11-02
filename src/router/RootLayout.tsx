import type { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

/** Root route: behaviour shared by every page. */
export const RootLayout = (): ReactElement => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
)

export default RootLayout
