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
    label: 'Natural gas and propane generator systems',
    href: 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/',
    desc: 'Match natural gas, CNG/LNG, propane (LPG), and biogas engine options to 50/60 Hz packages.',
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
    <section className="border-b border-gray-900 py-10 sm:py-14">
      <div className="grid border-t border-gray-900 lg:grid-cols-12">
        <div className="border-b border-gray-900 py-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:pr-8">
          <p className="section-index mb-3">{eyebrow}</p>
          <h2 className="brand-section-title font-bold text-gray-900">{title}</h2>
          <p className="measure-copy mt-4 text-sm leading-relaxed text-gray-600">{intro}</p>
          <div className="mt-7 grid grid-cols-3 border-t border-gray-900 text-xs">
            {['Shortlist', 'Package', 'Inquiry'].map((step) => (
              <div key={step} className="border-r border-gray-200 px-2 py-3 font-bold text-gray-900 last:border-r-0">
                {step}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-8 lg:pl-8">
          {COMMERCIAL_PATHWAYS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-4 border-b border-gray-200 py-4 hover:bg-blue-50 sm:grid-cols-[3.5rem_minmax(0,16rem)_minmax(0,1fr)]"
            >
              <span className="px-2 text-xs font-bold text-blue-600 sm:px-4">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-blue-600">{link.label}</span>
              <p className="col-span-2 max-w-[58ch] px-2 text-xs leading-relaxed text-gray-500 sm:col-span-1 sm:px-0">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
