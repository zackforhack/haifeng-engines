import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBrands, getAllEngines } from '@/lib/engines'
import { BrandLogo } from '@/components/BrandLogo'
import { brandSlug } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Generator Engine Brands',
  description: 'Browse diesel and gas generator engine specifications by brand. Find Cummins, Perkins, Volvo, Deutz, and more.',
  alternates: { canonical: '/brands' },
}

export default async function BrandsPage() {
  const [brands, engines] = await Promise.all([getAllBrands(), getAllEngines()])

  const brandCounts = brands.map((brand) => ({
    brand,
    total: engines.filter((e) => e.brand === brand).length,
    active: engines.filter((e) => e.brand === brand && e.status === 'active').length,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse by Brand</h1>
      <p className="text-gray-500 mb-8">{brands.length} brands in the database</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandCounts.map(({ brand, total, active }) => (
          <Link
            key={brand}
            href={`/brands/${brandSlug(brand)}`}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <BrandLogo brand={brand} size="md" className="mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">{brand}</h2>
            <p className="text-sm text-gray-500">
              {total} engine{total !== 1 ? 's' : ''} &middot; {active} in production
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
