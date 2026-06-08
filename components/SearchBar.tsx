'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'

export function SearchBar({
  defaultValue = '',
  target,
}: {
  defaultValue?: string
  // Where to send the search. Omit to search the current page (preserving its
  // other filters — used on /engines and /alternators). Set to e.g. "/engines"
  // on pages that don't handle `q` themselves (the homepage), so the query lands
  // on the results page instead of reloading a page that ignores it.
  target?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Cross-page search starts from a clean query; same-page search preserves filters.
    const p = new URLSearchParams(target ? '' : searchParams.toString())
    if (query.trim()) p.set('q', query.trim())
    else p.delete('q')
    const dest = target ?? pathname
    const qs = p.toString()
    router.push(qs ? `${dest}?${qs}` : dest)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by brand, model, or series..."
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
