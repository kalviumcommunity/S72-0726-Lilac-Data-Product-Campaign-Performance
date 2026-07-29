import { useSummary, useVanityVsActivation, useKeywordPerformance, useTierBreakdown } from '../hooks/useEda'
import KpiCard from '../components/KpiCard'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const summary = useSummary()
  const vanity = useVanityVsActivation()
  const keywords = useKeywordPerformance()
  const tiers = useTierBreakdown()

  if (summary.loading || vanity.loading || keywords.loading || tiers.loading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading dashboard...</div>
  }

  if (summary.error || vanity.error || keywords.error || tiers.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {summary.error || vanity.error || keywords.error || tiers.error}
          <p className="text-sm mt-1">Have you run the pipeline? Try: <code>python scripts/run_pipeline.py</code></p>
        </div>
      </div>
    )
  }

  const s = summary.data!
  const v = vanity.data!
  const k = keywords.data!.slice(0, 10) // Top 10 keywords
  const t = tiers.data!

  return (
    <div className="p-6 space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Campaign Performance Intelligence</h1>
        <p className="text-gray-600 mt-1">Identify which campaigns drive real activation vs. vanity traffic</p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Campaigns" value={s.total_campaigns.toLocaleString()} accent="blue" icon="🎯" />
        <KpiCard
          label="Total Revenue"
          value={`$${(s.total_revenue / 1_000_000).toFixed(2)}M`}
          accent="green"
          icon="💰"
        />
        <KpiCard
          label="Avg Conversion Rate"
          value={`${(s.avg_conversion_rate * 100).toFixed(2)}%`}
          sub={`Activation Score: ${s.avg_activation_score.toFixed(1)}`}
          accent="purple"
          icon="📈"
        />
        <KpiCard
          label="Vanity Traffic"
          value={`${s.vanity_traffic_pct.toFixed(1)}%`}
          sub={`${s.vanity_traffic_count.toLocaleString()} campaigns`}
          accent="yellow"
          icon="⚠️"
        />
      </section>

      {/* Activation Label Donut-style summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(v.activation_label_counts).map(([label, count]) => {
          const accent = label === 'High' ? 'green' : label === 'Medium' ? 'yellow' : 'red'
          return (
            <KpiCard
              key={label}
              label={`${label} Activation Campaigns`}
              value={count.toLocaleString()}
              accent={accent as 'green' | 'yellow' | 'red'}
              icon={label === 'High' ? '🚀' : label === 'Medium' ? '📊' : '🚨'}
            />
          )
        })}
      </section>

      {/* Clicks vs Conversion Rate Scatter */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Clicks vs. Conversion Rate — Vanity vs. Activation</h2>
        <p className="text-sm text-gray-500 mb-3">
          Red points = vanity traffic (high clicks, low conversion). Blue = genuine activation campaigns.
        </p>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="Clicks" name="Clicks" label={{ value: 'Clicks', position: 'insideBottom', offset: -10 }} />
            <YAxis dataKey="conversion_rate" name="Conv. Rate" tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) =>
                name === 'Conv. Rate' ? `${(value * 100).toFixed(2)}%` : value.toLocaleString()
              }
            />
            <Legend verticalAlign="top" />
            <Scatter
              name="Genuine Activation"
              data={v.scatter_points.filter(p => p.vanity_traffic_flag === 0)}
              fill="#6366f1"
              opacity={0.6}
            />
            <Scatter
              name="Vanity Traffic"
              data={v.scatter_points.filter(p => p.vanity_traffic_flag === 1)}
              fill="#f43f5e"
              opacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </section>

      {/* Keyword Performance Bar Chart */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Keyword Theme Performance</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={k} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="Common_Keywords" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => v.toFixed(1)} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg_activation_score" name="Avg Activation Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg_roi" name="Avg ROI" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Subscription Tier Table */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Performance by Subscription Tier</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Avg Conv. Rate</th>
                <th className="px-4 py-3">Avg ROI</th>
                <th className="px-4 py-3">Avg Revenue</th>
                <th className="px-4 py-3">Activation Score</th>
                <th className="px-4 py-3">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {t.map(row => (
                <tr key={row.Subscription_Tier} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.Subscription_Tier}</td>
                  <td className="px-4 py-3">{row.count.toLocaleString()}</td>
                  <td className="px-4 py-3">{(row.avg_conversion_rate * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3">{row.avg_roi.toFixed(2)}</td>
                  <td className="px-4 py-3">${row.avg_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${row.avg_activation_score}%` }}
                        />
                      </div>
                      <span>{row.avg_activation_score.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{'⭐'.repeat(Math.round(row.avg_satisfaction))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
