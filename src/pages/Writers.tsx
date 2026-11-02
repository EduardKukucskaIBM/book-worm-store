import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { getAuthors } from '../api/authors'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import type { Author } from '../types'
import './Writers.scss'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const Writers = (): ReactElement => {
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    void getAuthors().then((data) => {
      setAuthors([...data].sort((a, b) => a.name.localeCompare(b.name)))
    })
  }, [])

  return (
    <div className="writers-page" data-testid="writers-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Writers', isCurrent: true },
        ]}
      />
      <h1 className="writers-page__title">My Writers</h1>

      <ul className="writers-page__grid" aria-label="Authors" data-testid="writers-grid">
        {authors.map((author) => (
          <li key={author.id}>
            <Link
              to={`/?author=${encodeURIComponent(author.id)}`}
              className="writer-card"
              data-testid={`writer-card-${author.id}`}
            >
              <div className="writer-card__avatar" aria-hidden="true">
                {getInitials(author.name)}
              </div>
              <div className="writer-card__body">
                <p className="writer-card__name">{author.name}</p>
                <p className="writer-card__count">
                  {author.bookIds.length} book{author.bookIds.length !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Writers
