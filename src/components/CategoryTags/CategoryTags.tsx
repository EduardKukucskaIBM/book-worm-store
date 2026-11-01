import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Category } from '../../types'
import './CategoryTags.scss'

export interface CategoryTagsProps {
  categories?: Category[]
  className?: string
}

export const CategoryTags = ({
  categories = [],
  className = '',
}: CategoryTagsProps): ReactElement | null => {
  if (!categories || categories.length === 0) return null

  return (
    <div className={`category-tags ${className}`.trim()}>
      {categories.map((category, index) => (
        <span key={category.id} className="category-tags__item">
          <Link
            to={`/?category=${encodeURIComponent(category.slug || category.id)}`}
            className="category-tags__link"
          >
            {category.name}
          </Link>
          {index < categories.length - 1 && <span className="category-tags__separator">, </span>}
        </span>
      ))}
    </div>
  )
}

export default CategoryTags
