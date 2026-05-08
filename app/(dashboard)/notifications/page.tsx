'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { Notification } from '@/types'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Notification03Icon, 
  Tick01Icon, 
  Alert01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons'

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications(data ?? [])
    setLoading(false)
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true })
      .eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  if (!mounted) return null

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="pb-12">
      <Header title="Notification Center" />
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Recent Alerts</h2>
            <p className="text-sm text-white/40 font-medium">
              {unread > 0 ? `You have ${unread} unread notifications` : 'Your inbox is clear'}
            </p>
          </div>
          {unread > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllRead}
              className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg px-6 font-bold transition-all"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Card className="glass border-white/5 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Loading Alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/10">
                  <HugeiconsIcon icon={Notification03Icon} className="w-10 h-10" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h3 className="text-xl font-bold text-white">Quiet for now</h3>
                  <p className="text-sm text-white/40 mt-2 font-medium">When your automated jobs run, system alerts and failure notices will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-5 p-6 transition-colors group",
                      !n.is_read ? 'bg-indigo-500/[0.03] hover:bg-indigo-500/[0.05]' : 'hover:bg-white/[0.02]'
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                      !n.is_read 
                        ? 'bg-indigo-500/20 border-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(79,70,229,0.1)]' 
                        : 'bg-white/5 border-white/10 text-white/20'
                    )}>
                      {!n.is_read ? <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5" /> : <HugeiconsIcon icon={Tick01Icon} className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {n.job_title && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{n.job_title}</span>
                        )}
                        <span className="text-[10px] text-white/20 font-bold">•</span>
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                          {new Date(n.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm mt-1 leading-relaxed",
                        !n.is_read ? 'text-white font-bold' : 'text-white/60 font-medium'
                      )}>{n.message}</p>
                    </div>

                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
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
