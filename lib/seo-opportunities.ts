interface PriorityModelSpec {
  href: string
  brand: string
  series?: string
  label: string
  desc: string
  type: 'engine' | 'alternator'
}

export const PRIORITY_MODEL_SPECS: PriorityModelSpec[] = [
  {
    href: '/engines/kohler-kd62v12',
    brand: 'Kohler',
    label: 'Kohler KD62V12',
    desc: '2,250-2,500 kWe KD Series diesel generator engine.',
    type: 'engine',
  },
  {
    href: '/engines/baudouin-20m33g2750-5',
    brand: 'Baudouin',
    label: 'Baudouin 20M33G2750/5',
    desc: '2,750 kVA large 50 Hz diesel generator engine.',
    type: 'engine',
  },
  {
    href: '/engines/cummins-hsk78g',
    brand: 'Cummins',
    label: 'Cummins HSK78G',
    desc: '78 L natural-gas generator engine for prime and CHP power.',
    type: 'engine',
  },
  {
    href: '/engines/perkins-1206a-e70ttag2',
    brand: 'Perkins',
    label: 'Perkins 1206A-E70TTAG2',
    desc: '1200 Series 200 kWe standby diesel generator engine.',
    type: 'engine',
  },
  {
    href: '/engines/yuchai-yc16vtd2270-d30',
    brand: 'Yuchai',
    label: 'Yuchai YC16VTD2270-D30',
    desc: '16VTD 1,500 kWe standby diesel generator engine.',
    type: 'engine',
  },
]

export const PRIORITY_BRAND_HUBS = [
  {
    name: 'Baudouin',
    desc: 'Diesel and gas generator engine specs for Baudouin generator-set selection.',
  },
  {
    name: 'Jenbacher',
    desc: 'Gas engine specs for CHP, prime power, and industrial generator projects.',
  },
  {
    name: 'Hino',
    desc: 'Hino diesel generator engine specs for commercial and industrial gensets.',
  },
  {
    name: 'JCB',
    desc: 'JCB diesel generator engine specs for standby and prime-power packages.',
  },
  {
    name: 'Liebherr',
    desc: 'Liebherr diesel and gas generator engine specs for engineered industrial power projects.',
  },
  {
    name: 'MTU',
    desc: 'MTU diesel and gas generator engine specs for high-power standby, prime, and EPC packages.',
  },
  {
    name: 'Detroit Diesel',
    desc: 'Detroit Diesel generator engine specs for legacy and industrial power sets.',
  },
]
