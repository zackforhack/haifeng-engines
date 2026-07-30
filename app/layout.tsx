import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { SiteNav } from '@/components/SiteNav'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
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

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/showcase/taizhou-haifeng/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@haifengmachinery8351' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61579731085161' },
]

// Site-wide structured data: identifies the publisher (Organization) and the site
// (WebSite) and enables Google's sitelinks search box via SearchAction.
const siteSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#org`,
    name: 'Haifeng Machinery',
    legalName: 'Taizhou Haifeng Machinery Manufacturing Co., Ltd.',
    alternateName: ['Haifeng Power', 'Taizhou Haifeng Machinery', 'Haifeng Machinery Generator Engine Database'],
    url: 'https://www.haifengmachinery.com',
    logo: 'https://ecdn.cnyandex.com/haifengmachinery/uploads/haifeng-logo-560-1.webp',
    email: 'sales@haifengmachinery.com',
    telephone: '+1 4163179500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '89 Fenghuang West Road, Economic Development District',
      addressLocality: 'Taizhou City',
      addressRegion: 'Jiangsu Province',
      addressCountry: 'CN',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+1 4163179500',
        email: 'sales@haifengmachinery.com',
        availableLanguage: ['en', 'zh'],
        url: 'https://www.haifengmachinery.com/contact-us/',
      },
    ],
    sameAs: [...SOCIALS.map((s) => s.href), BASE],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: 'Generator Engine Specs Database by Haifeng Machinery',
    alternateName: 'The Generator Engine Encyclopedia',
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
        <header className="bg-white border-b border-gray-900 sticky top-0 z-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-4 group" aria-label="Haifeng Machinery Generator Engine Database">
              <Image
                src="/haifeng-logo.png"
                alt="Haifeng Machinery"
                width={440}
                height={150}
                priority
                className="h-auto w-[150px] shrink-0 sm:w-[172px]"
              />
              <span className="hidden min-w-0 border-l border-gray-300 pl-4 lg:block">
                <span className="block whitespace-nowrap text-[15px] font-semibold text-gray-900">
                  Generator Engine Database
                </span>
                <span className="block whitespace-nowrap text-[13px] text-gray-500">
                  Technical specifications and datasheets
                </span>
              </span>
            </Link>
            <SiteNav />
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-900 mt-16 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-500">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-12">
              <div className="sm:col-span-6 max-w-xl">
                <Image
                  src="/haifeng-logo.png"
                  alt="Haifeng Machinery"
                  width={440}
                  height={150}
                  className="h-auto w-[180px]"
                />
                <p className="mt-5 max-w-md text-[15px] leading-6">
                  Generator Engine Database is a free technical reference maintained by
                  Haifeng Machinery / Haifeng Power.
                </p>
              </div>
              <div className="sm:col-span-3 space-y-2">
                <p className="text-xs font-bold text-gray-900">Catalog</p>
                <Link href="/engines" className="block hover:text-blue-600">Engines</Link>
                <Link href="/alternators" className="block hover:text-blue-600">Alternators</Link>
                <Link href="/brands" className="block hover:text-blue-600">Brands</Link>
              </div>
              <div className="sm:col-span-3 space-y-2">
                <p className="text-xs font-bold text-gray-900">Resources</p>
                <Link href="/guides" className="block hover:text-blue-600">Guides</Link>
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="block hover:text-blue-600">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <p className="mt-10 max-w-md border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-400">
              Specifications are provided for engineering reference. Confirm final ratings with the manufacturer.
            </p>
          </div>
        </footer>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
