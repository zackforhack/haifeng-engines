import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Download, ExternalLink, MessageCircle } from 'lucide-react'
import { getAllEngines, getEngineBySlug, getPDFUrl, getRelatedEngines } from '@/lib/engines'
import { StatusBadge } from '@/components/StatusBadge'
import { PDFDownloadList } from '@/components/PDFDownloadList'
import { BrandLogo } from '@/components/BrandLogo'
import { TrackedExternalLink } from '@/components/TrackedExternalLink'
import { headlinePower, displayKva, displayKwe, displayOutput, ratedSpeedLabel, ratedSpeeds, buildIntro, compactConfig, ratedFrequencies, isVariableSpeedMechanical } from '@/lib/engine-display'
import { competitorsFor, pairSlug } from '@/lib/compare'
import { buildEngineFaqs } from '@/lib/engine-faq'
import { brandSlug } from '@/lib/seo'
import { quickWinEngineSeo, type QuickWinPageSeo } from '@/lib/quick-win-seo'
import { engineMetadataDescription, engineMetadataTitle } from '@/lib/metadata-lengths'
import type { Engine, EnginePDF } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

const HAIFENG_CONTACT_URL = 'https://www.haifengmachinery.com/contact-us/'
const HAIFENG_WHATSAPP_NUMBER = '14163179500'
const ENGINE_BASE_URL = 'https://engines.haifengmachinery.com'

function engineContactLabel(engine: Engine): string {
  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)
  const ratings = [
    kva ? `${kva.toLocaleString()} kVA` : null,
    out ? `${out.value.toLocaleString()} ${out.unit}` : null,
  ].filter(Boolean)

  return ratings.length ? `${engine.brand} ${engine.model} (${ratings.join(' / ')})` : `${engine.brand} ${engine.model}`
}

function whatsappHref(engine: Engine, slug: string): string {
  const message = [
    `Hi Haifeng Machinery, I am reviewing ${engineContactLabel(engine)} for a generator project.`,
    '',
    `Engine page: ${ENGINE_BASE_URL}/engines/${slug}`,
    '',
    'Can you help confirm:',
    '- generator package options',
    '- alternator sizing',
    '- enclosure and voltage options',
    '- quote availability',
  ].join('\n')

  return `https://wa.me/${HAIFENG_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function contactTracking(engine: Engine, channel: 'quote' | 'whatsapp', placement: string) {
  return {
    channel,
    placement,
    brand: engine.brand,
    model: engine.model,
    slug: engine.slug,
    engine: engineContactLabel(engine),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)
  if (!engine) return {}

  const quickWin = quickWinEngineSeo(slug)
  const title = engineMetadataTitle(engine, quickWin?.title)
  const description = engineMetadataDescription(engine, quickWin?.description ?? engine.description ?? buildIntro(engine))
  const aliases = uniqueAliases([...(quickWin?.aliases ?? []), ...modelAliases(engine)])
  const variableSpeed = isVariableSpeedMechanical(engine)
  const fuel = (engine.fuel_type ?? 'Diesel').trim()
  const fuelKeyword = fuel.toLowerCase()

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${engine.brand} ${engine.model}`,
      `${engine.model} specs`,
      `${engine.model} datasheet`,
      ...aliases,
      `${engine.brand} ${fuelKeyword} engine`,
      engine.series ?? '',
      variableSpeed ? `high-speed industrial ${fuelKeyword} engine` : `${fuelKeyword} generator engine`,
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
      <td className="w-40 px-4 py-3 text-sm font-medium text-gray-500 sm:w-48">{label}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{value}</td>
    </tr>
  )
}

function kweIsEstimated(engine: Engine): boolean {
  const b = engine.brand ?? ''
  const m = engine.model ?? ''
  if (b === 'Isuzu' || b === 'Hatz' || b === 'JCB' || b === 'Kirloskar' || b === 'MAN' || b === 'Liebherr') return true
  if (b === 'Mitsubishi') return !/gas/i.test(engine.fuel_type ?? '')
  if (b === 'FPT' && (m.includes('TEVP') || m.includes('ETVP'))) return true
  return false
}

function PowerRatingsTable({ engine }: { engine: Engine }) {
  const has50hz = engine.prime_power_kw_50hz || engine.standby_power_kw_50hz
    || engine.prime_power_kwe_50hz || engine.standby_power_kwe_50hz
  const has60hz = engine.prime_power_kw_60hz || engine.standby_power_kw_60hz
    || engine.prime_power_kwe_60hz || engine.standby_power_kwe_60hz
  if (!has50hz && !has60hz) return null

  const { rpm50, rpm60 } = ratedSpeeds(engine)
  const estimated = kweIsEstimated(engine)
  const ratingsGridClass = has50hz && has60hz
    ? 'grid grid-cols-1 gap-8 px-4 lg:grid-cols-2'
    : 'max-w-4xl px-4'

  return (
    <section id="ratings" className="scroll-mt-28 border-y border-gray-900 bg-white py-6">
      <h2 className="mb-2 px-4 text-xl font-bold text-gray-900">Power Ratings</h2>
      <p className="mb-4 px-4 text-xs text-gray-400">
        kWm = mechanical shaft power · kWe = electrical output · kVA = kWe ÷ 0.8 pf
        {estimated && <span className="text-amber-500"> · kWe estimated — see note below</span>}
      </p>

      <div className={ratingsGridClass}>
        {has50hz && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between border-t border-gray-900 pt-2">
              <span className="font-bold text-blue-700">50 Hz</span>
              <span>{rpm50} RPM</span>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between border-t border-gray-900 pt-2">
              <span className="font-bold text-blue-700">60 Hz</span>
              <span>{rpm60} RPM</span>
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
        <p className="mx-4 mt-5 border border-blue-600 bg-blue-50 px-4 py-3 text-xs text-blue-900">
          <strong>Note:</strong> The manufacturer does not publish a separate kWe rating for this engine.
          kWe values shown are estimated from the rated mechanical output (kWm) using a conservative
          90% alternator efficiency factor.
        </p>
      )}
    </section>
  )
}

function TopTaskFlow({
  engine,
  firstPdf,
  productPackage,
  competitors,
  whatsappUrl,
}: {
  engine: Engine
  firstPdf?: EnginePDF
  productPackage: { href: string; label: string }
  competitors: Engine[]
  whatsappUrl: string
}) {
  const modified = engine.updated_at ? engine.updated_at.slice(0, 10) : null
  const datasheetCount = engine.pdfs?.length ?? 0
  const primaryHref = firstPdf ? getPDFUrl(firstPdf.storage_path) : HAIFENG_CONTACT_URL
  const compareHref = competitors[0]
    ? `/engines/compare/${pairSlug(engine.slug, competitors[0].slug)}`
    : `/brands/${brandSlug(engine.brand)}`

  return (
    <section className="mb-8 border-y border-gray-900 bg-white">
      <div className="grid grid-cols-1 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <a
          href={primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center justify-between gap-3 border-b border-gray-900 bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 sm:border-r lg:border-b-0"
        >
          <span>{firstPdf ? 'Download datasheet' : 'Request datasheet'}</span>
          {firstPdf ? <Download aria-hidden="true" className="h-4 w-4" /> : <ExternalLink aria-hidden="true" className="h-4 w-4" />}
        </a>
        <Link
          href={compareHref}
          className="flex min-h-14 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 font-semibold text-blue-600 hover:bg-blue-50 lg:border-b-0 lg:border-r"
        >
          <span>Compare engine</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <TrackedExternalLink
          href={HAIFENG_CONTACT_URL}
          eventName="engine_contact_cta_click"
          eventProperties={contactTracking(engine, 'quote', 'top_task_flow')}
          className="flex min-h-14 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 font-semibold text-blue-600 hover:bg-blue-50 sm:border-b-0 sm:border-r"
        >
          <span>Get a quote</span>
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </TrackedExternalLink>
        <TrackedExternalLink
          href={whatsappUrl}
          eventName="engine_contact_cta_click"
          eventProperties={contactTracking(engine, 'whatsapp', 'top_task_flow')}
          className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 font-semibold text-blue-600 hover:bg-blue-50"
        >
          <span>Ask about this engine</span>
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
        </TrackedExternalLink>
      </div>

      <dl className="grid grid-cols-1 border-t border-gray-900 bg-gray-50 text-xs text-gray-600 sm:grid-cols-3">
        <div className="border-b border-gray-200 px-4 py-2.5 sm:border-b-0 sm:border-r">
          <dt className="font-medium text-gray-500">Manufacturer files</dt>
          <dd className="font-bold text-gray-900">
            {datasheetCount > 0 ? `${datasheetCount} datasheet${datasheetCount === 1 ? '' : 's'}` : 'No datasheet'}
          </dd>
        </div>
        <div className="border-b border-gray-200 px-4 py-2.5 sm:border-b-0 sm:border-r">
          <dt className="font-medium text-gray-500">Last updated</dt>
          <dd className="font-bold text-gray-900">{modified ?? 'Not listed'}</dd>
        </div>
        <div className="px-4 py-2.5">
          <dt className="font-medium text-gray-500">Package route</dt>
          <dd className="font-bold text-gray-900">{productPackage.label}</dd>
        </div>
      </dl>

      <nav aria-label="Engine page sections" className="flex overflow-x-auto border-t border-gray-900 text-xs font-bold text-blue-600">
        {[
          ['Ratings', '#ratings'],
          ['Specs', '#specs'],
          ['Downloads', '#downloads'],
          ['Compare', '#compare'],
          ['Package paths', '#package-paths'],
        ].map(([label, href]) => (
          <a key={href} href={href} className="shrink-0 whitespace-nowrap border-r border-gray-200 px-4 py-3 hover:bg-blue-50">
            {label}
          </a>
        ))}
      </nav>
    </section>
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
    <dl className="mb-8 grid grid-cols-2 border-y border-gray-900 sm:grid-cols-3 lg:grid-cols-5">
      {cards.slice(0, 5).map((c) => (
        <div key={c.label} className="border-b border-r border-gray-200 bg-white px-4 py-4 lg:border-b-0">
          <dt className="text-xs text-gray-500 font-medium leading-tight">{c.label}</dt>
          <dd className="mt-2 text-xl font-bold text-gray-900">{c.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RelatedEngines({ engines }: { engines: Engine[] }) {
  if (!engines.length) return null
  return (
    <section className="border-t border-gray-900 bg-white pt-5">
      <h2 className="mb-4 px-4 text-lg font-bold text-gray-900">Related Engines</h2>
      <ul className="grid grid-cols-1 border-t border-gray-200 sm:grid-cols-2">
        {engines.map((e) => {
          const kwe = displayKwe(headlinePower(e))
          return (
            <li key={e.slug}>
              <Link
                href={`/engines/${e.slug}`}
                className="flex items-center justify-between gap-2 border-b border-r border-gray-200 px-4 py-3 hover:bg-blue-50"
              >
                <span className="text-sm font-medium text-gray-800 truncate">{e.brand} {e.model}</span>
                {kwe != null && <span className="flex-shrink-0 text-xs text-gray-500">{kwe.toLocaleString()} kWe</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
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
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${className} inline-flex items-center gap-2`}>
        {children} <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
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
    <section className="border-t border-gray-900 bg-white pt-5">
      <h2 className="mb-3 px-4 text-lg font-semibold text-gray-900">
        {engine.brand} {engine.model} {variableSpeed ? 'industrial power context' : 'generator set context'}
      </h2>
      <p className="px-4 text-sm leading-relaxed text-gray-600">
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
        <div className="mt-4 px-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Also searched as</p>
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <span key={alias} className="border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 border-t border-gray-200 text-sm sm:grid-cols-3">
        <Link href={`/brands/${brandSlug(engine.brand)}`} className="flex items-center justify-between gap-3 border-b border-r border-gray-200 px-4 py-3 text-blue-600 hover:bg-blue-50">
          <span>
            <span className="block text-xs font-bold text-gray-500">Brand</span>
            <span className="font-semibold">All {engine.brand} engines</span>
          </span>
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Link>
        {competitors[0] && (
          <Link href={`/engines/compare/${pairSlug(engine.slug, competitors[0].slug)}`} className="flex items-center justify-between gap-3 border-b border-r border-gray-200 px-4 py-3 text-blue-600 hover:bg-blue-50">
            <span>
              <span className="block text-xs font-bold text-gray-500">Compare</span>
              <span className="font-semibold">Similar engines</span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </Link>
        )}
        <a href={productPackage.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 text-blue-600 hover:bg-blue-50">
          <span>
            <span className="block text-xs font-bold text-gray-500">Haifeng package</span>
            <span className="font-semibold">{productPackage.label}</span>
          </span>
          <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
        </a>
      </div>

      {quickWin?.links.length ? (
        <div className="mt-5 px-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Technical reference links</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {quickWin.links.map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                className="border border-gray-200 px-3 py-2 text-blue-600 hover:bg-blue-50"
              >
                {link.label}
              </SmartLink>
            ))}
          </div>
        </div>
      ) : null}

      {quickWin && (
        <div className="mx-4 mt-5 border border-blue-600 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{quickWin.cta.title}</h3>
          <p className="text-sm text-blue-900 leading-relaxed mb-3">{quickWin.cta.body}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <SmartLink href={quickWin.cta.primaryHref} className="bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
              {quickWin.cta.primaryLabel}
            </SmartLink>
            <SmartLink href={quickWin.cta.secondaryHref} className="border border-blue-200 bg-white px-4 py-2 font-medium text-blue-600 hover:bg-blue-100">
              {quickWin.cta.secondaryLabel}
            </SmartLink>
          </div>
        </div>
      )}
    </section>
  )
}

function ReferencePanel({ engine, slug }: { engine: Engine; slug: string }) {
  const modified = engine.updated_at ? engine.updated_at.slice(0, 10) : null
  const datasheetCount = engine.pdfs?.length ?? 0

  return (
    <section className="border-t border-gray-900 bg-white pt-5">
      <h2 className="mb-4 px-4 text-lg font-semibold text-gray-900">Reference</h2>
      <dl className="space-y-3 px-4 text-sm">
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
    </section>
  )
}

function MobileContactBar({ engine, quoteUrl, whatsappUrl }: { engine: Engine; quoteUrl: string; whatsappUrl: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-900 bg-white px-4 py-3 lg:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
      <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-2 text-sm font-semibold">
        <TrackedExternalLink
          href={whatsappUrl}
          eventName="engine_contact_cta_click"
          eventProperties={contactTracking(engine, 'whatsapp', 'mobile_sticky')}
          className="flex min-h-11 items-center justify-center gap-2 bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Ask on WhatsApp <MessageCircle aria-hidden="true" className="h-4 w-4" />
        </TrackedExternalLink>
        <TrackedExternalLink
          href={quoteUrl}
          eventName="engine_contact_cta_click"
          eventProperties={contactTracking(engine, 'quote', 'mobile_sticky')}
          className="flex min-h-11 items-center justify-center gap-2 border border-blue-600 bg-white px-3 py-2 text-blue-600 hover:bg-blue-50"
        >
          Get quote <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </TrackedExternalLink>
      </div>
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
  const base = ENGINE_BASE_URL

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
  const fuelCategory = engine.fuel_type?.trim() || 'Diesel'
  const whatsappUrl = whatsappHref(engine, slug)

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
    category: variableSpeed ? `Industrial ${fuelCategory} Engine` : `${fuelCategory} Generator Engine`,
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
  const firstPdf = engine.pdfs?.[0]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="max-w-none pb-24 lg:pb-0">
        {/* Breadcrumb */}
        <nav className="mb-6 border-b border-gray-200 pb-3 text-sm text-gray-400">
          <Link href="/engines" className="hover:text-blue-600">Engines</Link>
          {' / '}
          <Link href={`/brands/${brandSlug(engine.brand)}`} className="hover:text-blue-600">{engine.brand}</Link>
          {' / '}
          <span className="text-gray-700">{engine.model}</span>
        </nav>

        {/* Header */}
        <header className="catalog-grid border-b border-gray-900 pb-8 pt-2 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-5">
            <div>
              <BrandLogo brand={engine.brand} className="mb-3" />
              <p className="section-index mb-3">{engine.brand}</p>
              <h1 className="brand-display max-w-5xl font-bold text-gray-900">{quickWin?.h1 ?? `${engine.brand} ${engine.model}`}</h1>
              {engine.series && <p className="text-gray-500 mt-1">{engine.series}</p>}
            </div>
            <StatusBadge status={engine.status} />
          </div>

          {engine.status === 'discontinued' && (
            <div className="border border-gray-900 bg-gray-50 p-4 mb-4 text-sm text-gray-600">
              This engine is no longer in production{engine.year_discontinued ? ` (discontinued ${engine.year_discontinued})` : ''}.
              Specifications and documentation remain archived for reference.
            </div>
          )}

          <p className="max-w-4xl text-gray-600 leading-relaxed">{intro}</p>
        </header>

        <TopTaskFlow
          engine={engine}
          firstPdf={firstPdf}
          productPackage={productPackage}
          competitors={competitors}
          whatsappUrl={whatsappUrl}
        />

        <SpecHero engine={engine} />

        <PowerRatingsTable engine={engine} />

        {/* Spec-card lead image — a unique, owned, indexable graphic (Google Images / social). */}
        <figure className="my-8 max-w-4xl border-y border-gray-900 bg-white">
          <figcaption className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span>
              <span className="block text-xs font-bold text-gray-500">Shareable spec card</span>
              <span className="font-semibold text-gray-900">{engine.brand} {engine.model} summary image</span>
            </span>
            <a
              href={`/engines/${slug}/opengraph-image`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 font-semibold text-blue-600 hover:underline"
            >
              Open image <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/engines/${slug}/opengraph-image`}
            alt={imageAlt}
            width={1200}
            height={630}
            className="h-auto w-full border-t border-gray-200 object-contain"
          />
        </figure>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-10 lg:col-span-8">
            <EngineBuyerContext engine={engine} productPackage={productPackage} competitors={competitors} quickWin={quickWin} />

            {/* General Specs */}
            <section className="border-t border-gray-900 bg-white pt-5">
              <h2 id="specs" className="scroll-mt-28 px-4 text-lg font-bold text-gray-900 mb-4">Technical Specifications</h2>
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
            </section>

            {faqs.length > 0 && (
              <section className="border-t border-gray-900 bg-white pt-5">
                <h2 className="mb-4 px-4 text-lg font-bold text-gray-900">Frequently asked questions</h2>
                <div className="space-y-5 px-4">
                  {faqs.map((f) => (
                    <div key={f.q}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.q}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <RelatedEngines engines={related} />
            {competitors.length > 0 && (
              <section id="compare" className="scroll-mt-28 border-t border-gray-900 bg-white pt-5">
                <h2 className="mb-4 px-4 text-lg font-bold text-gray-900">Compare {engine.brand} {engine.model}</h2>
                <ul className="grid grid-cols-1 border-t border-gray-200 sm:grid-cols-2">
                  {competitors.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/engines/compare/${pairSlug(engine.slug, c.slug)}`}
                        className="flex items-center gap-2 border-b border-r border-gray-200 px-4 py-3 text-sm text-blue-900 hover:bg-blue-50"
                      >
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium truncate">{c.brand} {c.model}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            {engine.pdfs && engine.pdfs.length > 0 && (
              <div id="downloads" className="scroll-mt-28 border-t border-gray-900 bg-white pt-5">
                <PDFDownloadList pdfs={engine.pdfs} />
              </div>
            )}

            <ReferencePanel engine={engine} slug={slug} />

            <div className="border border-blue-600 bg-blue-50 p-5">
              <p className="font-semibold text-gray-900 mb-1">Need help using this engine?</p>
              <p className="text-sm text-blue-900 mb-3">
                Send this model to Haifeng on WhatsApp. We can help confirm whether it fits your
                generator package, alternator, enclosure, voltage, and compliance needs.
              </p>
              <TrackedExternalLink
                href={HAIFENG_CONTACT_URL}
                eventName="engine_contact_cta_click"
                eventProperties={contactTracking(engine, 'quote', 'sidebar_cta')}
                className="flex items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Get a Quote <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </TrackedExternalLink>
              <TrackedExternalLink
                href={whatsappUrl}
                eventName="engine_contact_cta_click"
                eventProperties={contactTracking(engine, 'whatsapp', 'sidebar_cta')}
                className="mt-2 flex items-center justify-center gap-2 border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
              >
                Ask on WhatsApp <MessageCircle aria-hidden="true" className="h-4 w-4" />
              </TrackedExternalLink>
              <p className="text-sm text-blue-900 mt-3">
                Or browse Haifeng&apos;s{' '}
                <a href={productPackage.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                  {productPackage.label}
                </a>
              </p>
            </div>

            <div id="package-paths" className="scroll-mt-28 border-t border-gray-900 bg-white pt-5">
              <p className="mb-3 px-4 text-sm font-semibold text-gray-700">Generator package paths</p>
              <div className="space-y-4 px-4 text-sm">
                <div>
                  <p className="mb-2 text-xs font-bold text-gray-500">Recommended for this engine</p>
                  <a href={productPackage.href} target="_blank" rel="noopener noreferrer" className="block font-semibold text-blue-600 hover:underline">
                    Haifeng {productPackage.label}
                  </a>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="mb-2 text-xs font-bold text-gray-500">Other package scopes</p>
                  <div className="space-y-2">
                    <a href="https://www.haifengmachinery.com/product-offerings/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      All product offerings
                    </a>
                    <a href="https://www.haifengmachinery.com/diesel-power-package-regulated/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      EPA standby diesel generators
                    </a>
                    <a href="https://www.haifengmachinery.com/gas-power-package-50hz-60hz/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      CNG and LPG gas generator systems
                    </a>
                    <a href="https://www.haifengmachinery.com/towable-power-package/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      Rental and towable power
                    </a>
                    <a href="https://www.haifengmachinery.com/custom-epc-power-solutions/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      Custom EPC power solutions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <MobileContactBar engine={engine} quoteUrl={HAIFENG_CONTACT_URL} whatsappUrl={whatsappUrl} />
    </>
  )
}
