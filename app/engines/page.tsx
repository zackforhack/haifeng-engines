import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Grid2X2, List } from 'lucide-react'
import { filterEngines, getFilterOptions } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'
import { EngineFilters } from '@/components/EngineFilters'
import { EngineTable } from '@/components/EngineTable'
import { BrowseFacets } from '@/components/BrowseFacets'
import { CommercialPathways } from '@/components/CommercialPathways'
import { ENGINE_GRID_PAGE_SIZE, ENGINE_TABLE_PAGE_SIZE, hasSearchParams, noindexFollowRobots } from '@/lib/seo'
import type { Engine } from '@/lib/types'

// Always fetch fresh data — prevents Next.js data cache from hiding new DB rows.
export const dynamic = 'force-dynamic'

// The table is a brand-by-power-band comparison matrix. Paginating its input
// produces incomplete bands (for example, later-alphabet gas brands disappear
// from 2,000+ kWe), so keep common filtered catalogs together. Broad and
// unfiltered catalogs still use normal pagination below.
const FILTERED_TABLE_FULL_RESULT_LIMIT = 500

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
  const pageSize = !isGrid && hasFilters && total > 0 && total <= FILTERED_TABLE_FULL_RESULT_LIMIT
    ? total
    : isGrid ? ENGINE_GRID_PAGE_SIZE : ENGINE_TABLE_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const engines = allEngines.slice((safePage - 1) * pageSize, safePage * pageSize)
  const resultLabel = `${total.toLocaleString()} matching engine${total !== 1 ? 's' : ''}`

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
      <div className="catalog-grid border-b border-gray-900 pb-8 pt-2 mb-8">
        <p className="section-index mb-4">01 Engine catalog</p>
        <h1 className="brand-display mb-6 font-bold text-gray-900">
          {p.q ? `Results for "${p.q}"` : 'Generator Engine Specifications'}
        </h1>
        <div className="max-w-2xl">
          <Suspense>
            <SearchBar defaultValue={p.q ?? ''} viewOnSearch="grid" />
          </Suspense>
        </div>
      </div>

      <div className="min-w-0 xl:grid xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-8">
        <Suspense>
          <EngineFilters options={options} totalCount={total} />
        </Suspense>

        <div className="min-w-0">
          {total > 0 && (
            <div className="mb-5 flex flex-col gap-3 border-t border-gray-900 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">{resultLabel}</h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
                  {isGrid
                    ? 'Grid view shows each engine as a specification card.'
                    : 'Table view becomes cards on mobile and a brand-by-power matrix on desktop.'}
                </p>
              </div>
              <div className="flex border border-gray-900 bg-white" aria-label="Catalog view">
                <Link
                  href={viewHref('table')}
                  title="Table view"
                  className={`flex h-9 w-10 items-center justify-center border-r border-gray-900 ${
                    !isGrid ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <List aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Table</span>
                </Link>
                <Link
                  href={viewHref('grid')}
                  title="Grid view"
                  className={`flex h-9 w-10 items-center justify-center ${
                    isGrid ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Grid2X2 aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Grid</span>
                </Link>
              </div>
            </div>
          )}

          {total === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No engines found.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
          ) : !isGrid ? (
        <>
          <div className="xl:hidden">
            <EngineCardGrid engines={engines} />
          </div>
          <div className="hidden xl:block">
            <EngineTable engines={engines} />
          </div>
          {hasFilters && total > ENGINE_TABLE_PAGE_SIZE && total <= FILTERED_TABLE_FULL_RESULT_LIMIT && (
            <p className="text-xs text-gray-400 mt-3">
              Showing all {total.toLocaleString()} filtered engines.
            </p>
          )}
        </>
          ) : (
        <EngineCardGrid engines={engines} />
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
                className="flex items-center gap-2 border border-gray-900 bg-white px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <span className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 text-sm text-gray-300 cursor-not-allowed select-none">
                <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous
              </span>
            )}

            <span className="text-sm text-gray-500 px-3">
              Page {safePage} of {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={pageHref(safePage + 1)}
                className="flex items-center gap-2 border border-gray-900 bg-white px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
              >
                Next <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 text-sm text-gray-300 cursor-not-allowed select-none">
                Next <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </span>
            )}
          </div>
        </>
          )}

          {/* Internal-linking hub — shown on the canonical (unfiltered) listing. */}
          {!hasFilters && (
            <>
              <CommercialPathways
                eyebrow="Package routes"
                title="Shortlist engines here, then choose the right Haifeng package path"
                intro="The catalog helps compare model specifications before inquiry. These commercial routes connect engine shortlists to EPA standby diesel, gas, towable, EPC, and general industrial generator package pages."
              />
              <BrowseFacets />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function EngineCardGrid({ engines }: { engines: Engine[] }) {
  return (
    <div className="grid grid-cols-1 border-t border-gray-900 sm:grid-cols-2 lg:grid-cols-3">
      {engines.map((engine) => (
        <EngineCard key={engine.id} engine={engine} />
      ))}
    </div>
  )
}
