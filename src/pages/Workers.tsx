import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, User, Users } from 'lucide-react'
import { format } from 'date-fns'
import { money } from '../lib/i18n'

const ROLE_LABELS: Record<string, string> = { laborer: 'عامل', driver: 'سائق', foreman: 'مشرف', mechanic: 'ميكانيكي' }
const ROLE_COLORS: Record<string, string> = { laborer: '#3b82f6', driver: '#f59e0b', foreman: '#8b5cf6', mechanic: '#ef4444' }

export default function Workers() {
  const nav = useNavigate()
  const [workers, setWorkers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [lands, setLands] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showLog, setShowLog] = useState<any>(null)
  const [wName, setWName] = useState(''); const [wPhone, setWPhone] = useState('')
  const [wRole, setWRole] = useState('laborer'); const [wRate, setWRate] = useState('15')
  const [logLand, setLogLand] = useState(''); const [logDays, setLogDays] = useState('1'); const [logTask, setLogTask] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('farm_workers').select('*').eq('is_active', true).order('name').then(({ data }) => setWorkers(data ?? []))
    supabase.from('farm_worker_logs').select('*, farm_workers(name), farm_lands(name)').order('date', { ascending: false }).limit(50).then(({ data }) => setLogs(data ?? []))
    supabase.from('farm_lands').select('id, name').eq('is_active', true).order('name').then(({ data }) => setLands(data ?? []))
  }
  useEffect(() => { load() }, [])

  const addWorker = async () => {
    if (!wName.trim()) return; setSaving(true)
    await supabase.from('farm_workers').insert({ name: wName.trim(), phone: wPhone || null, role: wRole, daily_rate: parseFloat(wRate) || 0 })
    setSaving(false); setShowAdd(false); setWName(''); setWPhone(''); setWRate('15'); load()
  }

  const addLog = async () => {
    if (!showLog || !logLand) return; setSaving(true)
    const days = parseFloat(logDays) || 1
    const paid = days * Number(showLog.daily_rate)
    await supabase.from('farm_worker_logs').insert({ worker_id: showLog.id, land_id: logLand, days_worked: days, amount_paid: paid, task: logTask || null, date: format(new Date(), 'yyyy-MM-dd') })
    await supabase.from('farm_costs').insert({ land_id: logLand, category: 'workers', amount: paid, date: format(new Date(), 'yyyy-MM-dd'), description: showLog.name + ' — ' + days + ' يوم' })
    setSaving(false); setShowLog(null); setLogLand(''); setLogDays('1'); setLogTask(''); load()
  }

  const totalPaidAll = logs.reduce((s, l) => s + Number(l.amount_paid), 0)

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => nav('/')} className="text-farm-green text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"><ArrowRight size={16} /> الرئيسية</button>
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1"><Users size={16} className="text-purple-400" /><p className="text-farm-dim text-[10px] font-bold tracking-wider">إدارة العمال</p></div>
          <h1 className="text-farm-steel text-2xl font-black">العمال</h1>
          <p className="text-farm-dim text-xs mt-0.5">{workers.length} عامل · إجمالي الأجور: {money(totalPaidAll)}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-90 transition-all">
          <Plus size={22} className="text-white" />
        </button>
      </div>

      {workers.map((w, i) => {
        const wLogs = logs.filter(l => l.worker_id === w.id)
        const totalPaid = wLogs.reduce((s, l) => s + Number(l.amount_paid), 0)
        const totalDays = wLogs.reduce((s, l) => s + Number(l.days_worked), 0)
        const color = ROLE_COLORS[w.role] ?? '#78716c'
        return (
          <div key={w.id} className={`card animate-fade-up delay-${Math.min(i + 1, 10)}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
                <User size={20} style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="text-farm-steel font-bold">{w.name}</p>
                <p className="text-farm-dim text-xs flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: color + '20', color }}>{ROLE_LABELS[w.role] ?? w.role}</span>
                  <span>{money(w.daily_rate)}/يوم</span>
                </p>
              </div>
              <div className="text-left">
                {totalPaid > 0 && <p className="text-farm-steel font-black text-sm">{money(totalPaid)}</p>}
                {totalDays > 0 && <p className="text-farm-dim text-[10px]">{totalDays} يوم</p>}
              </div>
            </div>
            <button onClick={() => setShowLog(w)} className="mt-3 flex items-center gap-1.5 text-farm-green text-xs font-bold hover:gap-2 transition-all">
              <Plus size={12} /> تسجيل يوم عمل
            </button>
          </div>
        )
      })}

      {/* Add Worker */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg flex items-center gap-2">👷 عامل جديد</h2>
            <div><label className="label-f">الاسم *</label><input value={wName} onChange={e => setWName(e.target.value)} className="input-f" placeholder="حسن علي" autoFocus /></div>
            <div><label className="label-f">الهاتف</label><input value={wPhone} onChange={e => setWPhone(e.target.value)} className="input-f" placeholder="+961 71 ..." /></div>
            <div>
              <label className="label-f">الدور</label>
              <div className="flex gap-2">
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setWRole(k)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${wRole === k ? 'text-white shadow-lg' : 'bg-farm-elevated border-farm-border text-farm-dim'}`}
                    style={wRole === k ? { background: ROLE_COLORS[k], borderColor: ROLE_COLORS[k] } : {}}>{v}</button>
                ))}
              </div>
            </div>
            <div><label className="label-f">الأجر اليومي ($)</label><input value={wRate} onChange={e => setWRate(e.target.value)} className="input-f" type="number" inputMode="decimal" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={addWorker} disabled={saving || !wName.trim()} className="btn-green flex-1">{saving ? 'جاري...' : 'إضافة'}</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Work */}
      {showLog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLog(null)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg">تسجيل عمل — {showLog.name}</h2>
            <p className="text-farm-dim text-xs">{money(showLog.daily_rate)}/يوم</p>
            <div>
              <label className="label-f">الأرض *</label>
              <div className="flex flex-wrap gap-2">
                {lands.map(l => (
                  <button key={l.id} onClick={() => setLogLand(l.id)} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${logLand === l.id ? 'bg-farm-green border-farm-green text-farm-dark shadow-lg shadow-farm-green/20' : 'bg-farm-elevated border-farm-border text-farm-dim'}`}>{l.name}</button>
                ))}
              </div>
            </div>
            <div><label className="label-f">عدد الأيام</label><input value={logDays} onChange={e => setLogDays(e.target.value)} className="input-f" type="number" inputMode="decimal" step="0.5" /></div>
            <div><label className="label-f">المهمة</label><input value={logTask} onChange={e => setLogTask(e.target.value)} className="input-f" placeholder="حصاد، تنظيف، زراعة..." /></div>
            <div className="bg-farm-green/10 border border-farm-green/30 rounded-xl p-3 text-center">
              <p className="text-farm-dim text-[10px]">المبلغ</p>
              <p className="text-farm-green text-2xl font-black">{money((parseFloat(logDays) || 0) * showLog.daily_rate)}</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={addLog} disabled={saving || !logLand} className="btn-green flex-1">{saving ? 'جاري...' : 'حفظ'}</button>
              <button onClick={() => setShowLog(null)} className="btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
