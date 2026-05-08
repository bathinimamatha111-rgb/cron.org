import { createClient } from "@supabase/supabase-ts"

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseURL, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: true },
})

