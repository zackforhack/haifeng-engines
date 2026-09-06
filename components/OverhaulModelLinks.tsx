import Link from 'next/link'
import { getOverhaulModelLinks } from '@/lib/overhaul-preview'

export async function OverhaulModelLinks({ brand }: { brand?: string }) {
  const models = await getOverhaulModelLinks(brand)
  if (!models.length) return null
  return (
    <section aria-labelledby="repair-models-heading" className="my-8 border-y border-gray-300 bg-white py-6">
      <h2 id="repair-models-heading" className="text-xl font-semibold text-gray-900">{brand ? `${brand} repair parts by engine model` : 'Use your nameplate to check model-specific parts'}</h2>
      <p className="mt-2 max-w-prose text-sm text-gray-600">These engine pages include reviewed part references. Match the model on your nameplate, then check the serial number and configuration requirements before ordering.</p>
      <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {models.map(engine => <li key={engine.slug}>
          <Link href={`/engines/${engine.slug}#overhaul-parts`} className="flex min-h-11 items-center py-2 text-sm font-medium text-blue-600 underline-offset-4 hover:underline">{engine.brand} {engine.model} repair part references</Link>
        </li>)}
      </ul>
    </section>
  )
}
