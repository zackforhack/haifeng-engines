import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const hpToKw = (hp) => round1(hp * 0.7457)

function sourcedDescription(brand, model, note) {
  return `${brand} ${model} discontinued legacy engine. ${note}`
}

const VOLVO_SMALL_DIESEL = [
  ['volvo-penta-2001', '2001', 1983, null, 1, 0.43, 9, 3200],
  ['volvo-penta-2002', '2002', 1984, null, 2, 0.61, 18, 3200],
  ['volvo-penta-2003', '2003', 1985, null, 3, 0.85, 28, 3200],
  ['volvo-penta-2003t', '2003T', 1985, null, 3, 0.85, 45, 3200],
  ['volvo-penta-md1b', 'MD1B', 1970, 1973, 1, null, 10, 2500],
  ['volvo-penta-md2b', 'MD2B', 1970, 1975, 2, null, 25, 2500],
  ['volvo-penta-md3b', 'MD3B', 1971, 1975, 3, null, 36, 2500],
  ['volvo-penta-md5a', 'MD5A', 1975, 1978, 1, null, 7.5, 2500],
  ['volvo-penta-md5b', 'MD5B', 1978, 1981, 1, null, 7.5, 2500],
  ['volvo-penta-md5c', 'MD5C', 1981, 1982, 1, null, 9.5, 3000],
  ['volvo-penta-md6a', 'MD6A', 1971, 1975, 2, null, 10, 2400],
  ['volvo-penta-md6b', 'MD6B', 1975, 1976, 2, null, 10, 2400],
  ['volvo-penta-md7a', 'MD7A', 1976, 1981, 2, null, 13.4, 2600],
  ['volvo-penta-md7b', 'MD7B', 1981, 1983, 2, null, 17.5, 3000],
  ['volvo-penta-md11c', 'MD11C', 1975, 1981, 2, null, 23, 2500],
  ['volvo-penta-md11d', 'MD11D', 1981, 1983, 2, null, 25, 3000],
  ['volvo-penta-md17c', 'MD17C', 1975, 1981, 3, null, 35, 2500],
  ['volvo-penta-md17d', 'MD17D', 1981, 1984, 3, null, 36, 3000],
].map(([slug, model, year_introduced, year_discontinued, cylinders, displacement_l, power_hp, rpm_rated]) => ({
  slug,
  fields: {
    model,
    year_introduced,
    year_discontinued,
    cylinders,
    displacement_l,
    power_hp,
    power_kw: hpToKw(power_hp),
    rpm_rated,
    configuration: `L${cylinders}, marine diesel`,
    description: sourcedDescription('Volvo Penta', model, 'Specifications cross-checked against Volvo Penta workshop/manual data and a Volvo Penta model guide listing production years, cylinder count, horsepower, and rated speed.'),
  },
}))

const VOLVO_LARGE_DIESEL = [
  ['volvo-penta-tamd61a', 'TAMD61A', 1986, null, 6, 5.48, 306, 2800],
  ['volvo-penta-tamd62a', 'TAMD62A', 1992, 1994, 6, 5.48, 340, null],
  ['volvo-penta-tamd63l', 'TAMD63L', null, null, 6, 5.48, 318, 2800],
  ['volvo-penta-tamd63p', 'TAMD63P', null, null, 6, 5.48, 370, 2800],
  ['volvo-penta-aqd70b', 'AQD70B', 1972, 1975, 6, null, 250, 2500],
  ['volvo-penta-aqd70c', 'AQD70C', 1974, 1978, 6, null, 280, 2500],
  ['volvo-penta-aqd70d', 'AQD70D', 1976, 1981, 6, null, 280, 2500],
  ['volvo-penta-tamd70b', 'TAMD70B', 1970, 1975, 6, null, 250, 2500],
  ['volvo-penta-tamd70c', 'TAMD70C', 1974, 1978, 6, null, 280, 2500],
  ['volvo-penta-tamd70d', 'TAMD70D', 1978, 1983, 6, null, 280, 2500],
  ['volvo-penta-tamd70e', 'TAMD70E', 1983, 1987, 6, null, 300, 2500],
  ['volvo-penta-tamd71a', 'TAMD71A', 1986, null, 6, 6.73, 357, 2500],
  ['volvo-penta-tamd71b', 'TAMD71B', null, null, 6, 6.73, 380, 2600],
  ['volvo-penta-tamd72a', 'TAMD72A', null, null, 6, 6.73, 430, 2600],
  ['volvo-penta-tamd72edc', 'TAMD72EDC', null, null, 6, 6.73, 430, 2600],
  ['volvo-penta-tamd73p-a', 'TAMD73P-A', null, null, 6, 6.73, 424, null],
  ['volvo-penta-tamd74c-a', 'TAMD74C-A', null, null, 6, 7.28, 430, 2500],
  ['volvo-penta-tamd74l-a', 'TAMD74L-A', null, null, 6, 7.28, null, null],
  ['volvo-penta-tamd74p-a', 'TAMD74P-A', null, null, 6, 7.28, 473, 2600],
  ['volvo-penta-tamd103a', 'TAMD103A', null, null, 6, null, 272, 2000],
  ['volvo-penta-tamd122a', 'TAMD122A', 1988, null, 6, 11.98, 400, 1900],
  ['volvo-penta-tamd122c', 'TAMD122C', 1988, null, 6, 11.98, 450, 2000],
  ['volvo-penta-tamd122d', 'TAMD122D', null, null, 6, 11.98, null, null],
  ['volvo-penta-tamd122p', 'TAMD122P', null, null, 6, 11.98, 600, 2250],
  ['volvo-penta-tamd162a', 'TAMD162A', 1988, null, 6, 16.123, 551, 1900],
  ['volvo-penta-tamd162b', 'TAMD162B', null, null, 6, 16.123, null, null],
  ['volvo-penta-tamd162c', 'TAMD162C', null, null, 6, 16.123, null, null],
  ['volvo-penta-tamd163a', 'TAMD163A', null, null, 6, 16.123, null, null],
  ['volvo-penta-tamd163p', 'TAMD163P', null, null, 6, 16.123, null, null],
  ['volvo-penta-tamd165a-a', 'TAMD165A-A', null, null, 6, 16.1, 550, null],
  ['volvo-penta-tamd165c-a', 'TAMD165C-A', null, null, 6, 16.1, 680, null],
  ['volvo-penta-tamd165p-a', 'TAMD165P-A', null, null, 6, 16.1, 770, 2100],
].map(([slug, model, year_introduced, year_discontinued, cylinders, displacement_l, power_hp, rpm_rated]) => ({
  slug,
  fields: {
    model,
    year_introduced,
    year_discontinued,
    cylinders,
    displacement_l,
    power_hp,
    power_kw: power_hp == null ? undefined : hpToKw(power_hp),
    rpm_rated,
    configuration: `L${cylinders}, turbocharged aftercooled marine diesel`,
    description: sourcedDescription('Volvo Penta', model, 'Specifications cross-checked against Volvo Penta model-guide, operator-manual, press-release, and workshop-manual sources. Sparse fields are left blank where a reliable model-specific value was not found.'),
  },
}))

const CATERPILLAR_POWER_RANGES = [
  ['caterpillar-d334-propulsion', 'D334 Propulsion', 360],
  ['caterpillar-d342-propulsion', 'D342 Propulsion', 360],
  ['caterpillar-d343-propulsion', 'D343 Propulsion', 550],
  ['caterpillar-d346-propulsion', 'D346 Propulsion', 735],
  ['caterpillar-d348-propulsion', 'D348 Propulsion', 1100],
  ['caterpillar-d349-propulsion', 'D349 Propulsion', 1470],
  ['caterpillar-d333c', 'D333C', 300],
].map(([slug, model, power_hp]) => ({
  slug,
  fields: {
    power_hp,
    power_kw: hpToKw(power_hp),
    description: sourcedDescription('Caterpillar', model, 'Model and horsepower range cross-checked against Caterpillar parts compatibility and legacy engine listing sources; using the upper published rating as representative power.'),
  },
}))

const CATERPILLAR_SPECIFIC = [
  {
    slug: 'caterpillar-d330c',
    fields: {
      power_hp: 65,
      power_kw: hpToKw(65),
      displacement_l: 5.7,
      cylinders: 4,
      rpm_rated: 2000,
      configuration: 'L4, diesel',
      description: sourcedDescription('Caterpillar', 'D330C', 'D330C specifications cross-checked against a Caterpillar D4D engine reference listing the D330C as a 4-cylinder, 5.7 L diesel rated 65 hp with 1680/2000 rpm variants.'),
    },
  },
]

const DEUTZ_2011 = [
  ['deutz-f-2l-2011', 'F 2L 2011', 2, 1.55, 23, 31, 2800, '19:1'],
  ['deutz-f-2m-2011', 'F 2M 2011', 2, 1.55, 24.2, 32, 2800, '19:1'],
  ['deutz-f-3l-2011', 'F 3L 2011', 3, 2.33, 35.8, 48, 2800, '19:1'],
  ['deutz-f-3m-2011', 'F 3M 2011', 3, 2.33, 36.5, 49, 2800, '19:1'],
  ['deutz-f-4l-2011', 'F 4L 2011', 4, 3.62, 47.8, 64, 2600, '19:1'],
  ['deutz-f-4m-2011', 'F 4M 2011', 4, 3.62, 48.5, 65, 2600, '19:1'],
  ['deutz-bf-4l-2011', 'BF 4L 2011', 4, 3.62, 58.1, 78, 2600, '18:1'],
  ['deutz-bf-4m-2011', 'BF 4M 2011', 4, 3.62, 68, 87, 2600, '18:1'],
  ['deutz-bf-4m-2011-c', 'BF 4M 2011 C', 4, 3.62, 74.9, 100, 2600, '18:1'],
  ['deutz-d-2011-l02', 'D 2011 L02', 2, 1.55, 23.5, 31.5, 2800, '19:1'],
  ['deutz-d-2011-l02-i', 'D 2011 L02 I', 2, 1.55, 23, 31, 2800, '19:1'],
  ['deutz-d-2011-l03', 'D 2011 L03', 3, 2.33, 36.5, 49, 2800, '19:1'],
  ['deutz-d-2011-l03-i', 'D 2011 L03 I', 3, 2.33, 36.4, 49, 2800, '19:1'],
  ['deutz-d-2011-l04', 'D 2011 L04', 4, 3.62, 50, 67, 2600, '19:1'],
  ['deutz-d-2011-l04-i', 'D 2011 L04 I', 4, 3.62, 47.5, 64, 2600, '19:1'],
  ['deutz-td-2011', 'TD 2011 L4 I', 4, 3.62, 57.6, 77.2, 2600, '18:1', 'deutz-td-2011-l4-i'],
].map(([slug, model, cylinders, displacement_l, power_kw, power_hp, rpm_rated, compression_ratio, newSlug]) => ({
  slug,
  matchSlugs: newSlug ? [slug, newSlug] : [slug],
  fields: {
    slug: newSlug,
    model,
    cylinders,
    displacement_l,
    power_kw,
    power_hp,
    rpm_rated,
    compression_ratio,
    configuration: `L${cylinders}, diesel`,
    description: sourcedDescription('Deutz', model, 'Technical data cross-checked against DEUTZ archive listings and DEUTZ 2011 Series published specification tables.'),
  },
}))

const DEUTZ_914 = [
  ['deutz-f-4l-914', 'F 4L 914', 62],
  ['deutz-f-6l-914', 'F 6L 914', 63],
].map(([slug, model, power_kw]) => ({
  slug,
  fields: {
    power_kw,
    power_hp: round1(power_kw / 0.7457),
    description: sourcedDescription('Deutz', model, 'Representative power cross-checked against DEUTZ engine archive/search-result specification listings; fields without a reliable model-specific value remain blank.'),
  },
}))

const updates = [
  ...VOLVO_SMALL_DIESEL,
  ...VOLVO_LARGE_DIESEL,
  ...CATERPILLAR_POWER_RANGES,
  ...CATERPILLAR_SPECIFIC,
  ...DEUTZ_2011,
  ...DEUTZ_914,
]

let updated = 0
for (const update of updates) {
  const fields = Object.fromEntries(
    Object.entries(update.fields).filter(([, value]) => value !== undefined && value !== null),
  )
  const { data, error } = await supabase
    .from('engines')
    .update(fields)
    .in('slug', update.matchSlugs ?? [update.slug])
    .select('slug, brand, model')
  if (error) throw error
  if (!data?.length) {
    console.warn(`No row matched ${update.slug}`)
    continue
  }
  updated += data.length
}

console.log(`Updated ${updated} legacy engine rows with source-validated quality hardening fields.`)
