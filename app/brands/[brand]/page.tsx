import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllBrands, getEnginesByBrand } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  return {
    title: `${decoded} Diesel Engine Specs`,
    description: `Browse all ${decoded} diesel generator engine specifications, datasheets, and manuals.`,
  }
}

export async function generateStaticParams() {
  const brands = await getAllBrands()
  return brands.map((b) => ({ brand: encodeURIComponent(b.toLowerCase()) }))
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const engines = await getEnginesByBrand(decoded)

  if (!engines.length) notFound()

  const activeEngines = engines.filter((e) => e.status === 'active')
  const discontinuedEngines = engines.filter((e) => e.status !== 'active')

  return (
    <div>
      <nav className="text-sm text-gray-400 mb-4">
        <a href="/brands" className="hover:text-blue-600">Brands</a>
        {' / '}
        <span className="text-gray-700 capitalize">{decoded}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{engines[0].brand} Diesel Engines</h1>
      <p className="text-gray-500 mb-8">{engines.length} engines in the database</p>

      {activeEngines.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">In Production</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEngines.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </section>
      )}

      {discontinuedEngines.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Discontinued / Archived</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discontinuedEngines.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
