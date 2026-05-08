'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { CronJob } from '@/types'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Layers01Icon, 
  Tick01Icon, 
  Alert01Icon,
  ArrowRight01Icon,
  Calendar03Icon
} from '@hugeicons/core-free-icons'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, unread: 0 })
  const [recentJobs, setRecentJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) return null

  return (
    <div className="pb-12">
      <Header title="Dashboard Overview" />
      <div className="p-8 space-y-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={Layers01Icon} 
            label="Total Cron Jobs" 
            value={stats.total} 
            color="indigo" 
            trend="+12%"
          />
          <StatCard 
            icon={Tick01Icon} 
            label="Active Schedules" 
            value={stats.active} 
            color="emerald" 
            trend="Live"
          />
          <StatCard 
            icon={Alert01Icon} 
            label="System Alerts" 
            value={stats.unread} 
            color="amber" 
            trend="Needs Attention"
          />
        </div>

        {/* Recent Activity Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <p className="text-sm text-white/40">Manage your latest job deployments</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group">
              View all jobs <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <Card className="glass overflow-hidden border-white/5">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-sm text-white/40 font-medium">Fetching your data...</p>
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                    <HugeiconsIcon icon={Calendar03Icon} className="w-8 h-8" />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <p className="text-white font-bold">No active jobs found</p>
                    <p className="text-sm text-white/40 mt-1">Get started by creating your first automated cron job.</p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
                    Create New Job
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-left text-white/40">
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Title & Description</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Schedule</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Last Run</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentJobs.map(job => (
                        <tr key={job.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                          <td className="px-6 py-5">
                            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</div>
                            <div className="text-xs text-white/40 mt-1 truncate max-w-[200px]">ID: {job.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <code className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-500/20">
                                {job.schedule}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${job.is_enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                              <span className={`text-xs font-bold ${job.is_enabled ? 'text-emerald-400' : 'text-white/40'}`}>
                                {job.is_enabled ? 'Operational' : 'Paused'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-white/40 font-medium">
                            {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, trend }: { icon: any; label: string; value: number; color: string; trend: string }) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
  }
  
  return (
    <Card className="glass group hover:border-white/20 transition-all duration-500 overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${colors[color]} opacity-10 blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-linear-to-br ${colors[color]} border shadow-inner`}>
            <HugeiconsIcon icon={Icon} className="w-6 h-6" />
          </div>
          <div className={`text-[10px] font-bold px-2 py-1 rounded-full border ${colors[color]} bg-white/5`}>
            {trend}
          </div>
        </div>
        <div className="mt-6">
          <p className="text-3xl font-black text-white tracking-tight">{value}</p>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
