import { ContextWhatsAppCta } from '@/components/ContextWhatsAppCta'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGuides, getGuideBySlug, getRelatedGuides } from '@/lib/guides'
import { OverhaulModelLinks } from '@/components/OverhaulModelLinks'
import { GeneratorSizingCalculator } from '@/components/GeneratorSizingCalculator'

const BASE = 'https://engines.haifengmachinery.com'

// Guides may embed an interactive tool by placing <!--CALCULATOR--> in the Markdown;
// the article HTML is split around it and the React component rendered in between.
const CALC_MARKER = '<!--CALCULATOR-->'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = getGuideBySlug(slug)
  if (!g) return {}
  return {
    title: g.title,
    description: g.description,
    keywords: g.keyword,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: { title: g.title, description: g.description, type: 'article' },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const g = getGuideBySlug(slug)
  if (!g) notFound()
  const relatedGuides = getRelatedGuides(slug)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${BASE}/guides/${slug}#article`,
      headline: g.title,
      description: g.description,
      image: g.hero ? `${BASE}${g.hero}` : `${BASE}/guides/${slug}/opengraph-image`,
      datePublished: g.updated,
      dateModified: g.updated,
      articleSection: g.cluster,
      keywords: g.keyword,
      author: { '@type': 'Organization', name: 'Haifeng Machinery', url: 'https://www.haifengmachinery.com' },
      publisher: { '@id': `${BASE}/#org` },
      isPartOf: { '@id': `${BASE}/#website` },
      about: [
        { '@type': 'Thing', name: 'Generator engines' },
        { '@type': 'Thing', name: 'Diesel and gas generator sets' },
        { '@type': 'Thing', name: g.cluster },
      ],
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/guides/${slug}` },
    },
    ...(relatedGuides.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Related guides for ${g.title}`,
          itemListElement: relatedGuides.map((guide, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: guide.title,
            url: `${BASE}/guides/${guide.slug}`,
          })),
        }]
      : []),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Guides', item: `${BASE}/guides` },
        { '@type': 'ListItem', position: 2, name: g.title, item: `${BASE}/guides/${slug}` },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <article className="max-w-3xl mx-auto">
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/guides" className="hover:text-blue-600">Guides</Link>
          {' / '}
          <span className="text-gray-700">{g.title}</span>
        </nav>

        {g.hero && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={g.hero} alt="" className="guide-hero" />
        )}

        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{g.cluster}</p>
        <h1 className="brand-display mb-3 font-bold text-gray-900">{g.title}</h1>
        <p className="text-gray-500 mb-8">
          Updated {new Date(g.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {g.html.includes(CALC_MARKER) ? (
          (() => {
            const [before, after] = g.html.split(CALC_MARKER)
            return (
              <div className="guide-content">
                <div dangerouslySetInnerHTML={{ __html: before }} />
                <GeneratorSizingCalculator />
                <div dangerouslySetInnerHTML={{ __html: after ?? '' }} />
              </div>
            )
          })()
        ) : (
          <div className="guide-content" dangerouslySetInnerHTML={{ __html: g.html }} />
        )}

        {slug === 'north-american-voltage-standards' && (
          <ContextWhatsAppCta title="Need a generator matched to your site voltage?"
            detail="Share the destination, required voltage, phase, frequency and load list. We can discuss the generator configuration for your project."
            message="Hi Haifeng Machinery, I need help matching a generator to my site. Destination: Voltage / phase / frequency: Required load:"
            path={`/guides/${slug}`} placement="voltage_guide_after_answer" intent="voltage_matching" />
        )}
        {slug === 'kva-vs-kw' && (
          <ContextWhatsAppCta title="Need help turning the rating into a generator requirement?"
            detail="Share your load list, power factor if known, voltage and largest motor load to discuss generator sizing."
            message="Hi Haifeng Machinery, I need help with generator sizing. Load list: Power factor if known: Voltage / frequency: Largest motor:"
            path={`/guides/${slug}`} placement="kva_kw_guide_after_answer" intent="generator_sizing" />
        )}

        {['how-to-size-a-generator', 'how-to-choose-a-generator-engine', 'how-to-select-a-transfer-switch', 'alternator-voltage-and-frequency', 'generator-paralleling-explained', 'low-voltage-vs-medium-voltage-generators', 'prime-vs-standby-cop-dcp', 'diesel-vs-natural-gas-total-cost-of-ownership'].includes(slug) && (
          <ContextWhatsAppCta
            title="Applying this guide to a generator project?"
            detail="Share your application, load, voltage, operating duty and project question to discuss package selection with Haifeng."
            message={`Hi Haifeng Machinery, I am reading ${g.title}.\nApplication:\nLoad / voltage / frequency:\nOperating duty:\nDestination:\nProject question:`}
            path={`/guides/${slug}`} placement="buyer_guide_after_answer" intent={slug} />
        )}

        {slug === 'how-to-read-engine-nameplate-spec-sheet' && <OverhaulModelLinks />}

        {relatedGuides.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Related generator guides</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{guide.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{guide.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">Looking for a specific engine?</p>
            <p className="text-sm text-gray-600">Browse {`>`}1,600 diesel & gas generator engine specs.</p>
          </div>
          <Link href="/engines" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Browse engines →
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/guides" className="text-blue-600 hover:underline text-sm">← All guides</Link>
        </div>
      </article>
    </>
  )
}
