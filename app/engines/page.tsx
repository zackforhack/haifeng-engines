import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Grid2X2, List } from 'lucide-react'
import { getFilterOptions, searchEnginesPage } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'
import { EngineFilters } from '@/components/EngineFilters'
import { EngineSortSelect } from '@/components/EngineCatalogControls'
import { EngineTable } from '@/components/EngineTable'
import { BrowseFacets } from '@/components/BrowseFacets'
import { CommercialPathways } from '@/components/CommercialPathways'
import { ENGINE_GRID_PAGE_SIZE, ENGINE_TABLE_PAGE_SIZE, hasSearchParams, noindexFollowRobots } from '@/lib/seo'
import type { Engine } from '@/lib/types'

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
  if (fuel === 'gas') return { ...canonical, title: 'Gas Generator Engines', description: 'Natural gas, propane (LPG), and biogas engine specifications for electrical power generation.' }
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
    p.hz || p.status
  )

  const isGrid = p.view === 'grid'
  const currentPage = Math.max(1, Number(p.page) || 1)

  const requestedPageSize = isGrid ? ENGINE_GRID_PAGE_SIZE : ENGINE_TABLE_PAGE_SIZE
  const [result, options] = await Promise.all([
    searchEnginesPage({
      q:         p.q,
      brand:     p.brand,
      origin:    p.origin,
      emissions: p.emissions,
      config:    p.config,
      fuel:      p.fuel === 'diesel' || p.fuel === 'gas' ? p.fuel : undefined,
      fuel_type: p.fuel_type,
      hz:        p.hz === '50' || p.hz === '60' ? p.hz : undefined,
      status:    p.status,
      sort:      p.sort,
    }, { page: currentPage, pageSize: requestedPageSize }),
    getFilterOptions(),
  ])

  const total = result.total
  const pageSize = result.pageSize
  const totalPages = result.totalPages
  const safePage = result.page
  const engines = result.engines
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
      ...(p.sort      ? { sort: p.sort }            : {}),
      ...(p.view      ? { view: p.view }            : {}),
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
      ...(p.sort      ? { sort: p.sort }            : {}),
      ...(v === 'grid' ? { view: 'grid' }           : {}),
    })
    return `/engines?${sp.toString()}`
  }

  function hrefWithout(keys: string[]) {
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
      ...(p.sort      ? { sort: p.sort }            : {}),
      ...(p.view      ? { view: p.view }            : {}),
    })
    for (const key of keys) sp.delete(key)
    sp.delete('page')
    const qs = sp.toString()
    return qs ? `/engines?${qs}` : '/engines'
  }

  const statusLabel: Record<string, string> = {
    active: 'Active',
    discontinued: 'Discontinued',
    limited: 'Limited',
  }
  const activeCriteria = [
    ...(p.q ? [{ label: 'Search', value: p.q, href: hrefWithout(['q']) }] : []),
    ...(p.brand ? [{ label: 'Brand', value: p.brand, href: hrefWithout(['brand']) }] : []),
    ...(p.origin ? [{ label: 'Origin', value: p.origin, href: hrefWithout(['origin']) }] : []),
    ...(p.emissions ? [{ label: 'Emissions', value: p.emissions, href: hrefWithout(['emissions']) }] : []),
    ...(p.config ? [{ label: 'Configuration', value: p.config, href: hrefWithout(['config']) }] : []),
    ...(p.fuel ? [{ label: 'Fuel', value: p.fuel === 'gas' ? 'Gas' : 'Diesel', href: hrefWithout(['fuel']) }] : []),
    ...(p.fuel_type ? [{ label: 'Fuel type', value: p.fuel_type, href: hrefWithout(['fuel_type']) }] : []),
    ...(p.hz ? [{ label: 'Frequency', value: `${p.hz} Hz`, href: hrefWithout(['hz']) }] : []),
    ...(p.status ? [{ label: 'Status', value: statusLabel[p.status] ?? p.status, href: hrefWithout(['status']) }] : []),
  ]

  return (
    <div>
      <div className="catalog-grid border-b border-gray-900 pb-8 pt-2 mb-8">
        <p className="section-index mb-4">01 Engine catalog</p>
        <h1 className="brand-display mb-6 font-bold text-gray-900">
          {p.q ? `Results for "${p.q}"` : 'Generator Engine Specifications'}
        </h1>
      </div>

      {!hasFilters && <BrowseFacets />}

      <section className="mb-8 border-y border-gray-900 bg-white">
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <Suspense>
            <SearchBar defaultValue={p.q ?? ''} viewOnSearch="grid" className="w-full" />
          </Suspense>
          <div className="lg:min-w-64">
            <p className="text-sm font-bold text-gray-900">{resultLabel}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Search by brand, model, series, fuel, frequency, emissions, and package-fit criteria.
            </p>
          </div>
        </div>

        {activeCriteria.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Active criteria</span>
              {activeCriteria.map((item) => (
                <Link
                  key={`${item.label}:${item.value}`}
                  href={item.href}
                  className="inline-flex min-h-8 items-center gap-2 border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-medium text-blue-900 hover:bg-blue-50"
                >
                  <span className="font-bold text-gray-900">{item.label}</span>
                  {item.value}
                  <span aria-hidden="true" className="text-blue-700">×</span>
                </Link>
              ))}
              <Link href={p.view === 'grid' ? '/engines?view=grid' : '/engines'} className="ml-auto text-xs font-bold text-blue-600 hover:underline">
                Clear all
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Suspense>
              <EngineSortSelect />
            </Suspense>
            <span className="text-xs text-gray-500">
              {isGrid ? 'Cards show individual engine records.' : 'Matrix groups engines by power band and brand.'}
            </span>
          </div>
          <div className="flex border border-gray-900 bg-white" aria-label="Catalog view">
            <Link
              href={viewHref('table')}
              title="Matrix view"
              className={`flex min-h-10 items-center justify-center gap-2 border-r border-gray-900 px-3 text-sm font-semibold ${
                !isGrid ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <List aria-hidden="true" className="h-4 w-4" />
              Matrix
            </Link>
            <Link
              href={viewHref('grid')}
              title="Cards view"
              className={`flex min-h-10 items-center justify-center gap-2 px-3 text-sm font-semibold ${
                isGrid ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Grid2X2 aria-hidden="true" className="h-4 w-4" />
              Cards
            </Link>
          </div>
        </div>
      </section>

      <div className="min-w-0 xl:grid xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-8">
        <Suspense>
          <EngineFilters options={options} />
        </Suspense>

        <div className="min-w-0">
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
            <div className="mt-14">
              <CommercialPathways
                eyebrow="Package routes"
                title="Shortlist engines here, then choose the right Haifeng package path"
                intro="The catalog helps compare model specifications before inquiry. These commercial routes connect engine shortlists to EPA standby diesel, gas, towable, EPC, and general industrial generator package pages."
              />
            </div>
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
