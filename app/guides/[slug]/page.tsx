import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllGuides, getGuideBySlug } from '@/lib/guides'
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

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      datePublished: g.updated,
      dateModified: g.updated,
      author: { '@type': 'Organization', name: 'Haifeng Machinery', url: 'https://www.haifengmachinery.com' },
      publisher: { '@id': `${BASE}/#org` },
      mainEntityOfPage: `${BASE}/guides/${slug}`,
    },
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{g.title}</h1>
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
