import booksData from '../data/books.json'
import authorsData from '../data/authors.json'
import publishersData from '../data/publishers.json'
import categoriesData from '../data/categories.json'
import {
  Author,
  Book,
  BookWithDetails,
  CatalogueFilters,
  Category,
  Publisher,
  Review,
} from '../types'

// In-memory reviews store to allow adding reviews at runtime
const dynamicReviews: Record<string, Review[]> = {}

export async function getBooks(filters?: CatalogueFilters): Promise<Book[]> {
  let list = (booksData as Book[]).map((book) => ({
    ...book,
    reviews: [...(book.reviews ?? []), ...(dynamicReviews[book.id] ?? [])],
  }))

  if (!filters) {
    return list
  }

  // 1. Category filter (supports id or slug, and matching child categories if parent is passed)
  if (filters.category && filters.category !== 'all') {
    const matchedCategory = (categoriesData as Category[]).find(
      (c) => c.id === filters.category || c.slug === filters.category
    )
    if (matchedCategory) {
      // Find all child category IDs if this is a parent category
      const childCatIds = (categoriesData as Category[])
        .filter((c) => c.parentId === matchedCategory.id)
        .map((c) => c.id)
      const validCategoryIds = new Set([matchedCategory.id, ...childCatIds])

      list = list.filter((book) => book.categoryIds.some((catId) => validCategoryIds.has(catId)))
    } else {
      list = list.filter((book) => book.categoryIds.includes(filters.category!))
    }
  }

  // 2. Publisher filter
  if (filters.publisher && filters.publisher !== 'all') {
    list = list.filter((book) => book.publisherId === filters.publisher)
  }

  // 3. Author filter
  if (filters.author && filters.author !== 'all') {
    list = list.filter((book) => book.authorId === filters.author)
  }

  // 4. Format filter
  if (filters.format && (filters.format as string) !== 'all') {
    list = list.filter((book) => book.format === filters.format)
  }

  // 5. Language filter
  if (filters.language && filters.language !== 'all') {
    list = list.filter(
      (book) => book.language.toLowerCase() === filters.language!.toLowerCase()
    )
  }

  // 6. Price range filter
  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    list = list.filter((book) => book.price >= min && book.price <= max)
  }

  // 7. Search query filter
  if (filters.q && filters.q.trim()) {
    const query = filters.q.trim().toLowerCase()
    const authorMap = new Map((authorsData as Author[]).map((a) => [a.id, a.name.toLowerCase()]))
    list = list.filter((book) => {
      const authorName = authorMap.get(book.authorId) ?? ''
      return (
        book.title.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        (book.longDescription && book.longDescription.toLowerCase().includes(query)) ||
        authorName.includes(query) ||
        (book.isbn && book.isbn.toLowerCase().includes(query))
      )
    })
  }

  // 8. Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-low-high':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating-high-low':
        list.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
        break
      case 'newest':
        list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
      case 'bestselling':
        list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.copiesSold - a.copiesSold)
        break
      case 'relevance':
      default:
        // Keep natural / bestseller prioritized order
        break
    }
  }

  return list
}

export async function getBookById(id: string): Promise<BookWithDetails | null> {
  const book = (booksData as Book[]).find((b) => b.id === id)
  if (!book) return null

  const author = (authorsData as Author[]).find((a) => a.id === book.authorId)
  const publisher = (publishersData as Publisher[]).find((p) => p.id === book.publisherId)
  const categories = (categoriesData as Category[]).filter((c) => book.categoryIds.includes(c.id))
  const reviews = [...(book.reviews ?? []), ...(dynamicReviews[book.id] ?? [])]

  return {
    ...book,
    reviews,
    author,
    publisher,
    categories,
  }
}

export async function getRelatedBooks(bookId: string, limit = 4): Promise<Book[]> {
  const book = (booksData as Book[]).find((b) => b.id === bookId)
  if (!book) return []

  const related = (booksData as Book[]).filter((b) => book.relatedBookIds.includes(b.id))
  if (related.length >= limit) {
    return related.slice(0, limit)
  }

  // If fewer related books exist, backfill with same category books
  const sameCategory = (booksData as Book[]).filter(
    (b) => b.id !== bookId && !book.relatedBookIds.includes(b.id) && b.categoryIds.some((c) => book.categoryIds.includes(c))
  )

  return [...related, ...sameCategory].slice(0, limit)
}

export async function getBestsellers(limit = 6): Promise<Book[]> {
  const books = await getBooks()
  return books
    .filter((b) => b.isBestseller)
    .sort((a, b) => b.copiesSold - a.copiesSold || b.rating - a.rating)
    .slice(0, limit)
}

export async function getNewLaunches(limit = 6): Promise<Book[]> {
  const books = await getBooks()
  return books
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}

export async function addBookReview(
  bookId: string,
  reviewInput: Omit<Review, 'id' | 'createdAt'>
): Promise<Review> {
  const newReview: Review = {
    ...reviewInput,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookId,
    createdAt: new Date().toISOString(),
  }

  if (!dynamicReviews[bookId]) {
    dynamicReviews[bookId] = []
  }
  dynamicReviews[bookId].unshift(newReview)

  return newReview
}
