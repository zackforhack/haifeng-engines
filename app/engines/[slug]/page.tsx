import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllEngines, getEngineBySlug } from '@/lib/engines'
import { StatusBadge } from '@/components/StatusBadge'
import { PDFDownloadList } from '@/components/PDFDownloadList'
import type { Engine } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) return {}

  const standby = engine.standby_power_kw_50hz ?? engine.power_kw
  const title = `${engine.brand} ${engine.model} Specs`
  const description = engine.description
    ?? `Full specifications for the ${engine.brand} ${engine.model} diesel engine. ${standby ? `${standby} kW standby` : ''} ${engine.cylinders ? `${engine.cylinders}-cylinder` : ''} diesel engine for generator sets.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    alternates: { canonical: `/engines/${slug}` },
  }
}

export async function generateStaticParams() {
  const engines = await getAllEngines()
  return engines.map((e) => ({ slug: e.slug }))
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

function kweIsEstimated(engine: Engine): boolean {
  const b = engine.brand ?? ''
  const m = engine.model ?? ''
  if (b === 'Isuzu' || b === 'Hatz' || b === 'JCB' || b === 'Kirloskar') return true
  if (b === 'Mitsubishi') return true
  if (b === 'FPT' && (m.includes('TEVP') || m.includes('ETVP'))) return true
  return false
}

function PowerRatingsTable({ engine }: { engine: Engine }) {
  const has50hz = engine.prime_power_kw_50hz || engine.standby_power_kw_50hz
    || engine.prime_power_kwe_50hz || engine.standby_power_kwe_50hz
  const has60hz = engine.prime_power_kw_60hz || engine.standby_power_kw_60hz
    || engine.prime_power_kwe_60hz || engine.standby_power_kwe_60hz
  if (!has50hz && !has60hz) return null

  const rpm50 = engine.rpm_rated ?? 1500
  const rpm60 = Math.round(rpm50 * 6 / 5)
  const estimated = kweIsEstimated(engine)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Power Ratings</h2>
      <p className="text-xs text-gray-400 mb-4">
        kWm = mechanical shaft power · kWe = electrical output · kVA = kWe ÷ 0.8 pf
        {estimated && <span className="text-amber-500"> · kWe estimated — see note below</span>}
      </p>

      <div className="space-y-6">
        {has50hz && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">50 Hz</span>
              {rpm50} RPM
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold w-36"></th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWm</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWe</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kVA</th>
                  </tr>
                </thead>
                <tbody>
                  {(engine.prime_power_kw_50hz || engine.prime_power_kwe_50hz || engine.prime_power_kva_50hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Prime Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.prime_power_kw_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kwe_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kva_50hz ?? '—'}</td>
                    </tr>
                  )}
                  {(engine.standby_power_kw_50hz || engine.standby_power_kwe_50hz || engine.standby_power_kva_50hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Standby Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.standby_power_kw_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kwe_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kva_50hz ?? '—'}</td>
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
              {rpm60} RPM
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold w-36"></th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWm</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWe</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kVA</th>
                  </tr>
                </thead>
                <tbody>
                  {(engine.prime_power_kw_60hz || engine.prime_power_kwe_60hz || engine.prime_power_kva_60hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Prime Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.prime_power_kw_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kwe_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kva_60hz ?? '—'}</td>
                    </tr>
                  )}
                  {(engine.standby_power_kw_60hz || engine.standby_power_kwe_60hz || engine.standby_power_kva_60hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Standby Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.standby_power_kw_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kwe_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kva_60hz ?? '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {estimated && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <strong>Note:</strong> The manufacturer does not publish a separate kWe rating for this engine.
          kWe values shown are estimated from the rated mechanical output (kWm) using a conservative
          90% alternator efficiency factor.
        </p>
      )}
    </div>
  )
}

export default async function EngineDetailPage({ params }: Props) {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) notFound()

  const standby = engine.standby_power_kw_50hz ?? engine.standby_power_kw_60hz ?? engine.power_kw

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${engine.brand} ${engine.model}`,
    brand: { '@type': 'Brand', name: engine.brand },
    description: engine.description ?? `${engine.brand} ${engine.model} diesel engine specifications`,
    ...(standby && {
      additionalProperty: [{ '@type': 'PropertyValue', name: 'Standby Power Output', value: `${standby} kW` }],
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
          <a href="/engines" className="hover:text-blue-600">Engines</a>
          {' / '}
          <a href={`/brands/${encodeURIComponent(engine.brand.toLowerCase())}`} className="hover:text-blue-600">{engine.brand}</a>
          {' / '}
          <span className="text-gray-700">{engine.model}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{engine.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900">{engine.model}</h1>
              {engine.series && <p className="text-gray-500 mt-1">{engine.series}</p>}
            </div>
            <StatusBadge status={engine.status} />
          </div>

          {engine.status === 'discontinued' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm text-gray-600">
              This engine is no longer in production{engine.year_discontinued ? ` (discontinued ${engine.year_discontinued})` : ''}.
              Specifications and documentation remain archived for reference.
            </div>
          )}

          {engine.description && <p className="text-gray-600">{engine.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Power Ratings Table */}
            <PowerRatingsTable engine={engine} />

            {/* General Specs */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              <table className="w-full">
                <tbody>
                  <SpecRow label="Brand" value={engine.brand} />
                  <SpecRow label="Model" value={engine.model} />
                  <SpecRow label="Series" value={engine.series} />
                  <SpecRow label="Configuration" value={engine.configuration} />
                  <SpecRow label="Cylinders" value={engine.cylinders} />
                  <SpecRow label="Displacement" value={engine.displacement_l ? `${engine.displacement_l} L` : undefined} />
                  <SpecRow label="Compression Ratio" value={engine.compression_ratio} />
                  <SpecRow label="Fuel Consumption" value={engine.fuel_consumption_l_per_hr ? `${engine.fuel_consumption_l_per_hr} L/hr` : undefined} />
                  <SpecRow label="Dry Weight" value={engine.weight_kg ? `${engine.weight_kg} kg` : undefined} />
                  <SpecRow label="Dimensions (L×W×H)" value={engine.length_mm ? `${engine.length_mm} × ${engine.width_mm} × ${engine.height_mm} mm` : undefined} />
                  <SpecRow label="Fuel Type" value={engine.fuel_type} />
                  <SpecRow label="Ignition Type" value={engine.ignition_type} />
                  <SpecRow label="Cooling Method" value={engine.cooling_method} />
                  <SpecRow label="Emissions Standard" value={engine.emissions_standard} />
                  <SpecRow label="Certifications" value={engine.certifications?.join(', ')} />
                  <SpecRow label="Country of Origin" value={engine.origin} />
                  <SpecRow label="Year Introduced" value={engine.year_introduced} />
                  <SpecRow label="Year Discontinued" value={engine.year_discontinued} />
                  <SpecRow label="Compatible Generators" value={engine.compatible_generator_brands?.join(', ')} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {engine.pdfs && engine.pdfs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <PDFDownloadList pdfs={engine.pdfs} />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <p className="font-semibold text-gray-900 mb-1">Need this engine?</p>
              <p className="text-sm text-gray-600 mb-3">
                Haifeng Machinery supplies diesel generators and engines worldwide.
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
          </div>
        </div>
      </div>
    </>
  )
}
