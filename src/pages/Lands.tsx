import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronLeft, Plus } from 'lucide-react'

export default function Lands() {
  const [lands, setLands] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [crop, setCrop] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => supabase.from('farm_lands').select('*').eq('is_active', true).order('name').then(({ data }) => setLands(data ?? []))
  useEffect(() => { load() }, [])

  const totalDunams = lands.reduce((s, l) => s + Number(l.size_dunams), 0)

  const addLand = async () => {
    if (!name.trim() || !size) return
    setSaving(true)
    await supabase.from('farm_lands').insert({ name: name.trim(), size_dunams: parseFloat(size), current_crop: crop || null, location: location || null })
    setSaving(false); setShowAdd(false); setName(''); setSize(''); setCrop(''); setLocation('')
    load()
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-farm-steel text-xl font-black">الأراضي</h1>
          <p className="text-farm-dim text-xs">{lands.length} أرض · {totalDunams.toLocaleString()} دونم</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-10 h-10 rounded-full bg-farm-green flex items-center justify-center"><Plus size={20} className="text-farm-dark" /></button>
      </div>

      {lands.map(l => (
        <Link key={l.id} to={`/lands/${l.id}`} className="card flex items-center gap-3 hover:border-farm-green/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-farm-green/15 flex items-center justify-center text-xl">🌿</div>
          <div className="flex-1 min-w-0">
            <p className="text-farm-steel font-bold text-sm truncate">{l.name}</p>
            <p className="text-farm-dim text-xs">{l.current_crop ?? 'بدون زراعة'} · {Number(l.size_dunams)} دونم · {l.ownership === 'rented' ? 'إيجار' : 'ملك'}</p>
          </div>
          <ChevronLeft size={16} className="text-farm-dim" />
        </Link>
      ))}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg">أرض جديدة</h2>
            <div><label className="label-f">الاسم *</label><input value={name} onChange={e => setName(e.target.value)} className="input-f" placeholder="أرض المغارة" /></div>
            <div><label className="label-f">المساحة (دونم) *</label><input value={size} onChange={e => setSize(e.target.value)} className="input-f" type="number" placeholder="200" /></div>
            <div><label className="label-f">المحصول الحالي</label><input value={crop} onChange={e => setCrop(e.target.value)} className="input-f" placeholder="بطاطا" /></div>
            <div><label className="label-f">الموقع</label><input value={location} onChange={e => setLocation(e.target.value)} className="input-f" placeholder="زحلة - شمال" /></div>
            <div className="flex gap-3">
              <button onClick={addLand} disabled={saving} className="btn-green flex-1">{saving ? 'جاري...' : 'إضافة'}</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-farm-dim font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
