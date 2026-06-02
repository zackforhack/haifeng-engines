import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllEngines, getEngineBySlug, getRelatedEngines } from '@/lib/engines'
import { StatusBadge } from '@/components/StatusBadge'
import { PDFDownloadList } from '@/components/PDFDownloadList'
import { BrandLogo } from '@/components/BrandLogo'
import { headlinePower, displayKva, displayOutput, ratedSpeedLabel, buildIntro } from '@/lib/engine-display'
import type { Engine } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) return {}

  const kva = displayKva(headlinePower(engine))
  const title = `${engine.brand} ${engine.model} Specs${kva ? ` – ${kva.toLocaleString()} kVA` : ''}`
  const description = engine.description ?? buildIntro(engine)

  return {
    title,
    description,
    keywords: [
      `${engine.brand} ${engine.model}`,
      `${engine.model} specs`,
      `${engine.model} datasheet`,
      `${engine.brand} diesel engine`,
      engine.series ?? '',
      'diesel generator engine',
    ].filter(Boolean),
    alternates: { canonical: `/engines/${slug}` },
    openGraph: { title, description, type: 'website', url: `/engines/${slug}` },
    twitter: { card: 'summary_large_image', title, description },
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
  if (b === 'Isuzu' || b === 'Hatz' || b === 'JCB' || b === 'Kirloskar' || b === 'MAN' || b === 'Liebherr') return true
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

  // rpm_rated may hold a 50Hz (1500/3000) or 60Hz (1800/3600) rated speed. Derive each
  // frequency's true speed instead of blindly ×6/5, which turned 60Hz-rated engines into
  // impossible figures (e.g. 1800 → 2160).
  const rated = engine.rpm_rated ?? 1500
  const ratedIs60 = rated === 1800 || rated === 3600
  const rpm50 = ratedIs60 ? Math.round(rated * 5 / 6) : rated
  const rpm60 = ratedIs60 ? rated : Math.round(rated * 6 / 5)
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

function SpecHero({ engine }: { engine: Engine }) {
  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)

  const cards: { label: string; value: string }[] = []
  if (kva) cards.push({ label: `${hp?.rating ?? 'Standby'} Power · ${hp?.hz ?? 50} Hz`, value: `${kva.toLocaleString()} kVA` })
  if (out) cards.push({ label: 'Electrical Output', value: `${out.value.toLocaleString()} ${out.unit}` })
  if (engine.configuration || engine.cylinders) cards.push({ label: 'Cylinders', value: engine.configuration ?? String(engine.cylinders) })
  if (engine.displacement_l) cards.push({ label: 'Displacement', value: `${engine.displacement_l} L` })
  cards.push({ label: 'Rated Speed', value: ratedSpeedLabel(engine) })

  if (cards.length === 0) return null

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.slice(0, 5).map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <dt className="text-xs text-gray-500 font-medium leading-tight">{c.label}</dt>
          <dd className="text-lg font-bold text-gray-900 mt-1">{c.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RelatedEngines({ engines }: { engines: Engine[] }) {
  if (!engines.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Engines</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {engines.map((e) => {
          const kva = displayKva(headlinePower(e))
          return (
            <li key={e.slug}>
              <Link
                href={`/engines/${e.slug}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 px-3 py-2 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800 truncate">{e.brand} {e.model}</span>
                {kva && <span className="flex-shrink-0 text-xs text-gray-500">{kva.toLocaleString()} kVA</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default async function EngineDetailPage({ params }: Props) {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) notFound()

  const related = await getRelatedEngines(engine)
  const intro = engine.description ?? buildIntro(engine)
  const base = 'https://engines.haifengmachinery.com'

  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)

  // Build PropertyValue specs from whatever is populated.
  const props: { '@type': 'PropertyValue'; name: string; value: string }[] = []
  const addProp = (name: string, value?: string | number | null) => {
    if (value !== undefined && value !== null && value !== '') props.push({ '@type': 'PropertyValue', name, value: String(value) })
  }
  if (kva) addProp(`${hp?.rating ?? 'Standby'} Power (${hp?.hz ?? 50} Hz)`, `${kva} kVA`)
  if (out) addProp('Electrical Output', `${out.value} ${out.unit}`)
  addProp('Configuration', engine.configuration)
  addProp('Cylinders', engine.cylinders)
  addProp('Displacement', engine.displacement_l ? `${engine.displacement_l} L` : undefined)
  addProp('Rated Speed', ratedSpeedLabel(engine))
  addProp('Cooling', engine.cooling_method)
  addProp('Fuel Type', engine.fuel_type)
  addProp('Emissions Standard', engine.emissions_standard)
  addProp('Dry Weight', engine.weight_kg ? `${engine.weight_kg} kg` : undefined)
  addProp('Country of Origin', engine.origin)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${base}/engines/${slug}#product`,
    name: `${engine.brand} ${engine.model}`,
    sku: engine.model,
    mpn: engine.model,
    ...(engine.series && { model: engine.series }),
    category: 'Diesel Generator Engine',
    image: `${base}/engines/${slug}/opengraph-image`,
    description: intro,
    brand: { '@type': 'Brand', name: engine.brand },
    manufacturer: { '@type': 'Organization', name: engine.brand },
    url: `${base}/engines/${slug}`,
    ...(props.length && { additionalProperty: props }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Engines', item: `${base}/engines` },
      { '@type': 'ListItem', position: 2, name: engine.brand, item: `${base}/brands/${encodeURIComponent(engine.brand.toLowerCase())}` },
      { '@type': 'ListItem', position: 3, name: engine.model, item: `${base}/engines/${slug}` },
    ],
  }

  const jsonLd = JSON.stringify([productSchema, breadcrumbSchema]).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/engines" className="hover:text-blue-600">Engines</Link>
          {' / '}
          <Link href={`/brands/${encodeURIComponent(engine.brand.toLowerCase())}`} className="hover:text-blue-600">{engine.brand}</Link>
          {' / '}
          <span className="text-gray-700">{engine.model}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <BrandLogo brand={engine.brand} className="mb-3" />
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{engine.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900">{engine.brand} {engine.model}</h1>
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

          <p className="text-gray-600 leading-relaxed">{intro}</p>
        </div>

        <SpecHero engine={engine} />

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

            <RelatedEngines engines={related} />
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
