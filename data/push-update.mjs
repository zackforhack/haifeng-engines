import git from 'isomorphic-git'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const http = require('/Users/ziqianhuang/haifeng-engines/node_modules/isomorphic-git/http/node/index.cjs')
import fs from 'fs'

const dir = '/Users/ziqianhuang/haifeng-engines'
const token = process.env.GH_TOKEN

await git.add({ fs, dir, filepath: 'components/PDFDownloadList.tsx' })

const sha = await git.commit({
  fs, dir,
  message: 'Improve PDF download buttons — prominent card-style with icon\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>',
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
