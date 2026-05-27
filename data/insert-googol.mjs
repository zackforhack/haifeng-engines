import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysodvwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

function slug(model) {
  return 'googol-' + model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function parseConfig(model) {
  if (/6L/i.test(model))  return { config: 'L6',  cylinders: 6 }
  if (/8L/i.test(model))  return { config: 'L8',  cylinders: 8 }
  if (/8V/i.test(model))  return { config: 'V8',  cylinders: 8 }
  if (/10V/i.test(model)) return { config: 'V10', cylinders: 10 }
  if (/12V/i.test(model)) return { config: 'V12', cylinders: 12 }
  if (/16V/i.test(model)) return { config: 'V16', cylinders: 16 }
  if (/20V/i.test(model)) return { config: 'V20', cylinders: 20 }
  return { config: null, cylinders: null }
}

function parseSeries(model) {
  if (model.startsWith('PT')) return 'P Series'
  if (model.startsWith('QT')) return 'Q Series'
  return null
}

function parseCooling(model) {
  // QTAA / PTAA = Air-Air;  QTA (no second A) = Water-Air
  if (/^QTAA/i.test(model) || /^PTAA/i.test(model)) return 'Air-Air'
  if (/^QTA[^A]/i.test(model)) return 'Water-Air'
  return null
}

// All 45 engines from 磐古2026发动机配置表（260207）.xlsx
// Fields: [model, engine_prime_kw, engine_standby_kw, genset_prime_kwe, genset_standby_kwe, displacement_l, weight_kg, dims]
const engines = [
  // P Series — Air-Air intercooling
  ['PTAA6L-EG490',   445,  490,  400,  440, 14.3, 1050, '1719x991x1253'],
  ['PTAA8L-EG580',   520,  580,  450,  500, 19.0, null, null],
  ['PTAA8L-EG625',   568,  625,  500,  550, 19.0, null, null],
  ['PTAA10V-EG690',  625,  690,  560,  620, 20.3, 1480, '1713x1403x1398'],
  ['PTAA10V-EG740',  675,  740,  600,  660, 20.3, 1480, '1713x1403x1398'],
  ['PTAA12V-EG750',  680,  750,  600,  660, 24.4, 1650, '1905x1403x1427'],
  ['PTAA12V-EG815',  720,  815,  640,  704, 24.4, 1650, '1905x1403x1427'],
  ['PTAA12V-EG900',  800,  900,  720,  800, 24.4, 1650, '1905x1403x1427'],
  ['PTAA16V-EG980',  893,  980,  800,  880, 32.5, 2050, '2186x1156x1426'],
  ['PTAA16V-EG1120', 1020, 1120,  900, 1000, 32.5, 2050, '2186x1156x1426'],
  ['PTAA16V-EG1225', 1115, 1225, 1000, 1100, 32.5, 2050, '2186x1156x1426'],
  ['PTAA20V-EG1345', 1225, 1345, 1100, 1200, 40.7, 2450, '2609x1150x1454'],
  ['PTAA20V-EG1480', 1345, 1480, 1200, 1320, 40.7, 2450, '2609x1150x1454'],
  // Q Series — Air-Air intercooling (QTAA)
  ['QTAA8V-EG1230',  1120, 1230, 1000, 1100, 43.0, 3756, '2260x1950x2130'],
  ['QTAA8V-EG1350',  1230, 1350, 1100, 1200, 43.0, 3756, '2260x1950x2130'],
  ['QTAA8V-EG1490',  1345, 1490, 1200, 1320, 43.0, 3756, '2260x1950x2130'],
  ['QTAA10V-EG1670', 1520, 1670, 1350, 1500, 53.8, 4472, '2476x1950x2340'],
  ['QTAA10V-EG1850', 1680, 1850, 1500, 1650, 53.8, 4472, '2476x1950x2340'],
  ['QTAA12V-EG1960', 1780, 1960, 1600, 1760, 64.5, 4920, '2672x1950x2340'],
  ['QTAA12V-EG1990', 1810, 1990, 1640, 1800, 64.5, 4920, '2672x1950x2340'],
  ['QTAA12V-EG2210', 2010, 2210, 1800, 2000, 64.5, 4920, '2672x1950x2340'],
  ['QTAA16V-EG2440', 2220, 2440, 2000, 2200, 86.0, 6160, '3172x1950x2340'],
  ['QTAA16V-EG2660', 2440, 2660, 2200, 2400, 86.0, 6160, '3172x1950x2340'],
  ['QTAA16V-EG2940', 2675, 2940, 2400, 2640, 86.0, 6160, '3172x1950x2340'],
  ['QTAA20V-EG3100', 2810, 3100, 2500, 2750, 107.5, 7550, '3688x1950x2340'],
  ['QTAA20V-EG3200', 2900, 3200, 2600, 2860, 107.5, 7550, '3688x1950x2340'],
  ['QTAA20V-EG3330', 3010, 3330, 2700, 3000, 107.5, 7550, '3688x1950x2340'],
  ['QTAA20V-EG3600', 3300, 3600, 3000, 3300, 107.5, 7550, '3688x1950x2340'],
  // Q Series — Water-Air intercooling (QTA, mostly D-suffix data-centre models)
  ['QTA8V-EG1230D',  1120, 1230, 1000, 1100, 43.0, 3955, '2260x1614x2130'],
  ['QTA8V-EG1350D',  1230, 1350, 1100, 1200, 43.0, 3955, '2260x1614x2130'],
  ['QTA8V-EG1490',   1345, 1490, 1200, 1320, 43.0, 3955, '2260x1614x2130'],
  ['QTA10V-EG1670D', 1520, 1670, 1350, 1500, 53.8, 4732, '2476x1614x2400'],
  ['QTA10V-EG1850',  1680, 1850, 1500, 1650, 53.8, 4732, '2476x1614x2400'],
  ['QTA12V-EG1960D', 1780, 1960, 1600, 1760, 64.5, 5200, '2760x1614x2400'],
  ['QTA12V-EG1990D', 1810, 1990, 1640, 1800, 64.5, 5200, '2760x1614x2400'],
  ['QTA12V-EG2210',  2010, 2210, 1800, 2000, 64.5, 5200, '2760x1614x2400'],
  ['QTA16V-EG2220D', 2000, 2220, 1800, 2000, 86.0, 6400, '3670x1634x2130'],
  ['QTA16V-EG2440D', 2220, 2440, 2000, 2200, 86.0, 6400, '3670x1634x2130'],
  ['QTA16V-EG2660D', 2440, 2660, 2200, 2400, 86.0, 6400, '3670x1634x2130'],
  ['QTA16V-EG2940',  2675, 2940, 2400, 2640, 86.0, 6400, '3670x1634x2130'],
  ['QTA20V-EG2950D', 2680, 2950, 2400, 2640, 107.5, 7800, '4170x1634x2130'],
  ['QTA20V-EG3100D', 2810, 3100, 2500, 2750, 107.5, 7800, '4170x1634x2130'],
  ['QTA20V-EG3200D', 2900, 3200, 2600, 2860, 107.5, 7800, '4170x1634x2130'],
  ['QTA20V-EG3330D', 3010, 3330, 2700, 3000, 107.5, 7800, '4170x1634x2130'],
  ['QTA20V-EG3600',  3300, 3600, 3000, 3300, 107.5, 7800, '4170x1634x2130'],
]

const records = engines.map(([model, eng_prime_kw, eng_standby_kw, prime_kwe, standby_kwe, disp, weight, dims]) => {
  const { config, cylinders } = parseConfig(model)
  const dimParts = dims ? dims.split('x').map(Number) : [null, null, null]
  return {
    slug:                      slug(model),
    brand:                     'Googol',
    model,
    series:                    parseSeries(model),
    origin:                    'China',
    status:                    'active',
    emissions_standard:        'China National Stage III',
    configuration:             config,
    cylinders,
    displacement_l:            disp,
    prime_power_kw_50hz:       eng_prime_kw,
    standby_power_kw_50hz:     eng_standby_kw,
    prime_power_kwe_50hz:      prime_kwe,
    standby_power_kwe_50hz:    standby_kwe,
    rpm_rated:                 1500,
    cooling_method:            parseCooling(model),
    weight_kg:                 weight,
    length_mm:                 dimParts[0],
    width_mm:                  dimParts[1],
    height_mm:                 dimParts[2],
  }
})

console.log(`Inserting ${records.length} Googol engines...`)

const { data, error } = await supabase.from('engines').insert(records).select('id, model')
if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`✓ Inserted ${data.length} engines`)
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
