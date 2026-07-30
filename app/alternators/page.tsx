import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Grid2X2,
  List,
} from 'lucide-react'
import { filterAlternators, getAlternatorFilterOptions } from '@/lib/alternators'
import { SearchBar } from '@/components/SearchBar'
import { AlternatorFilters } from '@/components/AlternatorFilters'
import type { Alternator } from '@/lib/types'
import { hasSearchParams, noindexFollowRobots } from '@/lib/seo'
import { PRIORITY_MODEL_SPECS } from '@/lib/seo-opportunities'

const PAGE_SIZE = 24

const KVA_RANGES = [
  { label: '< 100 kVA',          min: 0,    max: 99 },
  { label: '100 – 499 kVA',      min: 100,  max: 499 },
  { label: '500 – 999 kVA',      min: 500,  max: 999 },
  { label: '1,000 – 2,499 kVA',  min: 1000, max: 2499 },
  { label: '2,500+ kVA',         min: 2500, max: Infinity },
]

const PRIORITY_ALTERNATOR_SPECS = PRIORITY_MODEL_SPECS.filter((spec) => spec.type === 'alternator')

interface Props {
  searchParams: Promise<{
    q?: string
    brand?: string
    series?: string
    poles?: string
    min_kva?: string
    max_kva?: string
    sort?: string
    page?: string
    view?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams
  return {
    title: 'Browse Alternators',
    description: 'Browse generator alternator models by brand, series, kVA output and pole count, with links to official manufacturer data sheets.',
    alternates: { canonical: '/alternators' },
    ...(hasSearchParams(p) ? { robots: noindexFollowRobots } : {}),
  }
}

export default async function AlternatorsPage({ searchParams }: Props) {
  const p = await searchParams

  const hasFilters = !!(p.q || p.brand || p.series || p.poles || p.min_kva || p.max_kva)

  // ── Landing view ──────────────────────────────────────────────────────────
  if (!hasFilters) {
    const [options, stamfordAlternators] = await Promise.all([
      getAlternatorFilterOptions(),
      filterAlternators({ brand: 'Stamford' }),
    ])
    const landmarkAlternator = stamfordAlternators.find(
      (alternator) => alternator.slug === 'stamford-uci224g'
    )
    const featuredAlternators = [
      ...(landmarkAlternator ? [landmarkAlternator] : []),
      ...stamfordAlternators
        .filter((alternator) => alternator.slug !== landmarkAlternator?.slug)
        .slice(0, 5),
    ]

    function presetHref(params: Record<string, string>) {
      return `/alternators?${new URLSearchParams(params).toString()}`
    }

    return (
      <div>
        <header className="catalog-grid border-b border-gray-900 py-10 sm:py-14">
          <p className="section-index mb-5">Alternator index</p>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="max-w-4xl text-4xl font-bold leading-[0.96] text-gray-900 sm:text-6xl">
                Generator Alternator Specifications
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
                Compare generator alternators by manufacturer, series, pole count,
                and nominal prime kVA. Each model record links to available official
                manufacturer documentation.
              </p>
            </div>
            <div className="lg:col-span-4">
              <p className="text-xs font-bold uppercase text-gray-500">Catalog scope</p>
              <p className="metric-number mt-3 text-6xl font-bold text-blue-700">
                {options.brands.length}
              </p>
              <p className="mt-2 text-sm text-gray-600">manufacturers indexed</p>
            </div>
          </div>
          <div className="mt-10 max-w-4xl">
            <Suspense>
              <SearchBar defaultValue="" />
            </Suspense>
          </div>
        </header>

        {PRIORITY_ALTERNATOR_SPECS.length > 0 && (
          <section className="border-b border-gray-300 py-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="section-index mb-3">01 / Reference models</p>
                <h2 className="text-2xl font-bold text-gray-900">High-interest specifications</h2>
              </div>
              <Link href="/alternators?brand=Stamford" className="hidden items-center gap-2 text-sm font-bold text-blue-700 hover:underline sm:flex">
                Browse Stamford <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
            <div className="grid border-l border-t border-gray-300 sm:grid-cols-2 lg:grid-cols-3">
              {PRIORITY_ALTERNATOR_SPECS.map((spec) => (
                <Link
                  key={spec.href}
                  href={spec.href}
                  className="group min-h-36 border-b border-r border-gray-300 bg-white p-5 hover:bg-blue-50"
                >
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700">{spec.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{spec.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {featuredAlternators.length > 0 && (
          <section className="border-b border-gray-300 py-10">
            <div className="mb-5">
              <p className="section-index mb-3">02 / Stamford index</p>
              <h2 className="text-2xl font-bold text-gray-900">Representative Stamford models</h2>
            </div>
            <div className="grid border-l border-t border-gray-300 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAlternators.map((alternator) => (
                <Link
                  key={alternator.id}
                  href={`/alternators/${alternator.slug}`}
                  className="group border-b border-r border-gray-300 bg-white p-5 hover:bg-blue-50"
                >
                  <p className="text-xs font-bold uppercase text-blue-700">{alternator.brand}</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                      {alternator.model}
                    </h3>
                    <ArrowRight aria-hidden="true" className="shrink-0 text-blue-700" size={18} />
                  </div>
                  <p className="mt-5 text-sm text-gray-600">
                    {alternator.kva != null
                      ? `${alternator.kva.toLocaleString()} kVA nominal prime`
                      : 'Manufacturer ratings available on model page'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid border-b border-gray-300 py-10 md:grid-cols-2">
          {/* kVA ranges */}
          <section className="border-b border-gray-300 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
            <h2 className="mb-4 text-xs font-bold uppercase text-gray-500">
              Browse by kVA Range
            </h2>
            <div className="border-t border-gray-900">
              {KVA_RANGES.map(({ label, min, max }) => {
                const params: Record<string, string> = {}
                if (min > 0) params.min_kva = String(min)
                if (max < Infinity) params.max_kva = String(max)
                return (
                  <Link key={label} href={presetHref(params)}
                    className="flex items-center justify-between border-b border-gray-300 py-3 text-sm font-bold text-gray-900 hover:text-blue-700">
                    {label}<ArrowRight aria-hidden="true" size={15} />
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Poles */}
          {options.poles.length > 0 && (
            <section className="pt-8 md:pl-8 md:pt-0">
              <h2 className="mb-4 text-xs font-bold uppercase text-gray-500">
                Browse by Poles
              </h2>
              <div className="border-t border-gray-900">
                {options.poles.map((pole) => (
                  <Link key={pole} href={presetHref({ poles: pole })}
                    className="flex items-center justify-between border-b border-gray-300 py-3 text-sm font-bold text-gray-900 hover:text-blue-700">
                    {pole}-pole <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Series */}
        {options.series.length > 0 && (
          <section className="border-b border-gray-300 py-10">
            <h2 className="mb-4 text-xs font-bold uppercase text-gray-500">
              Browse by Series
            </h2>
            <div className="grid border-l border-t border-gray-300 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {options.series.map((s) => (
                <Link key={s} href={`/alternators/series/${s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                  className="flex min-h-12 items-center justify-between border-b border-r border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-700">
                  {s}<ArrowRight aria-hidden="true" size={14} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Brands */}
        {options.brands.length > 0 && (
          <section className="py-10">
            <h2 className="mb-4 text-xs font-bold uppercase text-gray-500">
              Browse by Brand
            </h2>
            <div className="grid border-l border-t border-gray-300 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {options.brands.map((brand) => (
                <Link key={brand} href={presetHref({ brand })}
                  className="flex min-h-12 items-center justify-between border-b border-r border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-700">
                  {brand}<ArrowRight aria-hidden="true" size={14} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10 grid border-l-4 border-blue-600 bg-white p-6 md:grid-cols-[1fr_auto] md:items-end md:gap-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Need help matching an alternator?</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
              Haifeng Machinery can match alternators with engines, controllers,
              voltage requirements, enclosure design, ambient conditions, and duty class.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold md:mt-0">
            <Link href="/guides/alternator-voltage-and-frequency" className="text-blue-700 hover:underline">
              Voltage guide
            </Link>
            <a
              href="https://www.haifengmachinery.com/contact-us/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-700 hover:underline"
            >
              Request support <ExternalLink aria-hidden="true" size={14} />
            </a>
          </div>
        </section>

        {options.brands.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No alternators in the database yet.</p>
            <p className="text-sm mt-1">Data coming soon.</p>
          </div>
        )}
      </div>
    )
  }

  // ── Results view ──────────────────────────────────────────────────────────
  const isTable = p.view !== 'grid'
  const currentPage = Math.max(1, Number(p.page) || 1)

  const [allAlternators, options] = await Promise.all([
    filterAlternators({
      q:       p.q,
      brand:   p.brand,
      series:  p.series,
      poles:   p.poles,
      min_kva: p.min_kva ? Number(p.min_kva) : undefined,
      max_kva: p.max_kva ? Number(p.max_kva) : undefined,
      sort:    p.sort,
    }),
    getAlternatorFilterOptions(),
  ])

  const total = allAlternators.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = allAlternators.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function href(extra: Record<string, string>) {
    const sp = new URLSearchParams({
      ...(p.q       ? { q: p.q }             : {}),
      ...(p.brand   ? { brand: p.brand }     : {}),
      ...(p.series  ? { series: p.series }   : {}),
      ...(p.poles   ? { poles: p.poles }     : {}),
      ...(p.min_kva ? { min_kva: p.min_kva } : {}),
      ...(p.max_kva ? { max_kva: p.max_kva } : {}),
      ...(p.sort    ? { sort: p.sort }       : {}),
      ...extra,
    })
    return `/alternators?${sp.toString()}`
  }

  return (
    <div>
      <header className="catalog-grid border-b border-gray-900 py-8">
        <p className="section-index mb-4">Filtered catalog</p>
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Alternators</h1>
            <p className="mt-3 text-sm text-gray-600">
              {total.toLocaleString()} matching model{total !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <Suspense>
              <SearchBar defaultValue={p.q ?? ''} />
            </Suspense>
          </div>
        </div>
      </header>
      <div className="py-6">
        <Suspense>
          <AlternatorFilters options={options} totalCount={total} />
        </Suspense>

      {total > 0 && (
        <div className="mb-4 flex justify-end border-b border-gray-300 pb-3">
          <Link href={href({ view: 'table' })}
            aria-label="Table view"
            title="Table view"
            className={`grid h-9 w-9 place-items-center border text-sm font-medium ${isTable ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400'}`}>
            <List aria-hidden="true" size={16} />
          </Link>
          <Link href={href({ view: 'grid' })}
            aria-label="Grid view"
            title="Grid view"
            className={`grid h-9 w-9 place-items-center border border-l-0 text-sm font-medium ${!isTable ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400'}`}>
            <Grid2X2 aria-hidden="true" size={16} />
          </Link>
        </div>
      )}

      {total === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No alternators found.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : isTable ? (
        <AlternatorTable alternators={pageItems} />
      ) : (
        <>
          <div className="grid border-l border-t border-gray-300 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((a) => (
              <Link key={a.id} href={`/alternators/${a.slug}`}
                className="group block min-h-48 border-b border-r border-gray-300 bg-white p-5 hover:bg-blue-50">
                <p className="text-xs font-bold uppercase text-blue-700">{a.brand}</p>
                <h3 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-blue-700">{a.model}</h3>
                {a.series && <p className="text-xs text-gray-500">{a.series} series</p>}
                <div className="mt-6 flex items-baseline gap-1">
                  {a.kva != null ? (
                    <>
                      <span className="text-lg font-semibold text-gray-900">{a.kva.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">kVA prime</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">See data sheet for ratings</span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                  {a.poles && <span>{a.poles}-pole</span>}
                  {a.spec_sheet_url && <span className="text-blue-600">Data sheet available</span>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center">
          {safePage > 1 ? (
            <Link href={href({ page: String(safePage - 1) })}
              aria-label="Previous page"
              className="grid h-10 w-10 place-items-center border border-gray-300 bg-white text-gray-700 hover:border-blue-500">
              <ArrowLeft aria-hidden="true" size={17} />
            </Link>
          ) : (
            <span className="grid h-10 w-10 place-items-center border border-gray-200 bg-white text-gray-300"><ArrowLeft aria-hidden="true" size={17} /></span>
          )}
          <span className="grid h-10 min-w-32 place-items-center border-y border-gray-300 bg-white px-3 text-sm text-gray-500">Page {safePage} of {totalPages}</span>
          {safePage < totalPages ? (
            <Link href={href({ page: String(safePage + 1) })}
              aria-label="Next page"
              className="grid h-10 w-10 place-items-center border border-gray-300 bg-white text-gray-700 hover:border-blue-500">
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          ) : (
            <span className="grid h-10 w-10 place-items-center border border-gray-200 bg-white text-gray-300"><ArrowRight aria-hidden="true" size={17} /></span>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

// ── Inline table component ─────────────────────────────────────────────────
const KVA_RANGES_TABLE = [
  { label: '< 100 kVA',         min: 0,    max: 99 },
  { label: '100 – 499 kVA',     min: 100,  max: 499 },
  { label: '500 – 999 kVA',     min: 500,  max: 999 },
  { label: '1,000 – 2,499 kVA', min: 1000, max: 2499 },
  { label: '2,500+ kVA',        min: 2500, max: Infinity },
  { label: 'kVA not specified', min: NaN,  max: NaN },
]

function rangeIdx(a: Alternator): number {
  if (a.kva == null) return KVA_RANGES_TABLE.length - 1 // "kVA not specified" bucket
  return KVA_RANGES_TABLE.findIndex((r) => a.kva! >= r.min && a.kva! <= r.max)
}

function AlternatorTable({ alternators }: { alternators: Alternator[] }) {
  const brands = [...new Set(alternators.map((a) => a.brand).filter(Boolean))].sort()
  const lookup: Map<string, Alternator[]>[] = KVA_RANGES_TABLE.map(() => new Map())

  for (const a of alternators) {
    const ri = rangeIdx(a)
    if (ri < 0 || !a.brand) continue
    const m = lookup[ri]
    if (!m.has(a.brand)) m.set(a.brand, [])
    m.get(a.brand)!.push(a)
  }

  const activeRanges = KVA_RANGES_TABLE.map((r, i) => ({ ...r, i })).filter(
    ({ i }) => brands.some((b) => (lookup[i].get(b)?.length ?? 0) > 0)
  )

  if (activeRanges.length === 0) return null

  return (
    <div className="space-y-6">
      {activeRanges.map(({ label, i }) => {
        const rangeBrands = brands.filter((b) => (lookup[i].get(b)?.length ?? 0) > 0)
        return (
          <div key={label}>
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">{label}</h3>
            <div className="overflow-x-auto border-y border-gray-900">
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {rangeBrands.map((brand) => {
                      const count = lookup[i].get(brand)?.length ?? 0
                      return (
                        <th key={brand}
                          className={`px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 whitespace-nowrap ${count > 4 ? 'min-w-[300px]' : 'min-w-[160px]'}`}>
                          {brand}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {rangeBrands.map((brand) => {
                      const cells = (lookup[i].get(brand) ?? []).sort((a, b) => (a.kva ?? 0) - (b.kva ?? 0))
                      const dense = cells.length > 4
                      return (
                        <td key={brand} className="px-1.5 py-1.5 border-r border-gray-100 last:border-r-0 align-top">
                          <div className={dense ? 'grid grid-cols-2 divide-x divide-gray-100' : 'flex flex-col'}>
                            {cells.map((a) => (
                              <Link key={a.id} href={`/alternators/${a.slug}`} title={a.model}
                                className="flex flex-col gap-px px-1.5 py-1 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
                                <span className="font-semibold text-gray-900 truncate">{a.model}</span>
                                <span className="text-gray-500 whitespace-nowrap">
                                  {a.kva != null
                                    ? <><span className="font-medium text-gray-700">{a.kva.toLocaleString()}</span><span className="text-gray-400"> kVA</span></>
                                    : <span className="text-gray-400">see data sheet</span>}
                                  {a.poles && <span className="text-gray-400"> · {a.poles}p</span>}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-4 text-[10px] text-gray-400">
        <span>Nominal prime kVA @ 50 Hz · full ratings on each model&rsquo;s data sheet</span>
      </div>
    </div>
  )
}
