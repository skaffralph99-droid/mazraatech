import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES } from '../lib/i18n'
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Map, Wrench } from 'lucide-react'

export default function Dashboard() {
  const [lands, setLands] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('farm_lands').select('*').eq('is_active', true).order('name'),
      supabase.from('farm_seasons').select('*').eq('year', 2026).order('created_at'),
      supabase.from('farm_costs').select('*').order('date', { ascending: false }),
      supabase.from('farm_equipment').select('*').eq('is_active', true),
    ]).then(([l, s, c, e]) => {
      setLands(l.data ?? [])
      setSeasons(s.data ?? [])
      setCosts(c.data ?? [])
      setEquipment(e.data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-farm-dim text-sm">جاري التحميل...</div></div>

  const totalDunams = lands.reduce((s, l) => s + Number(l.size_dunams), 0)
  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0)
  const totalRevenue = seasons.reduce((s, ss) => s + Number(ss.total_revenue ?? 0), 0)
  const profit = totalRevenue - totalCosts
  const needsRepair = equipment.filter(e => e.status === 'needs_repair').length

  // Costs by category
  const byCat: Record<string, number> = {}
  costs.forEach(c => { byCat[c.category] = (byCat[c.category] ?? 0) + Number(c.amount) })
  const topCosts = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Per-land profit
  const landProfit = lands.map(l => {
    const s = seasons.find(ss => ss.land_id === l.id)
    const rev = Number(s?.total_revenue ?? 0)
    const cost = costs.filter(c => c.land_id === l.id).reduce((sum, c) => sum + Number(c.amount), 0)
    return { ...l, revenue: rev, cost, profit: rev - cost, season: s }
  }).sort((a, b) => b.profit - a.profit)

  return (
    <div className="p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-farm-dim text-xs font-bold">الأراضي</p>
          <p className="text-2xl font-black text-farm-steel">{lands.length}</p>
          <p className="text-farm-dim text-xs">{totalDunams.toLocaleString()} دونم</p>
        </div>
        <div className="card text-center">
          <p className="text-farm-dim text-xs font-bold">المصاريف</p>
          <p className="text-2xl font-black text-red-400">${totalCosts.toLocaleString()}</p>
          <p className="text-farm-dim text-xs">هذا الموسم</p>
        </div>
        <div className="card text-center">
          <p className="text-farm-dim text-xs font-bold">الإيرادات</p>
          <p className="text-2xl font-black text-farm-green">${totalRevenue.toLocaleString()}</p>
          <p className="text-farm-dim text-xs">المبيعات</p>
        </div>
        <div className={`card text-center border-2 ${profit >= 0 ? 'border-farm-green/30' : 'border-red-500/30'}`}>
          <p className="text-farm-dim text-xs font-bold">{profit >= 0 ? 'الربح' : 'الخسارة'}</p>
          <p className={`text-2xl font-black ${profit >= 0 ? 'text-farm-green' : 'text-red-400'}`}>${Math.abs(profit).toLocaleString()}</p>
          <p className="text-farm-dim text-xs flex items-center justify-center gap-1">
            {profit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {profit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
          </p>
        </div>
      </div>

      {/* Quick action */}
      <Link to="/costs/new" className="card flex items-center gap-3 py-3 border-farm-green/30 hover:border-farm-green transition-colors">
        <div className="w-10 h-10 rounded-full bg-farm-green/15 flex items-center justify-center">
          <Plus size={20} className="text-farm-green" />
        </div>
        <div>
          <p className="text-farm-steel text-sm font-bold">إضافة مصروف</p>
          <p className="text-farm-dim text-xs">سجّل مصروف جديد على أي أرض</p>
        </div>
      </Link>

      {/* Per-land profit */}
      <div>
        <p className="section-title">الأراضي — الربح والخسارة</p>
        <div className="space-y-2">
          {landProfit.map(l => (
            <Link key={l.id} to={`/lands/${l.id}`} className="card flex items-center gap-3 hover:border-farm-green/30 transition-colors">
              <div className={`w-2 h-12 rounded-full ${l.profit > 0 ? 'bg-farm-green' : l.profit < 0 ? 'bg-red-400' : 'bg-farm-dim'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-farm-steel font-bold text-sm truncate">{l.name}</p>
                <p className="text-farm-dim text-xs">{l.current_crop} · {Number(l.size_dunams).toLocaleString()} دونم</p>
              </div>
              <div className="text-left">
                <p className={`text-sm font-black ${l.profit > 0 ? 'text-farm-green' : l.profit < 0 ? 'text-red-400' : 'text-farm-dim'}`}>
                  {l.profit > 0 ? '+' : ''}${l.profit.toLocaleString()}
                </p>
                <p className="text-farm-dim text-[10px]">
                  م: ${l.cost.toLocaleString()} · إ: ${l.revenue.toLocaleString()}
                </p>
              </div>
              <ChevronLeft size={16} className="text-farm-dim" />
            </Link>
          ))}
        </div>
      </div>

      {/* Top costs */}
      {topCosts.length > 0 && (
        <div>
          <p className="section-title">أعلى المصاريف</p>
          <div className="card space-y-3">
            {topCosts.map(([cat, amount]) => {
              const info = COST_CATEGORIES.find(c => c.key === cat)
              const pct = totalCosts > 0 ? (amount / totalCosts * 100) : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-farm-steel text-sm font-bold">{info?.icon} {info?.label ?? cat}</span>
                    <span className="text-farm-dim text-xs">${amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-farm-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-farm-green/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Equipment alerts */}
      {needsRepair > 0 && (
        <Link to="/equipment" className="card flex items-center gap-3 border-yellow-500/30">
          <Wrench size={20} className="text-yellow-400" />
          <div>
            <p className="text-farm-steel text-sm font-bold">{needsRepair} معدات تحتاج صيانة</p>
            <p className="text-farm-dim text-xs">اضغط لعرض التفاصيل</p>
          </div>
        </Link>
      )}

      <div className="h-8" />
    </div>
  )
}
