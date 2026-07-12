import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { computeHubStats, buildHubOverview, buildHubFaqs, engineKwe } from '@/lib/hub-stats'

export interface HubRelatedLink { label: string; href: string }
interface HubGuidance {
  title: string
  body: string
}

interface HubProjectLink {
  label: string
  href: string
}

function fmtRange(s: ReturnType<typeof computeHubStats>): string {
  if (s.kweMin != null && s.kweMax != null && s.kweMax > s.kweMin) {
    return `${Math.round(s.kweMin).toLocaleString()}-${Math.round(s.kweMax).toLocaleString()} kWe`
  }
  if (s.kweMax != null) return `up to ${Math.round(s.kweMax).toLocaleString()} kWe`
  return 'the required kWe range'
}

function buildSelectionGuidance(subject: string, s: ReturnType<typeof computeHubStats>): HubGuidance[] {
  const fuel = s.hasDiesel && s.hasGas ? 'diesel or gas' : s.hasGas ? 'gas' : 'diesel'
  return [
    {
      title: 'Start with duty and output',
      body: `Shortlist ${subject} around ${fmtRange(s)}, then compare prime, standby and frequency ratings against the actual load profile.`,
    },
    {
      title: 'Check site constraints',
      body: `Review ${fuel} availability, cooling package, emissions rules and service support before treating two similar kWe ratings as interchangeable.`,
    },
    {
      title: 'Match the alternator and package',
      body: 'After the engine shortlist is clear, confirm voltage, frequency, alternator frame size and radiator or canopy requirements for the complete generator set.',
    },
  ]
}

function buildProjectLinks(s: ReturnType<typeof computeHubStats>): HubProjectLink[] {
  return [
    ...(s.hasDiesel
      ? [{ label: 'Diesel generator packages', href: 'https://www.haifengmachinery.com/diesel-power-package-regulated/' }]
      : []),
    ...(s.hasGas
      ? [{ label: 'Gas generator packages', href: 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/' }]
      : []),
    { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    { label: 'Alternator matching guide', href: '/guides/alternator-voltage-and-frequency' },
    { label: 'Browse alternators', href: '/alternators' },
    { label: 'Contact Haifeng Machinery', href: 'https://www.haifengmachinery.com/contact-us/' },
  ]
}

// Below-the-table content block shared by every engine hub (brand + facet pages). It adds the
// unique, data-derived prose, key-facts strip, buyer guidance and cross-links that turn a bare
// listing into a page worth ranking — and emits FAQPage JSON-LD whose text matches the rendered FAQ.
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
  const guidance = buildSelectionGuidance(subject, stats)
  const projectLinks = buildProjectLinks(stats)

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

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Selection notes for buyers</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {guidance.map((item) => (
            <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Use this shortlist in a generator-set project</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-3xl">
          The model list is a specification starting point. Haifeng Machinery can help confirm the engine rating,
          alternator match, cooling system and emissions requirement for standby, prime or continuous-duty projects.
        </p>
        <div className="flex flex-wrap gap-2">
          {projectLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

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
