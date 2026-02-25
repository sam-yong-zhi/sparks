import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role (bypasses RLS, bypasses Next.js Data Cache)
export function supabaseServer() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url: RequestInfo | URL, options: RequestInit = {}) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  })
}

// Browser-side singleton with anon key
let browserClient: ReturnType<typeof createClient> | null = null
export function supabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}
