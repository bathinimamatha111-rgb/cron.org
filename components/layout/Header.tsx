'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification03Icon, UserCircle02Icon } from '@hugeicons/core-free-icons'

export default function Header({ title }: { title: string }) {
  const [mounted, setMounted] = useState(false)
  const [unread, setUnread] = useState(0)
  const [email, setEmail] = useState('')

  useEffect(() => {
    setMounted(true)
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      setUnread(count ?? 0)
    }
    load()
  }, [])

  if (!mounted) return <div className="h-[89px]" /> // Placeholder height

  return (
    <header className="glass sticky top-0 z-40 px-8 py-5 flex items-center justify-between border-b border-white/5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-xs text-white/40 font-medium">Welcome back, {email.split('@')[0]}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="/notifications" className="relative group p-2 rounded-xl hover:bg-white/5 transition-colors">
          <HugeiconsIcon icon={Notification03Icon} className="w-6 h-6 text-white/60 group-hover:text-indigo-400 transition-colors" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-4 ring-background">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{email.split('@')[0]}</p>
            <p className="text-[10px] text-white/40 font-medium mt-1 uppercase tracking-tighter">Pro Member</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center group cursor-pointer hover:border-indigo-500/50 transition-all">
            <HugeiconsIcon icon={UserCircle02Icon} className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
