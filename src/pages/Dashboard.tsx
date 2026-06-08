import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COST_CATEGORIES } from '../lib/i18n'
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Wrench, Users, AlertTriangle, Leaf, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

const CAT_COLORS: Record<string, string> = {
  mazout: '#f97316', seeds: '#22c55e', fertilizer: '#8b5cf6', pesticides: '#ec4899',
  workers: '#3b82f6', tractor: '#f59e0b', water: '#06b6d4', transport: '#6366f1',
  storage: '#14b8a6', other: '#78716c',
}
const CROP_ICONS: Record<string, string> = { 'بطاطا': '🥔', 'قمح': '🌾', 'بصل': '🧅', 'خضار': '🥬' }

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
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="text-6xl mb-5 animate-float">🌾</div>
      <p className="text-gradient text-xl font-black tracking-wider animate-fade-up delay-2">MazraaTech</p>
      <div className="flex gap-1.5 mt-4">
        <div className="w-2 h-2 rounded-full bg-farm-green animate-pulse" /><div className="w-2 h-2 rounded-full bg-farm-green animate-pulse delay-2" /><div className="w-2 h-2 rounded-full bg-farm-green animate-pulse delay-4" />
      </div>
    </div>
  )

  const totalDunams = lands.reduce((s, l) => s + Number(l.size_dunams), 0)
  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0)
  const totalRevenue = seasons.reduce((s, ss) => s + Number(ss.total_revenue ?? 0), 0)
  const profit = totalRevenue - totalCosts
  const needsRepair = equipment.filter(e => e.status === 'needs_repair').length
  const byCat: Record<string, number> = {}
  costs.forEach(c => { byCat[c.category] = (byCat[c.category] ?? 0) + Number(c.amount) })
  const topCosts = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const landProfit = lands.map(l => {
    const s = seasons.find(ss => ss.land_id === l.id)
    const rev = Number(s?.total_revenue ?? 0)
    const cost = costs.filter(c => c.land_id === l.id).reduce((sum, c) => sum + Number(c.amount), 0)
    return { ...l, revenue: rev, cost, profit: rev - cost }
  }).sort((a, b) => b.profit - a.profit)
  const recent = costs.slice(0, 5)

  return (
    <div className="p-4 space-y-5">
      {/* Hero */}
      <div className="animate-fade-up">
        <p className="text-farm-dim text-xs font-bold tracking-[0.2em] flex items-center gap-1.5"><Leaf size={12} className="text-farm-green" /> موسم ٢٠٢٦</p>
        <h1 className="text-farm-steel text-2xl font-black mt-1">مرحباً 👋</h1>
      </div>

      {/* KPIs — colored gradient cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card kpi-blue animate-fade-up delay-1">
          <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center"><span className="text-sm">🌿</span></div><p className="text-blue-300 text-[10px] font-bold">الأراضي</p></div>
          <p className="text-3xl font-black text-white animate-count delay-1">{lands.length}</p>
          <p className="text-blue-300/60 text-[10px] mt-0.5">{totalDunams.toLocaleString()} دونم</p>
        </div>
        <div className="card kpi-red animate-fade-up delay-2">
          <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center"><span className="text-sm">💸</span></div><p className="text-red-300 text-[10px] font-bold">المصاريف</p></div>
          <p className="text-3xl font-black text-white animate-count delay-2">${totalCosts.toLocaleString()}</p>
          <p className="text-red-300/60 text-[10px] mt-0.5">هذا الموسم</p>
        </div>
        <div className="card kpi-green animate-fade-up delay-3">
          <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center"><span className="text-sm">💰</span></div><p className="text-green-300 text-[10px] font-bold">الإيرادات</p></div>
          <p className="text-3xl font-black text-white animate-count delay-3">${totalRevenue.toLocaleString()}</p>
          <p className="text-green-300/60 text-[10px] mt-0.5">المبيعات</p>
        </div>
        <div className={`card animate-fade-up delay-4 animate-glow ${profit >= 0 ? 'kpi-green' : 'kpi-red'}`}>
          <div className="flex items-center gap-2 mb-2"><div className={`w-7 h-7 rounded-lg ${profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>{profit >= 0 ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}</div><p className={`${profit >= 0 ? 'text-green-300' : 'text-red-300'} text-[10px] font-bold`}>{profit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</p></div>
          <p className={`text-3xl font-black ${profit >= 0 ? 'text-gradient' : 'text-red-400'} animate-count delay-4`}>${Math.abs(profit).toLocaleString()}</p>
        </div>
      </div>

      {/* Quick add — big green button */}
      <Link to="/costs/new" className="block animate-fade-up delay-5">
        <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e, #4ade80)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Plus size={24} className="text-white" /></div>
            <div>
              <p className="text-white font-black text-base">إضافة مصروف</p>
              <p className="text-white/70 text-xs">سجّل مصروف جديد على أي أرض</p>
            </div>
          </div>
          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -left-8 -top-8 w-20 h-20 rounded-full bg-white/5" />
        </div>
      </Link>

      {/* Quick shortcuts */}
      <div className="animate-fade-up delay-6">
        <p className="section-title">إضافة سريعة</p>
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
          {COST_CATEGORIES.slice(0, 6).map((c, i) => (
            <Link key={c.key} to={`/costs/new?cat=${c.key}`}
              className={`animate-scale-in delay-${Math.min(i + 5, 10)} flex-shrink-0 rounded-2xl px-4 py-3 flex flex-col items-center gap-2 min-w-[76px] border border-transparent hover:-translate-y-1 transition-all duration-300 active:scale-90`}
              style={{ background: `${CAT_COLORS[c.key]}15`, borderColor: `${CAT_COLORS[c.key]}30` }}>
              <span className="text-2xl">{c.icon}</span>
              <span className="text-[10px] font-bold" style={{ color: CAT_COLORS[c.key] }}>{c.label.split('/')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Per-land profit */}
      <div className="animate-fade-up delay-7">
        <p className="section-title">الأراضي — الربح والخسارة</p>
        <div className="space-y-2.5">
          {landProfit.map((l, i) => (
            <Link key={l.id} to={`/lands/${l.id}`}
              className={`card flex items-center gap-3 hover:border-farm-green/30 hover:-translate-y-0.5 transition-all duration-200 animate-slide-right delay-${Math.min(i + 7, 10)}`}>
              <div className="w-11 h-11 rounded-xl bg-farm-elevated flex items-center justify-center text-xl">
                {CROP_ICONS[l.current_crop] ?? '🌿'}
              </div>
              <div className={`w-1 self-stretch rounded-full ${l.profit > 0 ? 'bg-green-400' : l.profit < 0 ? 'bg-red-400' : 'bg-farm-border'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-farm-steel font-bold text-sm truncate">{l.name}</p>
                <p className="text-farm-dim text-[10px]">{l.current_crop} · {Number(l.size_dunams)} دونم</p>
              </div>
              <div className="text-left min-w-[70px]">
                <p className={`text-sm font-black ${l.profit > 0 ? 'text-green-400' : l.profit < 0 ? 'text-red-400' : 'text-farm-dim'}`}>
                  {l.profit !== 0 ? (l.profit > 0 ? '+' : '') + '$' + l.profit.toLocaleString() : '—'}
                </p>
                {l.cost > 0 && <p className="text-farm-dim text-[9px]">م: ${l.cost.toLocaleString()}</p>}
              </div>
              <ChevronLeft size={14} className="text-farm-dim" />
            </Link>
          ))}
        </div>
      </div>

      {/* Cost breakdown — colorful bars */}
      {topCosts.length > 0 && (
        <div className="animate-fade-up delay-8">
          <p className="section-title">أين تذهب أموالك؟</p>
          <div className="card space-y-4">
            {topCosts.map(([cat, amount], i) => {
              const info = COST_CATEGORIES.find(c => c.key === cat)
              const pct = totalCosts > 0 ? (amount / totalCosts * 100) : 0
              const color = CAT_COLORS[cat] ?? '#78716c'
              return (
                <div key={cat} className={`animate-fade-in delay-${Math.min(i + 8, 10)}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-farm-steel text-xs font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: color + '20' }}>{info?.icon}</span>
                      {info?.label ?? cat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black" style={{ color }}>{pct.toFixed(0)}%</span>
                      <span className="text-farm-dim text-[10px]">${amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-farm-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full animate-bar transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="animate-fade-up delay-9">
          <p className="section-title">آخر المصاريف</p>
          <div className="card divide-y divide-farm-border/30">
            {recent.map((c, i) => {
              const info = COST_CATEGORIES.find(cat => cat.key === c.category)
              const color = CAT_COLORS[c.category] ?? '#78716c'
              return (
                <div key={c.id} className={`flex items-center gap-3 py-3 first:pt-1 last:pb-1 animate-fade-in delay-${Math.min(i + 9, 10)}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: color + '18' }}>{info?.icon ?? '📋'}</div>
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

      {/* Equipment & Workers */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-10">
        <Link to="/equipment" className="card kpi-amber flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Wrench size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-farm-steel text-sm font-bold">{equipment.length} معدات</p>
            {needsRepair > 0 ? (
              <p className="text-amber-400 text-[10px] flex items-center gap-0.5"><AlertTriangle size={8} /> {needsRepair} صيانة</p>
            ) : (
              <p className="text-farm-dim text-[10px]">كل شيء يعمل</p>
            )}
          </div>
        </Link>
        <Link to="/workers" className="card kpi-purple flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Users size={18} className="text-purple-400" />
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
