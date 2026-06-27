import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { EngineTable } from '@/components/EngineTable'
import { HubContent } from '@/components/HubContent'
import { computeHubStats } from '@/lib/hub-stats'
import { brandSlug, limitedEngines, ENGINE_HUB_DISPLAY_LIMIT } from '@/lib/seo'

export interface FacetSibling { label: string; href: string; active?: boolean }

// Shared body for the engine facet hub pages (configuration / emissions / rpm). The breadcrumb +
// sibling chips weave the facets into a tight internal-link mesh that funnels crawl equity down to
// the engine detail pages.
export function FacetHub({
  facetLabel, h1, intro, subject, engines, siblings, siblingHeading,
}: {
  facetLabel: string
  h1: string
  intro: string
  subject: string
  engines: Engine[]
  siblings: FacetSibling[]
  siblingHeading: string
}) {
  const stats = computeHubStats(engines)
  const brands = stats.brandCount
  const related = stats.topBrands.map((b) => ({
    label: `${b.name} engines`,
    href: `/brands/${brandSlug(b.name)}`,
  }))
  const displayedEngines = limitedEngines(engines)
  return (
    <div>
      <nav className="text-sm text-gray-400 mb-4">
        <Link href="/engines" className="hover:text-blue-600">Engines</Link>
        {' / '}<span className="text-gray-700">{facetLabel}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{h1}</h1>
      <p className="text-gray-500 mb-5 max-w-3xl">
        {intro}{' '}
        <span className="text-gray-400">({engines.length.toLocaleString()} models across {brands} brands.)</span>
      </p>

      {siblings.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 mb-2">{siblingHeading}</p>
          <div className="flex flex-wrap gap-2">
            {siblings.map((s) =>
              s.active ? (
                <span key={s.href} className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white font-medium">{s.label}</span>
              ) : (
                <Link key={s.href} href={s.href} className="px-3 py-1 text-sm rounded-full bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-700 transition-colors">
                  {s.label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}

      <EngineTable engines={displayedEngines} />
      {engines.length > displayedEngines.length && (
        <p className="text-xs text-gray-400 mt-3">
          Showing the first {ENGINE_HUB_DISPLAY_LIMIT.toLocaleString()} of {engines.length.toLocaleString()} models on this hub page. Use the filters on the main engine database for the full set.
        </p>
      )}

      <div className="mt-8 text-sm">
        <Link href="/engines" className="text-blue-600 hover:underline">← All engines</Link>
      </div>

      <HubContent subject={subject} engines={engines} related={related} />
    </div>
  )
}
