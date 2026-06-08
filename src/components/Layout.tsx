import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, Receipt, Wrench, Plus } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'الرئيسية' },
  { to: '/lands', icon: Map, label: 'الأراضي' },
  { to: '/costs/new', icon: Plus, label: 'مصروف', accent: true },
  { to: '/equipment', icon: Wrench, label: 'المعدات' },
  { to: '/workers', icon: Receipt, label: 'العمال' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-farm-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-farm-dark/95 backdrop-blur-md border-b border-farm-border/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <span className="text-farm-green font-black text-lg tracking-wide">MazraaTech</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">{children}</div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-farm-dark/95 backdrop-blur-md border-t border-farm-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${n.accent ? '' : isActive ? 'text-farm-green' : 'text-farm-dim'}`
            }>
              {n.accent ? (
                <div className="w-12 h-12 -mt-5 rounded-full bg-farm-green flex items-center justify-center shadow-lg shadow-farm-green/30">
                  <n.icon size={22} className="text-farm-dark" strokeWidth={2.5} />
                </div>
              ) : (
                <n.icon size={20} strokeWidth={1.8} />
              )}
              <span className="text-[10px] font-bold">{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
