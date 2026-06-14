import Fuse from 'fuse.js'
import type { Product } from './types'

export function createFuseIndex(products: Product[]) {
  return new Fuse(products, {
    threshold: 0.4,
    includeScore: true,
    useExtendedSearch: false,
    keys: [
      { name: 'title', weight: 1.0 },
      { name: 'aliases', weight: 0.9 },
      { name: 'slug', weight: 0.6 },
      { name: 'description', weight: 0.2 },
    ],
  })
}

export function searchProducts(fuse: Fuse<Product>, query: string): Product[] {
  if (!query.trim()) return []
  return fuse.search(query).map((r) => r.item)
}
