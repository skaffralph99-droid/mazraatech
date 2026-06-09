import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES, cat, money } from '../lib/i18n'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

export default function NewCost() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [lands, setLands] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [landId, setLandId] = useState(params.get('land') ?? '')
  const [category, setCategory] = useState(params.get('cat') ?? '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('farm_lands').select('id, name').eq('is_active', true).order('name').then(({ data }) => setLands(data ?? []))
    supabase.from('farm_seasons').select('id, land_id').eq('year', 2026).then(({ data }) => setSeasons(data ?? []))
  }, [])

  const selectedLand = lands.find(l => l.id === landId)
  const selectedCat = category ? cat(category) : null
  const amountNum = parseFloat(amount) || 0

  const submit = async () => {
    if (!landId) { setError('اختر أرض'); return }
    if (!category) { setError('اختر نوع المصروف'); return }
    if (amountNum <= 0) { setError('أدخل المبلغ'); return }
    setError(''); setSaving(true)
    const season = seasons.find(s => s.land_id === landId)
    const { error: err } = await supabase.from('farm_costs').insert({
      land_id: landId, season_id: season?.id ?? null,
      category, amount: amountNum, date, description: description.trim() || null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-farm-green/20 flex items-center justify-center mb-5 animate-glow">
          <Check size={40} className="text-farm-green" />
        </div>
        <h1 className="text-farm-steel text-2xl font-black mb-2">تم الحفظ!</h1>
        <div className="flex items-center gap-2 text-farm-dim text-sm mb-8">
          <span className="text-xl">{selectedCat?.icon}</span>
          <span>{money(amountNum)} · {selectedCat?.label} · {selectedLand?.name}</span>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <button onClick={() => { setSaved(false); setAmount(''); setDescription('') }} className="btn-green">إضافة مصروف آخر</button>
          <button onClick={() => nav('/')} className="w-full py-3 text-farm-dim font-bold text-sm hover:text-farm-steel transition-colors">← الرئيسية</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 animate-fade-up">
      <button onClick={() => nav('/')} className="text-farm-green text-sm font-bold flex items-center gap-1 mb-4 hover:gap-2 transition-all"><ArrowRight size={16} /> الرئيسية</button>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={18} className="text-farm-green" />
        <h1 className="text-farm-steel text-xl font-black">إضافة مصروف</h1>
      </div>

      <div className="space-y-5">
        {/* Land picker */}
        <div className="animate-fade-up delay-1">
          <label className="label-f">الأرض *</label>
          {lands.length === 0 ? (
            <p className="text-farm-dim text-xs">لا توجد أراضي — أضف أرض أولاً من صفحة الأراضي.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lands.map(l => (
                <button key={l.id} onClick={() => setLandId(l.id)} className={`chip ${landId === l.id ? 'chip-on' : 'chip-off'}`}>{l.name}</button>
              ))}
            </div>
          )}
        </div>

        {/* Category picker — colored */}
        <div className="animate-fade-up delay-2">
          <label className="label-f">نوع المصروف *</label>
          <div className="grid grid-cols-2 gap-2">
            {COST_CATEGORIES.map(c => {
              const on = category === c.key
              return (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95"
                  style={on
                    ? { background: c.color, borderColor: c.color, color: '#08140a', boxShadow: `0 4px 14px ${c.color}40` }
                    : { background: c.color + '12', borderColor: c.color + '30', color: c.color }}>
                  <span className="text-lg">{c.icon}</span> {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Amount */}
        <div className="animate-fade-up delay-3">
          <label className="label-f">المبلغ ($) *</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" inputMode="decimal" step="0.5"
            className="input-f text-3xl font-black text-center h-16" placeholder="0" autoFocus={!!category} />
        </div>

        {/* Date */}
        <div className="animate-fade-up delay-4">
          <label className="label-f">التاريخ</label>
          <input value={date} onChange={e => setDate(e.target.value)} type="date" className="input-f" />
        </div>

        {/* Description */}
        <div className="animate-fade-up delay-5">
          <label className="label-f">الوصف (اختياري)</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="input-f" placeholder="مثال: تعبئة مازوت 500 ليتر" />
        </div>

        {/* Preview */}
        {landId && category && amountNum > 0 && (
          <div className="card kpi-green animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: (selectedCat?.color ?? '#888') + '22' }}>{selectedCat?.icon}</span>
                <div>
                  <p className="text-farm-steel text-sm font-bold">{selectedCat?.label}</p>
                  <p className="text-farm-dim text-[10px]">{selectedLand?.name} · {format(new Date(date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
              <p className="text-farm-green text-xl font-black">{money(amountNum)}</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm font-semibold animate-fade-in">{error}</p>}
        <button onClick={submit} disabled={saving} className="btn-green text-base animate-fade-up delay-6">
          {saving ? (<><span className="w-4 h-4 border-2 border-farm-dark/30 border-t-farm-dark rounded-full spinner" /> جاري الحفظ...</>) : 'حفظ المصروف ←'}
        </button>
      </div>
    </div>
  )
}
