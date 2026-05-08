'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-mesh">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        {children}
      </main>
    </div>
  )
}
