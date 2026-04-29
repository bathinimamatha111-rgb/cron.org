'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { CronJob } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, unread: 0 })
  const [recentJobs, setRecentJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [jobsRes, notifRes] = await Promise.all([
        supabase.from('cron_jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
      ])

      const jobs: CronJob[] = jobsRes.data ?? []
      setStats({
        total: jobs.length,
        active: jobs.filter(j => j.is_enabled).length,
        unread: notifRes.count ?? 0,
      })
      setRecentJobs(jobs.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon="⊞" label="Total Jobs" value={stats.total} color="blue" />
          <StatCard icon="✅" label="Active Jobs" value={stats.active} color="green" />
          <StatCard icon="🔔" label="Unread Alerts" value={stats.unread} color="yellow" />
        </div>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cron Jobs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-gray-400">Loading...</p>
            ) : recentJobs.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">No jobs yet. Create your first cron job!</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{job.title}</td>
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{job.schedule}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          job.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {job.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }
  return (
    <Card>
      <CardContent className="pt-5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${bg[color]}`}>
          <span className="text-base">{icon}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}
