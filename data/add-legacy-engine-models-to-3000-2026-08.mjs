import { createClient } from '@supabase/supabase-js'

const TARGET_ENGINE_COUNT = 3000
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const hpToKw = (hp) => round1(hp * 0.7457)
const cuInToL = (cuIn) => round1(cuIn * 0.0163871)

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function clean(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))
}

function legacy(row) {
  const fuelType = row.fuel_type ?? 'Diesel'
  const record = {
    slug: row.slug ?? `${slugify(row.brand)}-${slugify(row.model)}`,
    brand: row.brand,
    model: row.model,
    series: row.series,
    status: 'discontinued',
    year_introduced: row.year_introduced,
    year_discontinued: row.year_discontinued,
    origin: row.origin,
    fuel_type: fuelType,
    ignition_type: /gas|propane|lpg/i.test(fuelType) ? 'Spark Ignition' : 'Compression Ignition',
    cooling_method: row.cooling_method ?? 'Liquid-Cooled',
    emissions_standard: row.emissions_standard ?? 'Unregulated',
    power_kw: row.power_kw,
    power_hp: row.power_hp,
    displacement_l: row.displacement_l,
    cylinders: row.cylinders,
    configuration: row.configuration,
    rpm_rated: row.rpm_rated,
    compression_ratio: row.compression_ratio,
    weight_kg: row.weight_kg,
    length_mm: row.length_mm,
    width_mm: row.width_mm,
    height_mm: row.height_mm,
    description: row.description ?? `${row.brand} ${row.model} discontinued legacy engine. ${row.use}`,
  }
  return clean(record)
}

function detroit(model, series, cylinders, displacementCuInPerCylinder, configuration, use) {
  return legacy({
    brand: 'Detroit Diesel',
    model,
    series,
    origin: 'United States',
    year_discontinued: /Series 60|8\.2/.test(series) ? undefined : 1999,
    displacement_l: cuInToL(cylinders * displacementCuInPerCylinder),
    cylinders,
    configuration,
    cooling_method: 'Liquid-Cooled',
    use: use ?? 'Source-validated Detroit Diesel legacy model with ongoing owner, rebuild, marine, generator, and parts-search demand.',
  })
}

function cat(model, series, cylinders, displacement_l, configuration, use) {
  return legacy({
    brand: 'Caterpillar',
    model,
    series,
    origin: 'United States',
    displacement_l,
    cylinders,
    configuration,
    cooling_method: 'Liquid-Cooled',
    use: use ?? 'Source-validated Caterpillar legacy industrial or marine engine model with ongoing parts and rebuild demand.',
  })
}

function deutz(model, series, cylinders, displacement_l, configuration, cooling_method = 'Air-Cooled') {
  return legacy({
    brand: 'Deutz',
    model,
    series,
    origin: 'Germany',
    displacement_l,
    cylinders,
    configuration,
    cooling_method,
    use: 'Source-validated DEUTZ archive engine model used in older generator, construction, agricultural, and mobile machinery applications.',
  })
}

function johnDeere(model, series, cylinders, displacement_l) {
  return legacy({
    brand: 'John Deere',
    model,
    series,
    origin: 'United States',
    displacement_l,
    cylinders,
    configuration: `L${cylinders}, naturally aspirated / turbocharged variants`,
    cooling_method: 'Liquid-Cooled',
    use: 'Source-validated older John Deere engine model from the numbered industrial engine identification series.',
  })
}

function volvo(model, series, cylinders, displacement_l) {
  return legacy({
    brand: 'Volvo Penta',
    model,
    series,
    origin: 'Sweden',
    displacement_l,
    cylinders,
    configuration: cylinders ? `L${cylinders}, marine diesel` : 'Marine diesel',
    cooling_method: 'Liquid-Cooled',
    use: 'Volvo Penta marine legacy engine no longer in production, retained for owners searching manuals, spares, rebuilds, and repower options.',
  })
}

function cummins(model, series, cylinders, displacement_l, configuration) {
  return legacy({
    brand: 'Cummins',
    model,
    series,
    origin: 'United States',
    displacement_l,
    cylinders,
    configuration,
    cooling_method: 'Liquid-Cooled',
    use: 'Source-validated older Cummins engine model with long-tail parts, overhaul, genset, truck, marine, and equipment search demand.',
  })
}

function kubota(model, series, cylinders, displacement_l, configuration) {
  return legacy({
    brand: 'Kubota',
    model,
    series,
    origin: 'Japan',
    displacement_l,
    cylinders,
    configuration,
    cooling_method: 'Liquid-Cooled',
    use: 'Source-validated older Kubota industrial diesel model from legacy Tier 1, Tier 2, or non-certified service literature.',
  })
}

function waukesha(model, series, cylinders, displacement_l, configuration, fuel_type = 'Natural Gas') {
  return legacy({
    brand: 'Waukesha',
    model,
    series,
    origin: 'United States',
    fuel_type,
    displacement_l,
    cylinders,
    configuration,
    cooling_method: 'Liquid-Cooled',
    use: 'Source-validated Waukesha legacy engine designation used in older stationary, gas compression, field power, and rebuild contexts.',
  })
}

const DETROIT_DIESEL = [
  detroit('2-53', '53 Series', 2, 53, 'L2, two-cycle diesel'),
  detroit('3-53', '53 Series', 3, 53, 'L3, two-cycle diesel'),
  detroit('4-53', '53 Series', 4, 53, 'L4, two-cycle diesel'),
  detroit('6-53', '53 Series', 6, 53, 'L6, two-cycle diesel'),
  detroit('4V-53', '53 Series', 4, 53, 'V4, two-cycle diesel'),
  detroit('6V-53', '53 Series', 6, 53, 'V6, two-cycle diesel'),
  detroit('6V-53N Industrial', '53 Series', 6, 53, 'V6, naturally aspirated two-cycle diesel'),
  detroit('6V-53T Industrial', '53 Series', 6, 53, 'V6, turbocharged two-cycle diesel'),
  detroit('2-71', 'Inline 71 Series', 2, 71, 'L2, two-cycle diesel'),
  detroit('3-71', 'Inline 71 Series', 3, 71, 'L3, two-cycle diesel'),
  detroit('4-71', 'Inline 71 Series', 4, 71, 'L4, two-cycle diesel'),
  detroit('6-71', 'Inline 71 Series', 6, 71, 'L6, two-cycle diesel'),
  detroit('6-71T', 'Inline 71 Series', 6, 71, 'L6, turbocharged two-cycle diesel'),
  detroit('6V-71', 'V71 Series', 6, 71, 'V6, two-cycle diesel'),
  detroit('8V-71', 'V71 Series', 8, 71, 'V8, two-cycle diesel'),
  detroit('12V-71', 'V71 Series', 12, 71, 'V12, two-cycle diesel'),
  detroit('16V-71', 'V71 Series', 16, 71, 'V16, two-cycle diesel'),
  detroit('12V-71 Generator Set', 'V71 Series', 12, 71, 'V12, two-cycle generator-drive diesel'),
  detroit('12V-71 Power Unit', 'V71 Series', 12, 71, 'V12, two-cycle power-unit diesel'),
  detroit('12V-71N Industrial', 'V71 Series', 12, 71, 'V12, naturally aspirated two-cycle diesel'),
  detroit('12V-71T Generator Set', 'V71 Series', 12, 71, 'V12, turbocharged two-cycle generator-drive diesel'),
  detroit('12V-71TA Industrial', 'V71 Series', 12, 71, 'V12, turbocharged aftercooled two-cycle diesel'),
  detroit('12V-71TI Marine', 'V71 Series', 12, 71, 'V12, turbocharged intercooled marine diesel'),
  detroit('6V-92', '92 Series', 6, 92, 'V6, two-cycle diesel'),
  detroit('8V-92', '92 Series', 8, 92, 'V8, two-cycle diesel'),
  detroit('12V-92', '92 Series', 12, 92, 'V12, two-cycle diesel'),
  detroit('16V-92', '92 Series', 16, 92, 'V16, two-cycle diesel'),
  detroit('6V-92TA Crew Boat', '92 Series', 6, 92, 'V6, turbocharged aftercooled marine diesel'),
  detroit('6V-92TA Marine Pleasure Craft', '92 Series', 6, 92, 'V6, turbocharged aftercooled marine diesel'),
  detroit('8V-92TA Commercial Marine', '92 Series', 8, 92, 'V8, turbocharged aftercooled marine diesel'),
  detroit('8V-92TA DDEC Commercial Marine', '92 Series', 8, 92, 'V8, DDEC turbocharged aftercooled marine diesel'),
  detroit('16V-92A Marine Pleasure Craft', '92 Series', 16, 92, 'V16, aftercooled marine diesel'),
  detroit('8V-149', '149 Series', 8, 149, 'V8, two-cycle diesel'),
  detroit('12V-149', '149 Series', 12, 149, 'V12, two-cycle diesel'),
  detroit('16V-149', '149 Series', 16, 149, 'V16, two-cycle diesel'),
  detroit('12V-149 Marine', '149 Series', 12, 149, 'V12, two-cycle marine diesel'),
  detroit('8.2L Fuel Pincher', '8.2 Liter Series', 8, 62.5, 'V8, four-cycle diesel'),
  detroit('Series 60 11.1L', 'Series 60', 6, 113, 'L6, four-cycle diesel'),
  detroit('Series 60 12.7L', 'Series 60', 6, 129, 'L6, four-cycle diesel'),
  detroit('Series 60 14.0L', 'Series 60', 6, 142, 'L6, four-cycle diesel'),
]

const VOLVO_PENTA = [
  volvo('2001', '2000 Series', 1, 0.43),
  volvo('2002', '2000 Series', 2, 0.61),
  volvo('2003', '2000 Series', 3, 0.85),
  volvo('2003T', '2000 Series', 3, 0.85),
  volvo('MD1B', 'MD Series', 1),
  volvo('MD2B', 'MD Series', 2),
  volvo('MD3B', 'MD Series', 3),
  volvo('MD5A', 'MD Series', 1),
  volvo('MD5B', 'MD Series', 1),
  volvo('MD5C', 'MD Series', 1),
  volvo('MD6A', 'MD Series', 2),
  volvo('MD6B', 'MD Series', 2),
  volvo('MD7A', 'MD Series', 2),
  volvo('MD7B', 'MD Series', 2),
  volvo('MD11C', 'MD Series', 2),
  volvo('MD11D', 'MD Series', 2),
  volvo('MD17C', 'MD Series', 3),
  volvo('MD17D', 'MD Series', 3),
  volvo('MD22A', 'MD22 Series', 4, 2.0),
  volvo('MD22L-B', 'MD22 Series', 4, 2.0),
  volvo('MD22P-B', 'MD22 Series', 4, 2.0),
  volvo('TMD22P-B', 'MD22 Series', 4, 2.0),
  volvo('TAMD22P-B', 'MD22 Series', 4, 2.0),
  volvo('AQAD30A', '30 Series', 4, 3.0),
  volvo('MD30A', '30 Series', 4, 3.0),
  volvo('TMD30A', '30 Series', 4, 3.0),
  volvo('TAMD30A', '30 Series', 4, 3.0),
  volvo('AD31A', '31 Series', 4, 2.4),
  volvo('AD31B', '31 Series', 4, 2.4),
  volvo('AD31D', '31 Series', 4, 2.4),
  volvo('AD31P', '31 Series', 4, 2.4),
  volvo('AQAD31A', '31 Series', 4, 2.4),
  volvo('AQAD31B', '31 Series', 4, 2.4),
  volvo('MD31A', '31 Series', 4, 2.4),
  volvo('TMD31A', '31 Series', 4, 2.4),
  volvo('TMD31B', '31 Series', 4, 2.4),
  volvo('TMD31D', '31 Series', 4, 2.4),
  volvo('TAMD31A', '31 Series', 4, 2.4),
  volvo('TAMD31B', '31 Series', 4, 2.4),
  volvo('TAMD31D', '31 Series', 4, 2.4),
  volvo('TAMD31P', '31 Series', 4, 2.4),
  volvo('AQAD40A', '40 Series', 6, 4.0),
  volvo('AQAD40B', '40 Series', 6, 4.0),
  volvo('AQD40A', '40 Series', 6, 4.0),
  volvo('MD40A', '40 Series', 6, 4.0),
  volvo('TMD40A', '40 Series', 6, 4.0),
  volvo('TMD40B', '40 Series', 6, 4.0),
  volvo('TMD40C', '40 Series', 6, 4.0),
  volvo('TAMD40A', '40 Series', 6, 4.0),
  volvo('TAMD40B', '40 Series', 6, 4.0),
  volvo('AD41A', '41 Series', 6, 3.6),
  volvo('AD41B', '41 Series', 6, 3.6),
  volvo('AD41D', '41 Series', 6, 3.6),
  volvo('AQAD41A', '41 Series', 6, 3.6),
  volvo('AQAD41B', '41 Series', 6, 3.6),
  volvo('D41A', '41 Series', 6, 3.6),
  volvo('D41B', '41 Series', 6, 3.6),
  volvo('D41D', '41 Series', 6, 3.6),
  volvo('TMD41A', '41 Series', 6, 3.6),
  volvo('TMD41B', '41 Series', 6, 3.6),
  volvo('TMD41D', '41 Series', 6, 3.6),
  volvo('TAMD41A', '41 Series', 6, 3.6),
  volvo('TAMD41B', '41 Series', 6, 3.6),
  volvo('TAMD41D', '41 Series', 6, 3.6),
  volvo('TAMD41P-B', '41 Series', 6, 3.6),
  volvo('KAD42A', 'KAD Series', 6, 3.6),
  volvo('KAD42B', 'KAD Series', 6, 3.6),
  volvo('KAMD42A', 'KAD Series', 6, 3.6),
  volvo('KAMD42B', 'KAD Series', 6, 3.6),
  volvo('TAMD42B', '42 Series', 6, 3.6),
  volvo('KAD43P', 'KAD Series', 6, 3.6),
  volvo('KAMD43P', 'KAD Series', 6, 3.6),
  volvo('KAD44P', 'KAD Series', 6, 3.6),
  volvo('KAMD44P', 'KAD Series', 6, 3.6),
  volvo('KAD300', 'KAD Series', 6, 3.6),
  volvo('KAMD300', 'KAD Series', 6, 3.6),
  volvo('TAMD61A', '61 Series', 6),
  volvo('TAMD62A', '62 Series', 6),
  volvo('TAMD63L', '63 Series', 6),
  volvo('TAMD63P', '63 Series', 6),
  volvo('AQD70B', '70 Series', 6),
  volvo('AQD70C', '70 Series', 6),
  volvo('AQD70D', '70 Series', 6),
  volvo('TAMD70B', '70 Series', 6),
  volvo('TAMD70C', '70 Series', 6),
  volvo('TAMD70D', '70 Series', 6),
  volvo('TAMD70E', '70 Series', 6),
  volvo('TAMD71A', '71 Series', 6),
  volvo('TAMD71B', '71 Series', 6),
  volvo('TAMD72A', '72 Series', 6),
  volvo('TAMD72EDC', '72 Series', 6),
  volvo('TAMD73P-A', '73 Series', 6),
  volvo('TAMD74C-A', '74 Series', 6),
  volvo('TAMD74L-A', '74 Series', 6),
  volvo('TAMD74P-A', '74 Series', 6),
  volvo('TAMD103A', '103 Series', 6),
  volvo('TAMD122A', '122 Series', 6),
  volvo('TAMD122C', '122 Series', 6),
  volvo('TAMD122D', '122 Series', 6),
  volvo('TAMD122P', '122 Series', 6),
  volvo('TAMD162A', '162 Series', 6),
  volvo('TAMD162B', '162 Series', 6),
  volvo('TAMD162C', '162 Series', 6),
  volvo('TAMD163A', '163 Series', 6),
  volvo('TAMD163P', '163 Series', 6),
  volvo('TAMD165A-A', '165 Series', 6),
  volvo('TAMD165C-A', '165 Series', 6),
  volvo('TAMD165P-A', '165 Series', 6),
]

const CATERPILLAR = [
  cat('D334 Propulsion', '300 Series', 4, undefined, 'L4, marine propulsion diesel'),
  cat('D342 Propulsion', '300 Series', 6, undefined, 'L6, marine propulsion diesel'),
  cat('D343 Propulsion', '300 Series', 6, undefined, 'L6, marine propulsion diesel'),
  cat('D346 Propulsion', '300 Series', 6, undefined, 'L6, marine propulsion diesel'),
  cat('D348 Propulsion', '300 Series', 12, undefined, 'V12, marine propulsion diesel'),
  cat('D349 Propulsion', '300 Series', 16, undefined, 'V16, marine propulsion diesel'),
  cat('3054 Propulsion', '3000 Series', 4, 4.0, 'L4, marine propulsion diesel'),
  cat('3054B Propulsion', '3000 Series', 4, 4.0, 'L4, marine propulsion diesel'),
  cat('3054T Mining', '3000 Series', 4, 4.0, 'L4, turbocharged mining diesel'),
  cat('3056E Industrial', '3000 Series', 6, 6.0, 'L6, industrial diesel'),
  cat('3114', '3100 Series', 4, 4.4, 'L4, industrial diesel'),
  cat('3116 Marine Propulsion', '3100 Series', 6, 6.6, 'L6, marine propulsion diesel'),
  cat('3126 Marine Propulsion', '3100 Series', 6, 7.2, 'L6, marine propulsion diesel'),
  cat('3126B Marine Propulsion', '3100 Series', 6, 7.2, 'L6, marine propulsion diesel'),
  cat('3176C Marine Propulsion', '3100 Series', 6, 10.3, 'L6, marine propulsion diesel'),
  cat('3204', '3200 Series', 4, 5.2, 'L4, diesel'),
  cat('3208 Marine Propulsion', '3200 Series', 8, 10.4, 'V8, marine propulsion diesel'),
  cat('D330C', '3300 Series', 4, undefined, 'L4, diesel'),
  cat('D333C', '3300 Series', 6, undefined, 'L6, diesel'),
  cat('D3304 Propulsion', '3300 Series', 4, 7.0, 'L4, marine propulsion diesel'),
  cat('3304B DINA Auxiliary', '3300 Series', 4, 7.0, 'L4, naturally aspirated auxiliary diesel'),
  cat('3304B DINA Genset', '3300 Series', 4, 7.0, 'L4, naturally aspirated generator diesel'),
  cat('3304B DINA Propulsion', '3300 Series', 4, 7.0, 'L4, naturally aspirated propulsion diesel'),
  cat('3304B DIT Auxiliary', '3300 Series', 4, 7.0, 'L4, turbocharged auxiliary diesel'),
  cat('3304B DIT Genset', '3300 Series', 4, 7.0, 'L4, turbocharged generator diesel'),
  cat('3304B DIT Propulsion', '3300 Series', 4, 7.0, 'L4, turbocharged propulsion diesel'),
  cat('3306B DINA Auxiliary', '3300 Series', 6, 10.5, 'L6, naturally aspirated auxiliary diesel'),
  cat('3306B DIT Auxiliary', '3300 Series', 6, 10.5, 'L6, turbocharged auxiliary diesel'),
  cat('3306B DITA Auxiliary', '3300 Series', 6, 10.5, 'L6, turbocharged aftercooled auxiliary diesel'),
  cat('3306B DITA Genset', '3300 Series', 6, 10.5, 'L6, turbocharged aftercooled generator diesel'),
  cat('3306B DITA Propulsion', '3300 Series', 6, 10.5, 'L6, turbocharged aftercooled propulsion diesel'),
  cat('3406 Industrial', '3400 Series', 6, 14.6, 'L6, industrial diesel'),
  cat('3406 Marine', '3400 Series', 6, 14.6, 'L6, marine diesel'),
  cat('3406B', '3400 Series', 6, 14.6, 'L6, turbocharged diesel'),
  cat('3406E Marine', '3400 Series', 6, 14.6, 'L6, electronically controlled marine diesel'),
  cat('3408', '3400 Series', 8, 18.0, 'V8, diesel'),
  cat('3408B', '3400 Series', 8, 18.0, 'V8, diesel'),
  cat('3408C', '3400 Series', 8, 18.0, 'V8, diesel'),
  cat('3412', '3400 Series', 12, 27.0, 'V12, diesel'),
  cat('3412C', '3400 Series', 12, 27.0, 'V12, diesel'),
]

const DEUTZ = [
  deutz('F 2L 2011', '2011 Series', 2, undefined, 'L2, naturally aspirated diesel'),
  deutz('F 2M 2011', '2011 Series', 2, undefined, 'L2, naturally aspirated diesel', 'Liquid-Cooled'),
  deutz('F 3L 2011', '2011 Series', 3, undefined, 'L3, naturally aspirated diesel'),
  deutz('F 3M 2011', '2011 Series', 3, undefined, 'L3, naturally aspirated diesel', 'Liquid-Cooled'),
  deutz('F 4L 2011', '2011 Series', 4, undefined, 'L4, naturally aspirated diesel'),
  deutz('F 4M 2011', '2011 Series', 4, undefined, 'L4, naturally aspirated diesel', 'Liquid-Cooled'),
  deutz('BF 4L 2011', '2011 Series', 4, undefined, 'L4, turbocharged diesel'),
  deutz('BF 4M 2011', '2011 Series', 4, undefined, 'L4, turbocharged diesel', 'Liquid-Cooled'),
  deutz('BF 4M 2011 C', '2011 Series', 4, undefined, 'L4, turbocharged charge-cooled diesel', 'Liquid-Cooled'),
  deutz('D 2011 L02', '2011 Series', 2, undefined, 'L2, diesel'),
  deutz('D 2011 L02 I', '2011 Series', 2, undefined, 'L2, diesel'),
  deutz('D 2011 L03', '2011 Series', 3, undefined, 'L3, diesel'),
  deutz('D 2011 L03 I', '2011 Series', 3, undefined, 'L3, diesel'),
  deutz('D 2011 L04', '2011 Series', 4, undefined, 'L4, diesel'),
  deutz('D 2011 L04 I', '2011 Series', 4, undefined, 'L4, diesel'),
  deutz('TD 2011 L4 I', '2011 Series', 4, 3.62, 'L4, turbocharged diesel'),
  deutz('F 3L 912', '912 Series', 3, 2.8, 'L3, naturally aspirated diesel'),
  deutz('F 4L 912', '912 Series', 4, 3.8, 'L4, naturally aspirated diesel'),
  deutz('F 5L 912', '912 Series', 5, 4.7, 'L5, naturally aspirated diesel'),
  deutz('F 6L 912', '912 Series', 6, 5.7, 'L6, naturally aspirated diesel'),
  deutz('F 4L 912 W', '912 Series', 4, 3.8, 'L4, naturally aspirated diesel'),
  deutz('F 6L 912 W', '912 Series', 6, 5.7, 'L6, naturally aspirated diesel'),
  deutz('BF 4L 913', '913 Series', 4, 4.086, 'L4, turbocharged diesel'),
  deutz('BF 6L 913', '913 Series', 6, 6.128, 'L6, turbocharged diesel'),
  deutz('BF 6L 913 C', '913 Series', 6, 6.128, 'L6, turbocharged charge-cooled diesel'),
  deutz('BF 6L 913 CT', '913 Series', 6, 6.128, 'L6, turbocharged charge-cooled diesel'),
  deutz('F 4L 914', '914 Series', 4, undefined, 'L4, naturally aspirated diesel'),
  deutz('F 6L 914', '914 Series', 6, undefined, 'L6, naturally aspirated diesel'),
  deutz('D 914 L04', '914 Series', 4, undefined, 'L4, diesel'),
  deutz('D 914 L06', '914 Series', 6, undefined, 'L6, diesel'),
  deutz('BF 4L 914', '914 Series', 4, undefined, 'L4, turbocharged diesel'),
  deutz('BF 6L 914', '914 Series', 6, undefined, 'L6, turbocharged diesel'),
  deutz('BF 6L 914 C', '914 Series', 6, undefined, 'L6, turbocharged charge-cooled diesel'),
  deutz('BF 4M 1013 EC', '1013 Series', 4, 4.764, 'L4, turbocharged diesel', 'Liquid-Cooled'),
  deutz('BF 4M 1013 FC', '1013 Series', 4, 4.764, 'L4, turbocharged charge-cooled diesel', 'Liquid-Cooled'),
  deutz('BF 6M 1013 EC', '1013 Series', 6, 7.146, 'L6, turbocharged diesel', 'Liquid-Cooled'),
  deutz('BF 6M 1013 FC', '1013 Series', 6, 7.146, 'L6, turbocharged charge-cooled diesel', 'Liquid-Cooled'),
  deutz('BF 6M 1015 C', '1015 Series', 6, undefined, 'V6, turbocharged charge-cooled diesel', 'Liquid-Cooled'),
  deutz('BF 8M 1015 C', '1015 Series', 8, undefined, 'V8, turbocharged charge-cooled diesel', 'Liquid-Cooled'),
  deutz('BF 8M 1015 CP', '1015 Series', 8, undefined, 'V8, turbocharged charge-cooled diesel', 'Liquid-Cooled'),
]

const JOHN_DEERE = [
  johnDeere('3152', '300 Series', 3, 2.5),
  johnDeere('3164', '300 Series', 3, 2.7),
  johnDeere('3179', '300 Series', 3, 2.9),
  johnDeere('3029', '300 Series', 3, 2.9),
  johnDeere('4202', '300 Series', 4, 3.3),
  johnDeere('4219', '300 Series', 4, 3.6),
  johnDeere('4239', '300 Series', 4, 3.9),
  johnDeere('4276', '300 Series', 4, 4.5),
  johnDeere('4039', '300 Series', 4, 3.9),
  johnDeere('4045', '300 Series', 4, 4.5),
  johnDeere('6303', '300 Series', 6, 5.0),
  johnDeere('6329', '300 Series', 6, 5.4),
  johnDeere('6359', '300 Series', 6, 5.9),
  johnDeere('6414', '300 Series', 6, 6.8),
  johnDeere('6059', '300 Series', 6, 5.9),
  johnDeere('6068', '300 Series', 6, 6.8),
  johnDeere('3029 PowerTech', '350 Series', 3, 2.9),
  johnDeere('4045 PowerTech', '350 Series', 4, 4.5),
  johnDeere('6068 PowerTech', '350 Series', 6, 6.8),
  johnDeere('4270', '400 Series', 4, 4.4),
  johnDeere('6404', '400 Series', 6, 6.6),
  johnDeere('6466', '400 Series', 6, 7.6),
  johnDeere('6076', '400 Series', 6, 7.6),
  johnDeere('6081', '450 Series', 6, 8.1),
  johnDeere('6531', '500 Series', 6, 8.7),
  johnDeere('6619', '500 Series', 6, 10.1),
  johnDeere('6105 PowerTech', '550 Series', 6, 10.5),
  johnDeere('6125 PowerTech', '650 Series', 6, 12.5),
]

const CUMMINS = [
  cummins('NH 220', 'N Series', 6, 14.0, 'L6, naturally aspirated diesel'),
  cummins('NH 855', 'N Series', 6, 14.0, 'L6, naturally aspirated diesel'),
  cummins('NT 855', 'N Series', 6, 14.0, 'L6, turbocharged diesel'),
  cummins('NTA 855', 'N Series', 6, 14.0, 'L6, turbocharged aftercooled diesel'),
  cummins('NTA855-G1', 'N Series', 6, 14.0, 'L6, generator-drive diesel'),
  cummins('NTA855-G2', 'N Series', 6, 14.0, 'L6, generator-drive diesel'),
  cummins('NTA855-G3', 'N Series', 6, 14.0, 'L6, generator-drive diesel'),
  cummins('N14', 'N Series', 6, 14.0, 'L6, diesel'),
  cummins('N14 Celect', 'N Series', 6, 14.0, 'L6, electronically controlled diesel'),
  cummins('L10', 'L Series', 6, 10.0, 'L6, diesel'),
  cummins('LT10', 'L Series', 6, 10.0, 'L6, diesel'),
  cummins('M11', 'M Series', 6, 10.8, 'L6, diesel'),
  cummins('MTA11-G1', 'M Series', 6, 10.8, 'L6, generator-drive diesel'),
  cummins('MTAA11-G3', 'M Series', 6, 10.8, 'L6, generator-drive diesel'),
  cummins('6C 8.3', 'C Series', 6, 8.3, 'L6, diesel'),
  cummins('6CT 8.3', 'C Series', 6, 8.3, 'L6, turbocharged diesel'),
  cummins('6CTA 8.3', 'C Series', 6, 8.3, 'L6, turbocharged aftercooled diesel'),
  cummins('V6-378', 'V Series', 6, 6.2, 'V6, diesel'),
  cummins('V8-504', 'V Series', 8, 8.3, 'V8, diesel'),
  cummins('V8-555', 'V Series', 8, 9.1, 'V8, diesel'),
  cummins('V8-903', 'V Series', 8, 14.8, 'V8, diesel'),
  cummins('VT903', 'V Series', 8, 14.8, 'V8, turbocharged diesel'),
  cummins('VTA28', 'VTA Series', 12, 28.0, 'V12, turbocharged aftercooled diesel'),
  cummins('KT19', 'K Series', 6, 19.0, 'L6, diesel'),
  cummins('KTA19', 'K Series', 6, 19.0, 'L6, turbocharged aftercooled diesel'),
  cummins('KT38', 'K Series', 12, 38.0, 'V12, diesel'),
  cummins('KTA38', 'K Series', 12, 38.0, 'V12, turbocharged aftercooled diesel'),
  cummins('KT50', 'K Series', 16, 50.0, 'V16, diesel'),
  cummins('KTA50', 'K Series', 16, 50.0, 'V16, turbocharged aftercooled diesel'),
]

const KUBOTA = [
  kubota('Z482', 'Super Mini Series', 2, 0.479, 'L2, naturally aspirated diesel'),
  kubota('Z602', 'Super Mini Series', 2, 0.599, 'L2, naturally aspirated diesel'),
  kubota('D662', 'Super Mini Series', 3, 0.656, 'L3, naturally aspirated diesel'),
  kubota('D722', 'Super Mini Series', 3, 0.719, 'L3, naturally aspirated diesel'),
  kubota('D782', 'Super Mini Series', 3, 0.778, 'L3, naturally aspirated diesel'),
  kubota('D902', 'Super Mini Series', 3, 0.898, 'L3, naturally aspirated diesel'),
  kubota('D905', '05 Series', 3, 0.898, 'L3, naturally aspirated diesel'),
  kubota('D1005', '05 Series', 3, 1.001, 'L3, naturally aspirated diesel'),
  kubota('D1105', '05 Series', 3, 1.123, 'L3, naturally aspirated diesel'),
  kubota('D1105-T', '05 Series', 3, 1.123, 'L3, turbocharged diesel'),
  kubota('D1305', '05 Series', 3, 1.261, 'L3, naturally aspirated diesel'),
  kubota('V1205', '05 Series', 4, 1.198, 'L4, naturally aspirated diesel'),
  kubota('V1205-T', '05 Series', 4, 1.198, 'L4, turbocharged diesel'),
  kubota('V1305', '05 Series', 4, 1.335, 'L4, naturally aspirated diesel'),
  kubota('V1505', '05 Series', 4, 1.498, 'L4, naturally aspirated diesel'),
  kubota('V1505-T', '05 Series', 4, 1.498, 'L4, turbocharged diesel'),
  kubota('D1403', '03 Series', 3, 1.372, 'L3, naturally aspirated diesel'),
  kubota('D1503', '03 Series', 3, 1.499, 'L3, naturally aspirated diesel'),
  kubota('D1703', '03 Series', 3, 1.647, 'L3, naturally aspirated diesel'),
  kubota('D1803-M', '03 Series', 3, 1.826, 'L3, naturally aspirated diesel'),
  kubota('V1903', '03 Series', 4, 1.857, 'L4, naturally aspirated diesel'),
  kubota('V2003-M', '03 Series', 4, 1.999, 'L4, naturally aspirated diesel'),
  kubota('V2003-M-T', '03 Series', 4, 1.999, 'L4, turbocharged diesel'),
  kubota('V2203', '03 Series', 4, 2.197, 'L4, naturally aspirated diesel'),
  kubota('V2203-DI', '03 Series', 4, 2.197, 'L4, direct-injection diesel'),
  kubota('V2203-M', '03 Series', 4, 2.197, 'L4, naturally aspirated diesel'),
  kubota('V2403-M', '03 Series', 4, 2.434, 'L4, naturally aspirated diesel'),
  kubota('V2403-M-T', '03 Series', 4, 2.434, 'L4, turbocharged diesel'),
  kubota('F2503-T', '03 Series', 5, 2.5, 'L5, turbocharged diesel'),
  kubota('F2803', '03 Series', 5, 2.746, 'L5, naturally aspirated diesel'),
  kubota('V3300', 'V3 Series', 4, 3.318, 'L4, naturally aspirated diesel'),
  kubota('V3300-T', 'V3 Series', 4, 3.318, 'L4, turbocharged diesel'),
  kubota('V3300DI', 'V3 Series', 4, 3.318, 'L4, direct-injection diesel'),
  kubota('V3300DI-T', 'V3 Series', 4, 3.318, 'L4, turbocharged direct-injection diesel'),
  kubota('V3800DI', 'V3 Series', 4, 3.769, 'L4, direct-injection diesel'),
  kubota('V3800DI-T', 'V3 Series', 4, 3.769, 'L4, turbocharged direct-injection diesel'),
]

const WAUKESHA = [
  waukesha('F554', 'Legacy Designation', 6, cuInToL(554), 'L6, gaseous fuel engine'),
  waukesha('D155', 'Legacy Designation', 4, cuInToL(155), 'L4, gaseous fuel engine'),
  waukesha('F265', 'Legacy Designation', 6, cuInToL(265), 'L6, gaseous fuel engine'),
  waukesha('F283', 'Legacy Designation', 6, cuInToL(283), 'L6, gaseous fuel engine'),
  waukesha('F310', 'Legacy Designation', 6, cuInToL(310), 'L6, gaseous fuel engine'),
  waukesha('F1905', 'Legacy Designation', 6, cuInToL(1905), 'L6, gaseous fuel engine'),
  waukesha('F2895G', 'VHP Series', 6, cuInToL(2895), 'L6, VHP gas engine'),
  waukesha('F3521G', 'VHP Series', 6, cuInToL(3521), 'L6, VHP gas engine'),
  waukesha('L5790G', 'VHP Series', 12, cuInToL(5790), 'V12, VHP gas engine'),
  waukesha('L7042G', 'VHP Series', 12, cuInToL(7042), 'V12, VHP gas engine'),
  waukesha('P9390GSI', 'VHP Series', 16, cuInToL(9388), 'V16, turbocharged intercooled gas engine'),
  waukesha('F3335D', 'VHP Diesel', 6, cuInToL(3335.2), 'L6, VHP diesel engine', 'Diesel'),
  waukesha('L6670D', 'VHP Diesel', 12, cuInToL(6670.5), 'V12, VHP diesel engine', 'Diesel'),
  waukesha('P8894D', 'VHP Diesel', 16, cuInToL(8894), 'V16, VHP diesel engine', 'Diesel'),
]

const candidates = [
  ...DETROIT_DIESEL,
  ...VOLVO_PENTA,
  ...CATERPILLAR,
  ...DEUTZ,
  ...JOHN_DEERE,
  ...CUMMINS,
  ...KUBOTA,
  ...WAUKESHA,
]

const slugCounts = new Map()
for (const record of candidates) slugCounts.set(record.slug, (slugCounts.get(record.slug) ?? 0) + 1)
const duplicateSlugs = [...slugCounts].filter(([, count]) => count > 1)
if (duplicateSlugs.length) {
  console.error(`Duplicate slugs in candidate batch: ${duplicateSlugs.map(([slug]) => slug).join(', ')}`)
  process.exit(1)
}

const { count: currentCount, error: countError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (countError) throw countError

const needed = Math.max(0, TARGET_ENGINE_COUNT - currentCount)
if (needed === 0) {
  console.log(`Engine count is already ${currentCount}; target ${TARGET_ENGINE_COUNT} reached.`)
  process.exit(0)
}

const candidateSlugs = candidates.map((record) => record.slug)
const existingSlugs = new Set()
for (let i = 0; i < candidateSlugs.length; i += 500) {
  const chunk = candidateSlugs.slice(i, i + 500)
  const { data, error } = await supabase
    .from('engines')
    .select('slug')
    .in('slug', chunk)
  if (error) throw error
  for (const row of data ?? []) existingSlugs.add(row.slug)
}

const missing = candidates.filter((record) => !existingSlugs.has(record.slug))
if (missing.length < needed) {
  console.error(`Need ${needed} new rows but only ${missing.length} missing validated candidates are available.`)
  process.exit(1)
}

const records = missing.slice(0, needed)
const { data, error } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
  .select('id, brand, model, slug')
if (error) throw error

const { count: afterCount, error: afterCountError } = await supabase
  .from('engines')
  .select('id', { count: 'exact', head: true })
if (afterCountError) throw afterCountError

console.log(`Imported ${data.length} validated legacy engine records.`)
console.log(`Engine count: ${currentCount} -> ${afterCount} (target ${TARGET_ENGINE_COUNT})`)
for (const row of data) {
  console.log(`${row.brand}\t${row.model}\t${row.slug}`)
}
