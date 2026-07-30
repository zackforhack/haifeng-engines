import fs from 'node:fs'

export function loadLocalEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#') || !line.includes('=')) continue
        const separator = line.indexOf('=')
        const key = line.slice(0, separator).trim()
        const value = line
          .slice(separator + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '')
        if (key && process.env[key] == null) process.env[key] = value
      }
    } catch {
      // Local environment files are optional in CI.
    }
  }
}

export function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}
