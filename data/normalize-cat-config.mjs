// Cat diesel rows stored configuration as verbose strings ("In-line 6, Turbocharged Aftercooled"),
// unlike every other brand's clean "L6"/"V16". Normalize to the clean cylinder-layout token so the
// Configuration filter isn't polluted, and preserve the aspiration descriptor into the description.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data } = await supabase.from('engines').select('id, model, configuration, description').eq('brand','Caterpillar')
let n = 0
for (const e of data) {
  const m = (e.configuration || '').match(/^(In-line|V)\s*(\d+)(?:,\s*(.+))?$/i)
  if (!m) continue  // already clean (L6/V12/etc) or null
  const clean = (/^v$/i.test(m[1]) ? 'V' : 'L') + m[2]
  const aspiration = (m[3] || '').trim()
  const upd = { configuration: clean }
  if (aspiration && e.description && !e.description.includes(aspiration)) {
    upd.description = e.description.replace(/\s*$/, '') + ` ${aspiration}.`
  }
  const { error } = await supabase.from('engines').update(upd).eq('id', e.id)
  if (error) console.error('✗', e.model, error.message)
  else { n++; console.log(`· ${e.model}: "${e.configuration}" -> ${clean}${aspiration ? ` (+desc: ${aspiration})` : ''}`) }
}
console.log(`\n✓ normalized ${n} Caterpillar configuration values`)
