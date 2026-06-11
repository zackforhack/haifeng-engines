// DB-wide: normalize verbose `configuration` strings to the clean cylinder-layout token (L6/V12/W18)
// used by the filter and the OG spec card. Verbose values were overflowing the OG "Cylinders" stat
// (cropping the image) and polluting the Configuration filter. Layout-prefixed strings ("In-line 6,
// Turbocharged") map directly; aspiration-only strings ("Turbocharged, Intercooled") derive the
// layout from the cylinder count (≤6 = inline L, ≥8 = V — verified unambiguous for the affected rows).
// The descriptive aspiration text (incl. vee-angle / 2-cycle / common-rail) is preserved into the
// engine description so no information is lost.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

function parse(c, cylinders) {
  c = (c || '').trim()
  if (!c || /^[LVW]\d+$/i.test(c)) return null  // empty or already clean
  let clean = null, rest = '', m
  if ((m = c.match(/^in-?line\s*(\d+)/i)))    { clean = 'L' + m[1]; rest = c.slice(m[0].length) }
  else if ((m = c.match(/^([vw])\s*(\d+)/i))) { clean = m[1].toUpperCase() + m[2]; rest = c.slice(m[0].length) }
  else if (/^single-cylinder/i.test(c))       { clean = 'L1'; rest = c.replace(/^single-cylinder/i, '') }
  else if (cylinders)                          { clean = (cylinders <= 6 ? 'L' : 'V') + cylinders; rest = c } // aspiration-only
  else return null
  rest = rest.replace(/^[\s,]+/, '').trim()
  return { clean, rest }
}

let all = [], from = 0
while (true) { const { data } = await supabase.from('engines').select('id, brand, model, configuration, cylinders, description').range(from, from + 999); all = all.concat(data); if (data.length < 1000) break; from += 1000 }
let n = 0, derived = 0
for (const e of all) {
  const p = parse(e.configuration, e.cylinders)
  if (!p) continue
  const upd = { configuration: p.clean }
  if (p.rest && e.description && !e.description.includes(p.rest)) {
    upd.description = e.description.replace(/\s*$/, '') + ` ${p.rest}.`
  }
  if (!/^(in-?line|v\s*\d|w\s*\d|single)/i.test((e.configuration || '').trim()) && !/^[LVW]\d+$/i.test((e.configuration||'').trim())) derived++
  const { error } = await supabase.from('engines').update(upd).eq('id', e.id)
  if (error) console.error('✗', e.brand, e.model, error.message); else n++
}
console.log(`✓ normalized ${n} configuration values (${derived} layout derived from cylinder count)`)
