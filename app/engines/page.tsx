import type { Metadata } from 'next'
import { getAllEngines, searchEngines } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Browse All Diesel Engines',
    description: 'Browse the complete database of diesel generator engine specifications.',
  }
}

export default async function EnginesPage({ searchParams }: Props) {
  const { q, status } = await searchParams

  let engines = q ? await searchEngines(q) : await getAllEngines()

  if (status) {
    engines = engines.filter((e) => e.status === status)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {q ? `Results for "${q}"` : 'All Diesel Engines'}
        </h1>
        <SearchBar defaultValue={q ?? ''} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 text-sm">
        {[
          { label: 'All', value: '' },
          { label: 'In Production', value: 'active' },
          { label: 'Discontinued', value: 'discontinued' },
          { label: 'Limited', value: 'limited' },
        ].map(({ label, value }) => {
          const href = value
            ? `/engines${q ? `?q=${encodeURIComponent(q)}&` : '?'}status=${value}`
            : `/engines${q ? `?q=${encodeURIComponent(q)}` : ''}`
          const active = (status ?? '') === value
          return (
            <a
              key={value}
              href={href}
              className={`px-3 py-1.5 rounded-full border font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {label}
            </a>
          )
        })}
        <span className="ml-auto text-gray-400 py-1.5">{engines.length} engines</span>
      </div>

      {engines.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No engines found{q ? ` for "${q}"` : ''}.</p>
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
