import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import type { Engine } from '@/lib/types'
import {
  parsePair, pairSlug, competitorsFor, getComparisonPairs, fuelCategory, resolveComparePair,
} from '@/lib/compare'
import { headlinePower, displayKva, ratedSpeedLabel, compactConfig } from '@/lib/engine-display'
import { compareMetadataDescription, compareMetadataTitle } from '@/lib/metadata-lengths'

const BASE = 'https://engines.haifengmachinery.com'

// Pre-render the curated pairs; allow any other valid pair to render on demand (and get cached).
export const dynamicParams = true

interface Props { params: Promise<{ pair: string }> }

export async function generateStaticParams() {
  const pairs = await getComparisonPairs()
  return pairs.map((pair) => ({ pair }))
}

function label(e: Engine) { return `${e.brand} ${e.model}` }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params
  const p = parsePair(pair)
  if (!p) return {}
  const { a, b } = await resolveComparePair(p.a, p.b)
  if (!a || !b) return {}
  const canonical = `/engines/compare/${pairSlug(a.slug, b.slug)}`
  const title = compareMetadataTitle(a, b)
  const description = compareMetadataDescription(a, b)
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
  }
}

// [label, valueA, valueB]
function specRows(a: Engine, b: Engine): [string, string, string][] {
  const dash = '—'
  const kwe = (e: Engine, f: 'standby' | 'prime', hz: 50 | 60) => {
    const v = (e as unknown as Record<string, number | undefined>)[`${f}_power_kwe_${hz}hz`]
    return v != null ? `${v.toLocaleString()} kWe` : dash
  }
  const kva = (e: Engine) => { const v = displayKva(headlinePower(e)); return v ? `${v.toLocaleString()} kVA` : dash }
  return [
    ['Headline rating', kva(a), kva(b)],
    ['Standby (50 Hz)', kwe(a, 'standby', 50), kwe(b, 'standby', 50)],
    ['Prime (50 Hz)', kwe(a, 'prime', 50), kwe(b, 'prime', 50)],
    ['Standby (60 Hz)', kwe(a, 'standby', 60), kwe(b, 'standby', 60)],
    ['Prime (60 Hz)', kwe(a, 'prime', 60), kwe(b, 'prime', 60)],
    ['Displacement', a.displacement_l ? `${a.displacement_l} L` : dash, b.displacement_l ? `${b.displacement_l} L` : dash],
    ['Configuration', compactConfig(a) ?? dash, compactConfig(b) ?? dash],
    ['Cylinders', a.cylinders != null ? String(a.cylinders) : dash, b.cylinders != null ? String(b.cylinders) : dash],
    ['Rated speed', ratedSpeedLabel(a), ratedSpeedLabel(b)],
    ['Fuel', a.fuel_type ?? dash, b.fuel_type ?? dash],
    ['Cooling', a.cooling_method ?? dash, b.cooling_method ?? dash],
    ['Emissions', a.emissions_standard ?? dash, b.emissions_standard ?? dash],
    ['Dry weight', a.weight_kg ? `${a.weight_kg} kg` : dash, b.weight_kg ? `${b.weight_kg} kg` : dash],
    ['Origin', a.origin ?? dash, b.origin ?? dash],
  ]
}

function buildIntro(a: Engine, b: Engine): string {
  const cat = (a.fuel_type || 'diesel').toLowerCase()
  const ka = displayKva(headlinePower(a))
  const kb = displayKva(headlinePower(b))
  let s = `The ${label(a)} and ${label(b)} are both ${cat === 'diesel' ? 'diesel' : cat} generator engines in a similar power class. `
  if (ka && kb) {
    const diff = Math.abs(ka - kb) / Math.max(ka, kb)
    s += diff < 0.05
      ? `Both are rated at roughly ${Math.round((ka + kb) / 2).toLocaleString()} kVA. `
      : `The ${label(ka > kb ? a : b)} is the higher-output unit (${Math.max(ka, kb).toLocaleString()} kVA vs ${Math.min(ka, kb).toLocaleString()} kVA). `
  }
  if (a.displacement_l && b.displacement_l && a.displacement_l !== b.displacement_l) {
    s += `Displacement is ${a.displacement_l} L versus ${b.displacement_l} L. `
  }
  s += 'The table below compares their full specifications side by side.'
  return s
}

function packageLinkFor(a: Engine, b: Engine): { href: string; label: string } {
  const fuel = fuelCategory(a) === 'gas' || fuelCategory(b) === 'gas' ? 'gas' : 'diesel'
  if (fuel === 'gas') {
    return { href: 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/', label: 'gas generator packages' }
  }

  const regulated = [a.emissions_standard, b.emissions_standard].some((standard) => standard && !/unregulated/i.test(standard))
  return regulated
    ? { href: 'https://www.haifengmachinery.com/diesel-power-package-regulated/', label: 'regulated diesel generator packages' }
    : { href: 'https://www.haifengmachinery.com/product-offerings/', label: 'diesel generator packages' }
}

function ComparisonBuyerGuide({ a, b }: { a: Engine; b: Engine }) {
  const productPackage = packageLinkFor(a, b)
  const aKva = displayKva(headlinePower(a))
  const bKva = displayKva(headlinePower(b))
  const higher = aKva && bKva && aKva !== bKva ? (aKva > bKva ? a : b) : null

  return (
    <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Choosing between {label(a)} and {label(b)}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Use this comparison as an engineering shortlist, then confirm the complete generator package against
        load profile, voltage, 50/60 Hz frequency, duty class, emissions rules, cooling margin, altitude,
        ambient temperature, enclosure design, controller features, and alternator sizing.
        {higher ? ` The ${label(higher)} has the higher headline kVA rating in this pair, but site conditions and duty cycle can still change the final recommendation.` : ''}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <a
          href={productPackage.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
        >
          Haifeng {productPackage.label}
        </a>
        <a
          href="https://www.haifengmachinery.com/contact-us/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
        >
          Request sizing support
        </a>
        <Link href="/guides/how-to-choose-a-generator-engine" className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200">
          Generator engine selection guide
        </Link>
      </div>
    </section>
  )
}

export default async function ComparePage({ params }: Props) {
  const { pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) notFound()

  // Enforce canonical (alphabetical) ordering — redirect B-vs-A to A-vs-B.
  const { a, b, canonical } = await resolveComparePair(parsed.a, parsed.b)
  if (!a || !b) notFound()
  if (canonical && canonical !== pair) permanentRedirect(`/engines/compare/${canonical}`)

  const intro = buildIntro(a, b)
  const rows = specRows(a, b)

  // Sibling comparisons for internal linking: each engine's other rivals.
  const [compA, compB] = await Promise.all([competitorsFor(a, 3), competitorsFor(b, 3)])
  const siblings = [
    ...compA.filter((o) => o.slug !== b.slug).map((o) => ({ e: a, o })),
    ...compB.filter((o) => o.slug !== a.slug).map((o) => ({ e: b, o })),
  ].slice(0, 6)

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: `${label(a)} vs ${label(b)}`, url: `${BASE}/engines/compare/${pair}`, description: intro,
      about: [
        { '@type': 'Product', name: label(a), url: `${BASE}/engines/${a.slug}` },
        { '@type': 'Product', name: label(b), url: `${BASE}/engines/${b.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Engines', item: `${BASE}/engines` },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: `${BASE}/engines` },
        { '@type': 'ListItem', position: 3, name: `${label(a)} vs ${label(b)}`, item: `${BASE}/engines/compare/${pair}` },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="max-w-4xl">
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/engines" className="hover:text-blue-600">Engines</Link>
          {' / '}<span className="text-gray-700">Compare</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {label(a)} <span className="text-gray-400 font-normal">vs</span> {label(b)}
        </h1>
        <p className="text-gray-600 leading-relaxed mb-6 max-w-3xl">{intro}</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-500 w-1/3">Specification</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  <Link href={`/engines/${a.slug}`} className="text-blue-700 hover:underline">{label(a)}</Link>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  <Link href={`/engines/${b.slug}`} className="text-blue-700 hover:underline">{label(b)}</Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([lbl, va, vb]) => (
                <tr key={lbl} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 px-4 text-gray-500">{lbl}</td>
                  <td className={`py-2.5 px-4 text-gray-800 ${va !== vb ? 'font-semibold' : ''}`}>{va}</td>
                  <td className={`py-2.5 px-4 text-gray-800 ${va !== vb ? 'font-semibold' : ''}`}>{vb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/engines/${a.slug}`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 bg-white transition-colors">
            {label(a)} full specs →
          </Link>
          <Link href={`/engines/${b.slug}`} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 bg-white transition-colors">
            {label(b)} full specs →
          </Link>
        </div>

        <ComparisonBuyerGuide a={a} b={b} />

        {siblings.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">More comparisons</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {siblings.map(({ e, o }) => (
                <li key={`${e.slug}-${o.slug}`}>
                  <Link href={`/engines/compare/${pairSlug(e.slug, o.slug)}`} className="block rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 px-3 py-2 text-sm text-gray-700 transition-colors">
                    {label(e)} <span className="text-gray-400">vs</span> {label(o)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}
