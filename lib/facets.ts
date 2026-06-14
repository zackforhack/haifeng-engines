// Single source of truth for engine facet hub pages (/engines/configuration, /engines/emissions,
// /engines/rpm). Imported by the facet routes, the sitemap, and the "Browse by" block so the set of
// pages, their slugs and labels never drift. Each set is curated to counts that clear the thin-content
// gate (see data/facet-dist.mjs); rare configs/standards are intentionally omitted.

export interface ConfigFacet { token: string; label: string; blurb: string }
export const CONFIG_FACETS: Record<string, ConfigFacet> = {
  'v6':       { token: 'V6',  label: 'V6',        blurb: 'compact 60–90° V6' },
  'v8':       { token: 'V8',  label: 'V8',        blurb: 'V8' },
  'v10':      { token: 'V10', label: 'V10',       blurb: 'V10' },
  'v12':      { token: 'V12', label: 'V12',       blurb: 'high-output V12' },
  'v16':      { token: 'V16', label: 'V16',       blurb: 'large V16' },
  'v20':      { token: 'V20', label: 'V20',       blurb: 'top-of-range V20' },
  'inline-3': { token: 'L3',  label: 'Inline-3',  blurb: 'compact inline-3' },
  'inline-4': { token: 'L4',  label: 'Inline-4',  blurb: 'inline-4' },
  'inline-6': { token: 'L6',  label: 'Inline-6',  blurb: 'inline-6' },
  'inline-8': { token: 'L8',  label: 'Inline-8',  blurb: 'inline-8' },
}

export interface EmissionsFacet { value: string; label: string; blurb: string }
export const EMISSIONS_FACETS: Record<string, EmissionsFacet> = {
  'epa-tier-4-final': { value: 'U.S. EPA Final Tier 4', label: 'U.S. EPA Tier 4 Final', blurb: 'the most stringent U.S. EPA off-road tier' },
  'epa-tier-3':       { value: 'U.S. EPA Tier 3',       label: 'U.S. EPA Tier 3',       blurb: 'U.S. EPA Tier 3' },
  'epa-tier-2':       { value: 'U.S. EPA Tier 2',       label: 'U.S. EPA Tier 2',       blurb: 'U.S. EPA Tier 2' },
  'epa-stationary':   { value: 'U.S. EPA Stationary',   label: 'U.S. EPA Stationary',   blurb: 'U.S. EPA stationary spark-ignition / emergency certification' },
  'euro-stage-v':     { value: 'Euro Stage V',          label: 'Euro Stage V',          blurb: 'the current EU non-road stage' },
  'euro-stage-iiia':  { value: 'Euro Stage IIIA',       label: 'Euro Stage IIIA',       blurb: 'Euro Stage IIIA' },
  'china-stage-iii':  { value: 'China National Stage III', label: 'China Stage III',    blurb: 'China National Stage III (GB 20891)' },
  'china-stage-iv':   { value: 'China National Stage IV',  label: 'China Stage IV',     blurb: 'China National Stage IV' },
}

export interface RpmFacet { rpm: number; label: string; blurb: string }
export const RPM_FACETS: Record<string, RpmFacet> = {
  '1500-rpm': { rpm: 1500, label: '1500 RPM', blurb: '1,500 rpm — the standard 4-pole speed for 50 Hz power' },
  '1800-rpm': { rpm: 1800, label: '1800 RPM', blurb: '1,800 rpm — the standard 4-pole speed for 60 Hz power' },
  '1000-rpm': { rpm: 1000, label: '1000 RPM', blurb: '1,000 rpm — low-speed running for long life and continuous duty' },
}
