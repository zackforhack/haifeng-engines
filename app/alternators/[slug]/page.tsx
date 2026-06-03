import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAlternatorBySlug } from '@/lib/alternators'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = await getAlternatorBySlug(slug)
  if (!a) return {}

  const title = `${a.brand} ${a.model} Alternator Specs`
  const bits = [a.kva != null ? `${a.kva} kVA` : '', a.poles ? `${a.poles}-pole` : '', a.series ? `${a.series} series` : '']
    .filter(Boolean).join(', ')
  const description = `Specifications and official data sheet for the ${a.brand} ${a.model} generator alternator${bits ? ` — ${bits}` : ''}.`

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

export default async function AlternatorDetailPage({ params }: Props) {
  const { slug } = await params
  const a = await getAlternatorBySlug(slug)
  if (!a) notFound()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${a.brand} ${a.model}`,
    brand: { '@type': 'Brand', name: a.brand },
    description: `${a.brand} ${a.model} generator alternator specifications`,
    ...(a.kva != null && {
      additionalProperty: [{ '@type': 'PropertyValue', name: 'Nominal Prime Output', value: `${a.kva} kVA` }],
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{a.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900">{a.model}</h1>
              {a.series && <p className="text-gray-500 mt-1">{a.series} series</p>}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {a.status}
            </span>
          </div>
          {a.kva != null && (
            <p className="mt-4 text-gray-600">
              <span className="text-2xl font-bold text-gray-900">{a.kva.toLocaleString()} kVA</span>
              <span className="text-gray-400 text-sm"> nominal prime @ 50&nbsp;Hz</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <table className="w-full">
                <tbody>
                  <SpecRow label="Brand" value={a.brand} />
                  <SpecRow label="Model" value={a.model} />
                  <SpecRow label="Series" value={a.series} />
                  <SpecRow label="Poles" value={a.poles ? `${a.poles}-pole` : undefined} />
                  <SpecRow label="Nominal Prime Output" value={a.kva != null ? `${a.kva.toLocaleString()} kVA @ 50 Hz` : undefined} />
                </tbody>
              </table>
              <p className="mt-4 text-xs text-gray-400">
                Full ratings across every voltage, frequency and winding are published on
                the manufacturer&rsquo;s data sheet.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {a.spec_sheet_url && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="font-semibold text-gray-900 mb-1">Technical Data Sheet</p>
                <p className="text-sm text-gray-600 mb-3">
                  Official {a.brand} data sheets for the {a.series ?? a.model} range — all
                  windings, voltages and frequencies.
                </p>
                <a
                  href={a.spec_sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View Data Sheets ↗
                </a>
              </div>
            )}

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
                {a.series && (
                  <Link href={`/alternators?series=${encodeURIComponent(a.series)}`}
                    className="block text-blue-600 hover:underline">
                    {a.series} series →
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
