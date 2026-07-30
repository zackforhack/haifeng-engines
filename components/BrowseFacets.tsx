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
    <section className="mt-14 border-t border-gray-900 pt-6">
      <p className="section-index mb-3">Browse</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-7">Engines by category</h2>
      <div className="grid grid-cols-1 border-t border-gray-900 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.heading} className="border-b border-r border-gray-200 p-4">
            <p className="mb-4 text-xs font-bold text-gray-900">{g.heading}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-blue-700 hover:decoration-blue-600"
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
