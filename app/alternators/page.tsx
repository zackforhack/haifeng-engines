import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { filterAlternators, getAlternatorFilterOptions } from '@/lib/alternators'
import { SearchBar } from '@/components/SearchBar'
import { AlternatorFilters } from '@/components/AlternatorFilters'
import type { Alternator } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Browse Alternators',
  description: 'Browse generator alternator models by brand, series, kVA output and pole count, with links to official manufacturer data sheets.',
  alternates: { canonical: '/alternators' },
}

const PAGE_SIZE = 24

const KVA_RANGES = [
  { label: '< 100 kVA',          min: 0,    max: 99 },
  { label: '100 – 499 kVA',      min: 100,  max: 499 },
  { label: '500 – 999 kVA',      min: 500,  max: 999 },
  { label: '1,000 – 2,499 kVA',  min: 1000, max: 2499 },
  { label: '2,500+ kVA',         min: 2500, max: Infinity },
]

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

export default async function AlternatorsPage({ searchParams }: Props) {
  const p = await searchParams

  const hasFilters = !!(p.q || p.brand || p.series || p.poles || p.min_kva || p.max_kva)

  // ── Landing view ──────────────────────────────────────────────────────────
  if (!hasFilters) {
    const options = await getAlternatorFilterOptions()

    function presetHref(params: Record<string, string>) {
      return `/alternators?${new URLSearchParams(params).toString()}`
    }

    return (
      <div>
        <div className="text-center py-10 mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Alternator Specifications
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
            Browse generator alternator models by brand, series, kVA output and pole
            count — each links to the manufacturer&rsquo;s official data sheet.
          </p>
          <div className="flex justify-center">
            <Suspense>
              <SearchBar defaultValue="" />
            </Suspense>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* kVA ranges */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Browse by kVA Range
            </h2>
            <div className="flex flex-wrap gap-2">
              {KVA_RANGES.map(({ label, min, max }) => {
                const params: Record<string, string> = {}
                if (min > 0) params.min_kva = String(min)
                if (max < Infinity) params.max_kva = String(max)
                return (
                  <Link key={label} href={presetHref(params)}
                    className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Poles */}
          {options.poles.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Browse by Poles
              </h2>
              <div className="flex flex-wrap gap-2">
                {options.poles.map((pole) => (
                  <Link key={pole} href={presetHref({ poles: pole })}
                    className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    {pole}-pole
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Series */}
        {options.series.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Browse by Series
            </h2>
            <div className="flex flex-wrap gap-2">
              {options.series.map((s) => (
                <Link key={s} href={`/alternators/series/${s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Brands */}
        {options.brands.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Browse by Brand
            </h2>
            <div className="flex flex-wrap gap-2">
              {options.brands.map((brand) => (
                <Link key={brand} href={presetHref({ brand })}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        )}

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
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Alternators</h1>
        <Suspense>
          <SearchBar defaultValue={p.q ?? ''} />
        </Suspense>
      </div>

      {/* Filter bar */}
      <Suspense>
        <AlternatorFilters options={options} totalCount={total} />
      </Suspense>

      {/* View toggle */}
      {total > 0 && (
        <div className="flex gap-1 mb-4">
          <Link href={href({ view: 'table' })}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isTable ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            Table
          </Link>
          <Link href={href({ view: 'grid' })}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${!isTable ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            Grid
          </Link>
        </div>
      )}

      {total === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No alternators found.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : isTable ? (
        <AlternatorTable alternators={allAlternators} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((a) => (
              <Link key={a.id} href={`/alternators/${a.slug}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{a.brand}</p>
                <h3 className="text-base font-bold text-gray-900">{a.model}</h3>
                {a.series && <p className="text-xs text-gray-500">{a.series} series</p>}
                <div className="mt-2 flex items-baseline gap-1">
                  {a.kva != null ? (
                    <>
                      <span className="text-lg font-semibold text-gray-900">{a.kva.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs">kVA prime</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">See data sheet for ratings</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-2">
                  {a.poles && <span>{a.poles}-pole</span>}
                  {a.spec_sheet_url && <span className="text-blue-600">Data sheet ↗</span>}
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {safePage > 1 ? (
                <Link href={href({ page: String(safePage - 1) })}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-blue-500 bg-white transition-colors">
                  ← Previous
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-300 bg-white cursor-not-allowed">← Previous</span>
              )}
              <span className="text-sm text-gray-500 px-3">Page {safePage} of {totalPages}</span>
              {safePage < totalPages ? (
                <Link href={href({ page: String(safePage + 1) })}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-blue-500 bg-white transition-colors">
                  Next →
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-300 bg-white cursor-not-allowed">Next →</span>
              )}
            </div>
          )}
        </>
      )}
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
            <div className="overflow-x-auto rounded-lg border border-gray-200">
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
