import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { filterEngines, getFilterOptions, getDbStats } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'
import { EngineFilters } from '@/components/EngineFilters'
import { EngineTable } from '@/components/EngineTable'

// Always fetch fresh data — prevents Next.js data cache from hiding new DB rows.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

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
    page?: string
    view?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, brand, emissions } = await searchParams
  if (brand) return { title: `${brand} Diesel Engines`, description: `Browse ${brand} diesel generator engine specifications.` }
  if (emissions) return { title: `${emissions} Engines`, description: `Diesel engines meeting ${emissions} emissions standards.` }
  if (q) return { title: `Search: ${q}`, description: 'Search results for diesel generator engine specifications.' }
  return {
    title: 'Diesel & Gas Generator Engine Specs',
    description: 'The complete database of diesel and gas engine specifications for electrical power generation. Search by brand, model, emissions standard, and power output.',
  }
}

const POWER_PRESETS: { label: string; params: Record<string, string> }[] = [
  { label: 'Under 100 kWe',    params: { max_kwe: '100' } },
  { label: '100 – 500 kWe',    params: { min_kwe: '100', max_kwe: '500' } },
  { label: '500 – 1,500 kWe',  params: { min_kwe: '500', max_kwe: '1500' } },
  { label: '1,500+ kWe',       params: { min_kwe: '1500' } },
]

function presetHref(params: Record<string, string>) {
  return `/engines?${new URLSearchParams(params).toString()}`
}

export default async function EnginesPage({ searchParams }: Props) {
  const p = await searchParams

  const hasFilters = !!(
    p.q || p.brand || p.origin || p.emissions || p.config ||
    p.hz || p.status || p.min_kwe || p.max_kwe
  )

  // ── No filters: landing / discovery view ─────────────────────────────────
  if (!hasFilters) {
    const [stats, options] = await Promise.all([getDbStats(), getFilterOptions()])

    return (
      <div>
        {/* Hero */}
        <div className="text-center py-12 mb-10">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
            Engines for Electrical Power Generation
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {stats.total.toLocaleString()}+ Generator Engine Specifications
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
            The complete reference for <strong className="font-semibold text-gray-700">diesel and gas</strong> engines used in electrical power generation — search specs, datasheets, and manuals by brand, model, emissions standard, and power output.
          </p>

          {/* Stat chips */}
          <div className="flex justify-center gap-6 flex-wrap mb-10">
            {[
              { value: stats.total.toLocaleString(), label: 'Engines' },
              { value: stats.brandCount.toString(), label: 'Brands' },
              { value: stats.originCount.toString(), label: 'Countries' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex justify-center">
            <Suspense>
              <SearchBar defaultValue="" />
            </Suspense>
          </div>
        </div>

        {/* Preset shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          {/* Emissions standards */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Browse by Emissions Standard
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'U.S. EPA',              value: 'U.S. EPA' },
                { label: 'Euro Stage',             value: 'Euro Stage' },
                { label: 'U.S. EPA Final Tier 4',  value: 'U.S. EPA Final Tier 4' },
                { label: 'Euro Stage V',            value: 'Euro Stage V' },
                { label: 'Unregulated',             value: 'Unregulated' },
              ].map(({ label, value }) => (
                <Link
                  key={value}
                  href={presetHref({ emissions: value })}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Power range */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Browse by Power Range
            </h2>
            <div className="flex flex-wrap gap-2">
              {POWER_PRESETS.map(({ label, params }) => (
                <Link
                  key={label}
                  href={presetHref(params)}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Brand grid */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Browse by Brand
            </h2>
            <Link href="/brands" className="text-sm text-blue-600 hover:underline">
              View all brands →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.brands.map((brand) => (
              <Link
                key={brand}
                href={presetHref({ brand })}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Filters active: results view ─────────────────────────────────────────
  const isGrid = p.view === 'grid'
  const currentPage = Math.max(1, Number(p.page) || 1)

  const [allEngines, options] = await Promise.all([
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

  const total = allEngines.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const engines = allEngines.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function pageHref(pg: number) {
    const sp = new URLSearchParams({
      ...(p.q         ? { q: p.q }                 : {}),
      ...(p.brand     ? { brand: p.brand }          : {}),
      ...(p.origin    ? { origin: p.origin }        : {}),
      ...(p.emissions ? { emissions: p.emissions }  : {}),
      ...(p.config    ? { config: p.config }        : {}),
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
          {p.q ? `Results for "${p.q}"` : 'Diesel Engines'}
        </h1>
        <Suspense>
          <SearchBar defaultValue={p.q ?? ''} />
        </Suspense>
      </div>

      <Suspense>
        <EngineFilters options={options} totalCount={total} />
      </Suspense>

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
        <EngineTable engines={allEngines} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {engines.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>

          {totalPages > 1 && (
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
          )}
        </>
      )}
    </div>
  )
}
