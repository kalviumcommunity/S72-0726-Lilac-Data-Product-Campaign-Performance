import { useVanityVsActivation } from '../hooks/useEda'
import KpiCard from '../components/KpiCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VanityAnalysis() {
  const { data, loading, error } = useVanityVsActivation()

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>
  if (error || !data)
    return <div className="p-6 text-red-500">{error || 'No data'}</div>

  const vanityRow = data.vanity_breakdown.find(r => r.vanity_traffic_flag === 1)
  const genuineRow = data.vanity_breakdown.find(r => r.vanity_traffic_flag === 0)

  const comparisonData = [
    {
      metric: 'Avg ROI',
      Vanity: vanityRow?.avg_roi ?? 0,
      Genuine: genuineRow?.avg_roi ?? 0,
    },
    {
      metric: 'Avg Conversions',
      Vanity: vanityRow?.avg_conversions ?? 0,
      Genuine: genuineRow?.avg_conversions ?? 0,
    },
    {
      metric: 'Avg Revenue ($k)',
      Vanity: (vanityRow?.avg_revenue ?? 0) / 1000,
      Genuine: (genuineRow?.avg_revenue ?? 0) / 1000,
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Vanity vs. Activation Analysis</h1>
        <p className="text-gray-500 mt-1">Campaigns with high clicks but poor conversion are flagged as vanity traffic</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Vanity Campaigns"
          value={vanityRow?.count.toLocaleString() ?? '—'}
          sub="High clicks, low conversion"
          accent="red"
          icon="🚨"
        />
        <KpiCard
          label="Genuine Activation"
          value={genuineRow?.count.toLocaleString() ?? '—'}
          sub="Meaningful downstream activation"
          accent="green"
          icon="✅"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Vanity vs. Genuine — KPI Comparison</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Vanity" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Genuine" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-amber-50 border border-amber-300 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">What is Vanity Traffic?</h3>
        <p className="text-sm text-amber-700">
          A campaign is flagged as vanity traffic when its click volume is in the top 40% of all campaigns,
          but its conversion rate falls in the bottom 25%. These campaigns consume budget and inflate impression
          metrics without generating meaningful signups, purchases, or activations.
        </p>
      </section>
    </div>
  )
}
