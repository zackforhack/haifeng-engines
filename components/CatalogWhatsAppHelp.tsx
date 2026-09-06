import { MessageCircle } from 'lucide-react'
import { TrackedExternalLink } from '@/components/TrackedExternalLink'

/** A single contextual route after the catalog's search controls. */
export function CatalogWhatsAppHelp({ context }: { context: 'home' | 'engines' | 'brands' | 'alternators' }) {
  const alternator = context === 'alternators'
  const label = alternator ? 'Need help matching an alternator?' : 'Need help finding an engine or replacement?'
  const detail = alternator
    ? 'Share the nameplate, kVA, voltage and frequency.'
    : 'Share the model or nameplate and your destination country.'
  const page = context === 'home' ? '/' : `/${context}`
  const message = [
    `Hi Haifeng Machinery, I need help ${alternator ? 'matching an alternator' : 'finding an engine or replacement'}.`,
    `Reference: https://engines.haifengmachinery.com${page}`,
    '',
    alternator ? 'Model / kVA / voltage / frequency:' : 'Engine model or requirement:',
    'Destination country:',
  ].join('\n')
  return (
    <aside aria-label="WhatsApp matching help" className="my-5 flex flex-col gap-3 border-y border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        <strong className="block font-semibold text-gray-900">{label}</strong>
        {detail}
      </p>
      <TrackedExternalLink
        href={`https://wa.me/14163179500?text=${encodeURIComponent(message)}`}
        eventName={['catalog_contact_cta_click', 'catalog_whatsapp_click']}
        eventProperties={{ channel: 'whatsapp', placement: `${context}_matching_help`, intent: 'matching', cta_version: '2026-09-06' }}
        impressionEventName="catalog_whatsapp_impression"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <MessageCircle aria-hidden="true" className="h-4 w-4" /> Ask on WhatsApp
      </TrackedExternalLink>
    </aside>
  )
}
