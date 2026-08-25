import fsp from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

function parseEnvFile(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separator = line.indexOf('=')
    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fsp.readFile(envFile, 'utf8'))
    } catch {
      // Optional local env files.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function kva(kwe) {
  return Math.round((kwe / 0.8) * 10) / 10
}

function displacement(cylinders, boreMm, strokeMm) {
  const liters = cylinders * Math.PI * (boreMm / 2) ** 2 * strokeMm / 1_000_000
  return Math.round(liters * 10) / 10
}

function configuration(cylinders, layout) {
  return layout === 'V' ? `V${cylinders}` : `L${cylinders}`
}

const sourceHub = 'https://www.abc-engines.com/en/markets/power-generation/product-solutions/generating-sets-gensets--6065'

function record({
  model,
  series,
  cylinders,
  layout,
  fuelType,
  ignitionType,
  rpmRated,
  boreMm,
  strokeMm,
  prime50,
  prime60,
  sourceUrl,
  sourceLabel,
  fuelDetail,
  injection,
}) {
  const slug = `abc-${slugify(model)}`
  const config = configuration(cylinders, layout)
  const displacementL = boreMm && strokeMm ? displacement(cylinders, boreMm, strokeMm) : null
  const sourceText = sourceLabel.replace(/^ABC\s+/i, '')

  return {
    sourceUrl,
    sourceLabel,
    row: {
      slug,
      brand: 'ABC',
      model,
      series,
      status: 'active',
      origin: 'Belgium',
      fuel_type: fuelType,
      ignition_type: ignitionType,
      cooling_method: 'Liquid-Cooled',
      emissions_standard: 'Application-dependent',
      rpm_rated: rpmRated,
      cylinders,
      configuration: config,
      ...(displacementL ? { displacement_l: displacementL } : {}),
      power_kw: prime50,
      prime_power_kw_50hz: prime50,
      prime_power_kwe_50hz: prime50,
      prime_power_kva_50hz: kva(prime50),
      prime_power_kw_60hz: prime60,
      prime_power_kwe_60hz: prime60,
      prime_power_kva_60hz: kva(prime60),
      description:
        `ABC ${model} is an Anglo Belgian Corporation medium-speed ${sourceText} power-generation engine. `
        + `The ABC product page validates a ${config} configuration, up to ${prime50.toLocaleString()} kWe at 50 Hz `
        + `and up to ${prime60.toLocaleString()} kWe at 60 Hz, with ${fuelDetail}. `
        + `${injection ? `Fuel injection: ${injection}. ` : ''}`
        + 'These ratings are listed for generator-set applications.',
    },
  }
}

const dzFuel = 'Diesel, gas oil, HFO, biofuel, vegetable oil and animal fat'
const dlFuel = 'diesel, gas oil and HFO operation'
const dfdzFuel = 'CNG, LNG, waste gas or landfill gas with diesel pilot capability'
const meohFuel = 'up to 70% methanol with 30% (bio)diesel/HVO, or 100% (bio)diesel/HVO'
const h2DfFuel = 'up to 85% hydrogen with 15% (bio)diesel/HVO, or 100% (bio)diesel/HVO'
const h2SiFuel = '100% hydrogen operation'

const RECORDS = [
  record({ model: '6DZ', series: 'DZC', cylinders: 6, layout: 'L', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1273, prime60: 1146, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/6dzc-genset-1', sourceLabel: 'ABC 6DZ genset product data page', fuelDetail: dzFuel, injection: 'Direct, mechanical, one pump per cylinder' }),
  record({ model: '8DZ', series: 'DZC', cylinders: 8, layout: 'L', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1697, prime60: 1528, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/8dzc-genset-1', sourceLabel: 'ABC 8DZ genset product data page', fuelDetail: dzFuel, injection: 'Direct, mechanical, one pump per cylinder' }),
  record({ model: '12VDZ', series: 'VDZC', cylinders: 12, layout: 'V', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 2546, prime60: 2292, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/12dzc-genset-1', sourceLabel: 'ABC 12VDZ genset product data page', fuelDetail: 'diesel, gas oil, HFO, biofuel and vegetable oil operation', injection: 'Direct, mechanical, one pump per cylinder' }),
  record({ model: '16VDZ', series: 'VDZC', cylinders: 16, layout: 'V', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 3395, prime60: 3057, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/16dzc-genset-1', sourceLabel: 'ABC 16VDZ genset product data page', fuelDetail: 'diesel, gas oil, HFO, biofuel and vegetable oil operation', injection: 'Direct, mechanical, one pump per cylinder' }),

  record({ model: '6DL36', series: 'DL36', cylinders: 6, layout: 'L', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 750, boreMm: 365, strokeMm: 420, prime50: 3797, prime60: 3645, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/6dl36-genset-1', sourceLabel: 'ABC 6DL36 genset product data page', fuelDetail: dlFuel, injection: 'Direct, mechanical, one pump per cylinder; common rail alternative' }),
  record({ model: '8DL36', series: 'DL36', cylinders: 8, layout: 'L', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 750, boreMm: 365, strokeMm: 420, prime50: 5063, prime60: 4860, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/8dl36-genset-1', sourceLabel: 'ABC 8DL36 genset product data page', fuelDetail: dlFuel, injection: 'Direct, mechanical, one pump per cylinder; common rail alternative' }),
  record({ model: '12DV36', series: 'DV36', cylinders: 12, layout: 'V', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 750, boreMm: 365, strokeMm: 420, prime50: 7594, prime60: 7290, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/12dv36-genset-1', sourceLabel: 'ABC 12DV36 genset product data page', fuelDetail: dlFuel, injection: 'Common rail; direct mechanical alternative' }),
  record({ model: '16DV36', series: 'DV36', cylinders: 16, layout: 'V', fuelType: 'Diesel', ignitionType: 'Compression Ignition', rpmRated: 750, boreMm: 365, strokeMm: 420, prime50: 10126, prime60: 9720, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/16dv36-genset-1', sourceLabel: 'ABC 16DV36 genset product data page', fuelDetail: dlFuel, injection: 'Common rail; direct mechanical alternative' }),

  record({ model: '6DZ DF', series: 'DZD Dual Fuel', cylinders: 6, layout: 'L', fuelType: 'Natural Gas', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 950, prime60: 855, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/6dzd-genset-1', sourceLabel: 'ABC 6DZ DF genset product data page', fuelDetail: dfdzFuel, injection: 'Direct fuel injection' }),
  record({ model: '8DZ DF', series: 'DZD Dual Fuel', cylinders: 8, layout: 'L', fuelType: 'Natural Gas', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1268, prime60: 1140, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/8dzd-genset-1', sourceLabel: 'ABC 8DZ DF genset product data page', fuelDetail: dfdzFuel, injection: 'Direct fuel injection' }),
  record({ model: '12VDZ DF', series: 'DZD Dual Fuel', cylinders: 12, layout: 'V', fuelType: 'Natural Gas', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1900, prime60: 1710, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/12dzd-genset-1', sourceLabel: 'ABC 12VDZ DF genset product data page', fuelDetail: dfdzFuel, injection: 'Direct fuel injection' }),
  record({ model: '16VDZ DF', series: 'DZD Dual Fuel', cylinders: 16, layout: 'V', fuelType: 'Natural Gas', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 2537, prime60: 2280, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/16dzd-genset-1', sourceLabel: 'ABC 16VDZ DF genset product data page', fuelDetail: dfdzFuel, injection: 'Direct, mechanical, one pump per cylinder' }),

  record({ model: '6DZ DF MeOH', series: 'DZD MeOH', cylinders: 6, layout: 'L', fuelType: 'Methanol', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1260, prime60: 1134, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/6dzd-meoh-genset-1', sourceLabel: 'ABC 6DZ DF MeOH genset product data page', fuelDetail: meohFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for methanol' }),
  record({ model: '8DZ DF MeOH', series: 'DZD MeOH', cylinders: 8, layout: 'L', fuelType: 'Methanol', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1680, prime60: 1512, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/8dzd-meoh-genset-1', sourceLabel: 'ABC 8DZ DF MeOH genset product data page', fuelDetail: meohFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for methanol' }),
  record({ model: '12VDZ DF MeOH', series: 'DZD MeOH', cylinders: 12, layout: 'V', fuelType: 'Methanol', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 2519, prime60: 2267, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/12dzd-meoh-genset-1', sourceLabel: 'ABC 12VDZ DF MeOH genset product data page', fuelDetail: meohFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for methanol' }),
  record({ model: '16VDZ DF MeOH', series: 'DZD MeOH', cylinders: 16, layout: 'V', fuelType: 'Methanol', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 3359, prime60: 3023, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/16dzd-meoh-genset-1', sourceLabel: 'ABC 16VDZ DF MeOH genset product data page', fuelDetail: meohFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for methanol' }),

  record({ model: 'BeHydro 6DZ DF H2', series: 'BeHydro DZD H2', cylinders: 6, layout: 'L', fuelType: 'Hydrogen', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 950, prime60: 855, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-6dzd-h2-genset-1', sourceLabel: 'ABC BeHydro 6DZ DF H2 genset product data page', fuelDetail: h2DfFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for hydrogen' }),
  record({ model: 'BeHydro 8DZ DF H2', series: 'BeHydro DZD H2', cylinders: 8, layout: 'L', fuelType: 'Hydrogen', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1268, prime60: 1140, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-8dzd-h2-genset-1', sourceLabel: 'ABC BeHydro 8DZ DF H2 genset product data page', fuelDetail: h2DfFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for hydrogen' }),
  record({ model: 'BeHydro 12VDZ DF H2', series: 'BeHydro DZD H2', cylinders: 12, layout: 'V', fuelType: 'Hydrogen', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1900, prime60: 1710, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-12dzd-h2-genset-1', sourceLabel: 'ABC BeHydro 12VDZ DF H2 genset product data page', fuelDetail: h2DfFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for hydrogen' }),
  record({ model: 'BeHydro 16VDZ DF H2', series: 'BeHydro DZD H2', cylinders: 16, layout: 'V', fuelType: 'Hydrogen', ignitionType: 'Pilot Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 2537, prime60: 2280, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-16dzd-h2-genset-1', sourceLabel: 'ABC BeHydro 16VDZ DF H2 genset product data page', fuelDetail: h2DfFuel, injection: 'Direct injection for (bio)diesel/HVO and port injection for hydrogen' }),
  record({ model: 'BeHydro 6DZ SI H2', series: 'BeHydro DZ H2', cylinders: 6, layout: 'L', fuelType: 'Hydrogen', ignitionType: 'Spark Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 950, prime60: 855, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-6dz-h2-genset-1', sourceLabel: 'ABC BeHydro 6DZ SI H2 genset product data page', fuelDetail: h2SiFuel, injection: 'Port injection' }),
  record({ model: 'BeHydro 8DZ SI H2', series: 'BeHydro DZ H2', cylinders: 8, layout: 'L', fuelType: 'Hydrogen', ignitionType: 'Spark Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1268, prime60: 1140, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-8dz-h2-genset-1', sourceLabel: 'ABC BeHydro 8DZ SI H2 genset product data page', fuelDetail: h2SiFuel, injection: 'Port injection' }),
  record({ model: 'BeHydro 12VDZ SI H2', series: 'BeHydro DZ H2', cylinders: 12, layout: 'V', fuelType: 'Hydrogen', ignitionType: 'Spark Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 1900, prime60: 1710, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-12dz-h2-genset-1', sourceLabel: 'ABC BeHydro 12VDZ SI H2 genset product data page', fuelDetail: h2SiFuel, injection: 'Port injection' }),
  record({ model: 'BeHydro 16VDZ SI H2', series: 'BeHydro DZ H2', cylinders: 16, layout: 'V', fuelType: 'Hydrogen', ignitionType: 'Spark Ignition', rpmRated: 1000, boreMm: 256, strokeMm: 310, prime50: 2537, prime60: 2280, sourceUrl: 'https://www.abc-engines.com/en/markets/power-generation/product/behydro-16dz-h2-genset-1', sourceLabel: 'ABC BeHydro 16VDZ SI H2 genset product data page', fuelDetail: h2SiFuel, injection: 'Port injection' }),
]

await loadEnv()

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  APPLY ? requireEnv('SUPABASE_SERVICE_KEY') : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
)

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ABC power-generation engine import`)
console.log(`Validated source hub: ${sourceHub}`)
console.log(`Prepared ${RECORDS.length} ABC generator engine records.`)

if (!APPLY) {
  for (const { row, sourceUrl } of RECORDS) {
    console.log(`${row.slug}\t${row.model}\t${row.prime_power_kwe_50hz}/${row.prime_power_kwe_60hz} kWe\t${sourceUrl}`)
  }
  console.log('Dry run passed. Re-run with --apply to upsert rows and source links.')
  process.exit(0)
}

let insertedOrUpdated = 0
for (const recordItem of RECORDS) {
  const { data: engine, error: upsertError } = await supabase
    .from('engines')
    .upsert(recordItem.row, { onConflict: 'slug' })
    .select('id, slug, brand, model')
    .single()
  if (upsertError) throw upsertError

  const { error: deleteError } = await supabase
    .from('engine_pdfs')
    .delete()
    .eq('engine_id', engine.id)
    .eq('storage_path', recordItem.sourceUrl)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('engine_pdfs').insert({
    engine_id: engine.id,
    type: 'datasheet',
    label: recordItem.sourceLabel,
    storage_path: recordItem.sourceUrl,
    file_size_bytes: null,
  })
  if (insertError) throw insertError

  insertedOrUpdated += 1
  console.log(`Upserted ${engine.slug} and linked ${recordItem.sourceUrl}`)
}

console.log(`Completed ${insertedOrUpdated} ABC power-generation engine records.`)
