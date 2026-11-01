import { useState, useEffect, useMemo, type ReactElement } from 'react'
import { Button } from '@carbon/react'
import { Filter, List } from '@carbon/icons-react'
import { Author, Book, Category, Publisher } from '../types'
import { getBooks, getCategories, getPublishers, getAuthors, getBestsellers, getNewLaunches } from '../api'
import { useCatalogueFilters, useRecommendations } from '../hooks'
import {
  CategorySidebar,
  FilterBar,
  ActiveFilterTags,
  BookShelf,
  EmptyState,
} from '../components'
import './Home.scss'

export const Home = (): ReactElement => {
  const {
    filters,
    rawFilters,
    hasActiveFilters,
    activeFilterCount,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
  } = useCatalogueFilters()

  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [bestsellers, setBestsellers] = useState<Book[]>([])
  const [newLaunches, setNewLaunches] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false)

  // Load initial reference data and shelves
  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [catsData, pubsData, authsData, allBooksData, bestsellersData, newLaunchesData] =
          await Promise.all([
            getCategories(),
            getPublishers(),
            getAuthors(),
            getBooks(),
            getBestsellers(3),
            getNewLaunches(3),
          ])

        if (isMounted) {
          setCategories(catsData)
          setPublishers(pubsData)
          setAuthors(authsData)
          setBooks(allBooksData)
          setBestsellers(bestsellersData)
          setNewLaunches(newLaunchesData)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load catalogue data', err)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  // Load filtered books whenever filters change
  useEffect(() => {
    let isMounted = true

    async function applyFilters() {
      if (!hasActiveFilters) {
        setFilteredBooks([])
        return
      }

      try {
        const result = await getBooks(filters)
        if (isMounted) {
          setFilteredBooks(result)
        }
      } catch (err) {
        console.error('Failed to filter books', err)
      }
    }

    applyFilters()

    return () => {
      isMounted = false
    }
  }, [filters, hasActiveFilters])

  // Authors & Categories fast lookup maps
  const authorsMap = useMemo(() => {
    return new Map(authors.map((a) => [a.id, a]))
  }, [authors])

  const categoriesMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]))
  }, [categories])

  // Recommendations hook
  const { recommendations, title: recommendedTitle } = useRecommendations(books, 3)

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setFilters({ category: undefined, publisher: undefined })
    } else {
      setFilters({ category: categoryId, publisher: undefined })
    }
    setIsDrawerOpen(false)
  }

  const handleSelectPublisher = (publisherId: string) => {
    if (publisherId === 'all') {
      setFilters({ publisher: undefined })
    } else {
      setFilters({ publisher: publisherId, category: undefined })
    }
    setIsDrawerOpen(false)
  }

  const handleSelectAll = () => {
    setFilters({ category: undefined, publisher: undefined })
    setIsDrawerOpen(false)
  }

  return (
    <div className="home-catalogue" data-testid="home-page">
      {/* Mobile/Tablet Controls Bar */}
      <div className="home-catalogue__mobile-bar">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={List}
          onClick={() => setIsDrawerOpen(true)}
          className="home-catalogue__drawer-btn"
        >
          Categories
        </Button>

        <Button
          kind={isMobileFiltersOpen || activeFilterCount > 0 ? 'secondary' : 'ghost'}
          size="sm"
          renderIcon={Filter}
          onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
          className="home-catalogue__filter-toggle-btn"
        >
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </Button>
      </div>

      <div className="home-catalogue__layout">
        {/* Persistent Desktop Sidebar */}
        <aside className="home-catalogue__sidebar-desktop">
          <CategorySidebar
            categories={categories}
            publishers={publishers}
            selectedCategory={rawFilters.category}
            selectedPublisher={rawFilters.publisher}
            onSelectCategory={handleSelectCategory}
            onSelectPublisher={handleSelectPublisher}
            onSelectAll={handleSelectAll}
          />
        </aside>

        {/* Mobile / Tablet Drawer */}
        {isDrawerOpen && (
          <div
            className="home-catalogue__drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          >
            <div
              className="home-catalogue__drawer-panel"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Categories drawer"
            >
              <div className="home-catalogue__drawer-header">
                <h3 className="home-catalogue__drawer-title">Categories & Publishers</h3>
                <Button
                  kind="ghost"
                  size="sm"
                  hasIconOnly
                  iconDescription="Close categories drawer"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="home-catalogue__drawer-body">
                <CategorySidebar
                  categories={categories}
                  publishers={publishers}
                  selectedCategory={rawFilters.category}
                  selectedPublisher={rawFilters.publisher}
                  onSelectCategory={handleSelectCategory}
                  onSelectPublisher={handleSelectPublisher}
                  onSelectAll={handleSelectAll}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="home-catalogue__content">
          <div
            className={`home-catalogue__filter-bar-container ${
              isMobileFiltersOpen ? 'home-catalogue__filter-bar-container--mobile-open' : ''
            }`}
          >
            <FilterBar
              searchQuery={rawFilters.q}
              selectedLanguage={rawFilters.language}
              selectedFormat={rawFilters.format}
              selectedPriceRange={rawFilters.priceRange}
              selectedSort={rawFilters.sort}
              onSearchChange={(val) => setFilter('q', val)}
              onLanguageChange={(val) => setFilter('language', val)}
              onFormatChange={(val) => setFilter('format', val)}
              onPriceRangeChange={(val) => setFilter('priceRange', val)}
              onSortChange={(val) => setFilter('sort', val)}
            />
          </div>

          <ActiveFilterTags
            category={rawFilters.category}
            publisher={rawFilters.publisher}
            author={rawFilters.author}
            q={rawFilters.q}
            language={rawFilters.language}
            format={rawFilters.format}
            priceRange={rawFilters.priceRange}
            sort={rawFilters.sort}
            categories={categories}
            publishers={publishers}
            authors={authors}
            onRemoveFilter={clearFilter}
            onClearAll={clearAllFilters}
          />

          {/* Shelves or Filtered Results */}
          {hasActiveFilters ? (
            <div className="home-catalogue__results" data-testid="catalogue-results">
              {isLoading ? (
                <BookShelf
                  title="Results"
                  books={[]}
                  loading={true}
                  skeletonCount={6}
                />
              ) : filteredBooks.length === 0 ? (
                <EmptyState
                  title="No books found"
                  description="We couldn't find any books matching your current filters and search criteria. Try modifying or clearing your filters."
                  action={{
                    label: 'Clear all filters',
                    onClick: clearAllFilters,
                  }}
                  className="home-catalogue__empty-state"
                />
              ) : (
                <BookShelf
                  title={`Results (${filteredBooks.length})`}
                  books={filteredBooks}
                  authorsMap={authorsMap}
                  categoriesMap={categoriesMap}
                  loading={false}
                />
              )}
            </div>
          ) : (
            <div className="home-catalogue__shelves" data-testid="catalogue-shelves">
              <BookShelf
                title={recommendedTitle}
                books={recommendations}
                authorsMap={authorsMap}
                categoriesMap={categoriesMap}
                loading={isLoading}
                skeletonCount={3}
              />

              <BookShelf
                title="Bestsellers this Month"
                books={bestsellers}
                authorsMap={authorsMap}
                categoriesMap={categoriesMap}
                loading={isLoading}
                skeletonCount={3}
              />

              <BookShelf
                title="New Launches"
                books={newLaunches}
                authorsMap={authorsMap}
                categoriesMap={categoriesMap}
                loading={isLoading}
                skeletonCount={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
