import { MessageCircle } from 'lucide-react'
import { TrackedExternalLink } from '@/components/TrackedExternalLink'

export function ContextWhatsAppCta({ title, detail, message, path, placement, intent }: {
  title: string; detail: string; message: string; path: string; placement: string; intent: string
}) {
  const href = `https://wa.me/14163179500?text=${encodeURIComponent(`${message}\n\nReference: https://engines.haifengmachinery.com${path}`)}`
  return (
    <aside aria-label="WhatsApp project help" className="my-8 border-y border-gray-200 bg-white px-5 py-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{detail}</p>
      <TrackedExternalLink href={href}
        eventName={['resource_contact_cta_click', 'resource_whatsapp_click']}
        eventProperties={{ channel: 'whatsapp', placement, intent, page_path: path, cta_version: '2026-09-06-batch2' }}
        impressionEventName="resource_whatsapp_impression"
        className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2">
        <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" /> Discuss on WhatsApp
      </TrackedExternalLink>
      <p className="mt-2 text-xs text-gray-500">Opens an editable message with this page linked.</p>
    </aside>
  )
}
