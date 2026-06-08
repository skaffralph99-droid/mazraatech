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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌾</span>
          <h1 className="text-farm-green text-2xl font-black tracking-wide mt-3">MazraaTech</h1>
          <p className="text-farm-dim text-xs tracking-widest mt-1">إدارة المزرعة الذكية</p>
        </div>
        <form onSubmit={submit} className="card space-y-4">
          <div className="h-1 bg-farm-green rounded-full -mt-4 -mx-4 mb-4 rounded-t-2xl" />
          <div>
            <label className="label-f">البريد الإلكتروني</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-f" placeholder="your@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="label-f">كلمة المرور</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="input-f" placeholder="••••••" autoComplete="current-password" />
          </div>
          {err && <p className="text-red-400 text-sm font-semibold">{err}</p>}
          <button type="submit" disabled={loading} className="btn-green">{loading ? 'جاري الدخول...' : 'دخول'}</button>
        </form>
      </div>
    </div>
  )
}
