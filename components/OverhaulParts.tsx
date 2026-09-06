'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { TrackedExternalLink } from '@/components/TrackedExternalLink'
import type { OverhaulPreview } from '@/lib/overhaul-preview'

// Local extension of the Precision Catalog: reference rows lead into a nameplate
// request. Preserve incumbent typography, blue actions, flat rules and mobile flow.
export function OverhaulParts({ brand, model, slug, preview }: {
  brand: string; model: string; slug: string; preview: OverhaulPreview
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [noPlate, setNoPlate] = useState(false)
  const engineName = `${brand} ${model}`
  const message = [
    `Hi Haifeng Machinery, I need overhaul / repair parts for my ${engineName}.`,
    `Engine page: https://engines.haifengmachinery.com/engines/${slug}`,
    `Parts needed: ${selected.length ? selected.join(', ') : 'Please help me identify the parts'}`,
    noPlate ? 'I cannot read or find the nameplate. I can share engine photos and existing part markings.' : 'I will attach a clear engine nameplate photo here. Please help confirm the correct parts.',
    'Repair details:',
  ].join('\n\n')
  const properties = { brand, model, slug, intent: 'overhaul_parts', placement: 'overhaul_section', nameplate_available: !noPlate, categories: selected.join(', ') }
  return (
    <section id="overhaul-parts" aria-labelledby="overhaul-heading" className="my-10 scroll-mt-28 border-y border-gray-900 bg-white">
      <div className="px-5 pt-7 sm:px-8">
        <h2 id="overhaul-heading" className="text-2xl font-bold text-gray-900 sm:text-3xl">{engineName} overhaul &amp; repair parts</h2>
        <p className="mt-3 max-w-3xl text-gray-600">Already running a {engineName}? Start with the parts you need, then send your nameplate so we can help check the right references for your engine.</p>
        {preview.localPreview && <p className="mt-3 text-sm text-gray-600">Local preview · reviewed records; live catalog publication is unchanged.</p>}
      </div>
      <div className="grid gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          {preview.categories.length > 0 ? <>
            <fieldset>
              <legend className="mb-3 font-semibold text-gray-900">Which parts do you need?</legend>
              <div className="flex flex-wrap gap-2">
                {preview.categories.map(category => <label key={category} className={`flex min-h-11 cursor-pointer items-center gap-2 border px-3 py-2 text-sm ${selected.includes(category) ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-300 text-gray-700 hover:border-blue-600'}`}>
                  <input type="checkbox" className="h-4 w-4 accent-blue-700" checked={selected.includes(category)} onChange={event => setSelected(current => event.target.checked ? [...current, category] : current.filter(item => item !== category))} />
                  {category}
                </label>)}
              </div>
            </fieldset>
            {preview.references.length > 0 ? <div className="mt-7">
              <h3 className="font-semibold text-gray-900">Reviewed part-number references</h3>
              <p className="mt-1 text-sm text-gray-600">A starting point for identification. Fitment must be confirmed before ordering.</p>
              <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
                {preview.references.map(reference => <li key={`${reference.category}-${reference.number}`} className="py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                    <span className="font-medium text-gray-900">{reference.category}</span>
                    <span className="break-all font-semibold text-gray-900">{reference.number}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{reference.name}</p>
                  <p className="mt-2 max-w-prose text-sm text-gray-600"><span className="font-medium text-gray-900">Fitment check: </span>{reference.condition}</p>
                  {reference.sourceName && <p className="mt-2 text-xs leading-relaxed text-gray-600">Source: {reference.sourceName}</p>}
                  {reference.verifiedAt && <p className="mt-1 text-xs text-gray-600">Fitment record verified: <time dateTime={reference.verifiedAt}>{new Date(reference.verifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time></p>}
                </li>)}
              </ul>
              <p className="mt-3 text-sm text-gray-600">Selected references only; this is not a complete overhaul list or a stock listing.</p>
            </div> : <p className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600">These categories have model-related records. Part numbers need further checking before we display them here.</p>}
          </> : <div className="border-y border-gray-200 py-5">
            <h3 className="font-semibold text-gray-900">Start with engine identification</h3>
            <p className="mt-2 max-w-prose text-gray-600">{preview.unavailable ? 'Parts references are temporarily unavailable. You can still send your engine details for help.' : 'We do not have a reviewed public parts preview for this model yet. Send the engine details and tell us what needs repair.'}</p>
          </div>}
        </div>
        <div className="self-start bg-blue-50 p-5 sm:p-6">
          <MessageCircle aria-hidden="true" className="mb-4 h-6 w-6 text-blue-700" />
          <h3 className="text-xl font-bold text-gray-900">Let’s identify the right parts.</h3>
          <p className="mt-3 text-sm leading-relaxed text-blue-900">The model is the starting point. Serial numbers and build configurations can change which parts fit.</p>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm text-blue-900">
            <li>Take a clear photo of the engine nameplate.</li>
            <li>Tell us what needs repair or replacement.</li>
            <li>Send both in WhatsApp to start a fitment check.</li>
          </ol>
          <Link href="/guides/how-to-read-engine-nameplate-spec-sheet" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline underline-offset-4">How to read your engine nameplate</Link>
          <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-blue-900">
            <input type="checkbox" className="h-4 w-4 shrink-0 accent-blue-700" checked={noPlate} onChange={event => setNoPlate(event.target.checked)} />
            I don’t have a readable nameplate
          </label>
          {noPlate && <p role="status" className="mb-3 text-sm text-blue-900">Send engine photos and any numbers on the existing parts. We may need more details to identify them.</p>}
          <TrackedExternalLink href={`https://wa.me/14163179500?text=${encodeURIComponent(message)}`} eventName={['engine_whatsapp_click', 'engine_overhaul_whatsapp_click']} eventProperties={properties} impressionEventName="engine_overhaul_impression" className="mt-2 flex min-h-12 items-center justify-between gap-3 bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700">
            <span>{noPlate ? 'Get identification help on WhatsApp' : 'Send nameplate on WhatsApp'}</span><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </TrackedExternalLink>
          <p className="mt-3 text-xs leading-relaxed text-blue-900">Opens WhatsApp with {model} and your selected categories included. Attach your photos there.</p>
        </div>
      </div>
    </section>
  )
}
