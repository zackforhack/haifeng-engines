import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllEngines, getEngineBySlug } from '@/lib/engines'
import { StatusBadge } from '@/components/StatusBadge'
import { PDFDownloadList } from '@/components/PDFDownloadList'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) return {}

  const title = `${engine.brand} ${engine.model} Specs`
  const description = engine.description
    ?? `Full specifications for the ${engine.brand} ${engine.model} diesel engine. ${engine.power_kw ? `${engine.power_kw} kW` : ''} ${engine.cylinders ? `${engine.cylinders}-cylinder` : ''} diesel engine.`

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

export default async function EngineDetailPage({ params }: Props) {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) notFound()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${engine.brand} ${engine.model}`,
    brand: { '@type': 'Brand', name: engine.brand },
    description: engine.description ?? `${engine.brand} ${engine.model} diesel engine specifications`,
    ...(engine.power_kw && {
      additionalProperty: [{ '@type': 'PropertyValue', name: 'Power Output', value: `${engine.power_kw} kW` }],
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

          {engine.description && (
            <p className="text-gray-600">{engine.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Specs */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
            <table className="w-full">
              <tbody>
                <SpecRow label="Brand" value={engine.brand} />
                <SpecRow label="Model" value={engine.model} />
                <SpecRow label="Series" value={engine.series} />
                <SpecRow label="Configuration" value={engine.configuration} />
                <SpecRow label="Cylinders" value={engine.cylinders} />
                <SpecRow label="Displacement" value={engine.displacement_l ? `${engine.displacement_l} L` : undefined} />
                <SpecRow label="Power Output" value={engine.power_kw ? `${engine.power_kw} kW / ${engine.power_hp ?? Math.round(engine.power_kw * 1.341)} HP` : undefined} />
                <SpecRow label="Rated RPM" value={engine.rpm_rated ? `${engine.rpm_rated} rpm` : undefined} />
                <SpecRow label="Max RPM" value={engine.rpm_max ? `${engine.rpm_max} rpm` : undefined} />
                <SpecRow label="Compression Ratio" value={engine.compression_ratio} />
                <SpecRow label="Fuel Consumption" value={engine.fuel_consumption_l_per_hr ? `${engine.fuel_consumption_l_per_hr} L/hr` : undefined} />
                <SpecRow label="Dry Weight" value={engine.weight_kg ? `${engine.weight_kg} kg` : undefined} />
                <SpecRow label="Dimensions (L×W×H)" value={engine.length_mm ? `${engine.length_mm} × ${engine.width_mm} × ${engine.height_mm} mm` : undefined} />
                <SpecRow label="Emissions Standard" value={engine.emissions_standard} />
                <SpecRow label="Certifications" value={engine.certifications?.join(', ')} />
                <SpecRow label="Year Introduced" value={engine.year_introduced} />
                <SpecRow label="Year Discontinued" value={engine.year_discontinued} />
                <SpecRow label="Compatible Generators" value={engine.compatible_generator_brands?.join(', ')} />
              </tbody>
            </table>
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
