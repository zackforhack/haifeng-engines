export interface BrandHubProfile {
  title: string
  h1: string
  description: string
  overview: string
  applications: string[]
  howToChoose: string[]
  featuredModels: string[]
  commonSearches: string[]
  links: { label: string; href: string }[]
  cta: {
    title: string
    body: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
  }
}

const CONTACT_URL = 'https://www.haifengmachinery.com/contact-us/'
const DIESEL_REGULATED_URL = 'https://www.haifengmachinery.com/diesel-power-package-regulated/'
const DIESEL_NON_REGULATED_URL = 'https://www.haifengmachinery.com/product-offerings/'
const GAS_PACKAGE_URL = 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/'
const TOWABLE_PACKAGE_URL = 'https://www.haifengmachinery.com/towable-power-package/'
const CUSTOM_EPC_URL = 'https://www.haifengmachinery.com/custom-epc-power-solutions/'

export const BRAND_HUB_PROFILES: Record<string, BrandHubProfile> = {
  'baudouin': {
    title: 'Baudouin Generators & Diesel Engine Specs',
    h1: 'Baudouin Generator Engines',
    description: 'Browse Baudouin generator engine specs for diesel generator sets, including 4M, 6M, 8M, 12M and 16M model families, kWe ratings, emissions and datasheets.',
    overview: 'Baudouin is a high-interest generator brand in this database, especially for diesel generator buyers comparing Moteurs Baudouin engine ratings, datasheets and emissions variants. The catalog covers compact 4M-series models through 12M33 and 16M33 high-power diesel generator-drive packages.',
    applications: [
      'High-power standby generator sets for industrial facilities and data centers',
      'Prime-power diesel packages for mining, oil and gas, rental and remote sites',
      'EPA Tier 2 regulated diesel packages where emissions documentation matters',
      'Unregulated-market diesel generator packages for export projects',
      'Gas and biogas generator-set projects where Baudouin gaseous-fuel models fit the site fuel supply',
    ],
    howToChoose: [
      'Start by selecting the required kWe band, then compare the closest Baudouin standby and prime ratings instead of comparing model names alone.',
      'Check whether the project needs an EPA Tier 2, China-market, gas/biogas or unregulated-market engine variant.',
      'Use the datasheet link on each model page to confirm radiator power, fuel consumption, dimensions and alternator matching before quoting a full genset.',
      'For large 12M55 and 16M55 engines, confirm voltage, alternator frame, enclosure access, cooling airflow and site altitude early.',
    ],
    featuredModels: [
      'baudouin-16m33g2250-5',
      'baudouin-16m33g2000-5',
      'baudouin-16m33g1900-5',
      'baudouin-16m33g1700-5',
      'baudouin-12m33g1650-5',
      'baudouin-12m33g1500-5',
      'baudouin-12m26g1100-5',
      'baudouin-6m21g550-5',
    ],
    commonSearches: [
      'baudouin generator',
      'baudouin generators',
      'baudouin generator review',
      'baudouin diesel generator engine',
      'moteurs baudouin generator',
      'baudouin engine datasheet',
    ],
    links: [
      { label: 'Haifeng product offerings', href: DIESEL_NON_REGULATED_URL },
      { label: 'EPA standby diesel packages', href: DIESEL_REGULATED_URL },
      { label: 'Custom EPC power solutions', href: CUSTOM_EPC_URL },
      { label: 'Baudouin high-power engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Diesel generator engines', href: '/engines/fuel/diesel' },
      { label: 'Gas generator engines', href: '/engines/fuel/gas' },
      { label: 'EPA Tier 2 engines', href: '/engines/emissions/epa-tier-2' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Need a Baudouin generator package?',
      body: 'Haifeng Machinery can help compare Baudouin engine ratings, match the alternator, select regulated or non-regulated diesel packages, and quote a complete generator set for your site conditions.',
      primaryLabel: 'Request Baudouin package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_REGULATED_URL,
    },
  },
  'jenbacher': {
    title: 'Jenbacher Generators & Gas Engine Specs',
    h1: 'Jenbacher Gas Generator Engines',
    description: 'Browse Jenbacher gas generator engine specs for CHP, prime power and industrial generators, including J420, J612, J616, J620 and J624 model ratings and datasheets.',
    overview: 'Jenbacher is primarily a gas-engine generator brand in this database, with large natural-gas models for CHP, prime power, industrial power and utility-scale projects. Use this hub to compare J-series output, displacement, configuration and datasheet coverage before sizing the full generator package.',
    applications: [
      'Natural-gas CHP and cogeneration plants',
      'Industrial prime-power generator systems',
      'Biogas and gas-to-power projects where site fuel quality can be verified',
      'Large commercial backup systems with gas supply available',
    ],
    howToChoose: [
      'Start with fuel quality and gas supply, then compare the J-series electrical output band.',
      'Confirm heat-recovery, CHP and emissions requirements before comparing gas engines to diesel alternatives.',
      'Check alternator voltage, grid interconnection and controls with the engine rating.',
    ],
    featuredModels: ['jenbacher-j624', 'jenbacher-j620', 'jenbacher-j616', 'jenbacher-j612', 'jenbacher-j420'],
    commonSearches: ['jenbacher generators', 'jenbacher gas engines', 'jenbacher industrial generators', 'jenbacher generator specs'],
    links: [
      { label: 'CNG and LPG gas generator systems', href: GAS_PACKAGE_URL },
      { label: 'Custom EPC power solutions', href: CUSTOM_EPC_URL },
      { label: 'Gas generator engines', href: '/engines/fuel/gas' },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Gas vs diesel TCO guide', href: '/guides/diesel-vs-natural-gas-total-cost-of-ownership' },
    ],
    cta: {
      title: 'Need help comparing Jenbacher gas packages?',
      body: 'Haifeng Machinery can help review gas engine output, alternator matching, controls and fuel-system requirements for gas generator projects.',
      primaryLabel: 'Request gas package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Gas generator packages',
      secondaryHref: GAS_PACKAGE_URL,
    },
  },
  'hino': {
    title: 'Hino Generator Engine Specs',
    h1: 'Hino Generator Engines',
    description: 'Browse Hino generator engine specs for diesel gensets, including P11C, J08E, W06E, J05E and W04D model ratings for compact and mid-range packages.',
    overview: 'Hino generator engines in this database cover compact and mid-range diesel generator sets, with inline engines such as P11C, J08E, W06E, J05E and W04D. Use this hub for genset Hino model lookup, power range checks and package selection context.',
    applications: [
      'Commercial standby generator sets',
      'Telecom, small industrial and facility backup power',
      'Compact diesel generator packages where serviceability and size matter',
    ],
    howToChoose: [
      'Match the Hino model to the required kWe band first, then verify whether a datasheet is available.',
      'Confirm the target market emissions requirement before using an unregulated engine in a quotation.',
      'Check alternator size and enclosure cooling for compact diesel packages.',
    ],
    featuredModels: ['hino-p11c', 'hino-j08e', 'hino-w06e', 'hino-j05e', 'hino-w04d'],
    commonSearches: ['genset hino', 'hino generator', 'hino generator engine', 'hino diesel generator'],
    links: [
      { label: 'Haifeng product offerings', href: DIESEL_NON_REGULATED_URL },
      { label: 'EPA standby diesel packages', href: DIESEL_REGULATED_URL },
      { label: 'Under 100 kWe engines', href: '/engines/power/under-100-kwe' },
      { label: '100-500 kWe engines', href: '/engines/power/100-500-kwe' },
      { label: 'Diesel generator engines', href: '/engines/fuel/diesel' },
    ],
    cta: {
      title: 'Need a compact Hino diesel generator package?',
      body: 'Haifeng Machinery can help compare Hino model output with alternator, controller, enclosure and voltage requirements for compact diesel gensets.',
      primaryLabel: 'Request Hino package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
  'jcb': {
    title: 'JCB Generator Engine Specs',
    h1: 'JCB Generator Engines',
    description: 'Browse JCB generator engine specs for diesel gensets, including 448 engines with Stage V, EPA Tier 4 Final and Tier 3 variants for regulated generator packages.',
    overview: 'JCB generator engines in this database focus on 4.8 L inline-4 diesel models for compact regulated generator sets. The hub is useful for buyers comparing Stage V, EPA Tier 4 Final and EPA Tier 3 JCB 448 variants by output, emissions level and datasheet coverage.',
    applications: [
      'Regulated-market compact diesel generator sets',
      'Rental, construction and industrial standby packages',
      'Projects where Stage V or EPA Tier 4 Final documentation is required',
    ],
    howToChoose: [
      'Choose the emissions family first: Stage V, EPA Tier 4 Final or EPA Tier 3.',
      'Compare the 448 model output band against the standby or prime kWe requirement.',
      'Use the datasheet to confirm aftertreatment, cooling and installation constraints before packaging.',
    ],
    featuredModels: ['jcb-448-sv-129', 'jcb-448-ta4f-110', 'jcb-448-ta3-100', 'jcb-448-ta3-75', 'jcb-448-ta4f-75'],
    commonSearches: ['jcb generators', 'jcb generator', 'jcb diesel generators', 'jcb generator engine'],
    links: [
      { label: 'Rental and towable power', href: TOWABLE_PACKAGE_URL },
      { label: 'Haifeng product offerings', href: DIESEL_NON_REGULATED_URL },
      { label: 'EPA Tier 4 Final engines', href: '/engines/emissions/epa-tier-4-final' },
      { label: 'Euro Stage V engines', href: '/engines/emissions/euro-stage-v' },
      { label: 'Under 100 kWe engines', href: '/engines/power/under-100-kwe' },
    ],
    cta: {
      title: 'Need a JCB regulated diesel generator package?',
      body: 'Haifeng Machinery can help confirm JCB engine output, emissions compliance, alternator matching and enclosure requirements for regulated diesel gensets.',
      primaryLabel: 'Request JCB package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Regulated diesel packages',
      secondaryHref: DIESEL_REGULATED_URL,
    },
  },
  'liebherr': {
    title: 'Liebherr Generators & Engine Specs',
    h1: 'Liebherr Generator Engines',
    description: 'Browse Liebherr generator engine specs for diesel and gas generator applications, including model ratings, fuel type, emissions context and datasheet references.',
    overview: 'Liebherr generator engines in this database are relevant for buyers comparing heavy-duty diesel and gas engine platforms for industrial power, project power and engineered generator packages. Use this hub to compare output, displacement, emissions tags, fuel type and datasheet coverage before selecting the full generator-set package.',
    applications: [
      'Industrial standby and prime-power generator packages',
      'Containerized generator projects for remote or harsh environments',
      'Gas generator projects where the fuel supply and operating profile are stable',
      'Mining, construction, oil and gas, and heavy industrial power systems',
      'Custom EPC projects requiring coordinated engine, alternator, enclosure and controls review',
    ],
    howToChoose: [
      'Start with the site duty, because a Liebherr engine used for routine prime power has different package requirements from a standby unit.',
      'Compare diesel and gas options against fuel availability, operating hours, ambient temperature and service access.',
      'Confirm alternator voltage, cooling airflow, enclosure or container layout, and emissions documentation before treating the engine rating as final.',
    ],
    featuredModels: ['liebherr-d976', 'liebherr-d9508', 'liebherr-d9512', 'liebherr-g9512'],
    commonSearches: ['liebherr generator', 'liebherr generators', 'liebherr engine', 'liebherr gas engines', 'liebherr generator engine'],
    links: [
      { label: 'Custom EPC power solutions', href: CUSTOM_EPC_URL },
      { label: 'CNG and LPG gas generator systems', href: GAS_PACKAGE_URL },
      { label: 'Haifeng product offerings', href: DIESEL_NON_REGULATED_URL },
      { label: 'Gas generator engines', href: '/engines/fuel/gas' },
      { label: 'Diesel generator engines', href: '/engines/fuel/diesel' },
      { label: 'Generator paralleling guide', href: '/guides/generator-paralleling-explained' },
    ],
    cta: {
      title: 'Need a Liebherr generator package review?',
      body: 'Haifeng Machinery can help compare Liebherr diesel or gas engine options with alternator, cooling, enclosure, controls and documentation requirements for engineered generator projects.',
      primaryLabel: 'Request Liebherr package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Custom EPC power solutions',
      secondaryHref: CUSTOM_EPC_URL,
    },
  },
  'mtu': {
    title: 'MTU Generators & Engine Specs',
    h1: 'MTU Generator Engines',
    description: 'Browse MTU generator engine specs for diesel and gas generator sets, including Series 2000 and Series 4000 model ratings, emissions context and datasheet references.',
    overview: 'MTU generator engines in this database cover high-value diesel and gas generator applications, including Series 2000 and Series 4000 model families used in standby, prime, data center, industrial and project-power packages. Use this hub to compare model output, fuel type, emissions context and datasheet coverage before selecting the full generator system.',
    applications: [
      'Mission-critical standby power for data centers and commercial facilities',
      'High-power diesel generator packages for industrial and export projects',
      'Gas generator systems where the project favors gaseous fuel and long runtime',
      'Parallel generator systems and custom EPC packages',
      'Projects where service access, documentation and alternator matching must be reviewed early',
    ],
    howToChoose: [
      'Start by separating Series 2000 and Series 4000 options, then compare the kWe band and fuel type against the project duty.',
      'Check whether the project needs diesel standby, gas operation, EPA-oriented documentation or a non-regulated export-market package.',
      'Confirm voltage, frequency, alternator frame, cooling package, controls and enclosure space before quoting a complete MTU-based generator set.',
    ],
    featuredModels: ['mtu-20v4000-g83', 'mtu-20v4000-g63', 'mtu-16v4000-g83', 'mtu-12v4000-g84f', 'mtu-18v2000-g85'],
    commonSearches: ['mtu generators', 'mtu generator', 'mtu engine models', 'mtu gas engines', 'mtu 20v4000'],
    links: [
      { label: 'Custom EPC power solutions', href: CUSTOM_EPC_URL },
      { label: 'EPA standby diesel packages', href: DIESEL_REGULATED_URL },
      { label: 'CNG and LPG gas generator systems', href: GAS_PACKAGE_URL },
      { label: '1,500+ kWe engines', href: '/engines/power/1500-plus-kwe' },
      { label: 'Diesel generator engines', href: '/engines/fuel/diesel' },
      { label: 'Gas generator engines', href: '/engines/fuel/gas' },
    ],
    cta: {
      title: 'Need an MTU generator package review?',
      body: 'Haifeng Machinery can help compare MTU engine ratings with alternator, controller, enclosure, voltage, fuel, emissions and project documentation requirements.',
      primaryLabel: 'Request MTU package support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Custom EPC power solutions',
      secondaryHref: CUSTOM_EPC_URL,
    },
  },
  'detroit-diesel': {
    title: 'Detroit Diesel Generator Engine Specs',
    h1: 'Detroit Diesel Generator Engines',
    description: 'Browse Detroit Diesel generator engine specs for gensets, including 16V149, 12V149, Series 60, 8V-92TA and legacy diesel power ratings with datasheets.',
    overview: 'Detroit Diesel generator engines in this database are useful for legacy genset lookup, replacement research and diesel package comparison. The hub includes V-series and Series 60 models with kWe output, displacement, emissions context and datasheet links where available.',
    applications: [
      'Legacy industrial generator-set replacement and reference work',
      'Marine, standby and prime diesel power packages',
      'Service, overhaul and sourcing research for older Detroit Diesel gensets',
    ],
    howToChoose: [
      'Start with the exact Detroit Diesel model family because legacy model names are easy to confuse.',
      'Compare kWe output and displacement against the existing alternator and generator frame.',
      'Check emissions and market restrictions carefully before quoting a legacy diesel engine.',
    ],
    featuredModels: ['detroit-diesel-16v149', 'detroit-diesel-12v149', 'detroit-diesel-series-60-14-0l', 'detroit-diesel-8v-92ta', 'detroit-diesel-series-60-12-7l'],
    commonSearches: ['genset detroit', 'detroit diesel generator sets', 'detroit diesel generator engine', 'detroit diesel genset'],
    links: [
      { label: 'Diesel generator engines', href: '/engines/fuel/diesel' },
      { label: '500-1,500 kWe engines', href: '/engines/power/500-1500-kwe' },
      { label: 'Generator engine selection guide', href: '/guides/how-to-choose-a-generator-engine' },
    ],
    cta: {
      title: 'Need help replacing or matching a Detroit Diesel genset?',
      body: 'Haifeng Machinery can help compare legacy Detroit Diesel ratings with available generator package options, alternator requirements and replacement-path constraints.',
      primaryLabel: 'Request Detroit Diesel support',
      primaryHref: CONTACT_URL,
      secondaryLabel: 'Diesel generator packages',
      secondaryHref: DIESEL_NON_REGULATED_URL,
    },
  },
}

export function brandHubProfile(slug: string): BrandHubProfile | null {
  return BRAND_HUB_PROFILES[slug] ?? null
}
