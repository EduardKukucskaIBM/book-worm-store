import type { ReactElement } from 'react'
import { Breadcrumb, BreadcrumbItem } from '@carbon/react'
import { Link } from 'react-router-dom'
import './Breadcrumbs.scss'

export interface BreadcrumbItemData {
  label: string
  to?: string
  isCurrent?: boolean
}

export interface BreadcrumbsProps {
  items: BreadcrumbItemData[]
  className?: string
  'aria-label'?: string
}

export const Breadcrumbs = ({
  items,
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
}: BreadcrumbsProps): ReactElement => {
  return (
    <Breadcrumb
      noTrailingSlash
      aria-label={ariaLabel}
      className={`app-breadcrumbs ${className ?? ''}`.trim()}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.isCurrent
        return (
          <BreadcrumbItem key={`${item.label}-${index}`} isCurrentPage={isLast}>
            {item.to && !isLast ? (
              <Link to={item.to} className="app-breadcrumbs__link">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

export default Breadcrumbs
