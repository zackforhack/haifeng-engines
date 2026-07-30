'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Menu, X } from 'lucide-react'

const LINKS = [
  { href: '/engines', label: 'Engines' },
  { href: '/alternators', label: 'Alternators' },
  { href: '/brands', label: 'Brands' },
  { href: '/guides', label: 'Guides' },
]

const CONTACT = 'https://www.haifengmachinery.com/contact-us/'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-stretch self-stretch text-sm font-medium text-gray-600">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={pathname === l.href || pathname.startsWith(`${l.href}/`) ? 'page' : undefined}
            className={`flex items-center border-l border-gray-200 px-5 transition-colors ${
              pathname === l.href || pathname.startsWith(`${l.href}/`)
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50 hover:text-blue-600'
            }`}
          >
            {l.label}
          </Link>
        ))}
        <a href={CONTACT} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 hover:bg-blue-700 transition-colors">
          Contact <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
      </button>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-gray-900">
          <nav className="flex flex-col px-4 py-3">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="border-t border-gray-200 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                {l.label}
              </Link>
            ))}
            <a href={CONTACT} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="flex items-center justify-between border-t border-gray-900 bg-blue-600 px-3 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors">
              Contact Us <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </nav>
        </div>
      )}
    </>
  )
}
