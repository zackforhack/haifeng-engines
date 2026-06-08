import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getDbStats, getFilterOptions } from '@/lib/engines'
import { getAllAlternators } from '@/lib/alternators'
import { getAllGuides } from '@/lib/guides'
import { SearchBar } from '@/components/SearchBar'
import { CountUp } from '@/components/CountUp'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'The Generator Engine Encyclopedia — Diesel, Gas Engine & Alternator Specs' },
  description:
    'The complete reference for diesel and gas generator engines and alternators used in electrical power generation. Browse specs, datasheets and guides by brand, model, power output and emissions standard.',
  alternates: { canonical: '/' },
}

const BASE = 'https://engines.haifengmachinery.com'

const POWER_PRESETS = [
  { label: 'Under 100 kWe',   slug: 'under-100-kwe' },
  { label: '100 – 500 kWe',   slug: '100-500-kwe' },
  { label: '500 – 1,500 kWe', slug: '500-1500-kwe' },
  { label: '1,500+ kWe',      slug: '1500-plus-kwe' },
]
const brandHref = (brand: string) => `/brands/${encodeURIComponent(brand.toLowerCase())}`

export default async function HomePage() {
  const [stats, options, alternators, guides] = await Promise.all([
    getDbStats(),
    getFilterOptions(),
    getAllAlternators(),
    Promise.resolve(getAllGuides()),
  ])

  const sections = [
    { href: '/engines', title: 'Engines', desc: `${stats.total.toLocaleString()} diesel & gas engine spec pages`, count: stats.total },
    { href: '/alternators', title: 'Alternators', desc: `${alternators.length} generator alternator models`, count: alternators.length },
    { href: '/brands', title: 'Brands', desc: `${stats.brandCount} engine brands worldwide`, count: stats.brandCount },
    { href: '/guides', title: 'Guides', desc: `${guides.length} practical generator guides`, count: guides.length },
  ]

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The Generator Engine Encyclopedia — sections',
    itemListElement: sections.map((s, i) => ({
      '@type': 'ListItem', position: i + 1, name: s.title, url: `${BASE}${s.href}`,
    })),
  }

  return (
    <div>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }} />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-10 shadow-xl">
        <div className="hero-photo" aria-hidden="true">
          <div className="img" />
          <div className="overlay" />
        </div>
        <div className="relative z-10 text-center px-6 py-16 sm:py-24">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-cyan-200 bg-white/10 border border-white/20 backdrop-blur rounded-full px-3 py-1 mb-5">
            The Generator Engine Encyclopedia
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-white">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              <CountUp end={stats.total} />+
            </span>{' '}
            Generator Engine Specifications
          </h1>
          <p className="text-slate-300 text-lg mb-9 max-w-2xl mx-auto">
            The complete reference for <strong className="font-semibold text-white">diesel and gas</strong> engines and alternators used in electrical power generation — search specs, datasheets, and guides by brand, model, emissions standard, and power output.
          </p>
          <div className="flex justify-center gap-8 sm:gap-12 flex-wrap mb-10">
            {[
              { value: stats.total, label: 'Engines' },
              { value: alternators.length, label: 'Alternators' },
              { value: stats.brandCount, label: 'Brands' },
              { value: stats.originCount, label: 'Countries' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-cyan-300"><CountUp end={value} /></p>
                <p className="text-sm text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Suspense><SearchBar defaultValue="" target="/engines" /></Suspense>
          </div>
        </div>
      </div>

      {/* Explore sections */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all">
            <p className="text-2xl font-extrabold text-blue-700"><CountUp end={s.count} /></p>
            <h2 className="text-base font-bold text-gray-900 mt-1">{s.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>

      {/* Browse by fuel */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Browse Engines by Fuel Type</h2>
        <div className="flex flex-wrap gap-2">
          {[{ label: 'Diesel', value: 'diesel' }, { label: 'Gas (Natural Gas · CNG/LNG · Biogas)', value: 'gas' }].map(({ label, value }) => (
            <Link key={value} href={`/engines/fuel/${value}`}
              className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Browse by Emissions Standard</h2>
          <div className="flex flex-wrap gap-2">
            {['U.S. EPA', 'Euro Stage', 'U.S. EPA Final Tier 4', 'Euro Stage V', 'Unregulated'].map((value) => (
              <Link key={value} href={`/engines?${new URLSearchParams({ emissions: value }).toString()}`}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                {value}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Browse by Power Range</h2>
          <div className="flex flex-wrap gap-2">
            {POWER_PRESETS.map(({ label, slug }) => (
              <Link key={label} href={`/engines/power/${slug}`}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Brands */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Browse by Brand</h2>
          <Link href="/brands" className="text-sm text-blue-600 hover:underline">View all brands →</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.brands.map((brand) => (
            <Link key={brand} href={brandHref(brand)}
              className="px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors">
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
