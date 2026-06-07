import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { filterEngines, getFilterOptions, getDbStats } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { SearchBar } from '@/components/SearchBar'
import { EngineFilters } from '@/components/EngineFilters'
import { EngineTable } from '@/components/EngineTable'
import { CountUp } from '@/components/CountUp'

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
    fuel?: string
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
  const { q, brand, emissions, fuel } = await searchParams
  // Filtered views share one canonical (/engines) so filter permutations don't
  // dilute as duplicate URLs; brand/model pages are indexed on their own paths.
  const canonical = { alternates: { canonical: '/engines' } }
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
    p.q || p.brand || p.origin || p.emissions || p.config || p.fuel ||
    p.hz || p.status || p.min_kwe || p.max_kwe
  )

  // ── No filters: landing / discovery view ─────────────────────────────────
  if (!hasFilters) {
    const [stats, options] = await Promise.all([getDbStats(), getFilterOptions()])

    return (
      <div>
        {/* Hero — futuristic animated background panel */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-10 shadow-xl">
          <div className="hero-photo" aria-hidden="true">
            <div className="img" />
            <div className="overlay" />
          </div>

          <div className="relative z-10 text-center px-6 py-16 sm:py-24">
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-cyan-200 bg-white/10 border border-white/20 backdrop-blur rounded-full px-3 py-1 mb-5">
              Engines for Electrical Power Generation
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-white">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                <CountUp end={stats.total} />+
              </span>{' '}
              Generator Engine Specifications
            </h1>
            <p className="text-slate-300 text-lg mb-9 max-w-2xl mx-auto">
              The complete reference for <strong className="font-semibold text-white">diesel and gas</strong> engines used in electrical power generation — search specs, datasheets, and manuals by brand, model, emissions standard, and power output.
            </p>

            {/* Stat chips */}
            <div className="flex justify-center gap-8 sm:gap-12 flex-wrap mb-10">
              {[
                { value: stats.total, label: 'Engines' },
                { value: stats.brandCount, label: 'Brands' },
                { value: stats.originCount, label: 'Countries' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-cyan-300"><CountUp end={value} /></p>
                  <p className="text-sm text-slate-400 mt-0.5">{label}</p>
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
        </div>

        {/* Fuel type */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Browse by Fuel Type
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Diesel', value: 'diesel' },
              { label: 'Gas (Natural Gas · CNG/LNG · Biogas)', value: 'gas' },
            ].map(({ label, value }) => (
              <Link
                key={value}
                href={presetHref({ fuel: value })}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {label}
              </Link>
            ))}
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
      fuel:      p.fuel === 'diesel' || p.fuel === 'gas' ? p.fuel : undefined,
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
      ...(p.fuel      ? { fuel: p.fuel }            : {}),
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
