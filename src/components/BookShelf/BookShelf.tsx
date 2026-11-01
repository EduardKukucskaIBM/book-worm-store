import type { ReactElement } from 'react'
import { SkeletonPlaceholder, SkeletonText } from '@carbon/react'
import { Author, Book, Category } from '../../types'
import BookCard from '../BookCard/BookCard'
import './BookShelf.scss'

export interface BookShelfProps {
  title: string
  books: Book[]
  authorsMap?: Map<string, Author>
  categoriesMap?: Map<string, Category>
  loading?: boolean
  skeletonCount?: number
  className?: string
  now?: Date
}

export const BookShelf = ({
  title,
  books,
  authorsMap,
  categoriesMap,
  loading = false,
  skeletonCount = 3,
  className = '',
  now,
}: BookShelfProps): ReactElement | null => {
  if (!loading && books.length === 0) {
    return null
  }

  return (
    <section className={`book-shelf ${className}`.trim()} aria-label={title}>
      <h2 className="book-shelf__title">{title}</h2>

      <div className="book-shelf__grid">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="book-shelf__skeleton-card"
                data-testid="bookshelf-skeleton"
              >
                <div className="book-shelf__skeleton-cover">
                  <SkeletonPlaceholder className="book-shelf__skeleton-placeholder" />
                </div>
                <div className="book-shelf__skeleton-info">
                  <SkeletonText heading width="70%" />
                  <SkeletonText width="40%" />
                  <SkeletonText paragraph lineCount={2} width="100%" />
                  <SkeletonText width="50%" />
                  <SkeletonText width="30%" />
                </div>
              </div>
            ))
          : books.map((book) => {
              const author = authorsMap?.get(book.authorId)
              const bookCategories = book.categoryIds
                .map((catId) => categoriesMap?.get(catId))
                .filter((c): c is Category => Boolean(c))

              return (
                <BookCard
                  key={book.id}
                  book={book}
                  authorName={author?.name}
                  categories={bookCategories}
                  now={now}
                />
              )
            })}
      </div>
    </section>
  )
}

export default BookShelf
