import type { ReactElement } from 'react'
import { Loading } from '@carbon/react'
import './PageLoading.scss'

/** Suspense fallback shown while a lazy route chunk loads. */
export const PageLoading = (): ReactElement => (
  <div className="page-loading" role="status" aria-live="polite" data-testid="page-loading">
    <Loading withOverlay={false} small description="Loading page" />
    <span className="page-loading__text">Loading…</span>
  </div>
)

export default PageLoading
