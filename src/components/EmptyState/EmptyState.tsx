import type { ComponentType, ReactElement } from 'react'
import { Button } from '@carbon/react'
import { Link } from 'react-router-dom'
import './EmptyState.scss'

export interface EmptyStateAction {
  label: string
  to?: string
  onClick?: () => void
  kind?: 'primary' | 'secondary' | 'tertiary'
}

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ComponentType<{ size?: number; className?: string; 'aria-hidden'?: 'true' | 'false' }>
  action?: EmptyStateAction
  className?: string
  'data-testid'?: string
}

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  className,
  'data-testid': dataTestId = 'empty-state',
}: EmptyStateProps): ReactElement => {
  return (
    <div
      className={`app-empty-state ${className ?? ''}`.trim()}
      data-testid={dataTestId}
    >
      {Icon && (
        <div className="app-empty-state__icon-wrapper" aria-hidden="true">
          <Icon size={48} className="app-empty-state__icon" />
        </div>
      )}
      <h2 className="app-empty-state__title">{title}</h2>
      {description && <p className="app-empty-state__description">{description}</p>}
      {action && (
        <div className="app-empty-state__action">
          {action.to ? (
            <Button
              as={Link}
              to={action.to}
              kind={action.kind ?? 'primary'}
              size="md"
            >
              {action.label}
            </Button>
          ) : (
            <Button
              kind={action.kind ?? 'primary'}
              size="md"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
