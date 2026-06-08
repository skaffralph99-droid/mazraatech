import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES } from '../lib/i18n'
import { ArrowRight, Check } from 'lucide-react'
import { format } from 'date-fns'

export default function NewCost() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [lands, setLands] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [landId, setLandId] = useState(params.get('land') ?? '')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('farm_lands').select('*').eq('is_active', true).order('name').then(({ data }) => setLands(data ?? []))
    supabase.from('farm_seasons').select('*').eq('year', 2026).then(({ data }) => setSeasons(data ?? []))
  }, [])

  const submit = async () => {
    if (!landId) { setError('اختر أرض'); return }
    if (!category) { setError('اختر نوع المصروف'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('أدخل المبلغ'); return }
    setError(''); setSaving(true)
    const season = seasons.find(s => s.land_id === landId)
    const { error: err } = await supabase.from('farm_costs').insert({
      land_id: landId, season_id: season?.id ?? null,
      category, amount: parseFloat(amount), date, description: description || null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div className="w-16 h-16 rounded-full bg-farm-green/20 flex items-center justify-center mb-4">
          <Check size={32} className="text-farm-green" />
        </div>
        <h1 className="text-farm-steel text-xl font-black mb-2">تم الحفظ!</h1>
        <p className="text-farm-dim text-sm mb-8">${parseFloat(amount).toLocaleString()} — {COST_CATEGORIES.find(c => c.key === category)?.label}</p>
        <div className="w-full max-w-xs space-y-3">
          <button onClick={() => { setSaved(false); setAmount(''); setDescription(''); setCategory('') }} className="btn-green">إضافة مصروف آخر</button>
          <button onClick={() => nav('/')} className="w-full py-3 text-farm-dim font-bold text-sm">الرئيسية ←</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <button onClick={() => nav(-1)} className="text-farm-green text-sm font-bold flex items-center gap-1 mb-4"><ArrowRight size={16} /> رجوع</button>
      <h1 className="text-farm-steel text-xl font-black mb-6">إضافة مصروف</h1>

      <div className="card space-y-5">
        {/* Land picker */}
        <div>
          <label className="label-f">الأرض *</label>
          <div className="flex flex-wrap gap-2">
            {lands.map(l => (
              <button key={l.id} onClick={() => setLandId(l.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${landId === l.id ? 'bg-farm-green border-farm-green text-farm-dark' : 'bg-farm-elevated border-farm-border text-farm-dim'}`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category picker */}
        <div>
          <label className="label-f">نوع المصروف *</label>
          <div className="grid grid-cols-2 gap-2">
            {COST_CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border transition-all ${category === c.key ? 'bg-farm-green border-farm-green text-farm-dark' : 'bg-farm-elevated border-farm-border text-farm-dim'}`}>
                <span className="text-lg">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label-f">المبلغ ($) *</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.5" className="input-f text-2xl font-black text-center" placeholder="0" />
        </div>

        {/* Date */}
        <div>
          <label className="label-f">التاريخ</label>
          <input value={date} onChange={e => setDate(e.target.value)} type="date" className="input-f" />
        </div>

        {/* Description */}
        <div>
          <label className="label-f">الوصف (اختياري)</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="input-f" placeholder="مثال: تعبئة مازوت 500 ليتر" />
        </div>

        {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
        <button onClick={submit} disabled={saving} className="btn-green">{saving ? 'جاري الحفظ...' : 'حفظ المصروف'}</button>
      </div>
    </div>
  )
}
