import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { computeHubStats, buildHubOverview, buildHubFaqs, engineKwe } from '@/lib/hub-stats'

export interface HubRelatedLink { label: string; href: string }

// Below-the-table content block shared by every engine hub (brand + facet pages). It adds the
// unique, data-derived prose, key-facts strip, FAQ and cross-links that turn a bare listing into
// a page worth ranking — and emits FAQPage JSON-LD whose text matches the rendered FAQ.
export function HubContent({
  subject,
  engines,
  related,
  showOverview = true,
}: {
  subject: string
  engines: Engine[]
  related?: HubRelatedLink[]
  showOverview?: boolean
}) {
  const stats = computeHubStats(engines)
  const overview = buildHubOverview(subject, stats)
  const faqs = buildHubFaqs(subject, stats)

  const kwes = engines.map(engineKwe).filter((v): v is number => v != null)
  const facts: { label: string; value: string }[] = [
    { label: 'Models', value: stats.total.toLocaleString() },
    ...(kwes.length ? [{ label: 'Power range', value: `${Math.round(stats.kweMin!).toLocaleString()}–${Math.round(stats.kweMax!).toLocaleString()} kWe` }] : []),
    { label: 'Fuel', value: stats.hasDiesel && stats.hasGas ? 'Diesel & gas' : stats.hasGas ? 'Gas' : 'Diesel' },
    ...(stats.brandCount > 1 ? [{ label: 'Brands', value: String(stats.brandCount) }] : []),
    ...(stats.withDatasheets ? [{ label: 'With datasheets', value: stats.withDatasheets.toLocaleString() }] : []),
  ]

  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
        />
      )}

      <h2 className="text-lg font-semibold text-gray-800 mb-3">About {subject}</h2>

      <dl className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${showOverview ? 'mb-5' : 'mb-8'}`}>
        {facts.map((f) => (
          <div key={f.label} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <dt className="text-xs font-medium text-gray-500">{f.label}</dt>
            <dd className="text-sm font-semibold text-gray-900">{f.value}</dd>
          </div>
        ))}
      </dl>

      {showOverview && <p className="text-gray-600 leading-relaxed max-w-3xl mb-8">{overview}</p>}

      {faqs.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently asked questions</h2>
          <div className="space-y-5 max-w-3xl mb-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {related && related.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Related</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="px-3 py-1 text-sm rounded-full bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-700 transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
