import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://engines.haifengmachinery.com'),
  title: {
    default: 'Diesel Engine Encyclopedia – Generator Engine Specs Database',
    template: '%s | Diesel Engine Encyclopedia',
  },
  description:
    'The complete diesel engine specifications database for generator engines. Browse specs, datasheets, and manuals for every diesel engine brand and model worldwide.',
  openGraph: {
    siteName: 'Diesel Engine Encyclopedia',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-700">Diesel Engine</span>
              <span className="text-xl font-light text-gray-600">Encyclopedia</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/engines" className="hover:text-blue-600 transition-colors">Engines</Link>
              <Link href="/alternators" className="hover:text-blue-600 transition-colors">Alternators</Link>
              <Link href="/brands" className="hover:text-blue-600 transition-colors">By Brand</Link>
              <a
                href="https://www.haifengmachinery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Haifeng Machinery ↗
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
                Diesel Engine Encyclopedia — a free resource by{' '}
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
