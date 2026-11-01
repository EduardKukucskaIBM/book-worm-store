import publishersData from '../data/publishers.json'
import { Publisher } from '../types'

export async function getPublishers(): Promise<Publisher[]> {
  return [...publishersData] as Publisher[]
}

export async function getPublisherById(id: string): Promise<Publisher | null> {
  const pub = (publishersData as Publisher[]).find((p) => p.id === id)
  return pub ? { ...pub } : null
}
