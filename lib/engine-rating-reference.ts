import type { Engine } from './types'

// The legacy catalog stores COP in prime_power_* for this family record.
// Keep its published duty label faithful to NAS-6109-EN (02/19), not the column name.
export function primeDutyLabel(engine: Engine): 'Prime' | 'Continuous' {
  return engine.slug === 'cummins-hsk78g' ? 'Continuous' : 'Prime'
}

export const HSK78G_REFERENCE = {
  reviewed: '2026-09-08',
  document: 'Cummins NAS-6109-EN (02/19)',
  url: 'https://www.cummins.com/sites/default/files/2019-08/Spec-Sheet-HSK78G-50Hz_2.pdf',
  summary: 'The HSK78G is an engine family used in 1,600, 1,800 and 2,000 kWe generator sets. The 2,000 kWe, 50 Hz value shown here corresponds to the C2000N5CD configuration and the source’s continuous (COP) duty definition. It is not a universal output for every HSK78G package.',
  frequency: 'Cummins lists N5CD configurations at 50 Hz with direct drive and N6CD configurations at 60 Hz with a gearbox. Do not infer engine speed from electrical frequency alone. Confirm the exact generator model and its data sheet.',
}
