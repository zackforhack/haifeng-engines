import Link from 'next/link'
import { Suspense } from 'react'
import { getAllBrands, getAllEngines } from '@/lib/engines'
import { SearchBar } from '@/components/SearchBar'

export default async function HomePage() {
  const [engines, brands] = await Promise.all([getAllEngines(), getAllBrands()])

  const activeCount = engines.filter((e) => e.status === 'active').length
  const discontinuedCount = engines.filter((e) => e.status === 'discontinued').length

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Diesel Engine Encyclopedia
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          The complete specifications database for diesel generator engines worldwide.
          Find datasheets, manuals, and full technical specs for every major brand and model.
        </p>
        <div className="flex justify-center">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 mb-12">
        {[
          { value: engines.length, label: 'Total Engines' },
          { value: activeCount, label: 'In Production' },
          { value: discontinuedCount, label: 'Archived / Discontinued' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Browse by Brand */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Browse by Brand</h2>
          <Link href="/brands" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/brands/${encodeURIComponent(brand.toLowerCase())}`}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Need a diesel generator?
        </h2>
        <p className="text-gray-600 mb-4">
          Haifeng Machinery supplies diesel generators and engines worldwide.
        </p>
        <a
          href="https://www.haifengmachinery.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Visit Haifeng Machinery ↗
        </a>
      </section>
    </div>
  )
}
