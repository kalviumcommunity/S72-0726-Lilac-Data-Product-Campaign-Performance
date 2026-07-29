import { useKeywordPerformance } from '../hooks/useEda'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Keywords() {
  const { data, loading, error } = useKeywordPerformance()

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>
  if (error || !data) return <div className="p-6 text-red-500">{error || 'No data'}</div>

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Keyword Theme Performance</h1>
        <p className="text-gray-500 mt-1">Which keyword themes drive the highest activation and ROI?</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Avg Activation Score by Keyword</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={(v) => v.toFixed(1)} />
            <YAxis type="category" dataKey="Common_Keywords" tick={{ fontSize: 12 }} width={80} />
            <Tooltip />
            <Bar dataKey="avg_activation_score" name="Activation Score" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Keyword Summary Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Campaigns</th>
                <th className="px-4 py-3">Avg Conv. Rate</th>
                <th className="px-4 py-3">Avg ROI</th>
                <th className="px-4 py-3">Total Revenue</th>
                <th className="px-4 py-3">Activation Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.Common_Keywords} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.Common_Keywords}</td>
                  <td className="px-4 py-3">{row.campaign_count.toLocaleString()}</td>
                  <td className="px-4 py-3">{(row.avg_conversion_rate * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3">{row.avg_roi.toFixed(2)}</td>
                  <td className="px-4 py-3">${row.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      row.avg_activation_score >= 50 ? 'bg-green-100 text-green-700' :
                      row.avg_activation_score >= 35 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {row.avg_activation_score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
