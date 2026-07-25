import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const OUT_DIR = process.env.DATA_QA_REPORT_DIR ?? path.join(process.cwd(), 'reports', 'data-qa')
const SEO_DIR = process.env.SEO_REPORT_DIR ?? path.join(process.cwd(), 'reports', 'seo')
const PAGE = 1000

function parseEnvFile(text) {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const idx = line.indexOf('=')
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) process.env[key] = value
  }
}

async function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      parseEnvFile(await fs.readFile(path.join(process.cwd(), file), 'utf8'))
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

function num(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function bool(value) {
  return value != null && value !== ''
}

function id(e) {
  return `${e.brand ?? '(missing brand)'} ${e.model ?? '(missing model)'}`.trim()
}

function representativeKwe(e) {
  return (
    num(e.standby_power_kwe_50hz) ??
    num(e.prime_power_kwe_50hz) ??
    num(e.standby_power_kwe_60hz) ??
    num(e.prime_power_kwe_60hz) ??
    null
  )
}

function hasRepresentativePower(e) {
  return representativeKwe(e) != null || num(e.power_kw) != null
}

function close(actual, expected, tolerance = 0.06) {
  if (actual == null || expected == null) return true
  return Math.abs(actual - expected) <= Math.abs(expected) * tolerance + 0.5
}

function issue(severity, category, engine, message, extra = {}) {
  return {
    severity,
    category,
    slug: engine?.slug ?? null,
    brand: engine?.brand ?? null,
    model: engine?.model ?? null,
    message,
    ...extra,
  }
}

function normalize(value) {
  if (value == null || value === '') return ''
  return String(value).trim().toLowerCase()
}

function engineSpecSignature(e) {
  const fields = [
    'fuel_type',
    'emissions_standard',
    'prime_power_kwe_50hz',
    'standby_power_kwe_50hz',
    'prime_power_kwe_60hz',
    'standby_power_kwe_60hz',
    'displacement_l',
    'cylinders',
    'rpm_rated',
    'status',
  ]
  return fields.map((field) => `${field}:${normalize(e[field])}`).join('|')
}

function engineVariantSummary(e) {
  const ratings = [
    `50Hz ${num(e.prime_power_kwe_50hz) ?? '-'} / ${num(e.standby_power_kwe_50hz) ?? '-'} kWe`,
    `60Hz ${num(e.prime_power_kwe_60hz) ?? '-'} / ${num(e.standby_power_kwe_60hz) ?? '-'} kWe`,
  ].join('; ')
  return {
    slug: e.slug,
    emissions: e.emissions_standard ?? '',
    fuel: e.fuel_type ?? '',
    ratings,
  }
}

const ORIGIN_ALIASES = new Map([
  ['USA', 'United States'],
  ['U.S.A.', 'United States'],
  ['US', 'United States'],
  ['U.S.', 'United States'],
  ['UK', 'United Kingdom'],
  ['U.K.', 'United Kingdom'],
])

const COOLING_METHOD_ALIASES = new Map([
  ['Liquid-cooled', 'Liquid-Cooled'],
])

function canonicalSlugText(value) {
  return String(value ?? '')
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function configurationCylinders(configuration) {
  const match = String(configuration ?? '').trim().match(/^[LVW](\d+)$/i)
  return match ? Number(match[1]) : null
}

function normalizedCompressionRatio(value) {
  if (value == null || value === '') return null
  const text = String(value).trim()
  if (/^\d+(?:\.\d+)?:1$/i.test(text)) return text
  if (/^\d+(?:\.\d+)?$/.test(text)) return `${text}:1`
  return null
}

function firstIdentityToken(value) {
  return String(value ?? '').trim().toLowerCase().split(/[\s/-]/)[0] ?? ''
}

function completeness(e) {
  const checks = [
    ['brand', bool(e.brand), 8],
    ['model', bool(e.model), 8],
    ['slug', bool(e.slug), 8],
    ['status', bool(e.status), 5],
    ['power', hasRepresentativePower(e), 12],
    ['displacement_l', num(e.displacement_l) != null, 8],
    ['cylinders', num(e.cylinders) != null, 7],
    ['configuration', bool(e.configuration), 6],
    ['rpm_rated', num(e.rpm_rated) != null, 5],
    ['fuel_type', bool(e.fuel_type), 8],
    ['ignition_type', bool(e.ignition_type), 4],
    ['cooling_method', bool(e.cooling_method), 4],
    ['emissions_standard', bool(e.emissions_standard), 6],
    ['origin', bool(e.origin), 4],
    ['datasheet', (e.pdfs?.length ?? 0) > 0, 12],
  ]
  const max = checks.reduce((sum, [, , weight]) => sum + weight, 0)
  const points = checks.reduce((sum, [, ok, weight]) => sum + (ok ? weight : 0), 0)
  return {
    score: Math.round((points / max) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([name]) => name),
  }
}

async function fetchAll(supabase, table, select) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return rows
}

async function latestSeoReport() {
  try {
    const files = (await fs.readdir(SEO_DIR))
      .filter((f) => f.endsWith('.json') && f.includes('_to_'))
      .sort()
    const latest = files.at(-1)
    if (!latest) return null
    return JSON.parse(await fs.readFile(path.join(SEO_DIR, latest), 'utf8'))
  } catch {
    return null
  }
}

function pageSignals(seo) {
  const map = new Map()
  for (const row of seo?.gsc?.pages ?? []) {
    try {
      const url = new URL(row.page)
      map.set(url.pathname, {
        clicks: Number(row.clicks ?? 0),
        impressions: Number(row.impressions ?? 0),
        ctr: Number(row.ctr ?? 0),
        position: Number(row.position ?? 0),
      })
    } catch {
      // Ignore malformed report rows.
    }
  }
  return map
}

function analyzeEngines(engines) {
  const issues = []
  const scored = []
  const modelVariants = []

  const slugs = new Map()
  const brandModels = new Map()

  for (const e of engines) {
    const c = completeness(e)
    scored.push({ engine: e, ...c })

    if (c.score < 70) issues.push(issue('medium', 'low_completeness', e, `${id(e)} completeness score ${c.score}`, { score: c.score, missing: c.missing }))
    if (!e.brand) issues.push(issue('critical', 'missing_brand', e, `Missing brand for slug ${e.slug ?? '(missing)'}`))
    if (!e.model) issues.push(issue('critical', 'missing_model', e, `Missing model for ${id(e)}`))
    if (!e.slug) issues.push(issue('critical', 'missing_slug', e, `Missing slug for ${id(e)}`))

    const originAlias = ORIGIN_ALIASES.get(String(e.origin ?? '').trim())
    if (originAlias) {
      issues.push(issue('low', 'origin_alias', e, `${id(e)} uses origin "${e.origin}"; prefer "${originAlias}" for taxonomy consistency`, {
        current: e.origin,
        preferred: originAlias,
      }))
    }

    const coolingAlias = COOLING_METHOD_ALIASES.get(String(e.cooling_method ?? '').trim())
    if (coolingAlias) {
      issues.push(issue('low', 'cooling_method_alias', e, `${id(e)} uses cooling method "${e.cooling_method}"; prefer "${coolingAlias}" for taxonomy consistency`, {
        current: e.cooling_method,
        preferred: coolingAlias,
      }))
    }

    if (e.brand && /[^\x00-\x7F]/.test(e.brand)) {
      const canonical = canonicalSlugText(e.brand)
      if (!canonical || !e.slug?.startsWith(`${canonical}-`)) {
        issues.push(issue('medium', 'non_ascii_brand_slug_review', e, `${id(e)} brand contains non-ASCII characters; verify canonical brand slug starts with "${canonical}"`))
      }
    }

    const cylinders = num(e.cylinders)
    if (cylinders != null && (cylinders < 1 || cylinders > 24)) {
      issues.push(issue('high', 'cylinder_range', e, `${id(e)} has unusual cylinder count ${cylinders}`))
    }

    const configCylinders = configurationCylinders(e.configuration)
    if (configCylinders != null && cylinders != null && configCylinders !== cylinders) {
      issues.push(issue('high', 'configuration_cylinder_mismatch', e, `${id(e)} configuration "${e.configuration}" conflicts with cylinder count ${cylinders}`))
    }

    const displacement = num(e.displacement_l)
    if (displacement != null && (displacement < 0.2 || displacement > 1200)) {
      issues.push(issue('high', 'displacement_range', e, `${id(e)} has unusual displacement ${displacement} L`))
    }

    if (e.compression_ratio && normalizedCompressionRatio(e.compression_ratio) !== String(e.compression_ratio).trim()) {
      issues.push(issue('low', 'compression_ratio_format', e, `${id(e)} compression ratio "${e.compression_ratio}" should use N:1 format`, {
        current: e.compression_ratio,
        preferred: normalizedCompressionRatio(e.compression_ratio),
      }))
    }

    if (e.description && String(e.description).trim().length < 80) {
      issues.push(issue('low', 'description_too_short', e, `${id(e)} description is only ${String(e.description).trim().length} characters; enrich from structured specs`, {
        length: String(e.description).trim().length,
      }))
    }

    if (e.description) {
      const description = String(e.description).toLowerCase()
      const brandToken = firstIdentityToken(e.brand)
      const modelToken = firstIdentityToken(e.model)
      if ((brandToken && !description.includes(brandToken)) || (modelToken && !description.includes(modelToken))) {
        issues.push(issue('low', 'description_missing_identity', e, `${id(e)} description should include the brand/model so it stands alone in snippets and exports`))
      }
    }

    for (const hz of ['50', '60']) {
      for (const rating of ['prime', 'standby']) {
        const kwm = num(e[`${rating}_power_kw_${hz}hz`])
        const kwe = num(e[`${rating}_power_kwe_${hz}hz`])
        const kva = num(e[`${rating}_power_kva_${hz}hz`])
        if (kwe != null && kva != null && !close(kva, kwe / 0.8)) {
          issues.push(issue('high', 'kva_vs_kwe', e, `${id(e)} ${rating} ${hz}Hz has ${kva} kVA but ${kwe} kWe; expected about ${(kwe / 0.8).toFixed(1)} kVA`))
        }
        if (kwe != null && kwm != null && kwe > kwm + 0.5) {
          issues.push(issue('high', 'kwe_gt_kwm', e, `${id(e)} ${rating} ${hz}Hz has ${kwe} kWe greater than ${kwm} kWm`))
        }
      }
      const prime = num(e[`prime_power_kwe_${hz}hz`])
      const standby = num(e[`standby_power_kwe_${hz}hz`])
      if (prime != null && standby != null && prime > standby + 0.5) {
        const primeKwm = num(e[`prime_power_kw_${hz}hz`])
        const standbyKwm = num(e[`standby_power_kw_${hz}hz`])
        if (primeKwm != null && standbyKwm != null && standbyKwm > primeKwm) {
          issues.push(issue('low', 'esp_electrical_below_prime_review', e, `${id(e)} ${hz}Hz has ESP engine output above PRP (${standbyKwm} vs ${primeKwm} kWm) but typical ESP generator output below PRP (${standby} vs ${prime} kWe); verify against source table`))
        } else {
          issues.push(issue('high', 'prime_gt_standby', e, `${id(e)} ${hz}Hz prime ${prime} kWe exceeds standby ${standby} kWe`))
        }
      }
    }

    const rep = representativeKwe(e)
    if (rep != null && displacement) {
      const ratio = rep / displacement
      if (ratio > 55) issues.push(issue('medium', 'high_kwe_per_l', e, `${id(e)} has high ${ratio.toFixed(1)} kWe/L`))
      if (ratio < 3) issues.push(issue('medium', 'low_kwe_per_l', e, `${id(e)} has low ${ratio.toFixed(1)} kWe/L`))
    }

    const fuel = String(e.fuel_type ?? '').toLowerCase()
    const ignition = String(e.ignition_type ?? '').toLowerCase()
    if (fuel.includes('diesel') && ignition && !ignition.includes('compression')) {
      issues.push(issue('medium', 'fuel_ignition_mismatch', e, `${id(e)} is diesel but ignition is "${e.ignition_type}"`))
    }
    if ((fuel.includes('gas') || fuel.includes('cng') || fuel.includes('lng')) && ignition && ignition.includes('compression')) {
      issues.push(issue('medium', 'fuel_ignition_mismatch', e, `${id(e)} is gas fuel but ignition is "${e.ignition_type}"`))
    }

    if (e.slug) slugs.set(e.slug, [...(slugs.get(e.slug) ?? []), e])
    if (e.brand && e.model) {
      const key = `${e.brand.toLowerCase()}|${e.model.toLowerCase()}`
      brandModels.set(key, [...(brandModels.get(key) ?? []), e])
    }
  }

  for (const [slug, rows] of slugs) {
    if (rows.length > 1) issues.push(issue('critical', 'duplicate_slug', rows[0], `Duplicate slug ${slug} appears ${rows.length} times`))
  }
  for (const [key, rows] of brandModels) {
    if (rows.length <= 1) continue

    const signatureGroups = new Map()
    for (const row of rows) {
      const signature = engineSpecSignature(row)
      signatureGroups.set(signature, [...(signatureGroups.get(signature) ?? []), row])
    }

    const exactDuplicates = [...signatureGroups.values()].filter((group) => group.length > 1)
    for (const group of exactDuplicates) {
      issues.push(issue('medium', 'duplicate_brand_model_exact_specs', group[0], `Duplicate brand/model with matching spec signature ${key.replace('|', ' ')} appears ${group.length} times`, {
        pages: group.map((row) => `/engines/${row.slug}`),
      }))
    }

    if (!exactDuplicates.length) {
      modelVariants.push({
        brandModel: key.replace('|', ' '),
        count: rows.length,
        variants: rows
          .sort((a, b) => String(a.slug).localeCompare(String(b.slug)))
          .map(engineVariantSummary),
      })
    }
  }

  return { issues, scored, modelVariants }
}

function analyzeAlternators(alternators) {
  const issues = []
  for (const a of alternators) {
    if (!a.brand) issues.push({ severity: 'critical', category: 'alternator_missing_brand', slug: a.slug, message: `Missing brand for alternator ${a.slug}` })
    if (!a.model) issues.push({ severity: 'critical', category: 'alternator_missing_model', slug: a.slug, message: `Missing model for alternator ${a.slug}` })
    if (!a.slug) issues.push({ severity: 'critical', category: 'alternator_missing_slug', slug: a.slug, message: `Missing slug for alternator ${a.brand} ${a.model}` })
    const kva = num(a.kva)
    if (kva != null && (kva < 1 || kva > 5000)) issues.push({ severity: 'medium', category: 'alternator_kva_range', slug: a.slug, message: `${a.brand} ${a.model} has unusual ${kva} kVA` })
    const poles = num(a.poles)
    if (poles != null && ![2, 4, 6, 8].includes(poles)) issues.push({ severity: 'medium', category: 'alternator_poles_range', slug: a.slug, message: `${a.brand} ${a.model} has unusual ${poles} poles` })
    if (!a.spec_sheet_url) issues.push({ severity: 'low', category: 'alternator_missing_datasheet', slug: a.slug, message: `${a.brand} ${a.model} has no spec sheet URL` })
  }
  return issues
}

function groupCounts(items, key) {
  const counts = new Map()
  for (const item of items) counts.set(item[key], (counts.get(item[key]) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

function table(rows, columns) {
  const header = `| ${columns.map((c) => c.label).join(' |')} |`
  const sep = `| ${columns.map(() => '---').join(' |')} |`
  const body = rows.map((row) => `| ${columns.map((c) => String(c.value(row)).replaceAll('|', '\\|')).join(' |')} |`)
  return [header, sep, ...body].join('\n')
}

function severityRank(severity) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[severity] ?? 9
}

function buildMarkdown(report) {
  const byCategory = groupCounts(report.issues, 'category')
  const bySeverity = groupCounts(report.issues, 'severity')
  const critical = report.issues
    .filter((i) => i.severity === 'critical' || i.severity === 'high')
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 40)
  const sampleIssues = report.issues
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 80)

  const lowCompleteness = report.lowCompleteness.slice(0, 40)
  const seoPriority = report.seoPriority.slice(0, 30)
  const modelVariants = report.modelVariants.slice(0, 40)

  return `# Data QA Report

Generated: ${report.generatedAt}

Engines: ${report.counts.engines.toLocaleString()}
Alternators: ${report.counts.alternators.toLocaleString()}
Issues: ${report.issues.length.toLocaleString()}

## Issues by Severity

${table(bySeverity, [
  { label: 'Severity', value: ([name]) => name },
  { label: 'Count', value: ([, count]) => count },
])}

## Issues by Category

${table(byCategory, [
  { label: 'Category', value: ([name]) => name },
  { label: 'Count', value: ([, count]) => count },
])}

## Critical / High Issues

${critical.length ? table(critical, [
  { label: 'Severity', value: (i) => i.severity },
  { label: 'Category', value: (i) => i.category },
  { label: 'Page', value: (i) => i.slug ? `/engines/${i.slug}` : '' },
  { label: 'Issue', value: (i) => i.message },
]) : 'No critical or high issues found.'}

## Issue Sample

${sampleIssues.length ? table(sampleIssues, [
  { label: 'Severity', value: (i) => i.severity },
  { label: 'Category', value: (i) => i.category },
  { label: 'Page', value: (i) => i.slug ? `/engines/${i.slug}` : '' },
  { label: 'Issue', value: (i) => i.message },
]) : 'No issues found.'}

## Lowest Completeness Engine Pages

${lowCompleteness.length ? table(lowCompleteness, [
  { label: 'Score', value: (r) => r.score },
  { label: 'Page', value: (r) => `/engines/${r.engine.slug}` },
  { label: 'Engine', value: (r) => id(r.engine) },
  { label: 'Missing', value: (r) => r.missing.join(', ') },
]) : 'No low-completeness pages found.'}

## SEO-Priority Data Fixes

These pages have Search Console impressions/clicks and data quality issues.

${seoPriority.length ? table(seoPriority, [
  { label: 'Score', value: (r) => r.score },
  { label: 'Impr.', value: (r) => r.gsc.impressions },
  { label: 'Clicks', value: (r) => r.gsc.clicks },
  { label: 'Pos.', value: (r) => r.gsc.position.toFixed(1) },
  { label: 'Page', value: (r) => `/engines/${r.engine.slug}` },
  { label: 'Missing', value: (r) => r.missing.join(', ') },
]) : 'No GSC-linked data quality priorities found in the latest SEO report.'}

## Same-Model Variant Groups

These rows share a brand/model value but differ by emissions, frequency, or rating package. They are not counted as duplicate issues unless the spec signature also matches.

${modelVariants.length ? table(modelVariants, [
  { label: 'Brand / Model', value: (r) => r.brandModel },
  { label: 'Rows', value: (r) => r.count },
  { label: 'Pages', value: (r) => r.variants.map((v) => `/engines/${v.slug}`).join('<br>') },
]) : 'No same-model variant groups found.'}
`
}

async function main() {
  await loadLocalEnv()
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const supabase = createClient(supabaseUrl, supabaseKey)

  const [engines, alternators, seo] = await Promise.all([
    fetchAll(supabase, 'engines', '*, pdfs:engine_pdfs(*)'),
    fetchAll(supabase, 'alternators', '*'),
    latestSeoReport(),
  ])

  const engineQa = analyzeEngines(engines)
  const alternatorIssues = analyzeAlternators(alternators)
  const gsc = pageSignals(seo)

  const seoPriority = engineQa.scored
    .map((row) => ({ ...row, gsc: gsc.get(`/engines/${row.engine.slug}`) }))
    .filter((row) => row.gsc && row.score < 90)
    .sort((a, b) => (b.gsc.impressions + b.gsc.clicks * 10) - (a.gsc.impressions + a.gsc.clicks * 10))

  const report = {
    generatedAt: new Date().toISOString(),
    counts: { engines: engines.length, alternators: alternators.length },
    issues: [...engineQa.issues, ...alternatorIssues].sort((a, b) => severityRank(a.severity) - severityRank(b.severity)),
    modelVariants: engineQa.modelVariants,
    lowCompleteness: engineQa.scored
      .filter((row) => row.score < 85)
      .sort((a, b) => a.score - b.score),
    seoPriority,
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 10)
  const jsonPath = path.join(OUT_DIR, `${stamp}.json`)
  const mdPath = path.join(OUT_DIR, `${stamp}.md`)
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2))
  await fs.writeFile(mdPath, buildMarkdown(report))

  console.log(`Wrote ${jsonPath}`)
  console.log(`Wrote ${mdPath}`)
  console.log(`${report.issues.length} issues across ${report.counts.engines} engines and ${report.counts.alternators} alternators`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
