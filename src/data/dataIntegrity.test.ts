import { describe, it, expect } from 'vitest'
import booksData from './books.json'
import authorsData from './authors.json'
import publishersData from './publishers.json'
import categoriesData from './categories.json'

// Referential integrity of the mock JSON: a dangling id would silently drop a
// related book, author, publisher or category from the UI.

interface BookRefs {
  id: string
  authorId: string
  publisherId: string
  categoryIds: string[]
  relatedBookIds: string[]
}

const books = booksData as unknown as BookRefs[]
const bookIds = new Set(books.map((b) => b.id))
const authorIds = new Set(authorsData.map((a) => a.id))
const publisherIds = new Set(publishersData.map((p) => p.id))
const categoryIds = new Set(categoriesData.map((c) => c.id))

describe('mock data integrity', () => {
  it('has unique ids in every collection', () => {
    for (const [name, list] of [
      ['books', books],
      ['authors', authorsData],
      ['publishers', publishersData],
      ['categories', categoriesData],
    ] as const) {
      const ids = list.map((x) => x.id)
      expect(new Set(ids).size, `duplicate id in ${name}`).toBe(ids.length)
    }
  })

  it('every relatedBookIds entry resolves to an existing book (and is not the book itself)', () => {
    const missing = books.flatMap((b) =>
      b.relatedBookIds
        .filter((id) => !bookIds.has(id) || id === b.id)
        .map((id) => `${b.id} -> ${id}`),
    )
    expect(missing).toEqual([])
  })

  it('every book has at least one related book, so Related Reads is never empty', () => {
    expect(books.filter((b) => b.relatedBookIds.length === 0).map((b) => b.id)).toEqual([])
  })

  it('every authorId resolves to an existing author', () => {
    const missing = books.filter((b) => !authorIds.has(b.authorId)).map((b) => `${b.id} -> ${b.authorId}`)
    expect(missing).toEqual([])
  })

  it('every publisherId resolves to an existing publisher', () => {
    const missing = books
      .filter((b) => !publisherIds.has(b.publisherId))
      .map((b) => `${b.id} -> ${b.publisherId}`)
    expect(missing).toEqual([])
  })

  it('every categoryIds entry resolves to an existing category', () => {
    const missing = books.flatMap((b) =>
      b.categoryIds.filter((id) => !categoryIds.has(id)).map((id) => `${b.id} -> ${id}`),
    )
    expect(missing).toEqual([])
  })

  it('every author bookIds entry and category parentId resolves', () => {
    const missingBooks = authorsData.flatMap((a) =>
      a.bookIds.filter((id) => !bookIds.has(id)).map((id) => `${a.id} -> ${id}`),
    )
    const missingParents = categoriesData
      .filter((c) => 'parentId' in c && c.parentId && !categoryIds.has(c.parentId as string))
      .map((c) => c.id)
    expect(missingBooks).toEqual([])
    expect(missingParents).toEqual([])
  })
})
