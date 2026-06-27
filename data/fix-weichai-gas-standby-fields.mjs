// Weichai 2024 domestic gas-engine XLS provides genset prime kWe and engine prime kW
// for these rows, but not a 50 Hz standby genset rating. Earlier derived standby
// values ended up lower than prime and triggered QA. Keep the source-backed prime
// fields and clear unsupported standby fields.
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const patch = {
  standby_power_kw_50hz: null,
  standby_power_kwe_50hz: null,
  standby_power_kva_50hz: null,
}

for (const slug of ['weichai-12m26d605e300ng', 'weichai-12m33d880a0bg']) {
  const { error } = await supabase.from('engines').update(patch).eq('slug', slug)
  if (error) {
    console.error(`Failed ${slug}: ${error.message}`)
    process.exitCode = 1
  } else {
    console.log(`Updated ${slug}`)
  }
}
