'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  ArrowLeft02Icon, 
  Link01Icon, 
  Calendar03Icon, 
  Mail01Icon,
  GlobalIcon,
  Clock01Icon
} from '@hugeicons/core-free-icons'

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 min', value: '*/5 * * * *' },
  { label: 'Every 15 min', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily midnight', value: '0 0 * * *' },
  { label: 'Every Monday 9am', value: '0 9 * * 1' },
]

export default function NewJobPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [schedule, setSchedule] = useState('*/5 * * * *')
  const [notifyOnFailure, setNotifyOnFailure] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('cron_jobs').insert({
      title,
      url,
      schedule,
      notify_on_failure: notifyOnFailure,
      is_enabled: true,
      user_id: user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/jobs')
    }
  }

  return (
    <div className="pb-12">
      <Header title="Configure New Automation" />
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <button 
          onClick={() => router.push('/jobs')}
          className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Schedules
        </button>

        <Card className="glass border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <HugeiconsIcon icon={Clock01Icon} className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-white">Cron Configuration</CardTitle>
                <p className="text-sm text-white/40 font-medium">Define the execution logic for your task</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-shake">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40">Job Identity</label>
                  <div className="relative group">
                    <Input
                      placeholder="e.g. Daily Data Sync"
                      className="h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all font-medium"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40">Endpoint Target</label>
                  <div className="relative group">
                    <HugeiconsIcon icon={GlobalIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      type="url"
                      placeholder="https://api.yoursite.com/cron"
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all font-medium"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40">Execution Schedule</label>
                  <code className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-black border border-indigo-500/20">CRONTAB FORMAT</code>
                </div>
                <div className="relative group">
                  <HugeiconsIcon icon={Calendar03Icon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    placeholder="* * * * *"
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white font-black tracking-widest placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    value={schedule}
                    onChange={e => setSchedule(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setSchedule(p.value)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg border transition-all duration-300",
                        schedule === p.value
                          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/10"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={notifyOnFailure}
                      onChange={e => setNotifyOnFailure(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
                    <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Failure Notifications</span>
                    <p className="text-xs text-white/20 font-medium">Alert me via email if this execution fails</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                  {loading ? 'Initializing...' : 'Deploy Automation'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/jobs')}
                  className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
