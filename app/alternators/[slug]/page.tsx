import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAlternatorBySlug } from '@/lib/alternators'
import type { Alternator } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = await getAlternatorBySlug(slug)
  if (!a) return {}

  const kva = a.prime_kva_50hz ?? a.standby_kva_50hz ?? a.prime_kva_60hz ?? a.standby_kva_60hz
  const title = `${a.brand} ${a.model} Alternator Specs`
  const description = a.description
    ?? `Full specifications for the ${a.brand} ${a.model} alternator.${kva ? ` ${kva} kVA` : ''} ${a.excitation_type ?? ''} ${a.phases === 3 ? '3-phase' : ''} alternator.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    alternates: { canonical: `/alternators/${slug}` },
  }
}

function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-sm text-gray-500 font-medium w-48">{label}</td>
      <td className="py-2 text-sm text-gray-900">{value}</td>
    </tr>
  )
}

function PowerRatingsTable({ a }: { a: Alternator }) {
  const has50hz = a.prime_kva_50hz || a.standby_kva_50hz || a.prime_kw_50hz || a.standby_kw_50hz
  const has60hz = a.prime_kva_60hz || a.standby_kva_60hz || a.prime_kw_60hz || a.standby_kw_60hz
  if (!has50hz && !has60hz) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Power Ratings</h2>
      <p className="text-xs text-gray-400 mb-4">
        kW = active power · kVA = apparent power at 0.8 power factor
      </p>
      <div className="space-y-6">
        {has50hz && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">50 Hz</span>
              1500 RPM
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold w-36"></th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kVA</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kW</th>
                  </tr>
                </thead>
                <tbody>
                  {(a.prime_kva_50hz || a.prime_kw_50hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Prime</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{a.prime_kva_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{a.prime_kw_50hz ?? '—'}</td>
                    </tr>
                  )}
                  {(a.standby_kva_50hz || a.standby_kw_50hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Standby</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{a.standby_kva_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{a.standby_kw_50hz ?? '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {has60hz && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">60 Hz</span>
              1800 RPM
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold w-36"></th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kVA</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kW</th>
                  </tr>
                </thead>
                <tbody>
                  {(a.prime_kva_60hz || a.prime_kw_60hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Prime</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{a.prime_kva_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{a.prime_kw_60hz ?? '—'}</td>
                    </tr>
                  )}
                  {(a.standby_kva_60hz || a.standby_kw_60hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Standby</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{a.standby_kva_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{a.standby_kw_60hz ?? '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function AlternatorDetailPage({ params }: Props) {
  const { slug } = await params
  const a = await getAlternatorBySlug(slug)
  if (!a) notFound()

  const kva = a.prime_kva_50hz ?? a.standby_kva_50hz ?? a.prime_kva_60hz ?? a.standby_kva_60hz

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${a.brand} ${a.model}`,
    brand: { '@type': 'Brand', name: a.brand },
    description: a.description ?? `${a.brand} ${a.model} alternator specifications`,
    ...(kva && {
      additionalProperty: [{ '@type': 'PropertyValue', name: 'Prime Output', value: `${kva} kVA` }],
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/alternators" className="hover:text-blue-600">Alternators</Link>
          {' / '}
          <Link href={`/alternators?brand=${encodeURIComponent(a.brand)}`} className="hover:text-blue-600">{a.brand}</Link>
          {' / '}
          <span className="text-gray-700">{a.model}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{a.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900">{a.model}</h1>
              {a.series && <p className="text-gray-500 mt-1">{a.series}</p>}
              {a.frame && <p className="text-xs text-gray-400 mt-0.5">Frame: {a.frame}</p>}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {a.status}
            </span>
          </div>

          {a.description && <p className="text-gray-600">{a.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <PowerRatingsTable a={a} />

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              <table className="w-full">
                <tbody>
                  <SpecRow label="Brand" value={a.brand} />
                  <SpecRow label="Model" value={a.model} />
                  <SpecRow label="Series" value={a.series} />
                  <SpecRow label="Frame" value={a.frame} />
                  <SpecRow label="Phases" value={a.phases ? `${a.phases}-phase` : undefined} />
                  <SpecRow label="Poles" value={a.poles ? `${a.poles}-pole` : undefined} />
                  <SpecRow label="Power Factor" value={a.power_factor} />
                  <SpecRow label="Voltage Output" value={a.voltage_output} />
                  <SpecRow label="Excitation Type" value={a.excitation_type} />
                  <SpecRow label="Insulation Class" value={a.insulation_class ? `Class ${a.insulation_class}` : undefined} />
                  <SpecRow label="IP Rating" value={a.ip_rating} />
                  <SpecRow label="Efficiency" value={a.efficiency ? `${a.efficiency}%` : undefined} />
                  <SpecRow label="Dry Weight" value={a.weight_kg ? `${a.weight_kg} kg` : undefined} />
                  <SpecRow label="Dimensions (L×W×H)" value={a.length_mm ? `${a.length_mm} × ${a.width_mm} × ${a.height_mm} mm` : undefined} />
                  <SpecRow label="Country of Origin" value={a.origin} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <p className="font-semibold text-gray-900 mb-1">Need this alternator?</p>
              <p className="text-sm text-gray-600 mb-3">
                Haifeng Machinery supplies alternators and complete generator sets worldwide.
              </p>
              <a
                href="https://www.haifengmachinery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get a Quote ↗
              </a>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Browse More</p>
              <div className="space-y-2 text-sm">
                <Link href={`/alternators?brand=${encodeURIComponent(a.brand)}`}
                  className="block text-blue-600 hover:underline">
                  All {a.brand} alternators →
                </Link>
                {a.excitation_type && (
                  <Link href={`/alternators?excitation=${encodeURIComponent(a.excitation_type)}`}
                    className="block text-blue-600 hover:underline">
                    {a.excitation_type} excitation →
                  </Link>
                )}
                <Link href="/alternators" className="block text-blue-600 hover:underline">
                  All alternators →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
