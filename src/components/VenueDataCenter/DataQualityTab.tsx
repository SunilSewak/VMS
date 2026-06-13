import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QualityMetric {
  label: string;
  value: number;
  total: number;
  percentage: number;
  color: 'green' | 'red' | 'yellow' | 'blue';
  icon: React.ReactNode;
}

interface DataQualityTabProps {
  refreshTrigger: number;
}

export function DataQualityTab({ refreshTrigger }: DataQualityTabProps) {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQualityMetrics();
  }, [refreshTrigger]);

  async function loadQualityMetrics() {
    try {
      setLoading(true);
      setError(null);

      // Get total hotels
      const { count: hotelCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true });

      // Get hotels with all required data
      const { count: completeCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .not('hall_master_id', 'is', null)
        .not('accommodation_inventory_id', 'is', null);

      // Get hotels missing halls
      const { count: missingHallsCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .is('hall_master_id', null);

      // Get hotels missing accommodation
      const { count: missingAccommodationCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .is('accommodation_inventory_id', null);

      const total = hotelCount || 0;
      const complete = completeCount || 0;

      setMetrics([
        {
          label: 'Hotels Ready',
          value: complete,
          total,
          percentage: total > 0 ? Math.round((complete / total) * 100) : 0,
          color: 'green',
          icon: <CheckCircle2 className="w-8 h-8" />
        },
        {
          label: 'Missing Halls',
          value: missingHallsCount || 0,
          total,
          percentage: total > 0 ? Math.round(((missingHallsCount || 0) / total) * 100) : 0,
          color: 'red',
          icon: <AlertTriangle className="w-8 h-8" />
        },
        {
          label: 'Missing Accommodation',
          value: missingAccommodationCount || 0,
          total,
          percentage: total > 0 ? Math.round(((missingAccommodationCount || 0) / total) * 100) : 0,
          color: 'yellow',
          icon: <AlertTriangle className="w-8 h-8" />
        },
        {
          label: 'Total Hotels',
          value: total,
          total,
          percentage: 100,
          color: 'blue',
          icon: <TrendingUp className="w-8 h-8" />
        }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load quality metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const colorMap = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200'
  };

  const iconColorMap = {
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Quality</h2>
        <p className="text-gray-600 text-sm mt-1">Monitor venue repository completeness and quality</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <div
            key={metric.label}
            className={`rounded-lg border p-6 ${colorMap[metric.color]}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${iconColorMap[metric.color]}`}>
                {metric.icon}
              </div>
              <span className="text-2xl font-bold text-gray-900">{metric.percentage}%</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{metric.label}</p>
            <p className="text-xs text-gray-600">
              {metric.value} of {metric.total}
            </p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Venue Readiness Score</p>
            <p className="mt-1">A venue is considered "ready" when it has complete halls, accommodation inventory, occupancy rules, and photos configured.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
