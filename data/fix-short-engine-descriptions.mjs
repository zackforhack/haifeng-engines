import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(file) {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) continue
      const idx = line.indexOf('=')
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && process.env[key] == null) process.env[key] = value
    }
  } catch {
    // Optional local env file.
  }
}

function num(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function representativeRating(e) {
  const order = [
    ['standby_power_kwe_50hz', 'standby', '50 Hz'],
    ['prime_power_kwe_50hz', 'prime', '50 Hz'],
    ['standby_power_kwe_60hz', 'standby', '60 Hz'],
    ['prime_power_kwe_60hz', 'prime', '60 Hz'],
    ['power_kw', 'rated', null],
  ]
  for (const [field, duty, hz] of order) {
    const value = num(e[field])
    if (value != null) return { value, duty, hz, unit: field === 'power_kw' ? 'kWm' : 'kWe' }
  }
  return null
}

function speedFor(e, hz) {
  const rated = num(e.rpm_rated) ?? 1500
  if (hz === '60 Hz' && (rated === 1500 || rated === 3000)) return Math.round((rated * 6) / 5)
  if (hz === '50 Hz' && (rated === 1800 || rated === 3600)) return Math.round((rated * 5) / 6)
  return rated
}

function cylinderDescription(e) {
  if (e.configuration && e.cylinders) return `${e.configuration} ${e.cylinders}-cylinder`
  if (e.configuration) return String(e.configuration)
  if (e.cylinders) return `${e.cylinders}-cylinder`
  return ''
}

function buildDescription(e) {
  const rating = representativeRating(e)
  const specs = [
    e.displacement_l ? `${e.displacement_l}L` : '',
    cylinderDescription(e),
    String(e.fuel_type ?? 'diesel').toLowerCase(),
  ].filter(Boolean).join(' ')
  const series = e.series ? ` in the ${e.series}` : ''
  let description = `${e.brand} ${e.model} is a ${specs} generator-drive engine${series}`

  if (rating) {
    const speed = speedFor(e, rating.hz)
    description += `, rated at ${rating.value.toLocaleString()} ${rating.unit} ${rating.duty} output`
    if (rating.hz) description += ` at ${speed.toLocaleString()} rpm / ${rating.hz}`
    else description += ` at ${speed.toLocaleString()} rpm`
  }

  const details = []
  if (e.emissions_standard) details.push(`${e.emissions_standard} emissions`)
  if (e.origin) details.push(`built in ${e.origin}`)
  if (details.length) description += `. It is ${details.join(' and ')}.`
  else description += '.'
  return description
}

async function fetchAll(supabase) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('id, slug, brand, model, series, description, displacement_l, cylinders, configuration, rpm_rated, fuel_type, emissions_standard, origin, prime_power_kwe_50hz, standby_power_kwe_50hz, prime_power_kwe_60hz, standby_power_kwe_60hz, power_kw')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
    from += 1000
  }
  return rows
}

parseEnvFile('.env.local')
parseEnvFile('.env')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const rows = await fetchAll(supabase)
const fixes = rows
  .filter((row) => row.description && String(row.description).trim().length < 80)
  .map((row) => ({ ...row, generatedDescription: buildDescription(row) }))

let updated = 0
for (const row of fixes) {
  const { error } = await supabase
    .from('engines')
    .update({ description: row.generatedDescription })
    .eq('id', row.id)
  if (error) {
    console.error(`✗ ${row.slug}: ${error.message}`)
    continue
  }
  updated++
  console.log(`${row.slug}: ${String(row.description).trim().length} -> ${row.generatedDescription.length}`)
}

console.log(`Updated ${updated} short engine descriptions`)
