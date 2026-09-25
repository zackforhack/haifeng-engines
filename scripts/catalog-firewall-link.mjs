import { readFileSync } from 'node:fs'

const [team, project = 'haifeng-engines'] = process.argv.slice(2)
if (!team || process.argv.length > 4) {
  console.error('Usage: node scripts/catalog-firewall-link.mjs <vercel-team-slug> [project-slug]')
  process.exit(1)
}
const rule = JSON.parse(readFileSync(new URL('../ops/vercel/catalog-rate-limit.json', import.meta.url), 'utf8'))
const url = new URL(`https://vercel.com/${encodeURIComponent(team)}/${encodeURIComponent(project)}/firewall/configure/rule/new`)
url.searchParams.set('template', JSON.stringify(rule))
console.log(url.href)
