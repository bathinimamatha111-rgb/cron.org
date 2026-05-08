import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase(token: string) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  client.auth.setSession({ access_token: token, refresh_token: '' })
  return client
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase(token)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('cron_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase(token)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('cron_jobs')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
