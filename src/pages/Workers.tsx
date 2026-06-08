import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, User } from 'lucide-react'
import { format } from 'date-fns'

export default function Workers() {
  const nav = useNavigate()
  const [workers, setWorkers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [lands, setLands] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showLog, setShowLog] = useState<any>(null)

  // Add worker form
  const [wName, setWName] = useState('')
  const [wPhone, setWPhone] = useState('')
  const [wRole, setWRole] = useState('laborer')
  const [wRate, setWRate] = useState('15')

  // Log form
  const [logLand, setLogLand] = useState('')
  const [logDays, setLogDays] = useState('1')
  const [logTask, setLogTask] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('farm_workers').select('*').eq('is_active', true).order('name').then(({ data }) => setWorkers(data ?? []))
    supabase.from('farm_worker_logs').select('*, farm_workers(name), farm_lands(name)').order('date', { ascending: false }).limit(50).then(({ data }) => setLogs(data ?? []))
    supabase.from('farm_lands').select('id, name').eq('is_active', true).order('name').then(({ data }) => setLands(data ?? []))
  }
  useEffect(() => { load() }, [])

  const addWorker = async () => {
    if (!wName.trim()) return
    setSaving(true)
    await supabase.from('farm_workers').insert({ name: wName.trim(), phone: wPhone || null, role: wRole, daily_rate: parseFloat(wRate) || 0 })
    setSaving(false); setShowAdd(false); setWName(''); setWPhone(''); setWRate('15')
    load()
  }

  const addLog = async () => {
    if (!showLog || !logLand) return
    setSaving(true)
    const days = parseFloat(logDays) || 1
    const paid = days * Number(showLog.daily_rate)
    await supabase.from('farm_worker_logs').insert({ worker_id: showLog.id, land_id: logLand, days_worked: days, amount_paid: paid, task: logTask || null, date: format(new Date(), 'yyyy-MM-dd') })
    // Also add as a cost on that land
    await supabase.from('farm_costs').insert({ land_id: logLand, category: 'workers', amount: paid, date: format(new Date(), 'yyyy-MM-dd'), description: `${showLog.name} — ${days} يوم` })
    setSaving(false); setShowLog(null); setLogLand(''); setLogDays('1'); setLogTask('')
    load()
  }

  const ROLE_LABELS: Record<string, string> = { laborer: 'عامل', driver: 'سائق', foreman: 'مشرف', mechanic: 'ميكانيكي' }

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => nav(-1)} className="text-farm-green text-sm font-bold flex items-center gap-1"><ArrowRight size={16} /> رجوع</button>
      <div className="flex items-center justify-between">
        <h1 className="text-farm-steel text-xl font-black">العمال</h1>
        <button onClick={() => setShowAdd(true)} className="w-10 h-10 rounded-full bg-farm-green flex items-center justify-center"><Plus size={20} className="text-farm-dark" /></button>
      </div>

      {workers.map(w => {
        const wLogs = logs.filter(l => l.worker_id === w.id)
        const totalPaid = wLogs.reduce((s, l) => s + Number(l.amount_paid), 0)
        const totalDays = wLogs.reduce((s, l) => s + Number(l.days_worked), 0)
        return (
          <div key={w.id} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-farm-green/15 flex items-center justify-center"><User size={18} className="text-farm-green" /></div>
              <div className="flex-1">
                <p className="text-farm-steel font-bold">{w.name}</p>
                <p className="text-farm-dim text-xs">{ROLE_LABELS[w.role] ?? w.role} · ${w.daily_rate}/يوم</p>
              </div>
              <div className="text-left">
                <p className="text-farm-steel font-bold text-sm">${totalPaid.toLocaleString()}</p>
                <p className="text-farm-dim text-[10px]">{totalDays} يوم</p>
              </div>
            </div>
            <button onClick={() => setShowLog(w)} className="mt-3 text-farm-green text-xs font-bold flex items-center gap-1"><Plus size={12} /> تسجيل يوم عمل</button>
          </div>
        )
      })}

      {/* Add Worker Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg">عامل جديد</h2>
            <div><label className="label-f">الاسم *</label><input value={wName} onChange={e => setWName(e.target.value)} className="input-f" placeholder="حسن علي" /></div>
            <div><label className="label-f">الهاتف</label><input value={wPhone} onChange={e => setWPhone(e.target.value)} className="input-f" placeholder="+961 71 ..." /></div>
            <div>
              <label className="label-f">الدور</label>
              <div className="flex gap-2">
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setWRole(k)} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${wRole === k ? 'bg-farm-green border-farm-green text-farm-dark' : 'bg-farm-elevated border-farm-border text-farm-dim'}`}>{v}</button>
                ))}
              </div>
            </div>
            <div><label className="label-f">الأجر اليومي ($)</label><input value={wRate} onChange={e => setWRate(e.target.value)} className="input-f" type="number" /></div>
            <div className="flex gap-3">
              <button onClick={addWorker} disabled={saving} className="btn-green flex-1">{saving ? 'جاري...' : 'إضافة'}</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-farm-dim font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Work Modal */}
      {showLog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowLog(null)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg">تسجيل عمل — {showLog.name}</h2>
            <p className="text-farm-dim text-xs">${showLog.daily_rate}/يوم</p>
            <div>
              <label className="label-f">الأرض *</label>
              <div className="flex flex-wrap gap-2">
                {lands.map(l => (
                  <button key={l.id} onClick={() => setLogLand(l.id)} className={`px-3 py-2 rounded-xl text-xs font-bold border ${logLand === l.id ? 'bg-farm-green border-farm-green text-farm-dark' : 'bg-farm-elevated border-farm-border text-farm-dim'}`}>{l.name}</button>
                ))}
              </div>
            </div>
            <div><label className="label-f">عدد الأيام</label><input value={logDays} onChange={e => setLogDays(e.target.value)} className="input-f" type="number" step="0.5" /></div>
            <div><label className="label-f">المهمة</label><input value={logTask} onChange={e => setLogTask(e.target.value)} className="input-f" placeholder="حصاد، تنظيف، زراعة..." /></div>
            <p className="text-farm-green font-black text-center text-lg">المبلغ: ${((parseFloat(logDays) || 0) * showLog.daily_rate).toLocaleString()}</p>
            <div className="flex gap-3">
              <button onClick={addLog} disabled={saving} className="btn-green flex-1">{saving ? 'جاري...' : 'حفظ'}</button>
              <button onClick={() => setShowLog(null)} className="px-4 py-2 text-farm-dim font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
