import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllEngines, getEngineBySlug, getPDFUrl, getRelatedEngines } from '@/lib/engines'
import { StatusBadge } from '@/components/StatusBadge'
import { PDFDownloadList } from '@/components/PDFDownloadList'
import { BrandLogo } from '@/components/BrandLogo'
import { headlinePower, displayKva, displayKwe, displayOutput, ratedSpeedLabel, buildIntro, compactConfig, ratedFrequencies, isVariableSpeedMechanical } from '@/lib/engine-display'
import { competitorsFor, pairSlug } from '@/lib/compare'
import { buildEngineFaqs } from '@/lib/engine-faq'
import { brandSlug } from '@/lib/seo'
import { quickWinEngineSeo, type QuickWinPageSeo } from '@/lib/quick-win-seo'
import { engineMetadataDescription, engineMetadataTitle } from '@/lib/metadata-lengths'
import type { Engine } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) return {}

  const quickWin = quickWinEngineSeo(slug)
  const title = engineMetadataTitle(engine)
  const description = engineMetadataDescription(engine, quickWin?.description ?? engine.description ?? buildIntro(engine))
  const aliases = uniqueAliases([...(quickWin?.aliases ?? []), ...modelAliases(engine)])
  const variableSpeed = isVariableSpeedMechanical(engine)

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${engine.brand} ${engine.model}`,
      `${engine.model} specs`,
      `${engine.model} datasheet`,
      ...aliases,
      `${engine.brand} diesel engine`,
      engine.series ?? '',
      variableSpeed ? 'high-speed industrial diesel engine' : 'diesel generator engine',
    ].filter(Boolean),
    alternates: { canonical: `/engines/${slug}` },
    openGraph: { title, description, type: 'website', url: `/engines/${slug}` },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export async function generateStaticParams() {
  const engines = await getAllEngines()
  return engines.map((e) => ({ slug: e.slug }))
}

function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-sm text-gray-500 font-medium w-48">{label}</td>
      <td className="py-2 text-sm text-gray-900">{value}</td>
    </tr>
  )
}

function kweIsEstimated(engine: Engine): boolean {
  const b = engine.brand ?? ''
  const m = engine.model ?? ''
  if (b === 'Isuzu' || b === 'Hatz' || b === 'JCB' || b === 'Kirloskar' || b === 'MAN' || b === 'Liebherr') return true
  if (b === 'Mitsubishi') return true
  if (b === 'FPT' && (m.includes('TEVP') || m.includes('ETVP'))) return true
  return false
}

function PowerRatingsTable({ engine }: { engine: Engine }) {
  const has50hz = engine.prime_power_kw_50hz || engine.standby_power_kw_50hz
    || engine.prime_power_kwe_50hz || engine.standby_power_kwe_50hz
  const has60hz = engine.prime_power_kw_60hz || engine.standby_power_kw_60hz
    || engine.prime_power_kwe_60hz || engine.standby_power_kwe_60hz
  if (!has50hz && !has60hz) return null

  // rpm_rated may hold a 50Hz (1500/3000) or 60Hz (1800/3600) rated speed. Derive each
  // frequency's true speed instead of blindly ×6/5, which turned 60Hz-rated engines into
  // impossible figures (e.g. 1800 → 2160).
  const rated = engine.rpm_rated ?? 1500
  const ratedIs60 = rated === 1800 || rated === 3600
  const rpm50 = ratedIs60 ? Math.round(rated * 5 / 6) : rated
  const rpm60 = ratedIs60 ? rated : Math.round(rated * 6 / 5)
  const estimated = kweIsEstimated(engine)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Power Ratings</h2>
      <p className="text-xs text-gray-400 mb-4">
        kWm = mechanical shaft power · kWe = electrical output · kVA = kWe ÷ 0.8 pf
        {estimated && <span className="text-amber-500"> · kWe estimated — see note below</span>}
      </p>

      <div className="space-y-6">
        {has50hz && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">50 Hz</span>
              {rpm50} RPM
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold w-36"></th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWm</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWe</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kVA</th>
                  </tr>
                </thead>
                <tbody>
                  {(engine.prime_power_kw_50hz || engine.prime_power_kwe_50hz || engine.prime_power_kva_50hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Prime Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.prime_power_kw_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kwe_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kva_50hz ?? '—'}</td>
                    </tr>
                  )}
                  {(engine.standby_power_kw_50hz || engine.standby_power_kwe_50hz || engine.standby_power_kva_50hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Standby Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.standby_power_kw_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kwe_50hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kva_50hz ?? '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {has60hz && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">60 Hz</span>
              {rpm60} RPM
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold w-36"></th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWm</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kWe</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">kVA</th>
                  </tr>
                </thead>
                <tbody>
                  {(engine.prime_power_kw_60hz || engine.prime_power_kwe_60hz || engine.prime_power_kva_60hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Prime Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.prime_power_kw_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kwe_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.prime_power_kva_60hz ?? '—'}</td>
                    </tr>
                  )}
                  {(engine.standby_power_kw_60hz || engine.standby_power_kwe_60hz || engine.standby_power_kva_60hz) && (
                    <tr className="border-t border-gray-100">
                      <td className="py-2 px-3 text-gray-600 font-medium">Standby Power</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{engine.standby_power_kw_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kwe_60hz ?? '—'}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{engine.standby_power_kva_60hz ?? '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {estimated && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <strong>Note:</strong> The manufacturer does not publish a separate kWe rating for this engine.
          kWe values shown are estimated from the rated mechanical output (kWm) using a conservative
          90% alternator efficiency factor.
        </p>
      )}
    </div>
  )
}

function SpecHero({ engine }: { engine: Engine }) {
  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)
  const variableSpeed = isVariableSpeedMechanical(engine)

  const cards: { label: string; value: string }[] = []
  if (kva) cards.push({ label: `${hp?.rating ?? 'Standby'} Power · ${hp?.hz ?? 50} Hz`, value: `${kva.toLocaleString()} kVA` })
  if (out) cards.push({
    label: variableSpeed ? 'Maximum Mechanical Power' : 'Electrical Output',
    value: `${out.value.toLocaleString()} ${out.unit}`,
  })
  if (engine.configuration || engine.cylinders) cards.push({ label: 'Cylinders', value: compactConfig(engine) ?? String(engine.cylinders) })
  if (engine.displacement_l) cards.push({ label: 'Displacement', value: `${engine.displacement_l} L` })
  cards.push({ label: 'Rated Speed', value: ratedSpeedLabel(engine) })

  if (cards.length === 0) return null

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.slice(0, 5).map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <dt className="text-xs text-gray-500 font-medium leading-tight">{c.label}</dt>
          <dd className="text-lg font-bold text-gray-900 mt-1">{c.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RelatedEngines({ engines }: { engines: Engine[] }) {
  if (!engines.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Engines</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {engines.map((e) => {
          const kwe = displayKwe(headlinePower(e))
          return (
            <li key={e.slug}>
              <Link
                href={`/engines/${e.slug}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 px-3 py-2 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800 truncate">{e.brand} {e.model}</span>
                {kwe != null && <span className="flex-shrink-0 text-xs text-gray-500">{kwe.toLocaleString()} kWe</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function modelAliases(engine: Engine): string[] {
  const model = engine.model.trim()
  const compact = model.replace(/[^a-z0-9]/gi, '')
  const compactLower = compact.toLowerCase()
  const spaced = model.replace(/[-_/]+/g, ' ')
  const aliases = new Set<string>()

  if (compactLower && compactLower !== model) aliases.add(compactLower)
  if (compact && compact.toLowerCase() !== model.toLowerCase()) aliases.add(compact)
  if (spaced && spaced.toLowerCase() !== model.toLowerCase()) aliases.add(spaced)
  aliases.add(`${engine.brand} ${model}`)
  if (engine.series && !model.toLowerCase().includes(engine.series.toLowerCase())) aliases.add(`${engine.series} ${model}`)

  return [...aliases].filter((a) => a.length >= 4).slice(0, 5)
}

function uniqueAliases(aliases: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const alias of aliases) {
    const cleaned = alias.trim()
    const key = cleaned.toLowerCase()
    if (!cleaned || cleaned.length < 4 || seen.has(key)) continue
    seen.add(key)
    out.push(cleaned)
  }
  return out.slice(0, 10)
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return <Link href={href} className={className}>{children}</Link>
}

function EngineBuyerContext({
  engine,
  productPackage,
  competitors,
  quickWin,
}: {
  engine: Engine
  productPackage: { href: string; label: string }
  competitors: Engine[]
  quickWin: QuickWinPageSeo | null
}) {
  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)
  const { has50, has60 } = ratedFrequencies(engine)
  const variableSpeed = isVariableSpeedMechanical(engine)
  const aliases = uniqueAliases([...(quickWin?.aliases ?? []), ...modelAliases(engine)])
  const ratingBits = [
    kva ? `${kva.toLocaleString()} kVA` : null,
    out ? `${out.value.toLocaleString()} ${out.unit}` : null,
    hp ? `${hp.rating.toLowerCase()} rating` : null,
  ].filter(Boolean)
  const frequencyText = has50 && has60 ? '50 Hz and 60 Hz generator sets' : has60 ? '60 Hz generator sets' : '50 Hz generator sets'
  const fuel = (engine.fuel_type ?? 'diesel').toLowerCase()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {engine.brand} {engine.model} {variableSpeed ? 'industrial power context' : 'generator set context'}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        {quickWin?.intro ?? (
          variableSpeed
            ? <>The {engine.brand} {engine.model} is a high-speed industrial {fuel} engine rated at
              {' '}{engine.power_kw?.toLocaleString()} kW mechanical output at {engine.rpm_rated?.toLocaleString()} RPM.
              It is used in off-road equipment and can support engineered variable-speed power systems, but its maximum
              power is not a direct 50/60 Hz alternator rating. Verify the drivetrain, power electronics, cooling, and
              emissions installation with Volvo Penta before specifying a generator package.</>
            : <>The {engine.brand} {engine.model} is listed here as a {fuel} generator-drive engine for {frequencyText}
              {ratingBits.length ? `, with a headline ${ratingBits.join(' / ')}` : ''}. Use this page to compare the published
              engine output, electrical kWe/kVA ratings, emissions level, datasheet availability, and neighboring models before
              specifying an alternator, controller, enclosure, voltage, and compliance package.</>
        )}
      </p>

      {aliases.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Also searched as</p>
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <span key={alias} className="rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs text-gray-700">
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <Link href={`/brands/${brandSlug(engine.brand)}`} className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200">
          All {engine.brand} engines
        </Link>
        {competitors[0] && (
          <Link href={`/engines/compare/${pairSlug(engine.slug, competitors[0].slug)}`} className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200">
            Compare similar engines
          </Link>
        )}
        <a href={productPackage.href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200">
          Haifeng {productPackage.label}
        </a>
      </div>

      {quickWin?.links.length ? (
        <div className="mt-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Helpful next pages</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {quickWin.links.map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                className="rounded-lg border border-gray-100 px-3 py-2 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
              >
                {link.label}
              </SmartLink>
            ))}
          </div>
        </div>
      ) : null}

      {quickWin && (
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{quickWin.cta.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{quickWin.cta.body}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <SmartLink href={quickWin.cta.primaryHref} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
              {quickWin.cta.primaryLabel} ↗
            </SmartLink>
            <SmartLink href={quickWin.cta.secondaryHref} className="rounded-lg border border-blue-200 bg-white px-4 py-2 font-medium text-blue-600 hover:bg-blue-100">
              {quickWin.cta.secondaryLabel}
            </SmartLink>
          </div>
        </div>
      )}
    </div>
  )
}

function ReferencePanel({ engine, slug }: { engine: Engine; slug: string }) {
  const modified = engine.updated_at ? engine.updated_at.slice(0, 10) : null
  const datasheetCount = engine.pdfs?.length ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Reference</h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-gray-500">Canonical page</dt>
          <dd>
            <Link href={`/engines/${slug}`} className="font-medium text-blue-600 hover:underline">
              /engines/{slug}
            </Link>
          </dd>
        </div>
        {modified && (
          <div>
            <dt className="text-gray-500">Last database update</dt>
            <dd className="font-medium text-gray-900">{modified}</dd>
          </div>
        )}
        <div>
          <dt className="text-gray-500">Manufacturer files</dt>
          <dd className="font-medium text-gray-900">
            {datasheetCount > 0 ? `${datasheetCount} datasheet${datasheetCount === 1 ? '' : 's'} linked` : 'No datasheet linked yet'}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default async function EngineDetailPage({ params }: Props) {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) notFound()

  const related = await getRelatedEngines(engine)
  const competitors = await competitorsFor(engine, 4)
  const quickWin = quickWinEngineSeo(slug)
  const intro = quickWin?.intro ?? engine.description ?? buildIntro(engine)
  const base = 'https://engines.haifengmachinery.com'

  // Contextual link to the matching Haifeng Machinery genset product line (gas vs diesel, and
  // for diesel, emissions-regulated vs non-regulated) — useful to buyers and a relevant link to
  // the parent commercial site.
  const isGas = /gas|lng|cng|biogas|methane/i.test(engine.fuel_type ?? '')
  const hasEmissions = !!engine.emissions_standard && !/unregulated/i.test(engine.emissions_standard)
  const productPackage = isGas
    ? { href: 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/', label: 'gas generator sets' }
    : hasEmissions
      ? { href: 'https://www.haifengmachinery.com/diesel-power-package-regulated/', label: 'diesel generator sets' }
      : { href: 'https://www.haifengmachinery.com/product-offerings/', label: 'diesel generator sets' }

  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)
  const variableSpeed = isVariableSpeedMechanical(engine)

  // Descriptive alt/caption for the spec-card image (Google Images + accessibility).
  const imageAlt =
    `${engine.brand} ${engine.model}` +
    `${engine.displacement_l ? ` ${engine.displacement_l}L` : ''}${engine.configuration ? ` ${engine.configuration}` : ''}` +
    ` ${(engine.fuel_type ?? 'diesel').toLowerCase()} ${variableSpeed ? 'high-speed industrial engine' : 'generator engine'}` +
    `${kva ? ` — ${kva.toLocaleString()} kVA ${(hp?.rating ?? 'standby').toLowerCase()}` : ''} specifications`

  // Build PropertyValue specs from whatever is populated.
  const props: { '@type': 'PropertyValue'; name: string; value: string }[] = []
  const addProp = (name: string, value?: string | number | null) => {
    if (value !== undefined && value !== null && value !== '') props.push({ '@type': 'PropertyValue', name, value: String(value) })
  }
  if (kva) addProp(`${hp?.rating ?? 'Standby'} Power (${hp?.hz ?? 50} Hz)`, `${kva} kVA`)
  if (out) addProp(variableSpeed ? 'Maximum Mechanical Power' : 'Electrical Output', `${out.value} ${out.unit}`)
  addProp('Configuration', engine.configuration)
  addProp('Cylinders', engine.cylinders)
  addProp('Displacement', engine.displacement_l ? `${engine.displacement_l} L` : undefined)
  addProp('Rated Speed', ratedSpeedLabel(engine))
  addProp('Cooling', engine.cooling_method)
  addProp('Fuel Type', engine.fuel_type)
  addProp('Emissions Standard', engine.emissions_standard)
  addProp('Dry Weight', engine.weight_kg ? `${engine.weight_kg} kg` : undefined)
  addProp('Country of Origin', engine.origin)
  addProp('Compression Ratio', engine.compression_ratio)
  addProp('Fuel Consumption', engine.fuel_consumption_l_per_hr ? `${engine.fuel_consumption_l_per_hr} L/hr` : undefined)
  addProp('Ignition Type', engine.ignition_type)
  addProp('Certifications', engine.certifications?.join(', '))
  addProp('Dimensions (L×W×H)', engine.length_mm ? `${engine.length_mm} × ${engine.width_mm} × ${engine.height_mm} mm` : undefined)
  addProp('Year Introduced', engine.year_introduced)
  // Full power matrix (so the structured data mirrors the on-page ratings table)
  addProp('Standby Power (50 Hz)', engine.standby_power_kwe_50hz ? `${engine.standby_power_kwe_50hz} kWe` : undefined)
  addProp('Prime Power (50 Hz)',   engine.prime_power_kwe_50hz   ? `${engine.prime_power_kwe_50hz} kWe`   : undefined)
  addProp('Standby Power (60 Hz)', engine.standby_power_kwe_60hz ? `${engine.standby_power_kwe_60hz} kWe` : undefined)
  addProp('Prime Power (60 Hz)',   engine.prime_power_kwe_60hz   ? `${engine.prime_power_kwe_60hz} kWe`   : undefined)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${base}/engines/${slug}#product`,
    name: `${engine.brand} ${engine.model}`,
    sku: engine.model,
    mpn: engine.model,
    ...(engine.series && { model: engine.series }),
    category: variableSpeed ? 'Industrial Off-Road Engine' : 'Diesel Generator Engine',
    image: {
      '@type': 'ImageObject',
      url: `${base}/engines/${slug}/opengraph-image`,
      width: 1200,
      height: 630,
      caption: imageAlt,
    },
    description: intro,
    brand: { '@type': 'Brand', name: engine.brand },
    manufacturer: { '@type': 'Organization', name: engine.brand },
    url: `${base}/engines/${slug}`,
    mainEntityOfPage: `${base}/engines/${slug}`,
    datePublished: engine.created_at,
    dateModified: engine.updated_at,
    ...(engine.pdfs?.length && {
      isBasedOn: engine.pdfs.map((pdf) => ({
        '@type': 'DigitalDocument',
        name: pdf.label,
        encodingFormat: 'application/pdf',
        url: `${base}${getPDFUrl(pdf.storage_path)}`,
      })),
    }),
    ...(props.length && { additionalProperty: props }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Engines', item: `${base}/engines` },
      { '@type': 'ListItem', position: 2, name: engine.brand, item: `${base}/brands/${brandSlug(engine.brand)}` },
      { '@type': 'ListItem', position: 3, name: engine.model, item: `${base}/engines/${slug}` },
    ],
  }

  // Quotable, data-derived FAQ — both rendered on-page and emitted as FAQPage schema (same text),
  // giving AI engines and featured snippets concise passages to cite from an otherwise table-heavy page.
  const faqs = buildEngineFaqs(engine)
  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  const jsonLd = JSON.stringify(
    [productSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])],
  ).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/engines" className="hover:text-blue-600">Engines</Link>
          {' / '}
          <Link href={`/brands/${brandSlug(engine.brand)}`} className="hover:text-blue-600">{engine.brand}</Link>
          {' / '}
          <span className="text-gray-700">{engine.model}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <BrandLogo brand={engine.brand} className="mb-3" />
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{engine.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900">{quickWin?.h1 ?? `${engine.brand} ${engine.model}`}</h1>
              {engine.series && <p className="text-gray-500 mt-1">{engine.series}</p>}
            </div>
            <StatusBadge status={engine.status} />
          </div>

          {engine.status === 'discontinued' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm text-gray-600">
              This engine is no longer in production{engine.year_discontinued ? ` (discontinued ${engine.year_discontinued})` : ''}.
              Specifications and documentation remain archived for reference.
            </div>
          )}

          <p className="text-gray-600 leading-relaxed">{intro}</p>
        </div>

        {/* Spec-card lead image — a unique, owned, indexable graphic (Google Images / social). */}
        <figure className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/engines/${slug}/opengraph-image`}
            alt={imageAlt}
            width={1200}
            height={630}
            className="w-full h-auto rounded-xl border border-gray-200"
          />
          <figcaption className="sr-only">{imageAlt}</figcaption>
        </figure>

        <SpecHero engine={engine} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Power Ratings Table */}
            <PowerRatingsTable engine={engine} />

            <EngineBuyerContext engine={engine} productPackage={productPackage} competitors={competitors} quickWin={quickWin} />

            {/* General Specs */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              <table className="w-full">
                <tbody>
                  <SpecRow label="Brand" value={engine.brand} />
                  <SpecRow label="Model" value={engine.model} />
                  <SpecRow label="Series" value={engine.series} />
                  <SpecRow label="Configuration" value={engine.configuration} />
                  <SpecRow label="Cylinders" value={engine.cylinders} />
                  <SpecRow label="Displacement" value={engine.displacement_l ? `${engine.displacement_l} L` : undefined} />
                  <SpecRow label="Compression Ratio" value={engine.compression_ratio} />
                  <SpecRow label="Fuel Consumption" value={engine.fuel_consumption_l_per_hr ? `${engine.fuel_consumption_l_per_hr} L/hr` : undefined} />
                  <SpecRow label="Dry Weight" value={engine.weight_kg ? `${engine.weight_kg} kg` : undefined} />
                  <SpecRow label="Dimensions (L×W×H)" value={engine.length_mm ? `${engine.length_mm} × ${engine.width_mm} × ${engine.height_mm} mm` : undefined} />
                  <SpecRow label="Fuel Type" value={engine.fuel_type} />
                  <SpecRow label="Ignition Type" value={engine.ignition_type} />
                  <SpecRow label="Cooling Method" value={engine.cooling_method} />
                  <SpecRow label="Emissions Standard" value={engine.emissions_standard} />
                  <SpecRow label="Certifications" value={engine.certifications?.join(', ')} />
                  <SpecRow label="Country of Origin" value={engine.origin} />
                  <SpecRow label="Year Introduced" value={engine.year_introduced} />
                  <SpecRow label="Year Discontinued" value={engine.year_discontinued} />
                  <SpecRow label="Compatible Generators" value={engine.compatible_generator_brands?.join(', ')} />
                </tbody>
              </table>
            </div>

            {faqs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently asked questions</h2>
                <div className="space-y-5">
                  {faqs.map((f) => (
                    <div key={f.q}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.q}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <RelatedEngines engines={related} />
            {competitors.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Compare {engine.brand} {engine.model}</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {competitors.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/engines/compare/${pairSlug(engine.slug, c.slug)}`}
                        className="flex items-center gap-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 px-3 py-2 text-sm text-gray-700 transition-colors"
                      >
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium truncate">{c.brand} {c.model}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {engine.pdfs && engine.pdfs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <PDFDownloadList pdfs={engine.pdfs} />
              </div>
            )}

            <ReferencePanel engine={engine} slug={slug} />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <p className="font-semibold text-gray-900 mb-1">Need this engine?</p>
              <p className="text-sm text-gray-600 mb-3">
                Need a generator package using this engine? Haifeng Machinery can help with sizing,
                alternator selection, controller, enclosure, voltage, and compliance support.
              </p>
              <a
                href="https://www.haifengmachinery.com/contact-us/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get a Quote ↗
              </a>
              <p className="text-sm text-gray-600 mt-3">
                Or browse Haifeng&apos;s{' '}
                <a href={productPackage.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                  {productPackage.label} ↗
                </a>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Generator package paths</p>
              <div className="space-y-2 text-sm">
                <a href="https://www.haifengmachinery.com/product-offerings/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                  All product offerings ↗
                </a>
                <a href="https://www.haifengmachinery.com/diesel-power-package-regulated/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                  EPA standby diesel generators ↗
                </a>
                <a href="https://www.haifengmachinery.com/gas-power-package-50hz-60hz/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                  CNG and LPG gas generator systems ↗
                </a>
                <a href="https://www.haifengmachinery.com/towable-power-package/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                  Rental and towable power ↗
                </a>
                <a href="https://www.haifengmachinery.com/custom-epc-power-solutions/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                  Custom EPC power solutions ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
