import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import './AuthorLink.scss'

export interface AuthorLinkProps {
  authorId: string
  authorName?: string
  className?: string
}

export const AuthorLink = ({
  authorId,
  authorName,
  className = '',
}: AuthorLinkProps): ReactElement => {
  const displayName = authorName || 'Unknown Author'

  return (
    <span className={`author-link ${className}`.trim()}>
      <span className="author-link__prefix">by </span>
      <Link to={`/?author=${encodeURIComponent(authorId)}`} className="author-link__name">
        {displayName}
      </Link>
    </span>
  )
}

export default AuthorLink
