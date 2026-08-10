import { useModelMetrics, useFeatureImportance } from '../hooks/useEda';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ModelInsights() {
  const { metrics, loading: mLoading, error: mError } = useModelMetrics();
  const { importances, loading: iLoading, error: iError } = useFeatureImportance();

  if (mLoading || iLoading) {
    return <div className="p-6 text-gray-400">Loading model insights...</div>;
  }

  if (mError || iError) {
    return <div className="p-6 text-red-400">Error: {mError || iError}</div>;
  }

  const formatImportance = (data?: Record<string, number>) => {
    if (!data) return [];
    return Object.entries(data)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: Number((value * 100).toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  };

  const convData = formatImportance(importances.conversion);
  const actData = formatImportance(importances.activation);

  const MetricCard = ({ title, data, keys }: { title: string, data: any, keys: {label: string, key: string, pct?: boolean}[] }) => (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {keys.map((k) => (
          <div key={k.key}>
            <p className="text-sm text-gray-400">{k.label}</p>
            <p className="text-xl font-bold text-cyan-400">
              {data && data[k.key] !== undefined 
                ? (k.pct ? (data[k.key] * 100).toFixed(2) + '%' : Number(data[k.key]).toFixed(4))
                : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold gradient-text mb-8">Model Insights</h1>

      <h2 className="text-xl font-semibold mb-4 text-white">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard 
          title="Conversion Predictor" 
          data={metrics.conversion} 
          keys={[{label: 'RMSE', key: 'RMSE'}, {label: 'R²', key: 'R2'}]} 
        />
        <MetricCard 
          title="Activation Classifier" 
          data={metrics.activation} 
          keys={[
            {label: 'F1 Score', key: 'f1', pct: true}, 
            {label: 'ROC-AUC', key: 'roc_auc', pct: true},
            {label: 'Accuracy', key: 'accuracy', pct: true}
          ]} 
        />
        <MetricCard 
          title="Revenue Forecaster" 
          data={metrics.revenue} 
          keys={[{label: 'RMSE', key: 'RMSE'}, {label: 'R²', key: 'R2'}]} 
        />
        {/* Placeholder for segmentation if needed */}
      </div>

      <h2 className="text-xl font-semibold mb-4 text-white">Feature Importances</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
        <div className="glass-card p-4 flex flex-col">
          <h3 className="text-center font-semibold text-gray-200 mb-4">Conversion Predictor</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={convData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" tickFormatter={(val) => `${val}%`} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} tick={{fontSize: 11}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col">
          <h3 className="text-center font-semibold text-gray-200 mb-4">Activation Classifier</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" tickFormatter={(val) => `${val}%`} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} tick={{fontSize: 11}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
