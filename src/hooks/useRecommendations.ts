import { useMemo } from 'react'
import { Book } from '../types'
import { useAuth, useOrders } from '../context'
import { getRecommendations } from '../utils/recommendations'

export interface UseRecommendationsResult {
  recommendations: Book[]
  title: string
  isGuest: boolean
}

export function useRecommendations(books: Book[], limit = 3): UseRecommendationsResult {
  const { user, isAuthenticated } = useAuth()
  const { orders } = useOrders()

  const recommendations = useMemo(() => {
    return getRecommendations(user, orders, books, limit)
  }, [user, orders, books, limit])

  const title = isAuthenticated && user ? 'Recommended for You' : 'Popular right now'

  return {
    recommendations,
    title,
    isGuest: !isAuthenticated || !user,
  }
}
