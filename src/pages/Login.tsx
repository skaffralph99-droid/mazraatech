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
    <div className="min-h-screen bg-farm-bg flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #1a2416 0%, #141810 40%, #0f1210 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 animate-fade-up">
          <div className="text-7xl mb-5 animate-float">🌾</div>
          <h1 className="text-4xl font-black tracking-wider animate-fade-up delay-1"><span className="text-gradient">MazraaTech</span></h1>
          <p className="text-farm-dim text-xs tracking-[0.3em] mt-3 animate-fade-up delay-2">إدارة المزرعة الذكية</p>
        </div>
        <form onSubmit={submit} className="space-y-4 animate-fade-up delay-3">
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30,36,25,0.9), rgba(20,24,16,0.95))', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="h-1 bg-gradient-to-l from-green-400 via-emerald-400 to-teal-400 rounded-full -mt-4 -mx-4 mb-6 rounded-b-none" />
            <div className="space-y-4">
              <div>
                <label className="label-f">البريد الإلكتروني</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-f" placeholder="your@email.com" autoComplete="email" />
              </div>
              <div>
                <label className="label-f">كلمة المرور</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="input-f" placeholder="••••••" autoComplete="current-password" />
              </div>
              {err && <p className="text-red-400 text-sm font-semibold animate-fade-in">{err}</p>}
              <button type="submit" disabled={loading} className="btn-green text-base mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                    جاري الدخول...
                  </span>
                ) : 'دخول ←'}
              </button>
            </div>
          </div>
        </form>
        <p className="text-center text-farm-dim/40 text-[10px] mt-10 animate-fade-in delay-5">MazraaTech v1.0 · TrendzLB</p>
      </div>
    </div>
  )
}
