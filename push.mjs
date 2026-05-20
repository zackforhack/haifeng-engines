import git from 'isomorphic-git'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const http = require('./node_modules/isomorphic-git/http/node/index.cjs')
import fs from 'fs'
import path from 'path'

const dir = process.cwd()
const token = process.env.GH_TOKEN
const username = 'zackforhack'
const repo = 'haifeng-engines'

async function run() {
  console.log('Initialising git repo...')
  await git.init({ fs, dir })

  await git.setConfig({ fs, dir, path: 'user.name', value: 'zackforhack' })
  await git.setConfig({ fs, dir, path: 'user.email', value: 'zackforhack@users.noreply.github.com' })

  console.log('Staging all files...')
  await git.add({ fs, dir, filepath: '.' })
  // Remove workflow file from index temporarily (needs 'workflow' token scope)
  await git.remove({ fs, dir, filepath: '.github/workflows/ci.yml' }).catch(() => {})

  console.log('Committing...')
  await git.commit({
    fs,
    dir,
    message: 'Initial scaffold: Diesel Engine Encyclopedia\n\nNext.js 14 + Supabase + Vercel CI/CD setup\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>',
    author: { name: 'zackforhack', email: 'zackforhack@users.noreply.github.com' },
  })

  console.log('Pushing to GitHub...')
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    remoteRef: 'main',
    url: `https://github.com/${username}/${repo}.git`,
    onAuth: () => ({ username: token, password: '' }),
    force: false,
  })

  console.log(`Done! https://github.com/${username}/${repo}`)
}

run().catch((err) => { console.error(err.message); process.exit(1) })
