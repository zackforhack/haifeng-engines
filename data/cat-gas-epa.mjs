// Cat's US electric-power gas gensets are stationary spark-ignition engines, which must be U.S. EPA
// certified under 40 CFR 60 Subpart JJJJ (NSPS) to be sold new in the US. Press/dealer sources
// confirm EPA stationary certification for G3406 (SI NSPS), G3412 (Stationary Emergency), G3516
// (emergency + non-emergency) and G3520 (non-emergency). The whole US gas lineup was wrongly tagged
// "Unregulated" — relabel the Natural Gas Caterpillar rows to the canonical "U.S. EPA Stationary".
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data: before } = await supabase.from('engines')
  .select('model, emissions_standard')
  .eq('brand', 'Caterpillar').eq('fuel_type', 'Natural Gas').order('model')
console.log('Before:'); for (const e of before) console.log(`  ${e.model.padEnd(8)} ${e.emissions_standard}`)
const { data, error } = await supabase.from('engines')
  .update({ emissions_standard: 'U.S. EPA Stationary' })
  .eq('brand', 'Caterpillar').eq('fuel_type', 'Natural Gas').eq('emissions_standard', 'Unregulated')
  .select('id')
if (error) { console.error('✗', error.message); process.exit(1) }
console.log(`\n✓ relabeled ${data.length} Caterpillar gas rows -> "U.S. EPA Stationary"`)
