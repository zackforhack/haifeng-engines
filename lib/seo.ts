import type { Metadata } from 'next'
import type { Engine } from '@/lib/types'

export const ENGINE_TABLE_PAGE_SIZE = 72
export const ENGINE_GRID_PAGE_SIZE = 24
export const ENGINE_HUB_DISPLAY_LIMIT = 120
export const STRUCTURED_DATA_ITEM_LIMIT = 100

export const noindexFollowRobots: Metadata['robots'] = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
}

export function hasSearchParams(params: Record<string, string | undefined>): boolean {
  return Object.values(params).some((value) => value != null && value !== '')
}

export function limitedEngines(engines: Engine[], limit = ENGINE_HUB_DISPLAY_LIMIT): Engine[] {
  return engines.slice(0, limit)
}

export function brandSlug(brand: string): string {
  return brand
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveBrandSlug(input: string, brands: string[]): string | null {
  const normalized = brandSlug(input)
  const lower = input.trim().toLowerCase()
  return brands.find((brand) => brandSlug(brand) === normalized || brand.toLowerCase() === lower) ?? null
}
