import git from 'isomorphic-git'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const http = require('/Users/ziqianhuang/haifeng-engines/node_modules/isomorphic-git/http/node/index.cjs')
import fs from 'fs'

const dir = '/Users/ziqianhuang/haifeng-engines'
const token = process.env.GH_TOKEN

await git.add({ fs, dir, filepath: 'data/download-upload-perkins-specsheets.mjs' })

const sha = await git.commit({
  fs, dir,
  message: 'Add Perkins spec sheet download script (37 PDFs from Perkins/Caterpillar CDN)\n\nIndividual ElectropaK datasheets for all 400/1100/1200/1700/2200/2500/2800/4000\nseries engines. Range documents used for engines without individual sheets.\nAll 51 engine records now have linked PDFs in Supabase.\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>',
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
