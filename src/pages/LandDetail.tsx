import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES } from '../lib/i18n'
import { ArrowRight, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function LandDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [land, setLand] = useState<any>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('farm_lands').select('*').eq('id', id).single(),
      supabase.from('farm_seasons').select('*').eq('land_id', id).order('year', { ascending: false }),
      supabase.from('farm_costs').select('*').eq('land_id', id).order('date', { ascending: false }),
    ]).then(([l, s, c]) => {
      setLand(l.data); setSeasons(s.data ?? []); setCosts(c.data ?? [])
    })
  }, [id])

  if (!land) return <div className="p-4 text-farm-dim">جاري التحميل...</div>

  const totalCost = costs.reduce((s, c) => s + Number(c.amount), 0)
  const currentSeason = seasons[0]
  const revenue = Number(currentSeason?.total_revenue ?? 0)
  const profit = revenue - totalCost

  // Costs by category
  const byCat: Record<string, number> = {}
  costs.forEach(c => { byCat[c.category] = (byCat[c.category] ?? 0) + Number(c.amount) })

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

      {/* Add cost button */}
      <Link to={`/costs/new?land=${id}`} className="card flex items-center gap-3 border-farm-green/30 hover:border-farm-green transition-colors">
        <div className="w-10 h-10 rounded-full bg-farm-green/15 flex items-center justify-center"><Plus size={18} className="text-farm-green" /></div>
        <p className="text-farm-steel text-sm font-bold">إضافة مصروف على هذه الأرض</p>
      </Link>

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
                  <span className="text-lg w-8 text-center">{info?.icon ?? '📋'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-farm-steel font-bold">{info?.label ?? cat}</span>
                      <span className="text-farm-dim">${amount.toLocaleString()}</span>
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
        <p className="section-title">سجل المصاريف</p>
        {costs.length === 0 && <p className="text-farm-dim text-sm text-center py-8">لا توجد مصاريف مسجلة</p>}
        {costs.map(c => {
          const info = COST_CATEGORIES.find(cat => cat.key === c.category)
          return (
            <div key={c.id} className="card mb-2 flex items-center gap-3">
              <span className="text-lg">{info?.icon ?? '📋'}</span>
              <div className="flex-1">
                <p className="text-farm-steel text-sm font-bold">{info?.label ?? c.category}</p>
                <p className="text-farm-dim text-xs">{c.description ?? ''} · {format(new Date(c.date), 'dd/MM/yyyy')}</p>
              </div>
              <p className="text-red-400 font-black text-sm">${Number(c.amount).toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      <div className="h-8" />
    </div>
  )
}
