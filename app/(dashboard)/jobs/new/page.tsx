'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'

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
    <div>
      <Header title="New Cron Job" />
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Cron Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  placeholder="e.g. Daily backup"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL to call</label>
                <Input
                  type="url"
                  placeholder="https://example.com/api/run"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">This URL will be called on your schedule</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Schedule</label>
                <Input
                  placeholder="* * * * *"
                  value={schedule}
                  onChange={e => setSchedule(e.target.value)}
                  required
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setSchedule(p.value)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                        schedule === p.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-400 text-gray-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Format: <code className="bg-gray-100 px-1 rounded">minute hour day month weekday</code>
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnFailure}
                    onChange={e => setNotifyOnFailure(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Notify me when this job fails</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Job'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/jobs')}>
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
