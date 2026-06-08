import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES } from '../lib/i18n'
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Wrench, Users, AlertTriangle, Leaf } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const [lands, setLands] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('farm_lands').select('*').eq('is_active', true).order('name'),
      supabase.from('farm_seasons').select('*').eq('year', 2026),
      supabase.from('farm_costs').select('*, farm_lands(name)').order('date', { ascending: false }).limit(100),
      supabase.from('farm_equipment').select('*').eq('is_active', true),
      supabase.from('farm_workers').select('*').eq('is_active', true),
    ]).then(([l, s, c, e, w]) => {
      setLands(l.data ?? []); setSeasons(s.data ?? []); setCosts(c.data ?? [])
      setEquipment(e.data ?? []); setWorkers(w.data ?? []); setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in">
      <div className="text-5xl mb-4 animate-pulse">🌾</div>
      <p className="text-farm-green font-black text-lg tracking-wider">MazraaTech</p>
      <p className="text-farm-dim text-xs mt-1">جاري تحميل بياناتك...</p>
    </div>
  )

  const totalDunams = lands.reduce((s, l) => s + Number(l.size_dunams), 0)
  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0)
  const totalRevenue = seasons.reduce((s, ss) => s + Number(ss.total_revenue ?? 0), 0)
  const profit = totalRevenue - totalCosts
  const needsRepair = equipment.filter(e => e.status === 'needs_repair').length
  const byCat: Record<string, number> = {}
  costs.forEach(c => { byCat[c.category] = (byCat[c.category] ?? 0) + Number(c.amount) })
  const topCosts = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const landProfit = lands.map(l => {
    const s = seasons.find(ss => ss.land_id === l.id)
    const rev = Number(s?.total_revenue ?? 0)
    const cost = costs.filter(c => c.land_id === l.id).reduce((sum, c) => sum + Number(c.amount), 0)
    return { ...l, revenue: rev, cost, profit: rev - cost }
  }).sort((a, b) => b.profit - a.profit)
  const recent = costs.slice(0, 5)

  return (
    <div className="p-4 space-y-5">
      {/* Hero greeting */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <Leaf size={18} className="text-farm-green" />
          <p className="text-farm-dim text-xs font-bold tracking-wider">موسم ٢٠٢٦</p>
        </div>
        <h1 className="text-farm-steel text-2xl font-black">لوحة التحكم</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card animate-fade-up delay-1 hover:border-farm-green/20 transition-all duration-300">
          <p className="text-farm-dim text-[10px] font-bold tracking-wider mb-1">🌿 الأراضي</p>
          <p className="text-3xl font-black text-farm-steel">{lands.length}</p>
          <p className="text-farm-dim text-[10px] mt-0.5">{totalDunams.toLocaleString()} دونم</p>
        </div>
        <div className="card animate-fade-up delay-2 hover:border-red-500/20 transition-all duration-300">
          <p className="text-farm-dim text-[10px] font-bold tracking-wider mb-1">💸 المصاريف</p>
          <p className="text-3xl font-black text-red-400">${totalCosts.toLocaleString()}</p>
          <p className="text-farm-dim text-[10px] mt-0.5">هذا الموسم</p>
        </div>
        <div className="card animate-fade-up delay-3 hover:border-farm-green/20 transition-all duration-300">
          <p className="text-farm-dim text-[10px] font-bold tracking-wider mb-1">💰 الإيرادات</p>
          <p className="text-3xl font-black text-farm-green">${totalRevenue.toLocaleString()}</p>
          <p className="text-farm-dim text-[10px] mt-0.5">المبيعات</p>
        </div>
        <div className={`card animate-fade-up delay-4 border-2 ${profit >= 0 ? 'border-farm-green/30 animate-pulse-glow' : 'border-red-500/30'}`}>
          <p className="text-farm-dim text-[10px] font-bold tracking-wider mb-1">{profit >= 0 ? '📈 الربح' : '📉 الخسارة'}</p>
          <p className={`text-3xl font-black ${profit >= 0 ? 'text-gradient' : 'text-red-400'}`}>${Math.abs(profit).toLocaleString()}</p>
          <p className="text-farm-dim text-[10px] mt-0.5 flex items-center gap-1">
            {profit >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />} صافي
          </p>
        </div>
      </div>

      {/* Quick cost shortcuts */}
      <div className="animate-fade-up delay-5">
        <p className="section-title">إضافة سريعة</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {COST_CATEGORIES.slice(0, 6).map((c, i) => (
            <Link key={c.key} to={`/costs/new?cat=${c.key}`}
              className={`animate-scale-in delay-${i + 4} flex-shrink-0 bg-farm-card border border-farm-border rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 min-w-[76px] hover:border-farm-green/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}>
              <span className="text-2xl">{c.icon}</span>
              <span className="text-farm-dim text-[10px] font-bold">{c.label.split('/')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Per-land profit */}
      <div className="animate-fade-up delay-6">
        <p className="section-title">الأراضي — الربح والخسارة</p>
        <div className="space-y-2">
          {landProfit.map((l, i) => (
            <Link key={l.id} to={`/lands/${l.id}`}
              className={`card flex items-center gap-3 hover:border-farm-green/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-right delay-${Math.min(i + 6, 10)}`}>
              <div className={`w-1.5 self-stretch rounded-full ${l.profit > 0 ? 'bg-farm-green' : l.profit < 0 ? 'bg-red-400' : 'bg-farm-border'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-farm-steel font-bold text-sm truncate">{l.name}</p>
                <p className="text-farm-dim text-[10px]">{l.current_crop} · {Number(l.size_dunams)} دونم</p>
              </div>
              <div className="text-left min-w-[70px]">
                <p className={`text-sm font-black ${l.profit > 0 ? 'text-farm-green' : l.profit < 0 ? 'text-red-400' : 'text-farm-dim'}`}>
                  {l.profit !== 0 ? (l.profit > 0 ? '+' : '') + '$' + l.profit.toLocaleString() : '—'}
                </p>
              </div>
              <ChevronLeft size={14} className="text-farm-dim" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="animate-fade-up delay-8">
          <p className="section-title">آخر المصاريف</p>
          <div className="card divide-y divide-farm-border/50">
            {recent.map((c, i) => {
              const info = COST_CATEGORIES.find(cat => cat.key === c.category)
              return (
                <div key={c.id} className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 animate-fade-in delay-${Math.min(i + 8, 10)}`}>
                  <div className="w-9 h-9 rounded-xl bg-farm-elevated flex items-center justify-center text-base">{info?.icon ?? '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-farm-steel text-sm font-bold truncate">{c.farm_lands?.name ?? '—'}</p>
                    <p className="text-farm-dim text-[10px]">{info?.label ?? c.category} · {format(new Date(c.date), 'dd/MM')}</p>
                  </div>
                  <p className="text-red-400 font-black text-sm">${Number(c.amount).toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top costs breakdown */}
      {topCosts.length > 0 && (
        <div className="animate-fade-up delay-9">
          <p className="section-title">أين تذهب أموالك؟</p>
          <div className="card space-y-3">
            {topCosts.map(([cat, amount], i) => {
              const info = COST_CATEGORIES.find(c => c.key === cat)
              const pct = totalCosts > 0 ? (amount / totalCosts * 100) : 0
              return (
                <div key={cat} className={`animate-fade-in delay-${Math.min(i + 9, 10)}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-farm-steel text-xs font-bold flex items-center gap-1.5">
                      <span className="text-base">{info?.icon}</span> {info?.label ?? cat}
                    </span>
                    <span className="text-farm-dim text-[10px] font-bold">${amount.toLocaleString()} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-farm-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-farm-green to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Equipment & Workers */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-10">
        <Link to="/equipment" className="card flex items-center gap-3 hover:border-yellow-500/30 hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Wrench size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-farm-steel text-sm font-bold">{equipment.length} معدات</p>
            {needsRepair > 0 ? (
              <p className="text-yellow-400 text-[10px] flex items-center gap-0.5"><AlertTriangle size={8} /> {needsRepair} تحتاج صيانة</p>
            ) : (
              <p className="text-farm-dim text-[10px]">الصيانة والإصلاح</p>
            )}
          </div>
        </Link>
        <Link to="/workers" className="card flex items-center gap-3 hover:border-farm-blue/30 hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-farm-blue/10 flex items-center justify-center">
            <Users size={18} className="text-farm-blue" />
          </div>
          <div>
            <p className="text-farm-steel text-sm font-bold">{workers.length} عمال</p>
            <p className="text-farm-dim text-[10px]">تسجيل ومتابعة</p>
          </div>
        </Link>
      </div>

      <div className="h-6" />
    </div>
  )
}
