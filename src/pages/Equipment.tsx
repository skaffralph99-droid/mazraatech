import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Wrench, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

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
    supabase.from('farm_maintenance').select('*, farm_equipment(name)').order('date', { ascending: false }).limit(50).then(({ data }) => setMaintenance(data ?? []))
  }
  useEffect(() => { load() }, [])

  const addMaintenance = async () => {
    if (!selected || !desc.trim() || !cost) return
    setSaving(true)
    await supabase.from('farm_maintenance').insert({ equipment_id: selected.id, description: desc, cost: parseFloat(cost), mechanic: mechanic || null, date: format(new Date(), 'yyyy-MM-dd') })
    setSaving(false); setShowAdd(false); setDesc(''); setCost(''); setMechanic('')
    load()
  }

  const ICONS: Record<string, string> = { tractor: '🚜', sprayer: '🧴', generator: '⚡', truck: '🚛' }

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => nav(-1)} className="text-farm-green text-sm font-bold flex items-center gap-1"><ArrowRight size={16} /> رجوع</button>
      <h1 className="text-farm-steel text-xl font-black">المعدات</h1>

      {equipment.map(eq => {
        const eqMaint = maintenance.filter(m => m.equipment_id === eq.id)
        const totalRepairCost = eqMaint.reduce((s, m) => s + Number(m.cost), 0)
        return (
          <div key={eq.id} className="card">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ICONS[eq.type] ?? '🔧'}</span>
              <div className="flex-1">
                <p className="text-farm-steel font-bold">{eq.name}</p>
                <p className="text-farm-dim text-xs">{eq.brand} · {eq.year_purchased}</p>
              </div>
              <div className="flex items-center gap-2">
                {eq.status === 'needs_repair' && <AlertTriangle size={16} className="text-yellow-400" />}
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${eq.status === 'operational' ? 'bg-farm-green/15 text-farm-green' : 'bg-yellow-500/15 text-yellow-400'}`}>
                  {eq.status === 'operational' ? 'يعمل' : 'يحتاج صيانة'}
                </span>
              </div>
            </div>
            {totalRepairCost > 0 && <p className="text-farm-dim text-xs mt-2">إجمالي الصيانة: ${totalRepairCost.toLocaleString()} · {eqMaint.length} عملية</p>}
            {eqMaint.length > 0 && (
              <div className="mt-3 space-y-1">
                {eqMaint.slice(0, 3).map(m => (
                  <div key={m.id} className="flex justify-between text-xs bg-farm-elevated rounded-lg px-3 py-2">
                    <span className="text-farm-steel">{m.description}</span>
                    <span className="text-red-400 font-bold">${Number(m.cost).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setSelected(eq); setShowAdd(true) }} className="mt-3 text-farm-green text-xs font-bold flex items-center gap-1">
              <Wrench size={12} /> إضافة صيانة
            </button>
          </div>
        )
      })}

      {/* Add Maintenance Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg">صيانة — {selected?.name}</h2>
            <div><label className="label-f">الوصف *</label><input value={desc} onChange={e => setDesc(e.target.value)} className="input-f" placeholder="تبديل فلتر زيت" /></div>
            <div><label className="label-f">التكلفة ($) *</label><input value={cost} onChange={e => setCost(e.target.value)} className="input-f" type="number" placeholder="150" /></div>
            <div><label className="label-f">الميكانيكي</label><input value={mechanic} onChange={e => setMechanic(e.target.value)} className="input-f" placeholder="اسم الميكانيكي" /></div>
            <div className="flex gap-3">
              <button onClick={addMaintenance} disabled={saving} className="btn-green flex-1">{saving ? 'جاري...' : 'حفظ'}</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-farm-dim font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
