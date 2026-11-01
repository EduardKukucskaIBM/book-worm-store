import { Book, Order, User } from '../types'

/**
 * Recommend books based on user purchase history, or fallback to bestsellers.
 */
export function getRecommendations(
  user: User | null | undefined,
  orders: Order[],
  books: Book[],
  limit = 4
): Book[] {
  // If no user or no orders for this user, return top bestsellers / top rated
  const userOrders = user ? orders.filter((o) => o.userId === user.id && o.status !== 'cancelled') : []

  if (!user || userOrders.length === 0) {
    return [...books]
      .sort((a, b) => {
        if (a.isBestseller !== b.isBestseller) {
          return a.isBestseller ? -1 : 1
        }
        return b.rating - a.rating || b.copiesSold - a.copiesSold
      })
      .slice(0, limit)
  }

  // Collect purchased book IDs
  const purchasedBookIds = new Set<string>()
  for (const order of userOrders) {
    for (const item of order.items) {
      purchasedBookIds.add(item.bookId)
    }
  }

  // Identify preferences from purchased books
  const preferredCategoryIds = new Map<string, number>()
  const preferredAuthorIds = new Map<string, number>()
  const preferredPublisherIds = new Map<string, number>()

  for (const book of books) {
    if (purchasedBookIds.has(book.id)) {
      for (const catId of book.categoryIds) {
        preferredCategoryIds.set(catId, (preferredCategoryIds.get(catId) ?? 0) + 1)
      }
      preferredAuthorIds.set(book.authorId, (preferredAuthorIds.get(book.authorId) ?? 0) + 1)
      preferredPublisherIds.set(book.publisherId, (preferredPublisherIds.get(book.publisherId) ?? 0) + 1)
    }
  }

  // Score candidate books (excluding purchased)
  const candidateBooks = books.filter((b) => !purchasedBookIds.has(b.id))

  const scored = candidateBooks.map((book) => {
    let score = 0

    // Category overlap weight (+3 each)
    for (const catId of book.categoryIds) {
      const matchCount = preferredCategoryIds.get(catId) ?? 0
      score += matchCount * 3
    }

    // Author match weight (+5)
    const authorMatchCount = preferredAuthorIds.get(book.authorId) ?? 0
    score += authorMatchCount * 5

    // Publisher match weight (+2)
    const pubMatchCount = preferredPublisherIds.get(book.publisherId) ?? 0
    score += pubMatchCount * 2

    // Popularity tie-breaker
    if (book.isBestseller) score += 1
    score += (book.rating ?? 0) * 0.2

    return { book, score }
  })

  scored.sort((a, b) => b.score - a.score || b.book.rating - a.book.rating)

  const result = scored.slice(0, limit).map((s) => s.book)

  // If we don't have enough, backfill with unpurchased bestsellers
  if (result.length < limit) {
    const includedIds = new Set(result.map((b) => b.id))
    const backfill = candidateBooks
      .filter((b) => !includedIds.has(b.id))
      .sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.rating - a.rating)
      .slice(0, limit - result.length)
    result.push(...backfill)
  }

  return result
}
