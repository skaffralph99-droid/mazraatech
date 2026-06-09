import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cropIcon, money, CROPS } from '../lib/i18n'
import { ChevronLeft, Plus, MapPin } from 'lucide-react'

export default function Lands() {
  const [lands, setLands] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [crop, setCrop] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('farm_lands').select('*').eq('is_active', true).order('name').then(({ data }) => setLands(data ?? []))
    supabase.from('farm_costs').select('land_id, amount').then(({ data }) => setCosts(data ?? []))
  }
  useEffect(() => { load() }, [])

  const totalDunams = lands.reduce((s, l) => s + Number(l.size_dunams), 0)
  const getCost = (id: string) => costs.filter(c => c.land_id === id).reduce((s, c) => s + Number(c.amount), 0)

  const addLand = async () => {
    if (!name.trim() || !size) return
    setSaving(true)
    // Insert and get the new row back directly (no fragile re-query by name)
    const { data: inserted } = await supabase.from('farm_lands')
      .insert({ name: name.trim(), size_dunams: parseFloat(size), current_crop: crop || null, location: location.trim() || null })
      .select('id').single()
    if (inserted) {
      await supabase.from('farm_seasons').insert({ land_id: inserted.id, year: 2026, season: 'صيف', crop: crop || 'غير محدد', area_dunams: parseFloat(size) })
    }
    setSaving(false); setShowAdd(false); setName(''); setSize(''); setCrop(''); setLocation('')
    load()
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-farm-green" />
            <p className="text-farm-dim text-[10px] font-bold tracking-wider">إدارة الأراضي</p>
          </div>
          <h1 className="text-farm-steel text-2xl font-black">الأراضي</h1>
          <p className="text-farm-dim text-xs mt-0.5">{lands.length} أرض · {totalDunams.toLocaleString()} دونم</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-11 h-11 rounded-full bg-gradient-to-br from-farm-green to-emerald-400 flex items-center justify-center shadow-lg shadow-farm-green/30 active:scale-90 transition-all">
          <Plus size={22} className="text-farm-dark" />
        </button>
      </div>

      {lands.map((l, i) => {
        const cost = getCost(l.id)
        const costPerDunam = Number(l.size_dunams) > 0 ? cost / Number(l.size_dunams) : 0
        const meta = [l.current_crop || 'بدون زراعة', `${Number(l.size_dunams)} دونم`, l.ownership === 'rented' ? 'إيجار' : 'ملك'].join(' · ')
        return (
          <Link key={l.id} to={`/lands/${l.id}`} className={`card flex items-center gap-3 hover:border-farm-green/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-right delay-${Math.min(i + 1, 10)}`}>
            <div className="w-12 h-12 rounded-xl bg-farm-elevated flex items-center justify-center text-2xl shrink-0">{cropIcon(l.current_crop)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-farm-steel font-bold text-sm truncate">{l.name}</p>
              <p className="text-farm-dim text-[10px]">{meta}</p>
              {cost > 0 && <p className="text-red-400/70 text-[10px] mt-0.5">مصاريف: {money(cost)} · {money(costPerDunam)}/دونم</p>}
            </div>
            <ChevronLeft size={14} className="text-farm-dim shrink-0" />
          </Link>
        )
      })}

      {lands.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-farm-dim text-sm">لا توجد أراضي بعد</p>
          <button onClick={() => setShowAdd(true)} className="text-farm-green text-sm font-bold mt-2">إضافة أرض ←</button>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg flex items-center gap-2">🌿 أرض جديدة</h2>
            <div><label className="label-f">الاسم *</label><input value={name} onChange={e => setName(e.target.value)} className="input-f" placeholder="أرض المغارة" autoFocus /></div>
            <div><label className="label-f">المساحة (دونم) *</label><input value={size} onChange={e => setSize(e.target.value)} className="input-f" type="number" inputMode="decimal" placeholder="200" /></div>
            <div>
              <label className="label-f">المحصول الحالي</label>
              <div className="flex flex-wrap gap-2">
                {CROPS.slice(0, 6).map(c => (
                  <button key={c} onClick={() => setCrop(crop === c ? '' : c)} className={`chip ${crop === c ? 'chip-on' : 'chip-off'}`}>{cropIcon(c)} {c}</button>
                ))}
              </div>
            </div>
            <div><label className="label-f">الموقع</label><input value={location} onChange={e => setLocation(e.target.value)} className="input-f" placeholder="زحلة - شمال" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={addLand} disabled={saving || !name.trim() || !size} className="btn-green flex-1">{saving ? 'جاري...' : 'إضافة'}</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
