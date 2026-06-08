import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'الرئيسية' },
  { to: '/costs/new', icon: Plus, label: 'مصروف', accent: true },
  { to: '/lands', icon: Map, label: 'الأراضي' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-farm-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-farm-border/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌾</span>
            <div>
              <span className="text-gradient font-black text-base tracking-wider">MazraaTech</span>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-farm-dim text-[10px] font-bold border border-farm-border rounded-lg px-3 py-1.5 hover:border-red-400/50 hover:text-red-400 transition-all">
            خروج
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">{children}</div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-20 glass border-t border-farm-border/30">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 transition-all duration-200 ${n.accent ? '' : isActive ? 'text-farm-green' : 'text-farm-dim hover:text-farm-steel'}`
            }>
              {n.accent ? (
                <div className="w-13 h-13 -mt-6 rounded-full bg-gradient-to-br from-farm-green to-emerald-400 flex items-center justify-center shadow-xl shadow-farm-green/30 hover:shadow-farm-green/50 transition-all duration-300 active:scale-90"
                  style={{ width: 52, height: 52 }}>
                  <n.icon size={24} className="text-farm-dark" strokeWidth={2.5} />
                </div>
              ) : (
                <n.icon size={22} strokeWidth={1.8} />
              )}
              <span className="text-[10px] font-bold">{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
