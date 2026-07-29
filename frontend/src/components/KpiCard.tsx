interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'red' | 'purple' | 'blue' | 'yellow'
  icon?: string
}

const accentClasses: Record<string, string> = {
  green:  'border-l-4 border-green-500  bg-green-50  text-green-700',
  red:    'border-l-4 border-red-400    bg-red-50    text-red-700',
  purple: 'border-l-4 border-purple-500 bg-purple-50 text-purple-700',
  blue:   'border-l-4 border-blue-500   bg-blue-50   text-blue-700',
  yellow: 'border-l-4 border-yellow-400 bg-yellow-50 text-yellow-700',
}

export default function KpiCard({ label, value, sub, accent = 'purple', icon }: KpiCardProps) {
  return (
    <div className={`rounded-xl p-5 shadow-sm ${accentClasses[accent]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}
