// The PSI diesel rows had older datasheet links (psi/spec-sheets/*-diesel.pdf) from a prior session,
// now superseded by the official PSI-Energy_*-Diesel_Engine.pdf sheets just attached. Remove the old
// links (and their orphaned storage objects) so each diesel shows a single, current datasheet.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const OLD = ['psi/spec-sheets/20l-diesel.pdf','psi/spec-sheets/40l-diesel.pdf','psi/spec-sheets/53l-diesel.pdf','psi/spec-sheets/88l-diesel.pdf']
const { data: del, error } = await supabase.from('engine_pdfs').delete().in('storage_path', OLD).select('id')
if (error) { console.error('✗ delete links:', error.message); process.exit(1) }
console.log(`✓ removed ${del.length} stale diesel datasheet links`)
const { error: se } = await supabase.storage.from('engine-pdfs').remove(OLD)
console.log(se ? `(storage objects: ${se.message})` : `✓ removed ${OLD.length} orphaned storage objects`)
