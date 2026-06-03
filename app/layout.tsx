import type { Metadata } from 'next'
import Link from 'next/link'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-700">The Generator Engine</span>
              <span className="text-xl font-light text-gray-600">Encyclopedia</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/engines" className="hover:text-blue-600 transition-colors">Engines</Link>
              <Link href="/alternators" className="hover:text-blue-600 transition-colors">Alternators</Link>
              <Link href="/brands" className="hover:text-blue-600 transition-colors">Brands</Link>
              <a
                href="https://www.haifengmachinery.com/contact-us/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Us ↗
              </a>
            </nav>
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
                <Link href="/brands" className="hover:text-gray-900">Brands</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
