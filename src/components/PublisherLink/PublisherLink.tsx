import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Publisher } from '../../types'
import './PublisherLink.scss'

export interface PublisherLinkProps {
  publisher: Pick<Publisher, 'id' | 'name'>
  className?: string
}

export const PublisherLink = ({
  publisher,
  className = '',
}: PublisherLinkProps): ReactElement => {
  return (
    <span className={`publisher-link ${className}`.trim()}>
      <Link
        to={`/?publisher=${encodeURIComponent(publisher.id)}`}
        className="publisher-link__name"
      >
        {publisher.name}
      </Link>
    </span>
  )
}

export default PublisherLink
