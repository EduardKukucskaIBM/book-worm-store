import { Suspense } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '../AppHeader/AppHeader'
import PageLoading from '../PageLoading/PageLoading'
import './PageLayout.scss'

export interface PageLayoutProps {
  children?: ReactNode
  breadcrumb?: ReactNode
  className?: string
  contentClassName?: string
  /** Remove the page padding and max-width so content (e.g. the Home sidebar) can touch the viewport edge */
  fullBleed?: boolean
}

export const PageLayout = ({
  children,
  breadcrumb,
  className,
  contentClassName,
  fullBleed = false,
}: PageLayoutProps): ReactElement => {
  return (
    <div
      className={`page-layout ${fullBleed ? 'page-layout--full-bleed' : ''} ${className ?? ''}`.trim()}
    >
      <AppHeader />
      <main id="main-content" className="page-layout__main">
        {breadcrumb && <div className="page-layout__breadcrumb">{breadcrumb}</div>}
        <div className={`page-layout__content ${contentClassName ?? ''}`.trim()}>
          {children ?? (
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  )
}

export default PageLayout
