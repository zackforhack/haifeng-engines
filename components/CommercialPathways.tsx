export const COMMERCIAL_PATHWAYS = [
  {
    label: 'Industrial generator product offerings',
    href: 'https://www.haifengmachinery.com/product-offerings/',
    desc: 'Start from Haifeng Machinery package categories after shortlisting engines or alternators.',
  },
  {
    label: 'EPA standby diesel generators',
    href: 'https://www.haifengmachinery.com/diesel-power-package-regulated/',
    desc: 'Review regulated emergency standby diesel generator packages and documentation needs.',
  },
  {
    label: 'CNG and LPG gas generator systems',
    href: 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/',
    desc: 'Match natural gas, CNG, LPG, and biogas engine options to 50/60 Hz packages.',
  },
  {
    label: 'Rental power and towable generator solutions',
    href: 'https://www.haifengmachinery.com/towable-power-package/',
    desc: 'Compare mobile and temporary-power package requirements for fleet, site, and event use.',
  },
  {
    label: 'Custom EPC power solutions',
    href: 'https://www.haifengmachinery.com/custom-epc-power-solutions/',
    desc: 'Use EPC support for containerized, parallel, switchgear, controls, and documentation scope.',
  },
] as const

interface CommercialPathwaysProps {
  eyebrow?: string
  title?: string
  intro?: string
}

export function CommercialPathways({
  eyebrow = 'Haifeng package paths',
  title = 'Turn a spec shortlist into a generator package',
  intro = 'Use the engine and alternator database to compare technical fit, then move into the Haifeng Machinery product route that matches the fuel, emissions, mobility, and project scope.',
}: CommercialPathwaysProps) {
  return (
    <section className="mb-12 border-y border-gray-200 py-8">
      <div className="mb-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">{eyebrow}</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{intro}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {COMMERCIAL_PATHWAYS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{link.label}</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">{link.desc}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
