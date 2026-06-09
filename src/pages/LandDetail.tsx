import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cat, cropIcon, money } from '../lib/i18n'
import { ArrowRight, Plus, Wheat, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function LandDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [land, setLand] = useState<any>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showHarvest, setShowHarvest] = useState(false)
  const [tonnes, setTonnes] = useState('')
  const [pricePerTonne, setPricePerTonne] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!id) return
    Promise.all([
      supabase.from('farm_lands').select('*').eq('id', id).single(),
      supabase.from('farm_seasons').select('*').eq('land_id', id).order('year', { ascending: false }),
      supabase.from('farm_costs').select('*').eq('land_id', id).order('date', { ascending: false }),
    ]).then(([l, s, c]) => {
      setLand(l.data); setSeasons(s.data ?? []); setCosts(c.data ?? []); setLoading(false)
    })
  }
  useEffect(() => { load() }, [id])

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-farm-dim text-sm">جاري التحميل...</div>
  if (!land) return (
    <div className="p-4 text-center py-20">
      <p className="text-4xl mb-3">🤔</p>
      <p className="text-farm-dim text-sm">لم نجد هذه الأرض</p>
      <button onClick={() => nav('/lands')} className="text-farm-green text-sm font-bold mt-3">← كل الأراضي</button>
    </div>
  )

  const totalCost = costs.reduce((s, c) => s + Number(c.amount), 0)
  const costPerDunam = Number(land.size_dunams) > 0 ? totalCost / Number(land.size_dunams) : 0
  const currentSeason = seasons[0]
  const revenue = Number(currentSeason?.total_revenue ?? 0)
  const profit = revenue - totalCost
  const harvestRecorded = Number(currentSeason?.harvest_tonnes ?? 0) > 0

  const byCat: Record<string, number> = {}
  costs.forEach(c => { byCat[c.category] = (byCat[c.category] ?? 0) + Number(c.amount) })
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1])

  const meta = [land.current_crop || 'بدون زراعة', `${Number(land.size_dunams)} دونم`, land.location]
    .filter(Boolean).join(' · ')

  const recordHarvest = async () => {
    if (!currentSeason || !tonnes || !pricePerTonne) return
    setSaving(true)
    await supabase.from('farm_seasons').update({
      harvest_tonnes: parseFloat(tonnes),
      sale_price_per_tonne: parseFloat(pricePerTonne),
      harvest_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'completed',
    }).eq('id', currentSeason.id)
    setSaving(false); setShowHarvest(false)
    load()
  }

  const deleteCost = async (costId: string) => {
    if (!confirm('حذف هذا المصروف؟')) return
    await supabase.from('farm_costs').delete().eq('id', costId)
    load()
  }

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => nav('/lands')} className="text-farm-green text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all animate-fade-up"><ArrowRight size={16} /> الأراضي</button>

      {/* Header */}
      <div className="card animate-fade-up delay-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-farm-elevated flex items-center justify-center text-2xl">{cropIcon(land.current_crop)}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-farm-steel text-xl font-black truncate">{land.name}</h1>
            <p className="text-farm-dim text-xs mt-0.5">{meta}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-farm-elevated rounded-xl p-3 text-center">
            <p className="text-red-400 text-base font-black">{money(totalCost)}</p>
            <p className="text-farm-dim text-[10px] mt-0.5">المصاريف</p>
          </div>
          <div className="bg-farm-elevated rounded-xl p-3 text-center">
            <p className="text-farm-green text-base font-black">{money(revenue)}</p>
            <p className="text-farm-dim text-[10px] mt-0.5">الإيرادات</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${profit >= 0 ? 'kpi-green' : 'kpi-red'} border`}>
            <p className={`text-base font-black ${profit >= 0 ? 'text-farm-green' : 'text-red-400'}`}>{money(Math.abs(profit))}</p>
            <p className="text-farm-dim text-[10px] mt-0.5">{profit >= 0 ? 'ربح' : 'خسارة'}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-2">
        <Link to={`/costs/new?land=${id}`} className="card flex items-center justify-center gap-2 py-3.5 border-farm-green/30 hover:border-farm-green hover:-translate-y-0.5 transition-all">
          <Plus size={16} className="text-farm-green" />
          <span className="text-farm-steel text-sm font-bold">إضافة مصروف</span>
        </Link>
        <button onClick={() => { setTonnes(''); setPricePerTonne(''); setShowHarvest(true) }} className="card flex items-center justify-center gap-2 py-3.5 border-amber-500/30 hover:border-amber-500 hover:-translate-y-0.5 transition-all">
          <Wheat size={16} className="text-amber-400" />
          <span className="text-farm-steel text-sm font-bold">{harvestRecorded ? 'تعديل الحصاد' : 'تسجيل الحصاد'}</span>
        </button>
      </div>

      {/* Harvest info */}
      {harvestRecorded && (
        <div className="card kpi-amber animate-fade-up delay-3">
          <div className="flex items-center gap-2 mb-3">
            <Wheat size={16} className="text-amber-400" />
            <p className="text-farm-steel text-sm font-bold">الحصاد</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-farm-steel font-black">{Number(currentSeason.harvest_tonnes)}<span className="text-xs text-farm-dim mr-0.5">طن</span></p><p className="text-farm-dim text-[10px]">الكمية</p></div>
            <div><p className="text-farm-steel font-black">{money(currentSeason.sale_price_per_tonne)}</p><p className="text-farm-dim text-[10px]">سعر الطن</p></div>
            <div><p className="text-farm-green font-black">{money(revenue)}</p><p className="text-farm-dim text-[10px]">الإجمالي</p></div>
          </div>
        </div>
      )}

      {/* Cost breakdown — colored bars */}
      {sortedCats.length > 0 && (
        <div className="animate-fade-up delay-4">
          <p className="section-title">توزيع المصاريف</p>
          <div className="card space-y-3">
            {sortedCats.map(([key, amount]) => {
              const info = cat(key)
              const pct = totalCost > 0 ? (amount / totalCost * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-farm-steel text-xs font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: info.color + '20' }}>{info.icon}</span>
                      {info.label}
                    </span>
                    <span className="text-farm-dim text-[10px]">{money(amount)} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-farm-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full animate-bar" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${info.color}88, ${info.color})` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cost history */}
      <div className="animate-fade-up delay-5">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">سجل المصاريف</p>
          {totalCost > 0 && <p className="text-farm-dim text-[10px]">{money(costPerDunam)}/دونم</p>}
        </div>
        {costs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-farm-dim text-sm">لا توجد مصاريف بعد</p>
            <Link to={`/costs/new?land=${id}`} className="text-farm-green text-sm font-bold mt-2 inline-block">إضافة أول مصروف ←</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {costs.map(c => {
              const info = cat(c.category)
              return (
                <div key={c.id} className="card flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: info.color + '18' }}>{info.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-farm-steel text-sm font-bold">{info.label}</p>
                    <p className="text-farm-dim text-[10px] truncate">{[c.description, format(new Date(c.date), 'dd/MM/yyyy')].filter(Boolean).join(' · ')}</p>
                  </div>
                  <p className="text-red-400 font-bold text-sm shrink-0">{money(c.amount)}</p>
                  <button onClick={() => deleteCost(c.id)} className="text-farm-dim/50 hover:text-red-400 active:text-red-400 transition-colors p-1.5 shrink-0" aria-label="حذف">
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Harvest Modal */}
      {showHarvest && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowHarvest(false)}>
          <div className="card w-full max-w-sm space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg flex items-center gap-2"><Wheat size={20} className="text-amber-400" /> تسجيل الحصاد</h2>
            <p className="text-farm-dim text-xs">{[land.name, land.current_crop].filter(Boolean).join(' — ')}</p>
            <div><label className="label-f">كمية الحصاد (طن) *</label><input value={tonnes} onChange={e => setTonnes(e.target.value)} className="input-f" type="number" inputMode="decimal" step="0.1" placeholder="45" autoFocus /></div>
            <div><label className="label-f">سعر البيع ($/طن) *</label><input value={pricePerTonne} onChange={e => setPricePerTonne(e.target.value)} className="input-f" type="number" inputMode="decimal" step="0.5" placeholder="300" /></div>
            {tonnes && pricePerTonne && (
              <div className="kpi-green border rounded-xl p-3 text-center animate-scale-in">
                <p className="text-farm-dim text-[10px]">الإيرادات المتوقعة</p>
                <p className="text-farm-green text-2xl font-black">{money((parseFloat(tonnes) || 0) * (parseFloat(pricePerTonne) || 0))}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={recordHarvest} disabled={saving || !tonnes || !pricePerTonne} className="btn-green flex-1">{saving ? 'جاري...' : 'حفظ الحصاد'}</button>
              <button onClick={() => setShowHarvest(false)} className="btn-ghost">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  )
}
