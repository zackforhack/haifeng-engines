import type { Metadata } from 'next'
import { Suspense } from 'react'
import { filterEngines, getFilterOptions } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'
import { EngineFilters } from '@/components/EngineFilters'

interface Props {
  searchParams: Promise<{
    q?: string
    brand?: string
    origin?: string
    emissions?: string
    config?: string
    hz?: string
    status?: string
    min_kwe?: string
    max_kwe?: string
    sort?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Browse All Diesel Engines',
    description: 'Browse the complete database of diesel generator engine specifications.',
  }
}

export default async function EnginesPage({ searchParams }: Props) {
  const p = await searchParams

  const [engines, options] = await Promise.all([
    filterEngines({
      q:         p.q,
      brand:     p.brand,
      origin:    p.origin,
      emissions: p.emissions,
      config:    p.config,
      hz:        p.hz === '50' || p.hz === '60' ? p.hz : undefined,
      status:    p.status,
      min_kwe:   p.min_kwe ? Number(p.min_kwe) : undefined,
      max_kwe:   p.max_kwe ? Number(p.max_kwe) : undefined,
      sort:      p.sort,
    }),
    getFilterOptions(),
  ])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {p.q ? `Results for "${p.q}"` : 'All Diesel Engines'}
        </h1>
        <Suspense>
          <SearchBar defaultValue={p.q ?? ''} />
        </Suspense>
      </div>

      <Suspense>
        <EngineFilters options={options} totalCount={engines.length} />
      </Suspense>

      {engines.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No engines found.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map((engine) => (
            <EngineCard key={engine.id} engine={engine} />
          ))}
        </div>
      )}
    </div>
  )
}
