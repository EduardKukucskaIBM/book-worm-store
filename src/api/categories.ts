import categoriesData from '../data/categories.json'
import { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  return [...categoriesData] as Category[]
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const cat = (categoriesData as Category[]).find((c) => c.id === id || c.slug === id)
  return cat ? { ...cat } : null
}
