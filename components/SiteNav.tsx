'use client'

import { useState } from 'react'
import Link from 'next/link'

const LINKS = [
  { href: '/engines', label: 'Engines' },
  { href: '/alternators', label: 'Alternators' },
  { href: '/brands', label: 'Brands' },
  { href: '/guides', label: 'Guides' },
]

const CONTACT = 'https://www.haifengmachinery.com/contact-us/'

export function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-blue-600 transition-colors">
            {l.label}
          </Link>
        ))}
        <a href={CONTACT} target="_blank" rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Contact Us ↗
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                {l.label}
              </Link>
            ))}
            <a href={CONTACT} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="mt-1 px-3 py-3 rounded-lg text-base font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Contact Us ↗
            </a>
          </nav>
        </div>
      )}
    </>
  )
}
