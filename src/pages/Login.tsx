import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr(error.message)
  }

  return (
    <div className="min-h-screen bg-farm-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-scale-in">🌾</div>
          <h1 className="text-gradient text-3xl font-black tracking-wider animate-fade-up delay-1">MazraaTech</h1>
          <p className="text-farm-dim text-xs tracking-[0.3em] mt-2 animate-fade-up delay-2">إدارة المزرعة الذكية</p>
        </div>
        <form onSubmit={submit} className="card space-y-5 animate-fade-up delay-3">
          <div className="h-1.5 bg-gradient-to-l from-farm-green to-emerald-400 rounded-full -mt-4 -mx-4 rounded-b-none" />
          <div>
            <label className="label-f">البريد الإلكتروني</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-f" placeholder="your@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="label-f">كلمة المرور</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="input-f" placeholder="••••••" autoComplete="current-password" />
          </div>
          {err && <p className="text-red-400 text-sm font-semibold animate-fade-in">{err}</p>}
          <button type="submit" disabled={loading} className="btn-green text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-farm-dark/30 border-t-farm-dark rounded-full animate-spin" />
                جاري الدخول...
              </span>
            ) : 'دخول ←'}
          </button>
        </form>
        <p className="text-center text-farm-dim/50 text-[10px] mt-8 animate-fade-in delay-5">MazraaTech v1.0 · TrendzLB</p>
      </div>
    </div>
  )
}
