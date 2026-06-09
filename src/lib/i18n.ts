const ar: Record<string, string> = {
  home: 'الرئيسية', lands: 'الأراضي', costs: 'المصاريف', equipment: 'المعدات',
  workers: 'العمال', addCost: 'إضافة مصروف', addLand: 'إضافة أرض',
  totalLands: 'الأراضي', totalDunams: 'دونم', totalCosts: 'المصاريف',
  totalRevenue: 'الإيرادات', profit: 'الربح', loss: 'خسارة',
  dunams: 'دونم', tonne: 'طن', season: 'موسم',
  dashboard: 'لوحة التحكم', settings: 'الإعدادات',
  save: 'حفظ', cancel: 'إلغاء', delete: 'حذف',
}
export function tr(key: string) { return ar[key] ?? key }

export type CostCategory = { key: string; label: string; short: string; icon: string; color: string }

export const COST_CATEGORIES: CostCategory[] = [
  { key: 'mazout', label: 'مازوت / بنزين', short: 'مازوت', icon: '⛽', color: '#f97316' },
  { key: 'seeds', label: 'بذور / شتول', short: 'بذور', icon: '🌱', color: '#22c55e' },
  { key: 'fertilizer', label: 'سماد', short: 'سماد', icon: '🧪', color: '#8b5cf6' },
  { key: 'pesticides', label: 'مبيدات', short: 'مبيدات', icon: '🧴', color: '#ec4899' },
  { key: 'workers', label: 'عمال', short: 'عمال', icon: '👷', color: '#3b82f6' },
  { key: 'tractor', label: 'تراكتور', short: 'تراكتور', icon: '🚜', color: '#f59e0b' },
  { key: 'water', label: 'مياه / ري', short: 'مياه', icon: '💧', color: '#06b6d4' },
  { key: 'transport', label: 'نقل', short: 'نقل', icon: '🚛', color: '#6366f1' },
  { key: 'storage', label: 'تخزين', short: 'تخزين', icon: '❄️', color: '#14b8a6' },
  { key: 'other', label: 'أخرى', short: 'أخرى', icon: '📋', color: '#78716c' },
]

const FALLBACK: CostCategory = { key: 'other', label: 'أخرى', short: 'أخرى', icon: '📋', color: '#78716c' }

// Single source of truth — every page uses this so a category always looks the same.
export function cat(key: string): CostCategory {
  return COST_CATEGORIES.find(c => c.key === key) ?? { ...FALLBACK, label: key, short: key }
}

export const CROPS = ['بطاطا', 'قمح', 'بصل', 'خضار', 'شمندر', 'عنب', 'تفاح', 'أخرى']
export const CROP_ICONS: Record<string, string> = {
  'بطاطا': '🥔', 'قمح': '🌾', 'بصل': '🧅', 'خضار': '🥬', 'شمندر': '🫜', 'عنب': '🍇', 'تفاح': '🍎',
}
export function cropIcon(crop?: string | null) { return (crop && CROP_ICONS[crop]) || '🌿' }

export const SEASONS = ['صيف', 'شتاء']

// Format money consistently as $1,234 (rounded, handles null/NaN)
export function money(n: any): string {
  const v = Number(n) || 0
  return '$' + Math.round(v).toLocaleString('en-US')
}
