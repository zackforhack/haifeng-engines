// Keep Volvo Penta fixed-speed generator ratings separate from the maximum
// output curves for VE variable-speed off-road engines. Run without --apply
// to preview; use --apply to write.
//
// Official sources:
//   Tier 4 Final / EU Stage IV range:
//   https://www.volvopenta.com/-/media/volvopenta/local/us/industrial/resources-downloads/meetingtier4finaldemands477086912018.pdf
//   Current EU Stage V off-road range:
//   https://www.volvopenta.com/en-us/industrial/industrial-engines/off-road-engine-range/
//   Fixed-speed generator ratings:
//   Volvo Penta (Shanghai) Power Generation Engine Selector, data/volvo-raw.txt

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY,
)

const emptyGeneratorRatings = {
  prime_power_kw_50hz: null,
  prime_power_kwe_50hz: null,
  prime_power_kva_50hz: null,
  standby_power_kw_50hz: null,
  standby_power_kwe_50hz: null,
  standby_power_kva_50hz: null,
  prime_power_kw_60hz: null,
  prime_power_kwe_60hz: null,
  prime_power_kva_60hz: null,
  standby_power_kw_60hz: null,
  standby_power_kwe_60hz: null,
  standby_power_kva_60hz: null,
}

const fixedSpeedModels = new Set([
  'TAD580VE',
  'TAD581VE',
  'TAD582VE',
  'TAD880VE',
  'TAD881VE',
  'TAD882VE',
  'TAD883VE',
  'TAD1181VE',
  'TAD1381VE',
  'TAD1382VE',
  'TAD1383VE',
  'TAD1384VE',
  'TAD1385VE',
])

const families = [
  {
    series: 'D5',
    displacement: 5.13,
    cylinders: 4,
    configuration: 'L4',
    tier4Dimensions: { weight_kg: 556, length_mm: 982, width_mm: 864, height_mm: 992 },
    stage5Dimensions: { weight_kg: 547, length_mm: null, width_mm: null, height_mm: null },
    tier4: [
      ['TAD570VE', 105, 141, 2300, 710, 1200],
      ['TAD571VE', 129, 173, 2300, 810, 1200],
      ['TAD572VE', 160, 214, 2300, 910, 1450],
    ],
    stage5: [
      ['TAD580VE', 105, 143, 2310, 700, 1300],
      ['TAD581VE', 129, 175, 2310, 800, 1300],
      ['TAD582VE', 160, 218, 2310, 900, 1300],
      ['TAD583VE', 175, 238, 2310, 950, 1300],
    ],
    stage5Document: {
      label: 'Volvo Penta TAD580-583VE EU Stage V Product Datasheet',
      storage_path: 'volvo/tad580ve-tad581ve-tad582ve.pdf',
    },
  },
  {
    series: 'D8',
    displacement: 7.7,
    cylinders: 6,
    configuration: 'L6',
    tier4Dimensions: { weight_kg: 696, length_mm: 1207, width_mm: 889, height_mm: 1006 },
    stage5Dimensions: { weight_kg: null, length_mm: null, width_mm: null, height_mm: null },
    tier4: [
      ['TAD870VE', 160, 218, 2200, 1060, 1200],
      ['TAD871VE', 185, 252, 2200, 1160, 1200],
      ['TAD872VE', 210, 286, 2200, 1235, 1350],
      ['TAD873VE', 235, 320, 2200, 1310, 1450],
    ],
    stage5: [
      ['TAD880VE', 160, 218, 2210, 1075, 1400],
      ['TAD881VE', 185, 252, 2210, 1175, 1400],
      ['TAD882VE', 210, 286, 2210, 1255, 1400],
      ['TAD883VE', 235, 320, 2210, 1330, 1400],
      ['TAD884VE', 250, 340, 2210, 1360, 1400],
    ],
    stage5Document: {
      label: 'Volvo Penta TAD880-884VE EU Stage V Product Datasheet',
      storage_path: 'volvo/tad880ve-tad881ve-tad882ve-tad883ve.pdf',
    },
  },
  {
    series: 'D11',
    displacement: 10.84,
    cylinders: 6,
    configuration: 'L6',
    tier4Dimensions: { weight_kg: 1041, length_mm: 1309, width_mm: 913, height_mm: 1227 },
    stage5Dimensions: { weight_kg: 1111, length_mm: null, width_mm: null, height_mm: null },
    tier4: [
      ['TAD1170VE', 235, 315, 2100, 1581, 1260],
      ['TAD1171VE', 265, 355, 2100, 1750, 1260],
      ['TAD1172VE', 285, 382, 1700, 1938, 1250],
    ],
    stage5: [
      ['TAD1180VE', 235, 320, 2100, 1590, 1400],
      ['TAD1181VE', 265, 361, 2100, 1795, 1400],
      ['TAD1182VE', 285, 388, 1800, 1949, 1400],
      ['TAD1183VE', 315, 428, 1700, 1949, 1400],
    ],
    stage5Document: {
      label: 'Volvo Penta TAD1180-1183VE EU Stage V Product Datasheet',
      storage_path: 'volvo/tad1181ve.pdf',
    },
  },
  {
    series: 'D13',
    displacement: 12.8,
    cylinders: 6,
    configuration: 'L6',
    tier4Dimensions: { weight_kg: 1267, length_mm: 1400, width_mm: 876, height_mm: 1200 },
    stage5Dimensions: { weight_kg: null, length_mm: null, width_mm: null, height_mm: null },
    tier4: [
      ['TAD1371VE', 285, 388, 1900, 1965, 1200],
      ['TAD1372VE', 315, 428, 1900, 2175, 1200],
      ['TAD1373VE', 345, 469, 1900, 2380, 1200],
      ['TAD1374VE', 375, 510, 1900, 2595, 1200],
      ['TAD1375VE', 405, 551, 1900, 2650, 1200],
    ],
    stage5: [
      ['TAD1381VE', 285, 388, 1900, 1965, 1200],
      ['TAD1382VE', 315, 428, 1900, 2130, 1200],
      ['TAD1383VE', 345, 469, 1900, 2330, 1200],
      ['TAD1384VE', 375, 510, 1900, 2595, 1200],
      ['TAD1385VE', 405, 551, 1710, 2650, 1200],
    ],
    stage5Document: {
      label: 'Volvo Penta TAD1381-1385VE EU Stage V Product Datasheet',
      storage_path: 'volvo/tad1381ve-tad1382ve-tad1383ve-tad1384ve-tad1385ve.pdf',
    },
  },
  {
    series: 'D16',
    displacement: 16.1,
    cylinders: 6,
    configuration: 'L6',
    tier4Dimensions: { weight_kg: 1322, length_mm: 1490, width_mm: 894, height_mm: 1351 },
    stage5Dimensions: { weight_kg: null, length_mm: null, width_mm: null, height_mm: null },
    tier4: [
      ['TAD1670VE', 405, 543, 1900, 2750, 1260],
      ['TAD1671VE', 450, 603, 1900, 2900, 1260],
      ['TAD1672VE', 515, 690, 1800, 3200, 1260],
    ],
    stage5: [
      ['TWD1683VE', 585, 796, 1900, 3650, 1200],
    ],
  },
]

const fixedSpeedRatings = [
  {
    model: 'TAD580VE',
    series: 'D5 Generator Drive',
    displacement_l: 5.13,
    cylinders: 4,
    configuration: 'L4',
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    ratings: { p50: [86, 80, 100], s50: [94, 86, 107], p60: [86, 80, 98], s60: [94, 86, 107] },
  },
  {
    model: 'TAD581VE',
    series: 'D5 Generator Drive',
    displacement_l: 5.13,
    cylinders: 4,
    configuration: 'L4',
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    ratings: { p50: [104, 95, 118], s50: [114, 104, 130], p60: [107, 98, 123], s60: [117, 108, 135] },
  },
  {
    model: 'TAD582VE',
    series: 'D5 Generator Drive',
    displacement_l: 5.13,
    cylinders: 4,
    configuration: 'L4',
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
    ratings: { p50: [118, 108, 135], s50: [129, 118, 147], p60: [131, 120, 150], s60: [144, 132, 165] },
  },
  {
    model: 'TAD880VE',
    series: 'D8 Generator Drive',
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p50: [135, 124, 155], s50: [149, 137, 171] },
  },
  {
    model: 'TAD881VE',
    series: 'D8 Generator Drive',
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p60: [153, 140, 176], s60: [168, 154, 193] },
  },
  {
    model: 'TAD882VE',
    series: 'D8 Generator Drive',
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p50: [163, 150, 187], s50: [179, 165, 206], p60: [175, 161, 201], s60: [192, 177, 221] },
  },
  {
    model: 'TAD883VE',
    series: 'D8 Generator Drive',
    displacement_l: 7.7,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p60: [197, 181, 226], s60: [216, 198, 248] },
  },
  {
    model: 'TAD1181VE',
    series: 'D11 Generator Drive',
    displacement_l: 10.84,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p50: [223, 207, 259], s50: [245, 228, 285], p60: [217, 200, 250], s60: [238, 219, 274] },
  },
  {
    model: 'TAD1381VE',
    series: 'D13 Generator Drive',
    displacement_l: 12.8,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p60: [233, 216, 271], s60: [256, 238, 297] },
  },
  {
    model: 'TAD1382VE',
    series: 'D13 Generator Drive',
    displacement_l: 12.8,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p50: [267, 250, 312], s50: [294, 273, 341], p60: [259, 241, 301], s60: [284, 264, 331] },
  },
  {
    model: 'TAD1383VE',
    series: 'D13 Generator Drive',
    displacement_l: 12.8,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p60: [286, 266, 332], s60: [314, 292, 365] },
  },
  {
    model: 'TAD1384VE',
    series: 'D13 Generator Drive',
    displacement_l: 12.8,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p60: [312, 290, 363], s60: [343, 319, 399] },
  },
  {
    model: 'TAD1385VE',
    series: 'D13 Generator Drive',
    displacement_l: 12.8,
    cylinders: 6,
    configuration: 'L6',
    emissions_standard: 'U.S. EPA Final Tier 4',
    ratings: { p50: [339, 315, 394], s50: [373, 347, 433], p60: [334, 310, 388], s60: [368, 343, 427] },
  },
]

function baseSlug(model) {
  return `volvo-penta-${model.toLowerCase()}`
}

function highSpeedSlug(model) {
  return `${baseSlug(model)}${fixedSpeedModels.has(model) ? '-high-speed' : ''}`
}

function highSpeedRecord(family, spec, generation) {
  const [model, powerKw, powerHp, ratedRpm, torqueNm, torqueRpm] = spec
  const isTier4 = generation === 'tier4'
  const dimensions = isTier4 ? family.tier4Dimensions : family.stage5Dimensions
  const emissions = isTier4
    ? 'Euro Stage IV / U.S. EPA Final Tier 4'
    : 'Euro Stage V'

  return {
    slug: highSpeedSlug(model),
    brand: 'Volvo Penta',
    model,
    series: `${family.series} Industrial High-Speed`,
    status: isTier4 ? 'limited' : 'active',
    power_kw: powerKw,
    power_hp: powerHp,
    displacement_l: family.displacement,
    cylinders: family.cylinders,
    configuration: family.configuration,
    rpm_rated: ratedRpm,
    rpm_max: ratedRpm,
    origin: 'Sweden',
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: emissions,
    ...dimensions,
    ...emptyGeneratorRatings,
    description: `Volvo Penta ${model} ${family.displacement}L ${family.configuration} variable-speed off-road diesel engine rated at ${powerKw} kW (${powerHp} hp) at ${ratedRpm.toLocaleString()} rpm, with ${torqueNm.toLocaleString()} Nm peak torque at ${torqueRpm.toLocaleString()} rpm. This high-speed ${emissions} rating is a maximum crankshaft-power curve, not a direct 1,500/1,800 rpm generator-set rating.`,
  }
}

function ratingFields(ratings) {
  const fields = { ...emptyGeneratorRatings }
  for (const [key, values] of Object.entries(ratings)) {
    const [kwm, kwe, kva] = values
    const frequency = key.endsWith('50') ? '50hz' : '60hz'
    const duty = key.startsWith('p') ? 'prime' : 'standby'
    fields[`${duty}_power_kw_${frequency}`] = kwm
    fields[`${duty}_power_kwe_${frequency}`] = kwe
    fields[`${duty}_power_kva_${frequency}`] = kva
  }
  return fields
}

function fixedSpeedRecord(entry) {
  const has50Hz = Boolean(entry.ratings.p50 || entry.ratings.s50)
  const standbyRatings = [entry.ratings.s50, entry.ratings.s60].filter(Boolean)
  const maximumMechanicalPower = Math.max(...standbyRatings.map(([kwm]) => kwm))
  const frequencies = [has50Hz ? '50 Hz at 1,500 rpm' : null, entry.ratings.p60 ? '60 Hz at 1,800 rpm' : null]
    .filter(Boolean)
    .join(' and ')

  return {
    slug: baseSlug(entry.model),
    brand: 'Volvo Penta',
    model: entry.model,
    series: entry.series,
    status: 'active',
    power_kw: maximumMechanicalPower,
    power_hp: Math.round(maximumMechanicalPower * 1.34102),
    displacement_l: entry.displacement_l,
    cylinders: entry.cylinders,
    configuration: entry.configuration,
    rpm_rated: has50Hz ? 1500 : 1800,
    rpm_max: has50Hz ? 1500 : 1800,
    origin: 'Sweden',
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    emissions_standard: entry.emissions_standard,
    ...ratingFields(entry.ratings),
    description: `Volvo Penta ${entry.model} fixed-speed generator-drive diesel engine with published ${frequencies} ratings. The table separates mechanical engine output (kWm), electrical output (kWe), and generator-set apparent power (kVA). These derated generator ratings must not be substituted with the model's higher variable-speed off-road maximum-power curve.`,
  }
}

const highSpeedRecords = families.flatMap((family) => [
  ...family.tier4.map((spec) => highSpeedRecord(family, spec, 'tier4')),
  ...family.stage5.map((spec) => highSpeedRecord(family, spec, 'stage5')),
])
const fixedRecords = fixedSpeedRatings.map(fixedSpeedRecord)
const records = [...highSpeedRecords, ...fixedRecords]

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

console.table(records.map((record) => ({
  slug: record.slug,
  model: record.model,
  duty: record.series.includes('High-Speed') ? 'variable-speed' : 'generator-drive',
  maximum_kw: record.power_kw,
  rated_rpm: record.rpm_rated,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(`\nDry run: ${highSpeedRecords.length} high-speed and ${fixedRecords.length} fixed-speed records.`)
  console.log('Re-run with --apply to update Supabase.')
  process.exit(0)
}

const { error } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (error) throw error

for (const family of families.filter((item) => item.stage5Document)) {
  const document = family.stage5Document
  const fixedSlugs = family.stage5
    .map(([model]) => model)
    .filter((model) => fixedSpeedModels.has(model))
    .map(baseSlug)
  const highSpeedSlugs = family.stage5.map(([model]) => highSpeedSlug(model))
  const allSlugs = [...fixedSlugs, ...highSpeedSlugs]

  const { data: engines, error: engineError } = await supabase
    .from('engines')
    .select('id, slug')
    .in('slug', allSlugs)
  if (engineError) throw engineError

  const fixedIds = engines.filter((engine) => fixedSlugs.includes(engine.slug)).map((engine) => engine.id)
  if (fixedIds.length) {
    const { error: unlinkError } = await supabase
      .from('engine_pdfs')
      .delete()
      .in('engine_id', fixedIds)
      .eq('storage_path', document.storage_path)
    if (unlinkError) throw unlinkError
  }

  const highSpeedEngines = engines.filter((engine) => highSpeedSlugs.includes(engine.slug))
  const highSpeedIds = highSpeedEngines.map((engine) => engine.id)
  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id, file_size_bytes')
    .eq('storage_path', document.storage_path)
  if (existingError) throw existingError

  const linked = new Set(existing.map((row) => row.engine_id))
  const fileSize = existing.find((row) => row.file_size_bytes)?.file_size_bytes ?? null
  const rows = highSpeedEngines
    .filter((engine) => !linked.has(engine.id))
    .map((engine) => ({
      engine_id: engine.id,
      type: 'datasheet',
      ...document,
      file_size_bytes: fileSize,
    }))
  if (rows.length) {
    const { error: documentError } = await supabase.from('engine_pdfs').insert(rows)
    if (documentError) throw documentError
  }
}

console.log(`Upserted ${highSpeedRecords.length} high-speed and ${fixedRecords.length} fixed-speed Volvo Penta records.`)
