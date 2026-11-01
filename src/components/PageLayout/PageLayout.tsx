import type { ReactElement, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '../AppHeader/AppHeader'
import './PageLayout.scss'

export interface PageLayoutProps {
  children?: ReactNode
  breadcrumb?: ReactNode
  className?: string
  contentClassName?: string
}

export const PageLayout = ({
  children,
  breadcrumb,
  className,
  contentClassName,
}: PageLayoutProps): ReactElement => {
  return (
    <div className={`page-layout ${className ?? ''}`.trim()}>
      <AppHeader />
      <main id="main-content" className="page-layout__main">
        {breadcrumb && <div className="page-layout__breadcrumb">{breadcrumb}</div>}
        <div className={`page-layout__content ${contentClassName ?? ''}`.trim()}>
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  )
}

export default PageLayout
