import type { ReactElement } from 'react'
import { Book, Category } from '../../types'
import BookCard from '../BookCard/BookCard'
import './RelatedReads.scss'

export interface RelatedReadItem {
  book: Book
  authorName?: string
  categories?: Category[]
}

export interface RelatedReadsProps {
  items: RelatedReadItem[]
  className?: string
}

export const RelatedReads = ({ items, className = '' }: RelatedReadsProps): ReactElement => {
  return (
    <aside className={`related-reads ${className}`.trim()} aria-label="Related Reads">
      <h2 className="related-reads__heading">Related Reads</h2>
      <div className="related-reads__divider" aria-hidden="true" />
      {items.length === 0 ? (
        <p className="related-reads__empty">No related reads yet</p>
      ) : (
        <ul className="related-reads__list" aria-label="Related books">
          {items.map(({ book, authorName, categories }) => (
            <li key={book.id} className="related-reads__item">
              <BookCard
                book={book}
                authorName={authorName}
                categories={categories}
                variant="related"
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default RelatedReads
