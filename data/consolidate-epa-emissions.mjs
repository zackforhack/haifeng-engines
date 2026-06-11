// Consolidate the inconsistent EPA stationary-gas labels into one canonical value.
// "EPA Certified" (Ford/Mesa/PSI gas gensets) and the lone "U.S. EPA Stationary" (Volvo Penta)
// both mean U.S. EPA stationary spark-ignition certification → standardize on "U.S. EPA Stationary".
// Bonus: the canonical value joins the "U.S. EPA" prefix family, so these now appear under the
// emissions filter's U.S. EPA umbrella (the vague "EPA Certified" string did not).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data, error } = await supabase.from('engines')
  .update({ emissions_standard: 'U.S. EPA Stationary' })
  .eq('emissions_standard', 'EPA Certified')
  .select('id')
if (error) { console.error('✗', error.message); process.exit(1) }
console.log(`✓ relabeled ${data.length} engines: "EPA Certified" -> "U.S. EPA Stationary"`)
// verify
const { count } = await supabase.from('engines').select('id', { count: 'exact', head: true }).eq('emissions_standard', 'U.S. EPA Stationary')
const { count: leftover } = await supabase.from('engines').select('id', { count: 'exact', head: true }).eq('emissions_standard', 'EPA Certified')
console.log(`now: "U.S. EPA Stationary" = ${count}, "EPA Certified" = ${leftover}`)
