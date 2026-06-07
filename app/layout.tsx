import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://engines.haifengmachinery.com'),
  title: {
    default: 'The Generator Engine Encyclopedia – Diesel & Gas Engine Specs Database',
    template: '%s | The Generator Engine Encyclopedia',
  },
  description:
    'The complete specifications database for diesel and gas engines used in electrical power generation. Browse specs, datasheets, and manuals for every generator engine brand and model worldwide.',
  openGraph: {
    siteName: 'The Generator Engine Encyclopedia',
    type: 'website',
  },
}

const BASE = 'https://engines.haifengmachinery.com'

// Site-wide structured data: identifies the publisher (Organization) and the site
// (WebSite) and enables Google's sitelinks search box via SearchAction.
const siteSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#org`,
    name: 'Haifeng Machinery',
    url: 'https://www.haifengmachinery.com',
    logo: `${BASE}/icon.png`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: 'The Generator Engine Encyclopedia',
    url: BASE,
    publisher: { '@id': `${BASE}/#org` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/engines?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, '\\u003c') }}
        />
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-base sm:text-xl font-bold text-blue-700 whitespace-nowrap">The Generator Engine</span>
              <span className="hidden sm:inline text-base sm:text-xl font-light text-gray-600 whitespace-nowrap">Encyclopedia</span>
            </Link>
            <SiteNav />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 mt-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <p>
                The Generator Engine Encyclopedia — a free resource by{' '}
                <a href="https://www.haifengmachinery.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Haifeng Machinery
                </a>
              </p>
              <div className="flex gap-4">
                <Link href="/engines" className="hover:text-gray-900">Browse Engines</Link>
                <Link href="/guides" className="hover:text-gray-900">Guides</Link>
                <Link href="/brands" className="hover:text-gray-900">Brands</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
