'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { CronJob } from '@/types'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  ArrowLeft02Icon, 
  PlayIcon, 
  Delete02Icon, 
  GlobalIcon, 
  Calendar03Icon, 
  Mail01Icon,
  Clock01Icon,
  Tick01Icon,
  Alert01Icon,
  Settings02Icon
} from '@hugeicons/core-free-icons'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [job, setJob] = useState<CronJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<{ status: string; message: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', url: '', schedule: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function load() {
      const { id } = await params
      const { data } = await supabase.from('cron_jobs').select('*').eq('id', id).single()
      if (data) {
        setJob(data)
        setEditForm({ title: data.title, url: data.url, schedule: data.schedule })
      }
      setLoading(false)
    }
    load()
  }, [params])

  async function saveChanges() {
    if (!job) return
    setSaving(true)
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({
        title: editForm.title,
        url: editForm.url,
        schedule: editForm.schedule
      })
      .eq('id', job.id)
      .select()
      .single()

    if (!error && data) {
      setJob(data)
      setEditing(false)
    }
    setSaving(false)
  }

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
      setRunResult({ status: 'failed', message: 'Not logged in. Please refresh and login again.' })
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
      setRunResult({ status: 'failed', message: `Error: ${result.error} ${result.detail ?? ''}` })
    } else if (result.status === 'success') {
      setRunResult({ status: 'success', message: `Job executed successfully in ${result.duration}ms` })
    } else {
      setRunResult({ status: 'failed', message: `Execution failed: ${result.errorMsg ?? result.error}` })
    }

    setRunning(false)
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="pb-12">
        <Header title="Automation Details" />
        <div className="p-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Loading Details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="pb-12">
        <Header title="Error" />
        <div className="p-20 text-center space-y-4">
          <HugeiconsIcon icon={Alert01Icon} className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white font-bold">Automation not found</p>
          <Button onClick={() => router.push('/jobs')} variant="outline">Back to Schedules</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-12">
      <Header title="Automation Insights" />
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <button 
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Schedules
          </button>
          
          <div className="flex items-center gap-3">
            {!editing ? (
              <Button 
                onClick={() => setEditing(true)}
                className="h-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg px-6 font-bold transition-all flex items-center gap-2"
              >
                <HugeiconsIcon icon={Settings02Icon} className="w-4 h-4" />
                Edit Configuration
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={saveChanges}
                  disabled={saving}
                  className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  onClick={() => {
                    if (job) {
                      setEditing(false)
                      setEditForm({ title: job.title, url: job.url, schedule: job.schedule })
                    }
                  }}
                  variant="ghost"
                  className="h-10 text-white/40 hover:text-white hover:bg-white/5 font-bold px-4"
                >
                  Cancel
                </Button>
              </div>
            )}
            <Button 
              onClick={runNow} 
              disabled={running || editing || !job}
              className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-6 font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              {running ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <HugeiconsIcon icon={PlayIcon} className="w-4 h-4" />}
              {running ? 'Executing...' : 'Run Now'}
            </Button>
            <Button 
              variant="outline" 
              onClick={deleteJob}
              disabled={editing || !job}
              className="h-10 border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-white/60 rounded-lg px-4 transition-all"
            >
              <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {runResult && (
          <div className={cn(
            "p-6 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300",
            runResult.status === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              runResult.status === 'success' ? 'bg-emerald-500/20 border-emerald-500/20' : 'bg-red-500/20 border-red-500/20'
            )}>
              {runResult.status === 'success' ? <HugeiconsIcon icon={Tick01Icon} className="w-5 h-5" /> : <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-[10px]">Execution {runResult.status}</p>
              <p className="text-sm font-bold mt-0.5">{runResult.message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="glass border-white/5 col-span-2 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-inner",
                    job?.is_enabled ? "bg-indigo-500/20 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/10 text-white/20"
                  )}>
                    <HugeiconsIcon icon={Clock01Icon} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    {editing ? (
                      <input 
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="bg-white/5 border border-indigo-500/30 rounded-lg px-3 py-1 text-xl font-bold text-white w-full focus:outline-hidden focus:border-indigo-500 transition-all"
                        placeholder="Job Title"
                      />
                    ) : (
                      <CardTitle className="text-2xl font-black text-white">{job?.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn("w-2 h-2 rounded-full", job?.is_enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", job?.is_enabled ? "text-emerald-400" : "text-white/20")}>
                        {job?.is_enabled ? 'Operational' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>
                {!editing && (
                  <button
                    onClick={toggleJob}
                    className={cn(
                      "relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300",
                      job?.is_enabled ? "bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]" : "bg-white/10"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300",
                      job?.is_enabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Target Configuration</label>
                <div className={cn(
                  "bg-white/5 border rounded-2xl p-6 flex items-start gap-4 transition-all group",
                  editing ? "border-indigo-500/30" : "border-white/10 hover:border-indigo-500/20"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-colors",
                    editing ? "text-indigo-400" : "text-white/40 group-hover:text-indigo-400"
                  )}>
                    <HugeiconsIcon icon={GlobalIcon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Endpoint URL</p>
                    {editing ? (
                      <input 
                        type="url"
                        value={editForm.url}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        className="bg-transparent border-b border-indigo-500/20 w-full py-1 text-sm font-bold text-white focus:outline-hidden focus:border-indigo-500 transition-all mt-1"
                        placeholder="https://api.example.com/endpoint"
                      />
                    ) : (
                      <p className="text-sm font-bold text-white break-all mt-0.5">{job.url}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className={cn(
                  "bg-white/5 border rounded-2xl p-6 transition-all group",
                  editing ? "border-indigo-500/30" : "border-white/10 hover:border-indigo-500/20"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <HugeiconsIcon icon={Calendar03Icon} className={cn("w-4 h-4 transition-colors", editing ? "text-indigo-400" : "text-white/20 group-hover:text-indigo-400")} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Schedule</span>
                  </div>
                  {editing ? (
                    <input 
                      type="text"
                      value={editForm.schedule}
                      onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                      className="bg-transparent border-b border-indigo-500/20 w-full py-1 text-lg font-black text-white focus:outline-hidden focus:border-indigo-500 transition-all tracking-widest"
                      placeholder="* * * * *"
                    />
                  ) : (
                    <code className="text-lg font-black text-white tracking-widest">{job.schedule}</code>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/20 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Alerts</span>
                  </div>
                  <p className="text-lg font-black text-white">{job.notify_on_failure ? 'ACTIVE' : 'MUTED'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="glass border-white/5 overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-white/40">Deployment Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <p className="text-xs font-bold text-white">System Initialized</p>
                      <p className="text-[10px] text-white/40 font-medium">{job?.created_at ? new Date(job.created_at).toLocaleString() : 'Loading...'}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/20 font-medium italic">No recent execution logs found for this schedule.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/5 overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-white/40">Configuration Meta</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase">Unique Identifer</p>
                  <p className="text-[10px] font-mono text-white/40 break-all">{job?.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase">Owner Context</p>
                  <p className="text-[10px] font-mono text-white/40 break-all">{job?.user_id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
