import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES } from '../lib/i18n'
import { ArrowRight, Plus, Wheat, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

export default function LandDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [land, setLand] = useState<any>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
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
    ]).then(([l, s, c]) => { setLand(l.data); setSeasons(s.data ?? []); setCosts(c.data ?? []) })
  }
  useEffect(() => { load() }, [id])

  if (!land) return <div className="p-4 text-farm-dim">جاري التحميل...</div>

  const totalCost = costs.reduce((s, c) => s + Number(c.amount), 0)
  const costPerDunam = Number(land.size_dunams) > 0 ? totalCost / Number(land.size_dunams) : 0
  const currentSeason = seasons[0]
  const revenue = Number(currentSeason?.total_revenue ?? 0)
  const profit = revenue - totalCost
  const harvestRecorded = Number(currentSeason?.harvest_tonnes ?? 0) > 0

  // Costs by category
  const byCat: Record<string, number> = {}
  costs.forEach(c => { byCat[c.category] = (byCat[c.category] ?? 0) + Number(c.amount) })

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

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => nav(-1)} className="text-farm-green text-sm font-bold flex items-center gap-1"><ArrowRight size={16} /> رجوع</button>

      {/* Land header */}
      <div className="card">
        <h1 className="text-farm-steel text-xl font-black">{land.name}</h1>
        <p className="text-farm-dim text-sm mt-1">{land.current_crop ?? 'بدون زراعة'} · {Number(land.size_dunams)} دونم · {land.location}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-farm-elevated rounded-xl p-3 text-center">
            <p className="text-red-400 text-lg font-black">${totalCost.toLocaleString()}</p>
            <p className="text-farm-dim text-[10px]">المصاريف</p>
          </div>
          <div className="bg-farm-elevated rounded-xl p-3 text-center">
            <p className="text-farm-green text-lg font-black">${revenue.toLocaleString()}</p>
            <p className="text-farm-dim text-[10px]">الإيرادات</p>
          </div>
          <div className={`bg-farm-elevated rounded-xl p-3 text-center border ${profit >= 0 ? 'border-farm-green/30' : 'border-red-500/30'}`}>
            <p className={`text-lg font-black ${profit >= 0 ? 'text-farm-green' : 'text-red-400'}`}>${Math.abs(profit).toLocaleString()}</p>
            <p className="text-farm-dim text-[10px]">{profit >= 0 ? 'ربح' : 'خسارة'}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link to={`/costs/new?land=${id}`} className="card flex items-center gap-2 py-3 border-farm-green/30 hover:border-farm-green transition-colors">
          <Plus size={16} className="text-farm-green" />
          <span className="text-farm-steel text-sm font-bold">إضافة مصروف</span>
        </Link>
        <button onClick={() => { setTonnes(''); setPricePerTonne(''); setShowHarvest(true) }} className="card flex items-center gap-2 py-3 border-yellow-500/30 hover:border-yellow-500 transition-colors text-right">
          <Wheat size={16} className="text-yellow-400" />
          <span className="text-farm-steel text-sm font-bold">{harvestRecorded ? 'تعديل الحصاد' : 'تسجيل الحصاد'}</span>
        </button>
      </div>

      {/* Harvest info */}
      {harvestRecorded && (
        <div className="card border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Wheat size={16} className="text-yellow-400" />
            <p className="text-farm-steel text-sm font-bold">الحصاد</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-farm-steel font-black">{Number(currentSeason.harvest_tonnes)} طن</p><p className="text-farm-dim text-[10px]">الكمية</p></div>
            <div><p className="text-farm-steel font-black">${Number(currentSeason.sale_price_per_tonne)}/طن</p><p className="text-farm-dim text-[10px]">سعر البيع</p></div>
            <div><p className="text-farm-green font-black">${revenue.toLocaleString()}</p><p className="text-farm-dim text-[10px]">الإجمالي</p></div>
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      {Object.keys(byCat).length > 0 && (
        <div>
          <p className="section-title">توزيع المصاريف</p>
          <div className="card space-y-2">
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
              const info = COST_CATEGORIES.find(c => c.key === cat)
              const pct = totalCost > 0 ? (amount / totalCost * 100) : 0
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-base w-7 text-center">{info?.icon ?? '📋'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-farm-steel font-bold">{info?.label ?? cat}</span>
                      <span className="text-farm-dim">${amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-farm-elevated rounded-full mt-1">
                      <div className="h-full bg-farm-green/50 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cost history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">سجل المصاريف</p>
          <p className="text-farm-dim text-[10px]">${costPerDunam.toFixed(1)}/دونم</p>
        </div>
        {costs.length === 0 && <p className="text-farm-dim text-sm text-center py-8">لا توجد مصاريف مسجلة</p>}
        {costs.map(c => {
          const info = COST_CATEGORIES.find(cat => cat.key === c.category)
          return (
            <div key={c.id} className="card mb-2 flex items-center gap-3 group">
              <span className="text-base">{info?.icon ?? '📋'}</span>
              <div className="flex-1">
                <p className="text-farm-steel text-sm font-bold">{info?.label ?? c.category}</p>
                <p className="text-farm-dim text-[10px]">{c.description ?? ''} · {format(new Date(c.date), 'dd/MM/yyyy')}</p>
              </div>
              <p className="text-red-400 font-bold text-sm">${Number(c.amount).toLocaleString()}</p>
              <button onClick={async (e) => { e.preventDefault(); if (!confirm('حذف هذا المصروف؟')) return; await supabase.from('farm_costs').delete().eq('id', c.id); load() }}
                className="text-farm-dim hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100">✕</button>
            </div>
          )
        })}
      </div>

      {/* Harvest Modal */}
      {showHarvest && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowHarvest(false)}>
          <div className="card w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-farm-steel font-black text-lg flex items-center gap-2"><Wheat size={20} className="text-yellow-400" /> تسجيل الحصاد</h2>
            <p className="text-farm-dim text-xs">{land.name} — {land.current_crop}</p>
            <div><label className="label-f">كمية الحصاد (طن) *</label><input value={tonnes} onChange={e => setTonnes(e.target.value)} className="input-f" type="number" step="0.1" placeholder="45" /></div>
            <div><label className="label-f">سعر البيع ($/طن) *</label><input value={pricePerTonne} onChange={e => setPricePerTonne(e.target.value)} className="input-f" type="number" step="0.5" placeholder="300" /></div>
            {tonnes && pricePerTonne && (
              <div className="bg-farm-green/10 border border-farm-green/30 rounded-xl p-3 text-center">
                <p className="text-farm-dim text-xs">الإيرادات المتوقعة</p>
                <p className="text-farm-green text-2xl font-black">${((parseFloat(tonnes) || 0) * (parseFloat(pricePerTonne) || 0)).toLocaleString()}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={recordHarvest} disabled={saving} className="btn-green flex-1">{saving ? 'جاري...' : 'حفظ الحصاد'}</button>
              <button onClick={() => setShowHarvest(false)} className="px-4 py-2 text-farm-dim font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  )
}
