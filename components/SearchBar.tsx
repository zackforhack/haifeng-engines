'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Search as SearchIcon } from 'lucide-react'

type EngineHit = {
  slug: string; brand: string; model: string; fuel_type: string | null
  prime_power_kwe_50hz: number | null; prime_power_kwe_60hz: number | null
}
type AltHit = { slug: string; brand: string; model: string; series: string | null; kva: number | null; poles: number | null }

export function SearchBar({
  defaultValue = '',
  target,
}: {
  defaultValue?: string
  // Where to send a full-text search submit. Omit to search the current page
  // (preserving its other filters — /engines, /alternators); set to "/engines"
  // on pages that don't handle `q` themselves (the homepage).
  target?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(defaultValue)
  const [engines, setEngines] = useState<EngineHit[]>([])
  const [alts, setAlts] = useState<AltHit[]>([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)

  // Flat list of navigable items in render order; the last slot (index === flat.length)
  // is the "search all results" action.
  const flat: { href: string }[] = [
    ...engines.map((e) => ({ href: `/engines/${e.slug}` })),
    ...alts.map((a) => ({ href: `/alternators/${a.slug}` })),
  ]

  function runSearch(value: string) {
    const dest = target ?? pathname
    const p = new URLSearchParams(target ? '' : searchParams.toString())
    if (value.trim()) p.set('q', value.trim()); else p.delete('q')
    const qs = p.toString()
    setOpen(false)
    router.push(qs ? `${dest}?${qs}` : dest)
  }

  // Debounced live suggestions straight from Supabase (public anon read).
  useEffect(() => {
    const term = query.trim()
    const id = ++seq.current
    // All state updates happen inside this deferred callback (never synchronously in the
    // effect body), which both debounces input and avoids cascading renders.
    const t = setTimeout(async () => {
      if (term.length < 2) {
        if (id === seq.current) { setEngines([]); setAlts([]); setOpen(false) }
        return
      }
      const like = `brand.ilike.%${term}%,model.ilike.%${term}%,series.ilike.%${term}%`
      const [eng, alt] = await Promise.all([
        supabase.from('engines')
          .select('slug,brand,model,fuel_type,prime_power_kwe_50hz,prime_power_kwe_60hz')
          .or(like).order('brand').order('model').limit(6),
        supabase.from('alternators')
          .select('slug,brand,model,series,kva,poles')
          .or(like).order('brand').order('model').limit(4),
      ])
      if (id !== seq.current) return // a newer keystroke superseded this request
      setEngines((eng.data as EngineHit[]) ?? [])
      setAlts((alt.data as AltHit[]) ?? [])
      setHighlight(-1)
      setOpen(true)
    }, term.length < 2 ? 0 : 160)
    return () => clearTimeout(t)
  }, [query])

  // Close on outside click.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, flat.length)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, -1)) }
    else if (e.key === 'Escape') { setOpen(false) }
    else if (e.key === 'Enter') {
      if (highlight >= 0 && highlight < flat.length) { e.preventDefault(); setOpen(false); router.push(flat[highlight].href) }
      // highlight === flat.length (the "search all" row) or -1 falls through to form submit
    }
  }

  const hasHits = engines.length > 0 || alts.length > 0

  return (
    <div ref={boxRef} className="relative w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(query) }}
        className="flex w-full border border-gray-900 bg-white"
      >
        <SearchIcon aria-hidden="true" className="ml-4 h-5 w-5 shrink-0 self-center text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (hasHits) setOpen(true) }}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          placeholder="Search by brand, model, or series..."
          className="min-w-0 flex-1 border-0 px-3 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          className="flex w-12 shrink-0 items-center justify-center border-l border-gray-900 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto sm:gap-2 sm:px-6"
        >
          <span className="sr-only sm:not-sr-only">Search</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </form>

      {open && (hasHits || query.trim().length >= 2) && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-900 overflow-hidden text-left"
        >
          {engines.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Engines</div>
          )}
          {engines.map((e, i) => {
            const kwe = e.prime_power_kwe_50hz ?? e.prime_power_kwe_60hz
            return (
              <button
                key={e.slug}
                type="button"
                role="option"
                aria-selected={highlight === i}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => { setOpen(false); router.push(`/engines/${e.slug}`) }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left ${highlight === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className="min-w-0 truncate text-gray-900"><span className="font-semibold">{e.brand}</span> {e.model}</span>
                <span className="shrink-0 text-xs text-gray-500">{kwe != null ? `${kwe} kWe` : e.fuel_type ?? ''}</span>
              </button>
            )
          })}

          {alts.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 border-t border-gray-100">Alternators</div>
          )}
          {alts.map((a, i) => {
            const idx = engines.length + i
            return (
              <button
                key={a.slug}
                type="button"
                role="option"
                aria-selected={highlight === idx}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => { setOpen(false); router.push(`/alternators/${a.slug}`) }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left ${highlight === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className="min-w-0 truncate text-gray-900"><span className="font-semibold">{a.brand}</span> {a.model}</span>
                <span className="shrink-0 text-xs text-gray-500">{a.kva != null ? `${a.kva} kVA` : a.series ?? ''}</span>
              </button>
            )
          })}

          {!hasHits && (
            <div className="px-4 py-3 text-sm text-gray-500">No matches — press Enter to search anyway.</div>
          )}

          <button
            type="button"
            role="option"
            aria-selected={highlight === flat.length}
            onMouseEnter={() => setHighlight(flat.length)}
            onClick={() => runSearch(query)}
            className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium border-t border-gray-100 ${highlight === flat.length ? 'bg-blue-50' : 'hover:bg-gray-50'} text-blue-700`}
          >
            Search all results for “{query.trim()}” →
          </button>
        </div>
      )}
    </div>
  )
}
