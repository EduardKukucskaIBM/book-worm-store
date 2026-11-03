import type { ReactElement } from 'react'
import { Search, Select, SelectItem } from '@carbon/react'
import { BookFormat, SortOption } from '../../types'
import './FilterBar.scss'

export interface FilterBarProps {
  searchQuery: string
  selectedLanguage: string
  selectedFormat: string
  selectedPriceRange: string
  selectedSort: string
  onSearchChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onFormatChange: (value: string) => void
  onPriceRangeChange: (value: string) => void
  onSortChange: (value: string) => void
  className?: string
}

export const FilterBar = ({
  searchQuery,
  selectedLanguage = 'all',
  selectedFormat = 'all',
  selectedPriceRange = 'all',
  selectedSort = 'relevance',
  onSearchChange,
  onLanguageChange,
  onFormatChange,
  onPriceRangeChange,
  onSortChange,
  className = '',
}: FilterBarProps): ReactElement => {
  return (
    <div className={`filter-bar ${className}`.trim()} role="search" aria-label="Book Catalogue Filters">
      <div className="filter-bar__search">
        <label htmlFor="catalogue-search" className="filter-bar__label">
          Search you want to read here
        </label>
        <Search
          id="catalogue-search"
          labelText="Search you want to read here"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          size="md"
        />
      </div>

      <div className="filter-bar__selects">
        <div className="filter-bar__item">
          <Select
            id="filter-language"
            labelText="Language"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            size="md"
          >
            <SelectItem value="all" text="All" />
            <SelectItem value="English" text="English" />
            <SelectItem value="Hindi" text="Hindi" />
            <SelectItem value="Spanish" text="Spanish" />
            <SelectItem value="French" text="French" />
          </Select>
        </div>

        <div className="filter-bar__item">
          <Select
            id="filter-format"
            labelText="Format (Paperback, ebook etc)"
            value={selectedFormat}
            onChange={(e) => onFormatChange(e.target.value as BookFormat | 'all')}
            size="md"
          >
            <SelectItem value="all" text="All" />
            <SelectItem value="Paperback" text="Paperback" />
            <SelectItem value="Hardcover" text="Hardcover" />
            <SelectItem value="eBook" text="eBook" />
          </Select>
        </div>

        <div className="filter-bar__item">
          <Select
            id="filter-price-range"
            labelText="Price Range"
            value={selectedPriceRange}
            onChange={(e) => onPriceRangeChange(e.target.value)}
            size="md"
          >
            <SelectItem value="all" text="All" />
            <SelectItem value="0-200" text="Under ₹200" />
            <SelectItem value="200-400" text="₹200 - ₹400" />
            <SelectItem value="400-600" text="₹400 - ₹600" />
            <SelectItem value="600+" text="Above ₹600" />
          </Select>
        </div>

        <div className="filter-bar__item">
          <Select
            id="filter-sort"
            labelText="Sort by"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            size="md"
          >
            <SelectItem value="relevance" text="Relevance" />
            <SelectItem value="price-low-high" text="Price: Low to High" />
            <SelectItem value="price-high-low" text="Price: High to Low" />
            <SelectItem value="rating-high-low" text="Customer Rating" />
            <SelectItem value="newest" text="Newest Arrivals" />
            <SelectItem value="bestselling" text="Bestsellers" />
          </Select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
