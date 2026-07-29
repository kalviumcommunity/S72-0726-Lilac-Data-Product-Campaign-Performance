import { useTierBreakdown } from '../hooks/useEda'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function Customers() {
  const { data, loading, error } = useTierBreakdown()

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>
  if (error || !data) return <div className="p-6 text-red-500">{error || 'No data'}</div>

  // Normalize radar chart values to 0–100 range for comparability
  const maxConv = Math.max(...data.map(d => d.avg_conversion_rate))
  const maxRoi = Math.max(...data.map(d => d.avg_roi))
  const maxRev = Math.max(...data.map(d => d.avg_revenue))
  const maxSat = Math.max(...data.map(d => d.avg_satisfaction))
  const maxSub = Math.max(...data.map(d => d.avg_subscription_length))

  const radarData = [
    { subject: 'Conv. Rate', ...Object.fromEntries(data.map(d => [d.Subscription_Tier, (d.avg_conversion_rate / maxConv) * 100])) },
    { subject: 'ROI',        ...Object.fromEntries(data.map(d => [d.Subscription_Tier, (d.avg_roi / maxRoi) * 100])) },
    { subject: 'Revenue',    ...Object.fromEntries(data.map(d => [d.Subscription_Tier, (d.avg_revenue / maxRev) * 100])) },
    { subject: 'Satisfaction', ...Object.fromEntries(data.map(d => [d.Subscription_Tier, (d.avg_satisfaction / maxSat) * 100])) },
    { subject: 'Sub. Length',  ...Object.fromEntries(data.map(d => [d.Subscription_Tier, (d.avg_subscription_length / maxSub) * 100])) },
  ]

  const colors: Record<string, string> = { Premium: '#6366f1', Standard: '#8b5cf6', Basic: '#ec4899' }

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Customer Insights</h1>
        <p className="text-gray-500 mt-1">Subscription tier breakdown and behavioral patterns</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Tier Performance Radar</h2>
        <p className="text-sm text-gray-400 mb-4">All metrics normalized 0–100 for comparability</p>
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}`} />
            <Legend />
            {data.map(d => (
              <Radar
                key={d.Subscription_Tier}
                name={d.Subscription_Tier}
                dataKey={d.Subscription_Tier}
                stroke={colors[d.Subscription_Tier] ?? '#999'}
                fill={colors[d.Subscription_Tier] ?? '#999'}
                fillOpacity={0.15}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map(row => (
          <div key={row.Subscription_Tier} className="bg-white rounded-xl shadow-sm p-5 border-t-4" style={{ borderColor: colors[row.Subscription_Tier] ?? '#999' }}>
            <h3 className="font-bold text-gray-800 text-lg">{row.Subscription_Tier}</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors[row.Subscription_Tier] ?? '#999' }}>
              {row.count.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mb-3">customers</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Conv. Rate: <strong>{(row.avg_conversion_rate * 100).toFixed(2)}%</strong></p>
              <p>Avg ROI: <strong>{row.avg_roi.toFixed(2)}</strong></p>
              <p>Activation Score: <strong>{row.avg_activation_score.toFixed(1)}</strong></p>
              <p>Avg Sub. Length: <strong>{row.avg_subscription_length.toFixed(0)} months</strong></p>
              <p>Satisfaction: <strong>{'⭐'.repeat(Math.round(row.avg_satisfaction))}</strong></p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
