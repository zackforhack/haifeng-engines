import Link from 'next/link'
import { CONFIG_FACETS, EMISSIONS_FACETS, RPM_FACETS } from '@/lib/facets'

// Internal-linking hub: surfaces every engine facet page from the high-traffic /engines listing so
// crawlers (and users) can reach the configuration / emissions / power / fuel / speed collections.
const GROUPS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Fuel',
    links: [
      { label: 'Diesel', href: '/engines/fuel/diesel' },
      { label: 'Gas', href: '/engines/fuel/gas' },
    ],
  },
  {
    heading: 'Power output',
    links: [
      { label: 'Under 100 kWe', href: '/engines/power/under-100-kwe' },
      { label: '100–500 kWe', href: '/engines/power/100-500-kwe' },
      { label: '500–1,500 kWe', href: '/engines/power/500-1500-kwe' },
      { label: '1,500+ kWe', href: '/engines/power/1500-plus-kwe' },
    ],
  },
  {
    heading: 'Configuration',
    links: Object.entries(CONFIG_FACETS).map(([slug, c]) => ({ label: c.label, href: `/engines/configuration/${slug}` })),
  },
  {
    heading: 'Emissions standard',
    links: Object.entries(EMISSIONS_FACETS).map(([slug, c]) => ({ label: c.label, href: `/engines/emissions/${slug}` })),
  },
  {
    heading: 'Rated speed',
    links: Object.entries(RPM_FACETS).map(([slug, c]) => ({ label: c.label, href: `/engines/rpm/${slug}` })),
  },
]

export function BrowseFacets() {
  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Browse engines by category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GROUPS.map((g) => (
          <div key={g.heading}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">{g.heading}</p>
            <div className="flex flex-wrap gap-2">
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1 text-sm rounded-full bg-white text-gray-600 border border-gray-300 hover:border-blue-400 hover:text-blue-700 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
