import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { money } from '../lib/i18n'

const ICONS: Record<string, string> = { tractor: '🚜', sprayer: '🧴', generator: '⚡', truck: '🚛' }
const TYPE_COLORS: Record<string, string> = { tractor: '#f59e0b', sprayer: '#8b5cf6', generator: '#ef4444', truck: '#3b82f6' }

export default function Equipment() {
  const nav = useNavigate()
  const [equipment, setEquipment] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [desc, setDesc] = useState('')
  const [cost, setCost] = useState('')
  const [mechanic, setMechanic] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('farm_equipment').select('*').eq('is_active', true).order('name').then(({ data }) => setEquipment(data ?? []))
    supabase.from('farm_maintenance').select('*').order('date', { ascending: false }).limit(50).then(({ data }) => setMaintenance(data ?? []))
  }
  useEffect(() => { load() }, [])

  const addMaintenance = async () => {
    if (!selected || !desc.trim() || !cost) return
    setSaving(true)
    await supabase.from('farm_maintenance').insert({ equipment_id: selected.id, description: desc, cost: parseFloat(cost), mechanic: mechanic || null, date: format(new Date(), 'yyyy-MM-dd') })
    setSaving(false); setShowAdd(false); setDesc(''); setCost(''); setMechanic('')
    load()
  }

  const totalMaintCost = maintenance.reduce((s, m) => s + Number(m.cost), 0)

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => nav('/')} className="text-farm-green text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"><ArrowRight size={16} /> الرئيسية</button>
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-1"><Wrench size={16} className="text-amber-400" /><p className="text-farm-dim text-[10px] font-bold tracking-wider">إدارة المعدات</p></div>
        <h1 className="text-farm-steel text-2xl font-black">المعدات</h1>
        <p className="text-farm-dim text-xs mt-0.5">{equipment.length} قطعة · إجمالي الصيانة: {money(totalMaintCost)}</p>
      </div>

      {equipment.map((eq, i) => {
        const eqMaint = maintenance.filter(m => m.equipment_id === eq.id)
        const totalRepairCost = eqMaint.reduce((s, m) => s + Number(m.cost), 0)
        const color = TYPE_COLORS[eq.type] ?? '#78716c'
        return (
          <div key={eq.id} className={`card animate-fade-up delay-${Math.min(i + 1, 10)}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: color + '15' }}>
                {ICONS[eq.type] ?? '🔧'}
              </div>
              <div className="flex-1">
                <p className="text-farm-steel font-bold">{eq.name}</p>
                <p className="text-farm-dim text-xs">{eq.brand} · {eq.year_purchased}</p>
              </div>
              <div className="flex items-center gap-2">
                {eq.status === 'needs_repair' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400"><AlertTriangle size={10} /> يحتاج صيانة</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400"><CheckCircle size={10} /> يعمل</span>
                )}
              </div>
            </div>
            {totalRepairCost > 0 && <p className="text-farm-dim text-[10px] mt-3">إجمالي الصيانة: <span className="text-red-400 font-bold">{money(totalRepairCost)}</span> · {eqMaint.length} عملية</p>}
            {eqMaint.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {eqMaint.slice(0, 3).map(m => (
                  <div key={m.id} className="flex justify-between items-center text-xs bg-farm-elevated rounded-xl px-3 py-2.5">
                    <div>
                      <span className="text-farm-steel font-bold">{m.description}</span>
                      <span className="text-farm-dim mr-2"> · {[m.mechanic, format(new Date(m.date), 'dd/MM')].filter(Boolean).join(' · ')}</span>
                    </div>
                    <span className="text-red-400 font-black">{money(m.cost)}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setSelected(eq); setShowAdd(true) }} className="mt-3 flex items-center gap-1.5 text-farm-green text-xs font-bold hover:gap-2 transition-all">
              <Plus size={12} /> إضافة صيانة
            </button>
          </div>
        )
      })}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg flex items-center gap-2"><Wrench size={18} className="text-amber-400" /> صيانة — {selected?.name}</h2>
            <div><label className="label-f">الوصف *</label><input value={desc} onChange={e => setDesc(e.target.value)} className="input-f" placeholder="تبديل فلتر زيت" autoFocus /></div>
            <div><label className="label-f">التكلفة ($) *</label><input value={cost} onChange={e => setCost(e.target.value)} className="input-f" type="number" inputMode="decimal" placeholder="150" /></div>
            <div><label className="label-f">الميكانيكي</label><input value={mechanic} onChange={e => setMechanic(e.target.value)} className="input-f" placeholder="اسم الميكانيكي" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={addMaintenance} disabled={saving || !desc.trim() || !cost} className="btn-green flex-1">{saving ? 'جاري...' : 'حفظ'}</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
