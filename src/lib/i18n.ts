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

export const COST_CATEGORIES = [
  { key: 'mazout', label: 'مازوت / بنزين', icon: '⛽' },
  { key: 'seeds', label: 'بذور / شتول', icon: '🌱' },
  { key: 'fertilizer', label: 'سماد', icon: '🧪' },
  { key: 'pesticides', label: 'مبيدات', icon: '🧴' },
  { key: 'workers', label: 'عمال', icon: '👷' },
  { key: 'tractor', label: 'تراكتور', icon: '🚜' },
  { key: 'water', label: 'مياه / ري', icon: '💧' },
  { key: 'transport', label: 'نقل', icon: '🚛' },
  { key: 'storage', label: 'تخزين', icon: '❄️' },
  { key: 'other', label: 'أخرى', icon: '📋' },
]

export const CROPS = ['بطاطا', 'قمح', 'بصل', 'خضار', 'شمندر', 'عنب', 'تفاح', 'أخرى']
export const SEASONS = ['صيف', 'شتاء']
