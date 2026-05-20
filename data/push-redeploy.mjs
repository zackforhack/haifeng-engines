import git from 'isomorphic-git'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const http = require('/Users/ziqianhuang/haifeng-engines/node_modules/isomorphic-git/http/node/index.cjs')
import fs from 'fs'

const dir = '/Users/ziqianhuang/haifeng-engines'
const token = process.env.GH_TOKEN

await git.add({ fs, dir, filepath: 'lib/engines.ts' })
await git.add({ fs, dir, filepath: 'data/upload-pdfs-to-supabase.mjs' })

const sha = await git.commit({
  fs, dir,
  message: 'Trigger redeploy: add PDF datasheets for all 49 Volvo Penta engines\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>',
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

console.log('Pushed — Vercel rebuilding all pages now (~1-2 min)')
