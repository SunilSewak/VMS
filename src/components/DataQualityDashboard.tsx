import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';
import { getQualityMetricsSummary, getReadinessInsights } from '../features/venues/qualityService';

interface QualityMetrics {
  totalHotels: number;
  hotelsMissingHalls: number;
  hotelsMissingAccommodation: number;
  hotelsMissingOccupancy: number;
  hotelsMissingPhotos: number;
  hotelsWithPhotos: number;
  totalPhotos: number;
  photoCompletionPercentage: number;
  hotelsNotVenueReady: number;
  readinessDistribution: {
    ready: number;
    partial: number;
    notReady: number;
  };
}

export function DataQualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [metricsData, insightsData] = await Promise.all([
        getQualityMetricsSummary(),
        getReadinessInsights()
      ]);
      setMetrics(metricsData);
      setInsights(insightsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load quality metrics');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  const readyPercentage = metrics.totalHotels > 0 
    ? Math.round((metrics.readinessDistribution.ready / metrics.totalHotels) * 100)
    : 0;
  const partialPercentage = metrics.totalHotels > 0
    ? Math.round((metrics.readinessDistribution.partial / metrics.totalHotels) * 100)
    : 0;
  const notReadyPercentage = 100 - readyPercentage - partialPercentage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">Data Quality Dashboard</h2>
      </div>

      {/* Overall Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Venue Ready</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {metrics.readinessDistribution.ready}
          </div>
          <p className="text-sm text-gray-500">
            {readyPercentage}% of {metrics.totalHotels} hotels
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${readyPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Partially Ready</span>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {metrics.readinessDistribution.partial}
          </div>
          <p className="text-sm text-gray-500">
            {partialPercentage}% of {metrics.totalHotels} hotels
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${partialPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Not Ready</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            {metrics.readinessDistribution.notReady}
          </div>
          <p className="text-sm text-gray-500">
            {notReadyPercentage}% of {metrics.totalHotels} hotels
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full"
              style={{ width: `${notReadyPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Missing Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Hotels Missing Halls</p>
          <p className="text-2xl font-bold text-red-600">
            {metrics.hotelsMissingHalls}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingHalls / metrics.totalHotels) * 100)}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Missing Accommodation</p>
          <p className="text-2xl font-bold text-red-600">
            {metrics.hotelsMissingAccommodation}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingAccommodation / metrics.totalHotels) * 100)}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Missing Occupancy Rules</p>
          <p className="text-2xl font-bold text-red-600">
            {metrics.hotelsMissingOccupancy}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingOccupancy / metrics.totalHotels) * 100)}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Missing Photos</p>
          <p className="text-2xl font-bold text-yellow-600">
            {metrics.hotelsMissingPhotos}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingPhotos / metrics.totalHotels) * 100)}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Not Venue Ready</p>
          <p className="text-2xl font-bold text-red-600">
            {metrics.hotelsNotVenueReady}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Missing critical components
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Hotels With Photos</p>
          <p className="text-2xl font-bold text-emerald-600">
            {metrics.hotelsWithPhotos}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsWithPhotos / metrics.totalHotels) * 100)}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Total Photos</p>
          <p className="text-2xl font-bold text-blue-600">
            {metrics.totalPhotos}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Across all hotels
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Photo Completion</p>
          <p className="text-2xl font-bold text-slate-900">
            {metrics.photoCompletionPercentage}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Hotels with at least one photo
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Hotels Missing Photos</p>
          <p className="text-2xl font-bold text-yellow-600">
            {metrics.hotelsMissingPhotos}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingPhotos / metrics.totalHotels) * 100)}% of total
          </p>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Readiness Insights
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                    insight.type === 'CRITICAL' ? 'bg-red-600' :
                    insight.type === 'WARNING' ? 'bg-yellow-600' :
                    insight.type === 'INFO' ? 'bg-blue-600' :
                    'bg-green-600'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                    {insight.affectedHotels && (
                      <p className="text-xs text-gray-500 mt-1">
                        Affects {insight.affectedHotels} hotel{insight.affectedHotels !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Summary:</strong> Out of {metrics.totalHotels} hotels in the system, 
          <strong className="text-green-700"> {metrics.readinessDistribution.ready} are venue-ready</strong>,
          <strong className="text-yellow-700"> {metrics.readinessDistribution.partial} are partially ready</strong>, and
          <strong className="text-red-700"> {metrics.readinessDistribution.notReady} need configuration</strong>.
        </p>
      </div>
    </div>
  );
}
