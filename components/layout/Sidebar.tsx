'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  DashboardSquare01Icon, 
  Calendar03Icon, 
  Notification03Icon, 
  Logout01Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
  { href: '/jobs', label: 'Cron Jobs', icon: Calendar03Icon },
  { href: '/notifications', label: 'Notifications', icon: Notification03Icon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen glass-dark border-r border-white/5 flex flex-col shrink-0 z-50">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <HugeiconsIcon icon={Clock01Icon} className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white">CronJob</div>
            <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Scheduler</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 font-bold">Menu</div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-full" />
              )}
              <HugeiconsIcon 
                icon={Icon}
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white/70"
                )} 
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full group"
        >
          <HugeiconsIcon icon={Logout01Icon} className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
