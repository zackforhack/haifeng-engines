export interface QuickWinLink {
  label: string
  href: string
}

export interface QuickWinCta {
  title: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

export interface QuickWinPageSeo {
  title: string
  h1: string
  description: string
  intro: string
  answer?: {
    heading: string
    body: string
  }
  aliases: string[]
  links: QuickWinLink[]
  cta: QuickWinCta
}

const CONTACT_URL = 'https://www.haifengmachinery.com/contact-us/'
const DIESEL_REGULATED_URL = 'https://www.haifengmachinery.com/diesel-power-package-regulated/'
const DIESEL_NON_REGULATED_URL = 'https://www.haifengmachinery.com/product-offerings/'
const GAS_PACKAGE_URL = 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/'
const CUSTOM_EPC_URL = 'https://www.haifengmachinery.com/custom-epc-power-solutions/'

export const QUICK_WIN_ENGINE_SEO: Record<string, QuickWinPageSeo> = {
  'kohler-kd62v12': {
    title: 'Kohler KD62V12 Specs: 2,500 kWe Generator Engine',
    h1: 'Kohler KD62V12 Generator Engine Specs',
    description: 'Kohler KD62V12 specs: 62.4 L V12 diesel, KD2000-KD2500 generator sets, 2,250-2,500 kWe standby, 50/60 Hz ratings and datasheet links.',
    intro: 'The Kohler KD62V12 is a 62.4 L V12 diesel generator engine used in KD2000-KD2500 generator sets. It is listed at 2,250 kWe standby at 50 Hz and 2,500 kWe standby at 60 Hz, with published prime/standby kWe and kVA ratings for high-power standby projects.',
    answer: {
      heading: 'What is the Kohler KD62V12?',
      body: 'The Kohler KD62V12 is a 62.4 L V12 diesel generator engine for very large standby and prime power packages. This reference page summarizes the KD62V12 as used in Kohler KD2000-KD2500 generator sets, including 50 Hz and 60 Hz ratings, displacement, cylinder layout, fuel type, emissions context, datasheet references and related high-power diesel engines. It is a strong candidate page for buyers comparing 2,000-2,500 kWe class generator-drive engines before confirming alternator frame, voltage, cooling, controls and enclosure scope.',
    },
    aliases: ['kd62v12', 'KD62 V12', 'Kohler KD62 V12', 'Kohler KD2000', 'Kohler KD2500', 'KD62V12 specs'],
    links: [
      { label: 'Kohler engine hub', href: '/brands/kohler' },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'EPA Tier 2 engines', href: '/engines/emissions/epa-tier-2' },
      { label: 'Alternator matching guide', href: '/guides/alternator-voltage-and-frequency' },
    ],
    cta: {
      title: 'Package the KD62V12 into a high-power diesel genset',
      body: 'Haifeng Machinery can help check alternator size, voltage, enclosure, radiator, controls and emissions requirements for generator packages in the KD62V12 power class.',
      primaryLabel: 'Request KD62V12 package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_REGULATED_URL,
    },
  },
  'isuzu-4bd1': {
    title: 'Isuzu 4BD1 Engine Specs, Manual & Power - 3.856 L',
    h1: 'Isuzu 4BD1 Engine Specs',
    description: 'Isuzu 4BD1 engine specs, manual links and power data: 3.856 L naturally aspirated inline-4 diesel, 70.6 kW at 2800 rpm, 17.5:1 compression.',
    intro: 'The Isuzu 4BD1 is a 3.856 L naturally aspirated inline-4 diesel engine from the Isuzu B Series. This reference page summarizes the 4BD1 displacement, cylinder layout, power rating, compression ratio, datasheet sources and related Isuzu 4B/6B models for buyers comparing compact diesel engine specifications.',
    answer: {
      heading: 'What is the Isuzu 4BD1?',
      body: 'The Isuzu 4BD1 is a 3.856 L naturally aspirated inline-4 diesel engine in the Isuzu B Series. This page is built for 4BD1 engine specs searches: it lists the 70.6 kW / 96 hp maximum mechanical output at 2,800 rpm, 17.5:1 compression ratio, liquid cooling, diesel fuel, Japan origin and available manual/specification sources. Because the 4BD1 is a variable-speed industrial engine rather than a fixed-speed generator-drive rating, use the data here as an engine reference before confirming alternator sizing, package derating and replacement options.',
    },
    aliases: ['4bd1', '4BD1 engine', '4BD1 engine specs', 'Isuzu 4BD1 specs', 'Isuzu 4BD1 diesel'],
    links: [
      { label: 'Isuzu engine hub', href: '/brands/isuzu' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-4 engines', href: '/engines/configuration/inline-4' },
      { label: 'Under 100 kWe engines', href: '/engines/power/under-100-kwe' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Compare the 4BD1 before choosing a diesel package',
      body: 'Haifeng Machinery can help compare the Isuzu 4BD1 with nearby diesel engine options, then review voltage, duty rating, enclosure, controls and export documentation for the complete generator package.',
      primaryLabel: 'Request 4BD1 package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'baudouin-20m33g2750-5': {
    title: 'Baudouin 20M33G2750/5 Generator Engine Specs - 2,750 kVA',
    h1: 'Baudouin 20M33G2750/5 Generator Engine Specs',
    description: 'Baudouin 20M33G2750/5 specs for 50 Hz large diesel generator projects: 66 L V20, 2,000 kWe prime, 2,200 kWe standby and 2,750 kVA.',
    intro: 'The Baudouin 20M33G2750/5 is a 66 L V20 diesel generator engine for large 50 Hz power projects. It is listed at 2,000 kWe / 2,500 kVA prime and 2,200 kWe / 2,750 kVA standby, making this page useful for buyers comparing high-power diesel engine ratings before specifying alternator, cooling, controls, enclosure, switchgear and documentation requirements.',
    aliases: ['20m33g2750', '20M33G2750/5', '20M33G2750 5', 'Baudouin 20M33G2750', 'Baudouin 2750 kVA engine'],
    links: [
      { label: 'Baudouin engine hub', href: '/brands/baudouin' },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Generator sizing guide', href: '/guides/how-to-size-a-generator' },
      { label: 'Generator paralleling guide', href: '/guides/generator-paralleling-explained' },
      { label: 'Custom EPC power solutions', href: CUSTOM_EPC_URL },
    ],
    cta: {
      title: 'Review a 2,750 kVA Baudouin diesel package',
      body: 'For large 50 Hz diesel projects, Haifeng Machinery can review the 20M33G2750/5 rating with alternator frame, voltage, cooling package, enclosure, controller, switchgear and export documentation needs.',
      primaryLabel: 'Request Baudouin package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Custom EPC power solutions',
      secondaryHref: CUSTOM_EPC_URL,
    },
  },
  'cummins-hsk78g': {
    title: 'Cummins HSK78G Gas Generator Engine Specs - 2,000 kWe',
    h1: 'Cummins HSK78G Gas Generator Engine Specs',
    description: 'Cummins HSK78G specs for gas generator and CHP projects: 78 L V12 lean-burn natural-gas engine, 2,000 kWe prime at 50 Hz, HSK78 series and datasheet context.',
    intro: 'The Cummins HSK78G is a 78 L V12 lean-burn natural-gas generator engine for prime, continuous and CHP power projects. This page lists the HSK78G at 2,000 kWe / 2,500 kVA prime power at 50 Hz and gives buyers a quick path to compare ratings, datasheets, related engines and gas generator package requirements.',
    answer: {
      heading: 'What is the Cummins HSK78G?',
      body: 'The Cummins HSK78G is a 78 L V12 lean-burn natural-gas generator engine for prime power, continuous duty and CHP projects. This page summarizes the HSK78G as a 2,000 kWe / 2,500 kVA class 50 Hz gas engine, with fuel type, displacement, configuration, datasheet context, related Cummins engines and package-selection links. It is intended for buyers comparing large gas generator engines before checking alternator frame, site gas supply, cooling system, controls, emissions context and power-plant integration needs.',
    },
    aliases: ['hsk78g', 'HSK 78G', 'Cummins HSK 78G', 'Cummins HSK78', 'HSK78 gas engine'],
    links: [
      { label: 'Cummins engine hub', href: '/brands/cummins' },
      { label: 'Gas engines', href: '/engines/fuel/gas' },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: '1500 RPM / 50 Hz engines', href: '/engines/rpm/1500-rpm' },
      { label: 'Gas vs diesel TCO guide', href: '/guides/diesel-vs-natural-gas-total-cost-of-ownership' },
    ],
    cta: {
      title: 'Match the HSK78G to a gas generator package',
      body: 'For gas generator or CHP projects, Haifeng Machinery can review engine output, alternator frame, voltage, gas train, cooling and controls before package selection.',
      primaryLabel: 'Request HSK78G package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Gas generator packages',
      secondaryHref: GAS_PACKAGE_URL,
    },
  },
  'mercedes-benz-om-352': {
    title: 'Mercedes-Benz OM352 Engine Specs & Manual - 5.675 L',
    h1: 'Mercedes-Benz OM352 Engine Specs',
    description: 'Mercedes-Benz OM352 engine specs and manual links: 5.675 L naturally aspirated inline-6 diesel, 96 kW at 2800 rpm, 17:1 compression.',
    intro: 'The Mercedes-Benz OM352 is a 5.675 L naturally aspirated inline-6 diesel engine from the OM 300 Series. This reference page summarizes OM352 engine specs, manual links, displacement, cylinder layout, 96 kW maximum mechanical output, 17:1 compression and related Mercedes-Benz legacy diesel models.',
    answer: {
      heading: 'What is the Mercedes-Benz OM352?',
      body: 'The Mercedes-Benz OM352 is a 5.675 L inline-6 diesel engine from the OM 300 Series. This page targets OM352 engine specs and manual searches with the key published fields buyers usually need first: naturally aspirated configuration, 96 kW maximum mechanical output at 2,800 rpm, 17:1 compression ratio, liquid cooling, diesel fuel and Germany origin. Because the OM352 is a legacy industrial engine rather than a current fixed-speed genset rating, treat the power figure as mechanical engine output and confirm alternator sizing, derating and replacement fit before packaging.',
    },
    aliases: ['om352', 'OM 352', 'Mercedes OM352', 'Mercedes-Benz OM 352', 'OM352 engine specs', 'OM352 manual'],
    links: [
      { label: 'Mercedes-Benz engine hub', href: '/brands/mercedes-benz' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-6 engines', href: '/engines/configuration/inline-6' },
      { label: 'Under 100 kWe engines', href: '/engines/power/under-100-kwe' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Review an OM352 replacement or diesel package',
      body: 'Haifeng Machinery can help compare the OM352 with available legacy or equivalent diesel engines, then review alternator fit, controls, enclosure, voltage and export documentation for a complete package.',
      primaryLabel: 'Request OM352 support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'mercedes-benz-om-366-la': {
    title: 'Mercedes-Benz OM366 LA Specs - Turbo Diesel 150 kW',
    h1: 'Mercedes-Benz OM366 LA Engine Specs',
    description: 'Mercedes-Benz OM366 LA specs: 5.958 L turbocharged charge-cooled inline-6 diesel, 150 kW at 2600 rpm, Euro Stage I and manual links.',
    intro: 'The Mercedes-Benz OM366 LA is a 5.958 L turbocharged charge-cooled inline-6 diesel engine from the OM 300 Series. This reference page summarizes OM366 LA specs, 150 kW maximum mechanical output, Euro Stage I context, compression ratio, datasheet sources and related Mercedes-Benz legacy engines.',
    answer: {
      heading: 'What is the Mercedes-Benz OM366 LA?',
      body: 'The Mercedes-Benz OM366 LA is a 5.958 L inline-6 diesel engine with turbocharging and charge cooling. This page gives searchers the core OM366 LA specs in one place: 150 kW maximum mechanical output at 2,600 rpm, 16.5:1 compression ratio, liquid cooling, diesel fuel, Euro Stage I emissions context and Germany origin. It is useful for legacy export equipment, replacement-engine research and generator-package feasibility checks, but the listed output is mechanical engine power and should be reviewed before alternator matching or derating.',
    },
    aliases: ['om366la', 'OM 366 LA', 'OM366 LA', 'Mercedes OM366 LA', 'Mercedes-Benz OM 366 LA', 'OM366 LA specs'],
    links: [
      { label: 'Mercedes-Benz engine hub', href: '/brands/mercedes-benz' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-6 engines', href: '/engines/configuration/inline-6' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Generator sizing guide', href: '/guides/how-to-size-a-generator' },
    ],
    cta: {
      title: 'Compare the OM366 LA for a diesel package',
      body: 'Haifeng Machinery can review whether the OM366 LA output class fits a standby or prime package, then match alternator, voltage, controller, enclosure and documentation requirements.',
      primaryLabel: 'Request OM366 LA support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'hino-j08c': {
    title: 'Hino J08C Engine Specs & Manual - 7.961 L Diesel',
    h1: 'Hino J08C Engine Specs',
    description: 'Hino J08C engine specs and manual links: 7.961 L inline-6 diesel, 151 kW at 2900 rpm, 19.2:1 compression and legacy datasheet context.',
    intro: 'The Hino J08C is a 7.961 L inline-6 diesel engine used in legacy truck, bus, construction, generator, power-unit and marine-conversion applications. This reference page summarizes J08C specs, manual links, 151 kW maximum mechanical output, compression ratio, datasheet context and related Hino engines.',
    answer: {
      heading: 'What is the Hino J08C?',
      body: 'The Hino J08C is a 7.961 L inline-6 diesel engine associated with older Hino trucks, buses, construction equipment, generator power units and marine conversions. This page collects the key J08C specs: common-rail diesel configuration, 151 kW maximum mechanical output at 2,900 rpm, 19.2:1 compression ratio, liquid cooling, Japan origin and available documentation links. For generator applications, treat the listed value as engine output and confirm fixed-speed rating, alternator match, cooling package and replacement-engine availability before quoting.',
    },
    aliases: ['j08c', 'J08C engine', 'Hino J08C specs', 'Hino J08C manual', 'Hino J08C diesel'],
    links: [
      { label: 'Hino engine hub', href: '/brands/hino' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-6 engines', href: '/engines/configuration/inline-6' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Review J08C support or replacement options',
      body: 'Haifeng Machinery can help compare the Hino J08C with nearby diesel engine options and review generator package fit, voltage, controls, enclosure and export documentation.',
      primaryLabel: 'Request J08C support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'isuzu-6bb1': {
    title: 'Isuzu 6BB1 Engine Specs & Manual - 5.393 L Diesel',
    h1: 'Isuzu 6BB1 Engine Specs',
    description: 'Isuzu 6BB1 engine specs and manual links: 5.393 L naturally aspirated inline-6 diesel, 107 kW at 3200 rpm, 17.5:1 compression.',
    intro: 'The Isuzu 6BB1 is a 5.393 L naturally aspirated inline-6 diesel engine from Isuzu legacy medium-duty applications. This reference page summarizes 6BB1 engine specs, manual sources, 107 kW maximum mechanical output, compression ratio, origin and related Isuzu 4B/6B engines.',
    answer: {
      heading: 'What is the Isuzu 6BB1?',
      body: 'The Isuzu 6BB1 is a 5.393 L naturally aspirated inline-6 diesel engine introduced in the 1970s for medium-duty Isuzu applications. This page is built for 6BB1 engine specs searches and lists the core reference fields: 107 kW maximum mechanical output at 3,200 rpm, 17.5:1 compression ratio, liquid cooling, diesel fuel, Japan origin and available documentation context. For genset or replacement projects, verify whether the engine will run at the required fixed speed and confirm alternator sizing before packaging.',
    },
    aliases: ['6bb1', '6BB1 engine', 'Isuzu 6BB1 specs', 'Isuzu 6BB1 manual', 'Isuzu 6BB1 diesel'],
    links: [
      { label: 'Isuzu engine hub', href: '/brands/isuzu' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-6 engines', href: '/engines/configuration/inline-6' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Isuzu 4BD1 specs', href: '/engines/isuzu-4bd1' },
    ],
    cta: {
      title: 'Compare the 6BB1 before sourcing a package',
      body: 'Haifeng Machinery can help compare the Isuzu 6BB1 with related Isuzu engines, then review generator package fit, voltage, controls, enclosure and overseas sourcing options.',
      primaryLabel: 'Request 6BB1 support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'isuzu-6bd1': {
    title: 'Isuzu 6BD1 Engine Specs & Manual - 5.785 L Diesel',
    h1: 'Isuzu 6BD1 Engine Specs',
    description: 'Isuzu 6BD1 engine specs and manual links: 5.785 L naturally aspirated inline-6 diesel, 106 kW at 2800 rpm, 17.5:1 compression.',
    intro: 'The Isuzu 6BD1 is a 5.785 L naturally aspirated inline-6 diesel engine used in legacy truck, marine and industrial equipment applications. This reference page summarizes 6BD1 specs, manual links, 106 kW maximum mechanical output, compression ratio, origin and related Isuzu B Series engines.',
    answer: {
      heading: 'What is the Isuzu 6BD1?',
      body: 'The Isuzu 6BD1 is a 5.785 L naturally aspirated inline-6 diesel engine used in older truck, marine and industrial equipment applications. This page collects the most useful 6BD1 engine specs for searchers: 106 kW maximum mechanical output at 2,800 rpm, 17.5:1 compression ratio, liquid cooling, diesel fuel, Japan origin, 1976 introduction and linked technical references. For generator or replacement-engine projects, confirm fixed-speed duty, alternator matching, cooling and availability before treating the mechanical output as package capacity.',
    },
    aliases: ['6bd1', '6BD1 engine', 'Isuzu 6BD1 specs', 'Isuzu 6BD1 manual', 'Isuzu 6BD1 diesel'],
    links: [
      { label: 'Isuzu engine hub', href: '/brands/isuzu' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-6 engines', href: '/engines/configuration/inline-6' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Isuzu 6BB1 specs', href: '/engines/isuzu-6bb1' },
    ],
    cta: {
      title: 'Review 6BD1 replacement or package fit',
      body: 'Haifeng Machinery can help compare the Isuzu 6BD1 with related Isuzu and equivalent diesel engines, then review alternator, controller, enclosure and sourcing options.',
      primaryLabel: 'Request 6BD1 support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'ford-2715e': {
    title: 'Ford 2715E Engine Specs & Manual - Dorset 5.95 L',
    h1: 'Ford 2715E Engine Specs',
    description: 'Ford 2715E engine specs and manual links: Dorset 5.95 L naturally aspirated inline-6 diesel, 89 kW at 2500 rpm, 16.5:1 compression.',
    intro: 'The Ford 2715E is a 5.95 L naturally aspirated inline-6 diesel engine in the Dorset 2700 Series. This reference page summarizes 2715E engine specs, manual links, 89 kW maximum mechanical output, compression ratio and related Ford industrial, marine and generator-package engines.',
    answer: {
      heading: 'What is the Ford 2715E?',
      body: 'The Ford 2715E is a 5.95 L naturally aspirated inline-6 diesel engine from the Ford Dorset 2700 Series. This page targets Ford 2715E specs and manual searches with the main fields buyers need: 89 kW maximum mechanical output at 2,500 rpm, 16.5:1 compression ratio, liquid cooling, diesel fuel, United Kingdom origin and legacy industrial/marine/generator-package context. For replacement or genset use, confirm the required fixed speed, alternator rating, cooling configuration and parts availability before quoting the package.',
    },
    aliases: ['2715e', 'Ford 2715E specs', 'Ford 2715E manual', 'Ford Dorset 2715E', 'Ford 2715E diesel'],
    links: [
      { label: 'Ford engine hub', href: '/brands/ford' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-6 engines', href: '/engines/configuration/inline-6' },
      { label: 'Under 100 kWe engines', href: '/engines/power/under-100-kwe' },
      { label: 'Ford 2712E specs', href: '/engines/ford-2712e' },
    ],
    cta: {
      title: 'Review a Ford 2715E replacement or package',
      body: 'Haifeng Machinery can help compare the 2715E with related Ford Dorset engines and modern equivalents, then review alternator fit, controls, enclosure and sourcing scope.',
      primaryLabel: 'Request 2715E support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'ford-2712e': {
    title: 'Ford 2712E Engine Specs & Manual - Dorset 4.15 L',
    h1: 'Ford 2712E Engine Specs',
    description: 'Ford 2712E engine specs and manual links: Dorset 4.15 L inline-4 diesel, 60 kW at 1500 rpm, legacy marine and generator package context.',
    intro: 'The Ford 2712E is a 4.15 L inline-4 diesel engine in the Ford Dorset/Dover family. This reference page summarizes 2712E specs, manual links, 60 kW output at 1,500 rpm, legacy marine and industrial context, and related Ford generator package engines.',
    answer: {
      heading: 'What is the Ford 2712E?',
      body: 'The Ford 2712E is a 4.15 L inline-4 diesel engine from the Ford Dorset/Dover industrial and marine family. This page collects the key 2712E engine specs for buyers and owners: 60 kW output at 1,500 rpm, naturally aspirated marine/industrial diesel configuration, liquid cooling, United Kingdom origin and legacy manual/datasheet context. Because 1,500 rpm aligns with 50 Hz generator speed, the 2712E is especially relevant for older genset, marine and repower searches, but alternator and package fit still need confirmation.',
    },
    aliases: ['2712e', 'Ford 2712E specs', 'Ford 2712E manual', 'Ford Dorset 2712E', 'Ford Dover 2712E'],
    links: [
      { label: 'Ford engine hub', href: '/brands/ford' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Inline-4 engines', href: '/engines/configuration/inline-4' },
      { label: 'Under 100 kWe engines', href: '/engines/power/under-100-kwe' },
      { label: 'Ford 2715E specs', href: '/engines/ford-2715e' },
    ],
    cta: {
      title: 'Review a Ford 2712E replacement or package',
      body: 'Haifeng Machinery can help compare the 2712E with related Ford engines or modern equivalents, then review alternator, controls, enclosure, voltage and sourcing requirements.',
      primaryLabel: 'Request 2712E support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'volvo-penta-md11c': {
    title: 'Volvo Penta MD11C Specs & Manual - 17 kW Diesel',
    h1: 'Volvo Penta MD11C Engine Specs',
    description: 'Volvo Penta MD11C specs and manual links: 2-cylinder marine diesel, 17 kW at 2500 rpm, production-year context and legacy replacement notes.',
    intro: 'The Volvo Penta MD11C is a 2-cylinder marine diesel engine listed at 17 kW maximum mechanical output at 2,500 rpm. This reference page summarizes MD11C specs, manual links, production-year context, fuel type, cooling, related Volvo Penta engines and replacement-package considerations.',
    answer: {
      heading: 'What is the Volvo Penta MD11C?',
      body: 'The Volvo Penta MD11C is a 2-cylinder legacy marine diesel engine listed at 17 kW maximum mechanical output at 2,500 rpm. This page is designed for MD11C specs and manual searches, summarizing the model identity, diesel fuel type, liquid cooling, Sweden origin, 1975 introduction context, linked Volvo Penta references and related small Volvo Penta engines. The MD11C is not a current fixed-speed generator-drive rating, so use this page for engine identification and replacement planning before confirming alternator, repower or genset suitability.',
    },
    aliases: ['md11c', 'MD11C', 'Volvo MD11C', 'Volvo Penta MD11C manual', 'Volvo Penta MD11C specs'],
    links: [
      { label: 'Volvo Penta engine hub', href: '/brands/volvo-penta' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Volvo Penta MD7B specs', href: '/engines/volvo-penta-md7b' },
      { label: 'Volvo Penta AQAD41A specs', href: '/engines/volvo-penta-aqad41a' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Review MD11C support or replacement options',
      body: 'Haifeng Machinery can help compare the MD11C with available legacy or equivalent engines and review whether a diesel generator or repower package is practical.',
      primaryLabel: 'Request MD11C support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'perkins-1206a-e70ttag2': {
    title: 'Perkins 1206A-E70TTAG2 Generator Engine Specs - 200 kWe / 250 kVA',
    h1: 'Perkins 1206A-E70TTAG2 Generator Engine Specs',
    description: 'Perkins 1206A-E70TTAG2 specs for 50 Hz diesel generator sets: 7.0 L inline-6, 184 kWe prime / 200 kWe standby, 230-250 kVA and ElectropaK datasheet links.',
    intro: 'The Perkins 1206A-E70TTAG2 is a 7.0 L inline-6 diesel generator engine in the Perkins 1200 Series. It is listed for 50 Hz generator sets at 184 kWe / 230 kVA prime and 200 kWe / 250 kVA standby, making this page a focused reference for mid-range generator package sizing.',
    aliases: ['1206a-e70ttag2', '1206A E70TTAG2', 'Perkins 1206A E70TTAG2', '1206A-E70TTA G2', 'Perkins 1200 Series 200 kWe'],
    links: [
      { label: 'Perkins engine hub', href: '/brands/perkins' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: '1500 RPM / 50 Hz engines', href: '/engines/rpm/1500-rpm' },
      { label: 'Generator sizing guide', href: '/guides/how-to-size-a-generator' },
    ],
    cta: {
      title: 'Use the 1206A-E70TTAG2 in a 50 Hz diesel package',
      body: 'Haifeng Machinery can help confirm whether this Perkins rating fits your standby or prime load, then match alternator, controller, enclosure and voltage options.',
      primaryLabel: 'Request Perkins package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'mtu-20v4000-g24f': {
    title: 'MTU 20V4000 G24F Generator Engine Specs - 20V4000 Series',
    h1: 'MTU 20V4000 G24F Generator Engine Specs',
    description: 'MTU 20V4000 G24F generator engine specs for high-power diesel generator projects, including Series 4000 ratings, displacement, frequency, datasheet and package review context.',
    intro: 'The MTU 20V4000 G24F is a high-power Series 4000 generator-drive engine used in large diesel generator packages. Use this page to confirm the model identity, output band, datasheet references, fuel and emissions context before matching the engine to alternator, cooling, enclosure, switchgear and project documentation requirements.',
    aliases: ['mtu 20v4000', 'MTU 20V4000', 'MTU 20V4000 G24F', '20V4000 G24F', 'MTU Series 4000 generator engine'],
    links: [
      { label: 'MTU engine hub', href: '/brands/mtu' },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Alternator matching guide', href: '/guides/alternator-voltage-and-frequency' },
      { label: 'Generator paralleling guide', href: '/guides/generator-paralleling-explained' },
    ],
    cta: {
      title: 'Review an MTU 20V4000 generator package',
      body: 'For large diesel generator projects, Haifeng Machinery can review the MTU 20V4000 rating with alternator, cooling, enclosure, controller, switchgear and documentation requirements.',
      primaryLabel: 'Request MTU 20V4000 package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Custom EPC power solutions',
      secondaryHref: CUSTOM_EPC_URL,
    },
  },
  'weichai-6m31d740e310': {
    title: 'Weichai 6M31D740E310 Generator Engine Specs - 833 kVA',
    h1: 'Weichai 6M31D740E310 Generator Engine Specs',
    description: 'Weichai 6M31D740E310 specs for 50/60 Hz diesel generator sets: 18.6 L V6, 666 kWe standby, 833 kVA, China Stage III and package support.',
    intro: 'The Weichai 6M31D740E310 is an 18.6 L V6 diesel generator-drive engine in the M31 series. It is listed at 666 kWe / 833 kVA standby power for both 50 Hz and 60 Hz generator sets, with China Stage III / unregulated-market context for buyers comparing industrial diesel package options.',
    aliases: ['6m31d740e310', '6M31D740E310', 'Weichai 6M31D740E310', 'Weichai M31 740 kWm', 'Weichai 833 kVA generator engine'],
    links: [
      { label: 'Weichai engine hub', href: '/brands/weichai' },
      { label: '500-1,500 kWe engines', href: '/engines/power/500-1500-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'China Stage III engines', href: '/engines/emissions/china-stage-iii' },
      { label: 'Generator sizing guide', href: '/guides/how-to-size-a-generator' },
      { label: 'Alternator matching guide', href: '/guides/alternator-voltage-and-frequency' },
    ],
    cta: {
      title: 'Review a Weichai 833 kVA diesel generator package',
      body: 'Haifeng Machinery can help check whether the 6M31D740E310 fits the required standby or prime load, then match alternator, controller, enclosure, voltage, cooling and export documentation.',
      primaryLabel: 'Request Weichai package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Product offerings',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'weichai-wp7d185e310': {
    title: 'Weichai WP7D185E310 G-Drive Datasheet & Generator Specs',
    h1: 'Weichai WP7D185E310 G-Drive Generator Engine Specs',
    description: 'Weichai WP7D185E310 g-drive generator engine specs and datasheet context for diesel generator package selection, including rating, fuel, emissions and alternator matching notes.',
    intro: 'The Weichai WP7D185E310 is a generator-drive diesel engine searched by buyers looking for model-specific datasheet and package information. Use this page to confirm the engine identity, rating band, fuel and emissions context before matching it to alternator, controller, enclosure and voltage requirements.',
    aliases: ['weichai wp7d185e310', 'WP7D185E310', 'WP7D185E310 g-drive', 'weichai wp7d185e310 g-drive datasheet'],
    links: [
      { label: 'Weichai engine hub', href: '/brands/weichai' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Generator sizing guide', href: '/guides/how-to-size-a-generator' },
      { label: 'Alternator matching guide', href: '/guides/alternator-voltage-and-frequency' },
    ],
    cta: {
      title: 'Match the WP7D185E310 to a diesel generator package',
      body: 'Haifeng Machinery can help confirm whether this Weichai g-drive engine fits the required standby or prime load, then match alternator, controller, enclosure and voltage options.',
      primaryLabel: 'Request Weichai package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Product offerings',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'weichai-wp10d264e200': {
    title: 'Weichai WP10D264E200 Generator Engine Specs',
    h1: 'Weichai WP10D264E200 Generator Engine Specs',
    description: 'Weichai WP10D264E200 generator engine specs for diesel genset selection, including model identity, rating context, fuel, emissions, datasheet and package support.',
    intro: 'The Weichai WP10D264E200 is a generator-drive diesel engine model searched by buyers comparing Weichai genset options. Use this page to confirm the model, rating, emissions context and datasheet availability before selecting the complete generator package.',
    aliases: ['wp10d264e200', 'WP10D264E200', 'Weichai WP10D264E200', 'Weichai WP10D264E200 generator engine'],
    links: [
      { label: 'Weichai engine hub', href: '/brands/weichai' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
      { label: 'Generator sizing guide', href: '/guides/how-to-size-a-generator' },
    ],
    cta: {
      title: 'Review a Weichai diesel generator package',
      body: 'Haifeng Machinery can help review the WP10D264E200 rating, alternator match, controls, enclosure, voltage and project documentation for a complete generator package.',
      primaryLabel: 'Request Weichai package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Product offerings',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'yuchai-yc16vtd2270-d30': {
    title: 'Yuchai YC16VTD2270-D30 Generator Engine Specs - 1,500 kWe',
    h1: 'Yuchai YC16VTD2270-D30 Generator Engine Specs',
    description: 'Yuchai YC16VTD2270-D30 specs for high-power 50 Hz diesel generator sets: 52.26 L V16, 1,350 kWe prime / 1,500 kWe standby and 16VTD datasheet links.',
    intro: 'The Yuchai YC16VTD2270-D30 is a 52.26 L V16 diesel generator engine from the 16VTD series. It is listed for 50 Hz high-power generator sets at 1,350 kWe / 1,687.5 kVA prime and 1,500 kWe / 1,875 kVA standby, with China Stage III / unregulated-market context and an official Yuchai spec sheet linked.',
    aliases: ['yc16vtd2270 d30', 'YC16VTD2270-D30', 'YC16VTD2270 D30', 'Yuchai 16VTD2270', '16VTD2270-D30'],
    links: [
      { label: 'Yuchai engine hub', href: '/brands/yuchai' },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Diesel engines', href: '/engines/fuel/diesel' },
      { label: '1500 RPM / 50 Hz engines', href: '/engines/rpm/1500-rpm' },
      { label: 'China Stage III engines', href: '/engines/emissions/china-stage-iii' },
    ],
    cta: {
      title: 'Review a 1,500 kWe Yuchai generator package',
      body: 'For high-power 50 Hz diesel projects, Haifeng Machinery can review the YC16VTD2270-D30 rating, alternator match, cooling package, controls and compliance needs.',
      primaryLabel: 'Request Yuchai package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_REGULATED_URL,
    },
  },
}

export const QUICK_WIN_ALTERNATOR_SEO: Record<string, QuickWinPageSeo> = {
  'stamford-uci224g': {
    title: 'Stamford UCI224G Alternator Specs - 85 kVA UCI224',
    h1: 'Stamford UCI224G Alternator Specs',
    description: 'Stamford UCI224G alternator specs for generator-set matching: 85 kVA nominal prime output, 4-pole UCI224 series, datasheet links and Haifeng package support.',
    intro: 'The Stamford UCI224G is an 85 kVA, 4-pole generator alternator in the UCI224 series. This page summarizes the model identity, nominal prime output, official data-sheet path and generator-set matching context so buyers can pair it with the right engine, voltage, controller and enclosure.',
    aliases: ['uci224g', 'UCI224 G', 'UCI 224 G', 'Stamford UCI224 G', 'Cummins Generator Technologies UCI224G'],
    links: [
      { label: 'Stamford alternators', href: '/alternators?brand=Stamford' },
      { label: 'UCI224 series', href: '/alternators/series/uci224' },
      { label: 'All alternators', href: '/alternators' },
      { label: 'Alternator voltage guide', href: '/guides/alternator-voltage-and-frequency' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Match the UCI224G to a generator set',
      body: 'Haifeng Machinery can help confirm the alternator frame, voltage, winding, AVR, engine match and enclosure requirements for a complete diesel or gas generator package.',
      primaryLabel: 'Request UCI224G matching support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Custom EPC power solutions',
      secondaryHref: CUSTOM_EPC_URL,
    },
  },
}

export function quickWinEngineSeo(slug: string): QuickWinPageSeo | null {
  return QUICK_WIN_ENGINE_SEO[slug] ?? null
}

export function quickWinAlternatorSeo(slug: string): QuickWinPageSeo | null {
  return QUICK_WIN_ALTERNATOR_SEO[slug] ?? null
}
