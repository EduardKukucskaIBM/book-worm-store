import type { ReactElement } from 'react'
import { Author } from '../../types'
import './AuthorBio.scss'

export interface AuthorBioProps {
  author: Pick<Author, 'id' | 'name' | 'bio'>
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export const AuthorBio = ({ author, className = '' }: AuthorBioProps): ReactElement => {
  const initials = getInitials(author.name)

  return (
    <div className={`author-bio ${className}`.trim()}>
      <div className="author-bio__avatar" aria-hidden="true">
        {initials}
      </div>
      <div className="author-bio__content">
        <h3 className="author-bio__name">{author.name}</h3>
        <p className="author-bio__text">{author.bio}</p>
      </div>
    </div>
  )
}

export default AuthorBio
