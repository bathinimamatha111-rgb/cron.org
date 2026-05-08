'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { CronJob } from '@/types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  ViewIcon,
  Delete02Icon,
  Settings02Icon,
  GlobalIcon,
  Calendar03Icon,
  Tick01Icon,
  CircleIcon
} from '@hugeicons/core-free-icons'

export default function JobsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadJobs()
  }, [])

  async function loadJobs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserEmail(user.email ?? '')

    const { data } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setJobs(data ?? [])
    setLoading(false)
  }

  async function toggleJob(id: string, current: boolean) {
    const { data } = await supabase
      .from('cron_jobs')
      .update({ is_enabled: !current })
      .eq('id', id)
      .select()
      .single()

    if (data) {
      setJobs(prev => prev.map(j => j.id === id ? data : j))
    }
  }

  async function toggleNotify(id: string, current: boolean) {
    const { data } = await supabase
      .from('cron_jobs')
      .update({ notify_on_failure: !current })
      .eq('id', id)
      .select()
      .single()

    if (data) {
      setJobs(prev => prev.map(j => j.id === id ? data : j))
    }
  }

  async function deleteJob(id: string) {
    if (!confirm('Are you sure you want to delete this job?')) return
    await supabase.from('cron_jobs').delete().eq('id', id)
    setJobs(prev => prev.filter(j => j.id !== id))
    setSelectedIds(prev => prev.filter(sid => sid !== id))
  }

  async function deleteSelected() {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} jobs?`)) return
    setDeleting(true)
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .in('id', selectedIds)

    if (!error) {
      setJobs(prev => prev.filter(j => !selectedIds.includes(j.id)))
      setSelectedIds([])
    }
    setDeleting(false)
  }

  function toggleSelectAll() {
    if (selectedIds.length === jobs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(jobs.map(j => j.id))
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  if (!mounted) return null

  return (
    <div className="pb-12">
      <Header title="Cron Jobs Management" />
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Active Schedules</h2>
            <p className="text-sm text-white/40 font-medium">You have {jobs.length} total automation tasks configured</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <Button
                onClick={deleteSelected}
                disabled={deleting}
                className="h-12 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-300"
              >
                <HugeiconsIcon icon={Delete02Icon} className="w-5 h-5" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
            <Link href="/jobs/new">
              <Button className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center gap-2">
                <HugeiconsIcon icon={Add01Icon} className="w-5 h-5" />
                Create New Job
              </Button>
            </Link>
          </div>
        </div>

        <Card className="glass border-white/5 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Loading Jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/10">
                  <HugeiconsIcon icon={Calendar03Icon} className="w-10 h-10" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h3 className="text-xl font-bold text-white">No Jobs Found</h3>
                  <p className="text-sm text-white/40 mt-2 font-medium">Your automation suite is currently empty. Start by adding your first scheduled task.</p>
                </div>
                <Link href="/jobs/new">
                  <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-xl font-bold transition-all">
                    Initialize First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-left text-white/40">
                      <th className="pl-6 py-5 w-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-indigo-500 transition-all cursor-pointer"
                          checked={selectedIds.length === jobs.length && jobs.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Job Identity</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Full ID</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Owner Email</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Endpoint</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Frequency</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Alerts</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Created</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Updated</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {jobs.map(job => (
                      <tr key={job.id} className={cn(
                        "hover:bg-white/[0.02] transition-colors group",
                        selectedIds.includes(job.id) && "bg-indigo-500/[0.02]"
                      )}>
                        <td className="pl-6 py-6">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-indigo-500 transition-all cursor-pointer"
                            checked={selectedIds.includes(job.id)}
                            onChange={() => toggleSelect(job.id)}
                          />
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                              job.is_enabled
                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                : "bg-white/5 border-white/10 text-white/20"
                            )}>
                              <HugeiconsIcon icon={Settings02Icon} className="w-5 h-5" />
                            </div>
                            <div className="font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors whitespace-nowrap">{job.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-mono text-[10px] text-white/40">
                          {job.id}
                        </td>
                        <td className="px-6 py-6 text-indigo-400 font-bold text-[11px]">
                          {userEmail}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 text-white/60 font-medium group-hover:text-white transition-colors">
                            <HugeiconsIcon icon={GlobalIcon} className="w-4 h-4 text-white/20" />
                            <span className="truncate max-w-[150px]">{job.url}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <code className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black border border-indigo-500/20">
                            {job.schedule}
                          </code>
                        </td>
                        <td className="px-6 py-6 text-white/40 font-medium">
                          <button
                            onClick={() => toggleNotify(job.id, job.notify_on_failure)}
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-hidden",
                              job.notify_on_failure ? "bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/10"
                            )}
                            title={job.notify_on_failure ? "Turn Off Email Alerts" : "Turn On Email Alerts"}
                          >
                            <span className={cn(
                              "inline-block h-3 w-3 rounded-full bg-white shadow-md transition-transform duration-300",
                              job.notify_on_failure ? "translate-x-5" : "translate-x-1"
                            )} />
                          </button>
                        </td>
                        <td className="px-6 py-6">
                          <button
                            onClick={() => toggleJob(job.id, job.is_enabled)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-hidden",
                              job.is_enabled ? "bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]" : "bg-white/10"
                            )}
                          >
                            <span className={cn(
                              "inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-300",
                              job.is_enabled ? "translate-x-6" : "translate-x-1"
                            )} />
                          </button>
                        </td>
                        <td className="px-6 py-6 text-white/40 font-medium whitespace-nowrap">
                          {job.created_at ? new Date(job.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) :'-'}
                        </td>
                        <td className="px-6 py-6 text-indigo-400/60 font-medium whitespace-nowrap">
                          {job.updated_at ? new Date(job.updated_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : '-'}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/jobs/${job.id}`)}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                              title="Edit Job"
                            >
                              <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete Job"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
