import type { ReactElement, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '../AppHeader/AppHeader'
import './BackdropLayout.scss'

export interface BackdropLayoutProps {
  children?: ReactNode
  className?: string
  cardClassName?: string
}

export const BackdropLayout = ({
  children,
  className,
  cardClassName,
}: BackdropLayoutProps): ReactElement => {
  return (
    <div className={`backdrop-layout ${className ?? ''}`.trim()}>
      <AppHeader />
      <main id="main-content" className="backdrop-layout__main">
        <div className={`backdrop-layout__card-container ${cardClassName ?? ''}`.trim()}>
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  )
}

export default BackdropLayout
