import git from 'isomorphic-git'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const http = require('/Users/ziqianhuang/haifeng-engines/node_modules/isomorphic-git/http/node/index.cjs')
import fs from 'fs'

const dir = '/Users/ziqianhuang/haifeng-engines'
const token = process.env.GH_TOKEN

const files = [
  'data/insert-perkins-unregulated.sql',
  'data/upload-perkins-selectionchart.mjs',
]

for (const f of files) {
  await git.add({ fs, dir, filepath: f })
  console.log('Staged:', f)
}

const sha = await git.commit({
  fs, dir,
  message: 'Add 51 Perkins unregulated engines with full 50/60Hz power ratings\n\nSource: 2026年珀金斯发动机选型表-无排放.pdf\nCovers 400, 1100, 1200, 1700, 2200, 2500, 2800 and 4000 series.\nPDF uploaded to Supabase and linked to all engine records.\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>',
  author: { name: 'zackforhack', email: 'zackforhack@users.noreply.github.com' },
})
console.log('Committed:', sha)

await git.push({
  fs, http, dir,
  remote: 'origin',
  remoteRef: 'main',
  url: 'https://github.com/zackforhack/haifeng-engines.git',
  onAuth: () => ({ username: token, password: '' }),
  force: true,
})
console.log('Pushed to GitHub — Vercel will deploy in ~30 seconds')
