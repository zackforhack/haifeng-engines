// Correct Volvo Penta high-speed industrial engines that were previously
// represented as fixed-speed generator engines, and add their Tier 4 Final
// predecessors. Run without --apply to preview; use --apply to write.
//
// Official sources:
//   https://www.volvopenta.com/-/media/volvopenta/local/us/industrial/resources-downloads/meetingtier4finaldemands477086912018.pdf
//   https://www.volvopenta.com/en-us/industrial/industrial-engines/off-road-engine-range/d8-eu-stage-v/
//   https://www.volvopenta.com/en-us/industrial/industrial-engines/off-road-engine-range/d13-eu-stage-v/

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

const families = [
  {
    series: 'D8 Industrial',
    displacement: 7.7,
    dimensions: { weight_kg: 696, length_mm: 1207, width_mm: 889, height_mm: 1006 },
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
      file_size_bytes: 1724425,
    },
  },
  {
    series: 'D13 Industrial',
    displacement: 12.8,
    dimensions: { weight_kg: 1267, length_mm: 1400, width_mm: 876, height_mm: 1200 },
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
      file_size_bytes: 1672817,
    },
  },
]

function slug(model) {
  return `volvo-penta-${model.toLowerCase()}`
}

function commonRecord(family, spec) {
  const [model, powerKw, powerHp, ratedRpm, torqueNm, torqueRpm] = spec
  return {
    slug: slug(model),
    brand: 'Volvo Penta',
    model,
    series: family.series,
    status: 'active',
    power_kw: powerKw,
    power_hp: powerHp,
    displacement_l: family.displacement,
    cylinders: 6,
    configuration: 'L6',
    rpm_rated: ratedRpm,
    rpm_max: ratedRpm,
    origin: 'Sweden',
    fuel_type: 'Diesel/HVO',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    torqueNm,
    torqueRpm,
    ...emptyGeneratorRatings,
  }
}

const records = families.flatMap((family) => {
  const tier4 = family.tier4.map((spec) => {
    const record = commonRecord(family, spec)
    const { torqueNm, torqueRpm, ...fields } = record
    return {
      ...fields,
      ...family.dimensions,
      emissions_standard: 'Euro Stage IV / U.S. EPA Final Tier 4',
      description: `Volvo Penta ${record.model} ${family.displacement}L inline-six high-speed industrial diesel engine rated at ${record.power_kw} kW at ${record.rpm_rated.toLocaleString()} rpm, with ${torqueNm.toLocaleString()} Nm peak torque at ${torqueRpm.toLocaleString()} rpm. It is certified for EU Stage IV and U.S. EPA Tier 4 Final. This VE model is a variable-speed industrial engine; generator use requires an engineered drivetrain or power-electronics system and is not a standard 1,500/1,800 rpm genset rating.`,
    }
  })

  const stage5 = family.stage5.map((spec) => {
    const record = commonRecord(family, spec)
    const { torqueNm, torqueRpm, ...fields } = record
    const predecessor = record.model === 'TAD884VE'
      ? 'TAD870-873VE range'
      : record.model.replace('TAD88', 'TAD87').replace('TAD138', 'TAD137')
    return {
      ...fields,
      weight_kg: null,
      length_mm: null,
      width_mm: null,
      height_mm: null,
      emissions_standard: 'Euro Stage V',
      description: `Volvo Penta ${record.model} ${family.displacement}L inline-six high-speed industrial diesel engine rated at ${record.power_kw} kW at ${record.rpm_rated.toLocaleString()} rpm, with ${torqueNm.toLocaleString()} Nm peak torque at ${torqueRpm.toLocaleString()} rpm. It belongs to Volvo Penta's EU Stage V range and succeeds the Stage IV/Tier 4 Final ${predecessor}. This VE model is a variable-speed industrial engine; generator use requires an engineered drivetrain or power-electronics system and is not a standard 1,500/1,800 rpm genset rating.`,
    }
  })

  return [...tier4, ...stage5]
})

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

console.table(records.map((record) => ({
  model: record.model,
  maximum_kw: record.power_kw,
  rated_rpm: record.rpm_rated,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to update Supabase.')
  process.exit(0)
}

const { error } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (error) throw error

for (const family of families) {
  const stage5Slugs = family.stage5.map(([model]) => slug(model))
  const { data: engines, error: engineError } = await supabase
    .from('engines')
    .select('id, slug')
    .in('slug', stage5Slugs)
  if (engineError) throw engineError

  const engineIds = engines.map((engine) => engine.id)
  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .in('engine_id', engineIds)
    .eq('storage_path', family.stage5Document.storage_path)
  if (existingError) throw existingError

  const linked = new Set(existing.map((document) => document.engine_id))
  const rows = engines
    .filter((engine) => !linked.has(engine.id))
    .map((engine) => ({
      engine_id: engine.id,
      type: 'datasheet',
      ...family.stage5Document,
    }))
  if (rows.length) {
    const { error: documentError } = await supabase.from('engine_pdfs').insert(rows)
    if (documentError) throw documentError
  }
}

console.log(`Upserted ${records.length} Volvo Penta high-speed industrial engines.`)
