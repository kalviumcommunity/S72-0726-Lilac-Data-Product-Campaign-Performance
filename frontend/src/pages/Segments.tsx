import { useSegments } from '../hooks/useEda';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

export default function Segments() {
  const { profiles, loading, error } = useSegments();

  if (loading) return <div className="p-6 text-gray-400">Loading segments...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!profiles || profiles.length === 0) return <div className="p-6 text-gray-400">No segment data available.</div>;

  // Format data for Radar Chart
  // We want to compare across features: ROI, activation_score, conversion_rate, Customer_Satisfaction_Post_Refund
  // Wait, their scales are very different. ROI ~ 1-5, activation_score ~ 0-100, conversion_rate ~ 0-1, satisfaction ~ 0-10
  // It's better to normalise them or use different charts, but radar chart can handle different scales if we normalise them relative to max.
  
  const features = ['ROI', 'activation_score', 'conversion_rate', 'Customer_Satisfaction_Post_Refund'];
  const maxVals = features.reduce((acc, feat) => {
    acc[feat] = Math.max(...profiles.map(p => Math.abs(p.means[feat] || 0)));
    if (acc[feat] === 0) acc[feat] = 1; // avoid div by 0
    return acc;
  }, {} as Record<string, number>);

  const radarData = features.map(feat => {
    const dataPoint: any = { subject: feat.replace(/_/g, ' ') };
    profiles.forEach(p => {
      // Normalise to 0-100 scale for visual comparison
      dataPoint[p.label] = ((p.means[feat] || 0) / maxVals[feat]) * 100;
      dataPoint[`${p.label}_raw`] = p.means[feat]; // Store raw for tooltip if needed
    });
    return dataPoint;
  });

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const rawVal = entry.payload[`${entry.name}_raw`];
            const displayVal = typeof rawVal === 'number' ? (
              label.includes('rate') ? (rawVal * 100).toFixed(2) + '%' 
              : rawVal.toFixed(2)
            ) : 'N/A';
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {displayVal}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold gradient-text mb-8">Customer Segmentation</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {profiles.map((p, i) => (
          <div key={p.cluster_id} className="glass-card p-6 border-t-4" style={{ borderColor: colors[i % colors.length] }}>
            <h3 className="text-2xl font-bold text-white mb-1">{p.label}</h3>
            <p className="text-gray-400 mb-4">{p.size.toLocaleString()} Campaigns</p>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Avg Activation</span>
                <span className="font-semibold text-white">{(p.means.activation_score || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Avg ROI</span>
                <span className="font-semibold text-cyan-400">{(p.means.ROI || 0).toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Avg Conversion</span>
                <span className="font-semibold text-purple-400">{((p.means.conversion_rate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Avg Satisfaction</span>
                <span className="font-semibold text-orange-400">{(p.means.Customer_Satisfaction_Post_Refund || 0).toFixed(1)} / 10</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 h-[500px] flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-white text-center">Segment Profiles Comparison</h2>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {profiles.map((p, i) => (
                <Radar 
                  key={p.cluster_id} 
                  name={p.label} 
                  dataKey={p.label} 
                  stroke={colors[i % colors.length]} 
                  fill={colors[i % colors.length]} 
                  fillOpacity={0.3} 
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
