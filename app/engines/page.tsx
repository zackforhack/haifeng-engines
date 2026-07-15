import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { filterEngines, getFilterOptions } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'
import { EngineFilters } from '@/components/EngineFilters'
import { EngineTable } from '@/components/EngineTable'
import { BrowseFacets } from '@/components/BrowseFacets'
import { CommercialPathways } from '@/components/CommercialPathways'
import { ENGINE_GRID_PAGE_SIZE, ENGINE_TABLE_PAGE_SIZE, hasSearchParams, noindexFollowRobots } from '@/lib/seo'

// Always fetch fresh data — prevents Next.js data cache from hiding new DB rows.
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    q?: string
    brand?: string
    origin?: string
    emissions?: string
    config?: string
    fuel?: string
    fuel_type?: string
    hz?: string
    status?: string
    min_kwe?: string
    max_kwe?: string
    sort?: string
    page?: string
    view?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams
  const { q, brand, emissions, fuel } = p
  // Filtered views share one canonical (/engines) so filter permutations don't
  // dilute as duplicate URLs; brand/model pages are indexed on their own paths.
  const canonical = {
    alternates: { canonical: '/engines' },
    ...(hasSearchParams(p) ? { robots: noindexFollowRobots } : {}),
  }
  if (brand) return { ...canonical, title: `${brand} Generator Engines`, description: `Browse ${brand} diesel and gas generator engine specifications.` }
  if (fuel === 'gas') return { ...canonical, title: 'Gas Generator Engines', description: 'Natural gas, CNG/LNG and biogas engine specifications for electrical power generation.' }
  if (fuel === 'diesel') return { ...canonical, title: 'Diesel Generator Engines', description: 'Diesel engine specifications for electrical power generation.' }
  if (emissions) return { ...canonical, title: `${emissions} Engines`, description: `Generator engines meeting ${emissions} emissions standards.` }
  if (q) return { ...canonical, title: `Search: ${q}`, description: 'Search results for diesel and gas generator engine specifications.' }
  return {
    ...canonical,
    title: 'Diesel & Gas Generator Engine Specs',
    description: 'The complete database of diesel and gas engine specifications for electrical power generation. Search by brand, model, emissions standard, and power output.',
  }
}

export default async function EnginesPage({ searchParams }: Props) {
  const p = await searchParams

  const hasFilters = !!(
    p.q || p.brand || p.origin || p.emissions || p.config || p.fuel || p.fuel_type ||
    p.hz || p.status || p.min_kwe || p.max_kwe
  )

  const isGrid = p.view === 'grid'
  const pageSize = isGrid ? ENGINE_GRID_PAGE_SIZE : ENGINE_TABLE_PAGE_SIZE
  const currentPage = Math.max(1, Number(p.page) || 1)

  const [allEngines, options] = await Promise.all([
    filterEngines({
      q:         p.q,
      brand:     p.brand,
      origin:    p.origin,
      emissions: p.emissions,
      config:    p.config,
      fuel:      p.fuel === 'diesel' || p.fuel === 'gas' ? p.fuel : undefined,
      fuel_type: p.fuel_type,
      hz:        p.hz === '50' || p.hz === '60' ? p.hz : undefined,
      status:    p.status,
      min_kwe:   p.min_kwe ? Number(p.min_kwe) : undefined,
      max_kwe:   p.max_kwe ? Number(p.max_kwe) : undefined,
      sort:      p.sort,
    }),
    getFilterOptions(),
  ])

  const total = allEngines.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const engines = allEngines.slice((safePage - 1) * pageSize, safePage * pageSize)

  function pageHref(pg: number) {
    const sp = new URLSearchParams({
      ...(p.q         ? { q: p.q }                 : {}),
      ...(p.brand     ? { brand: p.brand }          : {}),
      ...(p.origin    ? { origin: p.origin }        : {}),
      ...(p.emissions ? { emissions: p.emissions }  : {}),
      ...(p.config    ? { config: p.config }        : {}),
      ...(p.fuel      ? { fuel: p.fuel }            : {}),
      ...(p.fuel_type ? { fuel_type: p.fuel_type }  : {}),
      ...(p.hz        ? { hz: p.hz }                : {}),
      ...(p.status    ? { status: p.status }        : {}),
      ...(p.min_kwe   ? { min_kwe: p.min_kwe }      : {}),
      ...(p.max_kwe   ? { max_kwe: p.max_kwe }      : {}),
      ...(p.sort      ? { sort: p.sort }            : {}),
      ...(pg > 1      ? { page: String(pg) }        : {}),
    })
    return `/engines?${sp.toString()}`
  }

  function viewHref(v: 'table' | 'grid') {
    const sp = new URLSearchParams({
      ...(p.q         ? { q: p.q }                 : {}),
      ...(p.brand     ? { brand: p.brand }          : {}),
      ...(p.origin    ? { origin: p.origin }        : {}),
      ...(p.emissions ? { emissions: p.emissions }  : {}),
      ...(p.config    ? { config: p.config }        : {}),
      ...(p.fuel      ? { fuel: p.fuel }            : {}),
      ...(p.fuel_type ? { fuel_type: p.fuel_type }  : {}),
      ...(p.hz        ? { hz: p.hz }                : {}),
      ...(p.status    ? { status: p.status }        : {}),
      ...(p.min_kwe   ? { min_kwe: p.min_kwe }      : {}),
      ...(p.max_kwe   ? { max_kwe: p.max_kwe }      : {}),
      ...(p.sort      ? { sort: p.sort }            : {}),
      ...(v === 'grid' ? { view: 'grid' }           : {}),
    })
    return `/engines?${sp.toString()}`
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {p.q ? `Results for "${p.q}"` : 'Generator Engine Specifications'}
        </h1>
        <Suspense>
          <SearchBar defaultValue={p.q ?? ''} />
        </Suspense>
      </div>

      <Suspense>
        <EngineFilters options={options} totalCount={total} />
      </Suspense>

      {!hasFilters && (
        <CommercialPathways
          eyebrow="Generator package routes"
          title="Shortlist engines here, then choose the right Haifeng package path"
          intro="The catalog helps compare model specifications before inquiry. These commercial routes connect engine shortlists to EPA standby diesel, gas, towable, EPC, and general industrial generator package pages."
        />
      )}

      {/* View toggle */}
      {total > 0 && (
        <div className="flex gap-1 mb-4">
          <Link
            href={viewHref('table')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              !isGrid
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            Table
          </Link>
          <Link
            href={viewHref('grid')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              isGrid
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            Grid
          </Link>
        </div>
      )}

      {total === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No engines found.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : !isGrid ? (
        <EngineTable engines={engines} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map((engine) => (
            <EngineCard key={engine.id} engine={engine} />
          ))}
        </div>
      )}

      {total > pageSize && (
        <>
          {!isGrid && (
            <p className="text-xs text-gray-400 mt-3">
              Showing {((safePage - 1) * pageSize + 1).toLocaleString()}-{Math.min(safePage * pageSize, total).toLocaleString()} of {total.toLocaleString()} engines.
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-10">
            {safePage > 1 ? (
              <Link
                href={pageHref(safePage - 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-blue-500 hover:text-blue-700 bg-white transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-300 bg-white cursor-not-allowed select-none">
                ← Previous
              </span>
            )}

            <span className="text-sm text-gray-500 px-3">
              Page {safePage} of {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={pageHref(safePage + 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-blue-500 hover:text-blue-700 bg-white transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-300 bg-white cursor-not-allowed select-none">
                Next →
              </span>
            )}
          </div>
        </>
      )}

      {/* Internal-linking hub — shown on the canonical (unfiltered) listing. */}
      {!hasFilters && <BrowseFacets />}
    </div>
  )
}
