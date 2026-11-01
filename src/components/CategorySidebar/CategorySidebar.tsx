import type { ReactElement } from 'react'
import { Category, Publisher } from '../../types'
import './CategorySidebar.scss'

export interface CategorySidebarProps {
  categories?: Category[]
  publishers?: Publisher[]
  selectedCategory?: string
  selectedPublisher?: string
  onSelectCategory: (categoryId: string) => void
  onSelectPublisher: (publisherId: string) => void
  onSelectAll?: () => void
  className?: string
}

// Category list ordered and labelled as in screenshot 01
const DISPLAY_CATEGORIES = [
  { id: 'cat-romance', name: 'Romance', slug: 'romance' },
  { id: 'cat-mystery', name: 'Mystery', slug: 'mystery' },
  { id: 'cat-sci-fi', name: 'Science Fiction', slug: 'sci-fi' },
  { id: 'cat-fantasy', name: 'Fantasy', slug: 'fantasy' },
  { id: 'cat-history', name: 'Historical', slug: 'history' },
  { id: 'cat-biography', name: 'Biography', slug: 'biography' },
  { id: 'cat-self-help', name: 'Self-help', slug: 'self-help' },
  { id: 'cat-memoir', name: 'Memoir', slug: 'memoir' },
  { id: 'cat-travel', name: 'Travel', slug: 'travel' },
  { id: 'cat-cooking', name: 'Cooking', slug: 'cooking' },
  { id: 'cat-children', name: "Children's", slug: 'children' },
  { id: 'cat-young-adult', name: 'Young Adult', slug: 'young-adult' },
  { id: 'cat-comics', name: 'Comics & Graphic Novels', slug: 'comics' },
  { id: 'cat-poetry', name: 'Poetry', slug: 'poetry' },
  { id: 'cat-drama', name: 'Drama', slug: 'drama' },
  { id: 'cat-science', name: 'Science', slug: 'science' },
  { id: 'cat-philosophy', name: 'Philosophy', slug: 'philosophy' },
  { id: 'cat-religion', name: 'Religion', slug: 'religion' },
  { id: 'cat-language-learning', name: 'Language Learning', slug: 'language-learning' },
]

export const CategorySidebar = ({
  categories = [],
  publishers = [],
  selectedCategory = 'all',
  selectedPublisher = 'all',
  onSelectCategory,
  onSelectPublisher,
  onSelectAll,
  className = '',
}: CategorySidebarProps): ReactElement => {
  const isAllActive =
    (!selectedCategory || selectedCategory === 'all') &&
    (!selectedPublisher || selectedPublisher === 'all')

  const handleAllClick = () => {
    if (onSelectAll) {
      onSelectAll()
    } else {
      onSelectCategory('all')
    }
  }

  // Merge loaded categories with display list if any custom exists
  const categoryItems = DISPLAY_CATEGORIES.map((disp) => {
    const matched = categories.find(
      (c) => c.slug === disp.slug || c.id === disp.id || c.name.toLowerCase() === disp.name.toLowerCase()
    )
    return {
      id: matched ? matched.id : disp.id,
      slug: matched ? matched.slug : disp.slug,
      name: disp.name,
    }
  })

  return (
    <aside className={`category-sidebar ${className}`.trim()} aria-label="Book Categories and Publishers">
      <nav className="category-sidebar__nav">
        <ul className="category-sidebar__list" role="list">
          <li className="category-sidebar__item-wrapper">
            <button
              type="button"
              className={`category-sidebar__item ${isAllActive ? 'category-sidebar__item--active' : ''}`}
              onClick={handleAllClick}
              aria-current={isAllActive ? 'true' : undefined}
            >
              <span className="category-sidebar__item-text">All</span>
            </button>
          </li>

          {categoryItems.map((cat) => {
            const isCatActive =
              !isAllActive &&
              (selectedCategory === cat.id ||
                selectedCategory === cat.slug ||
                selectedCategory === cat.name.toLowerCase())

            return (
              <li key={cat.id} className="category-sidebar__item-wrapper">
                <button
                  type="button"
                  className={`category-sidebar__item ${isCatActive ? 'category-sidebar__item--active' : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                  aria-current={isCatActive ? 'true' : undefined}
                >
                  <span className="category-sidebar__item-text">{cat.name}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {publishers.length > 0 && (
          <div className="category-sidebar__group">
            <h4 className="category-sidebar__group-title">Publishers</h4>
            <ul className="category-sidebar__list" role="list">
              {publishers.map((pub) => {
                const isPubActive = selectedPublisher === pub.id

                return (
                  <li key={pub.id} className="category-sidebar__item-wrapper">
                    <button
                      type="button"
                      className={`category-sidebar__item ${isPubActive ? 'category-sidebar__item--active' : ''}`}
                      onClick={() => onSelectPublisher(pub.id)}
                      aria-current={isPubActive ? 'true' : undefined}
                    >
                      <span className="category-sidebar__item-text">{pub.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  )
}

export default CategorySidebar
