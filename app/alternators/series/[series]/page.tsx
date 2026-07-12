import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { filterAlternators, getAlternatorFilterOptions } from '@/lib/alternators'
import type { Alternator } from '@/lib/types'
import { PRIORITY_MODEL_SPECS } from '@/lib/seo-opportunities'

const BASE = 'https://engines.haifengmachinery.com'
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

interface Props { params: Promise<{ series: string }> }

async function resolveSeries(slug: string): Promise<string | null> {
  const { series } = await getAlternatorFilterOptions()
  return series.find((s) => slugify(s) === slug) ?? null
}

function priorityAlternatorSpecsForSeries(series: string) {
  return PRIORITY_MODEL_SPECS
    .filter((spec) => spec.type === 'alternator')
    .filter((spec) => spec.series && slugify(spec.series) === slugify(series))
}

export async function generateStaticParams() {
  const { series } = await getAlternatorFilterOptions()
  return series.map((s) => ({ series: slugify(s) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: slug } = await params
  const series = await resolveSeries(slug)
  if (!series) return {}
  const items = await filterAlternators({ series })
  const brand = items[0]?.brand ?? ''
  return {
    title: `${brand} ${series} Alternators`,
    description: `${brand} ${series} series generator alternators — ${items.length} models with kVA ratings, pole counts and links to official data sheets.`,
    alternates: { canonical: `/alternators/series/${slug}` },
  }
}

export default async function AlternatorSeriesPage({ params }: Props) {
  const { series: slug } = await params
  const series = await resolveSeries(slug)
  if (!series) notFound()

  const items = (await filterAlternators({ series })).sort((a, b) => (a.kva ?? 0) - (b.kva ?? 0))
  if (!items.length) notFound()

  const brand = items[0].brand
  const kvas = items.map((a) => a.kva).filter((k): k is number => k != null)
  const range = kvas.length ? `${Math.min(...kvas).toLocaleString()}–${Math.max(...kvas).toLocaleString()} kVA` : null
  const poles = [...new Set(items.map((a) => a.poles).filter(Boolean))].join(' / ')
  const prioritySpecs = priorityAlternatorSpecsForSeries(series)

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: `${brand} ${series} Alternators`,
      url: `${BASE}/alternators/series/${slug}`,
      mainEntity: {
        '@type': 'ItemList', numberOfItems: items.length,
        itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: `${a.brand} ${a.model}`, url: `${BASE}/alternators/${a.slug}` })),
      },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Alternators', item: `${BASE}/alternators` },
        { '@type': 'ListItem', position: 2, name: `${series} series`, item: `${BASE}/alternators/series/${slug}` },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div>
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/alternators" className="hover:text-blue-600">Alternators</Link>
          {' / '}<span className="text-gray-700">{series} series</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{brand} {series} Alternators</h1>
        <p className="text-gray-500 mb-6">
          {items.length} model{items.length !== 1 ? 's' : ''} in the {brand} {series} series
          {range ? `, ${range}` : ''}{poles ? ` · ${poles}-pole` : ''}.
        </p>

        {prioritySpecs.length > 0 && (
          <section className="mb-8 bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Priority alternator specs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prioritySpecs.map((spec) => (
                <Link key={spec.href} href={spec.href} className="block group">
                  <span className="block text-sm font-semibold text-blue-600 group-hover:underline">
                    {spec.label}
                  </span>
                  <span className="block text-xs text-gray-500 leading-relaxed mt-0.5">
                    {spec.desc}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Match a {series} alternator to a generator package
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Alternator selection should be checked together with engine output, voltage, 50/60 Hz frequency,
            controller features, enclosure layout, site temperature, altitude, transient load response,
            and local compliance requirements.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <a
              href="https://www.haifengmachinery.com/contact-us/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700"
            >
              Request alternator matching ↗
            </a>
            <Link href="/guides/alternator-voltage-and-frequency" className="rounded-lg border border-blue-200 bg-white px-4 py-2 font-medium text-blue-600 hover:bg-blue-50">
              Voltage and frequency guide
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a: Alternator) => (
            <Link key={a.id} href={`/alternators/${a.slug}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{a.brand}</p>
              <h2 className="text-base font-bold text-gray-900">{a.model}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                {a.kva != null
                  ? <><span className="text-lg font-semibold text-gray-900">{a.kva.toLocaleString()}</span><span className="text-gray-400 text-xs">kVA prime</span></>
                  : <span className="text-sm text-gray-400">See data sheet</span>}
              </div>
              <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-2">
                {a.poles && <span>{a.poles}-pole</span>}
                {a.spec_sheet_url && <span className="text-blue-600">Data sheet ↗</span>}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/alternators" className="text-blue-600 hover:underline">← All alternators</Link>
        </div>
      </div>
    </>
  )
}
