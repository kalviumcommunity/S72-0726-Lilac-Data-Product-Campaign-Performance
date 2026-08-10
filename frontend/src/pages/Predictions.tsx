import React, { useState } from 'react';
import { api } from '../services/api';
import { CampaignPredictRequest, CampaignPredictResponse } from '../types';

export default function Predictions() {
  const [formData, setFormData] = useState<CampaignPredictRequest>({
    Budget: 1000,
    Clicks: 500,
    ROI: 1.5,
    Discount_Level: 10,
    Units_Sold: 100,
    Bundle_Price: 50,
    Subscription_Length: 12,
    Customer_Satisfaction_Post_Refund: 5,
    subscription_value_score: 30,
    discount_tier: 'Low',
    revenue_per_click: 2.5,
    cost_per_conversion: 15,
    Conversions: 50,
    activation_score: 80,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CampaignPredictResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predict(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isHighActivation = result ? result.activation_probability >= 0.5 : false;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold gradient-text mb-6">Campaign Predictions</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Input Parameters</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {key.replace(/_/g, ' ')}
                  </label>
                  {key === 'discount_tier' ? (
                    <select
                      name={key}
                      value={value}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      name={key}
                      value={value}
                      onChange={handleChange}
                      step="any"
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Predicting...' : 'Predict Outcome'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>
        </div>

        <div>
          {result && (
            <div className="glass-card p-6 sticky top-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6 text-white">Prediction Results</h2>
              <div className="space-y-6">
                <div className={`p-4 rounded-lg border ${isHighActivation ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Activation Status</p>
                  <p className={`text-2xl font-bold ${isHighActivation ? 'text-green-400' : 'text-red-400'}`}>
                    {isHighActivation ? 'High Activation' : 'Vanity Risk'}
                  </p>
                  <p className="text-sm mt-2 text-gray-300">
                    Probability: {(result.activation_probability * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Predicted Conversion Rate</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {(result.predicted_conversion_rate * 100).toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Predicted Revenue</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${result.predicted_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
