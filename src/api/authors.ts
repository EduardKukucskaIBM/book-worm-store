import authorsData from '../data/authors.json'
import { Author } from '../types'

export async function getAuthors(): Promise<Author[]> {
  return [...authorsData] as Author[]
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const author = (authorsData as Author[]).find((a) => a.id === id)
  return author ? { ...author } : null
}
