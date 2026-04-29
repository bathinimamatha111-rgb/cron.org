import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'No token provided' }, { status: 401 })

    const supabase = getSupabase(token)

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return Response.json({ error: 'Session expired. Please login again.' }, { status: 401 })
    }

    const { job_id } = await request.json()
    if (!job_id) return Response.json({ error: 'job_id is required' }, { status: 400 })

    // Get job from database
    const { data: job, error: jobError } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return Response.json({ error: 'Job not found', detail: jobError?.message }, { status: 404 })
    }

    // Call the job URL
    const start = Date.now()
    let status = 'success'
    let responseCode: number | null = null
    let errorMsg: string | null = null

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(job.url, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeout)
      responseCode = res.status
      status = res.ok ? 'success' : 'failed'
      if (!res.ok) errorMsg = `HTTP ${res.status} error`

    } catch (fetchErr: any) {
      status = 'failed'
      errorMsg = fetchErr?.name === 'AbortError'
        ? 'Request timed out after 15 seconds'
        : (fetchErr?.message ?? 'Request failed')
    }

    const duration = Date.now() - start

    // Save notification to database
    const message = status === 'success'
      ? `✅ "${job.title}" ran successfully — HTTP ${responseCode} in ${duration}ms`
      : `❌ "${job.title}" failed — ${errorMsg}`

    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: user.id,
      job_title: job.title,
      message,
      is_read: false,
    })

    if (notifError) {
      return Response.json({
        status,
        responseCode,
        duration,
        errorMsg,
        warning: `Job ran but notification failed to save: ${notifError.message}`,
      })
    }

    return Response.json({ status, responseCode, duration, errorMsg })

  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}
