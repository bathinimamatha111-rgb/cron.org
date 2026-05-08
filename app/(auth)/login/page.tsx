'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { Clock01Icon, Mail01Icon, LockPasswordIcon } from '@hugeicons/core-free-icons'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-mesh">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <Card className="w-full max-w-md glass relative z-10 border-white/10 shadow-2xl">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <HugeiconsIcon icon={Clock01Icon} className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-white">Welcome Back</CardTitle>
            <p className="text-sm text-white/40 font-medium">Log in to manage your cron schedules</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <HugeiconsIcon icon={Mail01Icon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <HugeiconsIcon icon={LockPasswordIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-10 pt-4">
          <p className="text-sm text-white/40 font-medium">
            New here?{' '}
            <Link href="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
