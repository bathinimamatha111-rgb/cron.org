'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { CronJob } from '@/types'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setJobs(data ?? [])
    setLoading(false)
  }

  async function toggleJob(id: string, current: boolean) {
    await supabase.from('cron_jobs').update({ is_enabled: !current }).eq('id', id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, is_enabled: !current } : j))
  }

  async function deleteJob(id: string) {
    if (!confirm('Are you sure you want to delete this job?')) return
    await supabase.from('cron_jobs').delete().eq('id', id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  return (
    <div>
      <Header title="Cron Jobs" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <p className="text-sm text-gray-500">{jobs.length} job(s) total</p>
          <Link href="/jobs/new">
            <Button>+ New Cron Job</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-gray-400">Loading...</p>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 mb-4">No cron jobs yet.</p>
                <Link href="/jobs/new">
                  <Button>Create your first job</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">URL</th>
                      <th className="px-4 py-3">Schedule</th>
                      <th className="px-4 py-3">Enabled</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className="font-medium text-blue-600 hover:underline text-left"
                          >
                            {job.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{job.url}</td>
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{job.schedule}</code>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleJob(job.id, job.is_enabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              job.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                              job.is_enabled ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => router.push(`/jobs/${job.id}`)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View
                            </button>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Delete
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
