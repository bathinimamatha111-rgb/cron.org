'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { CronJob } from '@/types'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [job, setJob] = useState<CronJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<{ status: string; message: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { id } = await params
      const { data } = await supabase.from('cron_jobs').select('*').eq('id', id).single()
      setJob(data)
      setLoading(false)
    }
    load()
  }, [params])

  async function toggleJob() {
    if (!job) return
    const { data } = await supabase
      .from('cron_jobs')
      .update({ is_enabled: !job.is_enabled })
      .eq('id', job.id)
      .select()
      .single()
    if (data) setJob(data)
  }

  async function deleteJob() {
    if (!job || !confirm('Delete this job permanently?')) return
    await supabase.from('cron_jobs').delete().eq('id', job.id)
    router.push('/jobs')
  }

  async function runNow() {
    if (!job) return
    setRunning(true)
    setRunResult(null)

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.access_token) {
      setRunResult({ status: 'failed', message: '❌ Not logged in. Please refresh and login again.' })
      setRunning(false)
      return
    }

    const res = await fetch('/api/jobs/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ job_id: job.id }),
    })

    const result = await res.json()

    if (result.error && !result.status) {
      setRunResult({ status: 'failed', message: `❌ Error: ${result.error} ${result.detail ?? ''} ${result.notifError ?? ''}` })
    } else if (result.status === 'success') {
      setRunResult({ status: 'success', message: `✅ Job ran successfully! Response: HTTP ${result.responseCode} in ${result.duration}ms` })
    } else {
      setRunResult({ status: 'failed', message: `❌ Job failed: ${result.errorMsg ?? result.error}` })
    }

    setRunning(false)
  }

  if (loading) {
    return (
      <div>
        <Header title="Job Details" />
        <p className="p-6 text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div>
        <Header title="Job Details" />
        <p className="p-6 text-sm text-gray-400">Job not found.</p>
      </div>
    )
  }

  return (
    <div>
      <Header title={job.title} />
      <div className="p-6 space-y-6 max-w-2xl">

        <button
          onClick={() => router.push('/jobs')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Jobs
        </button>

        {/* Run Result Message */}
        {runResult && (
          <div className={`p-4 rounded-lg text-sm font-medium ${
            runResult.status === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {runResult.message}
            <p className="text-xs mt-1 font-normal opacity-70">Check Notifications page to see the saved alert.</p>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-base">{job.title}</CardTitle>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleJob}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  job.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  job.is_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm text-gray-500">
                {job.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">URL</p>
              <p className="text-sm font-medium break-all">{job.url}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Schedule</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{job.schedule}</code>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Notify on failure</p>
              <p className="text-sm">{job.notify_on_failure ? '✅ Yes' : '❌ No'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-600">{new Date(job.created_at).toLocaleString()}</p>
            </div>

            <div className="pt-4 border-t flex gap-3">
              <Button onClick={runNow} disabled={running}>
                {running ? 'Running...' : '▶ Run Now'}
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteJob}>
                Delete Job
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
