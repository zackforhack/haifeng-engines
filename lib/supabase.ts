import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Catalog records change independently of the application source. Version the
// server-side fetch key by deployment so every Vercel build reads current data,
// then allow a practical runtime cache window for the programmatic pages.
const catalogCacheVersion =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.CATALOG_CACHE_VERSION

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers)
      if (catalogCacheVersion) {
        headers.set('x-haifeng-catalog-version', catalogCacheVersion)
      }
      return fetch(input, { ...init, headers, next: { revalidate: 3600 } })
    },
  },
})
