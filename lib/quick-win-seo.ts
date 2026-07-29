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
    title: 'Kohler KD62V12 Generator Engine Specs - 2,500 kWe / 3,125 kVA',
    h1: 'Kohler KD62V12 Generator Engine Specs',
    description: 'Kohler KD62V12 generator engine specs for KD2000-KD2500 sets: 62.4 L V12 diesel, 2,250-2,500 kWe standby, 50/60 Hz ratings, EPA Tier 2 and datasheet links.',
    intro: 'The Kohler KD62V12 is a 62.4 L V12 diesel generator engine used in KD2000-KD2500 generator sets. It is listed at 2,250 kWe standby at 50 Hz and 2,500 kWe standby at 60 Hz, with EPA Tier 2 emissions coverage and published prime/standby kWe and kVA ratings for high-power standby projects.',
    aliases: ['kd62v12', 'KD62 V12', 'Kohler KD62 V12', 'Kohler KD2000', 'Kohler KD2500'],
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
