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

const metricCardStyle = {
  background: 'var(--surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border)',
  padding: 'var(--space-5)',
};

const smallCardStyle = {
  background: 'var(--surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border)',
  padding: 'var(--space-4)',
};

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
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{
          background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--danger)', margin: 0 }}>Error</p>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', margin: 'var(--space-1) 0 0' }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data available</p>
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

  const readinessCards = [
    { label: 'Venue Ready', value: metrics.readinessDistribution.ready, pct: readyPercentage, color: '#10b981', icon: <CheckCircle2 size={20} /> },
    { label: 'Partially Ready', value: metrics.readinessDistribution.partial, pct: partialPercentage, color: '#f59e0b', icon: <AlertTriangle size={20} /> },
    { label: 'Not Ready', value: metrics.readinessDistribution.notReady, pct: notReadyPercentage, color: '#ef4444', icon: <AlertCircle size={20} /> },
  ];

  const missingCards = [
    { label: 'Hotels Missing Halls', value: metrics.hotelsMissingHalls, color: '#ef4444' },
    { label: 'Missing Accommodation', value: metrics.hotelsMissingAccommodation, color: '#ef4444' },
    { label: 'Missing Occupancy Rules', value: metrics.hotelsMissingOccupancy, color: '#ef4444' },
    { label: 'Missing Photos', value: metrics.hotelsMissingPhotos, color: '#f59e0b' },
    { label: 'Not Venue Ready', value: metrics.hotelsNotVenueReady, color: '#ef4444', sub: 'Missing critical components' },
  ];

  const photoCards = [
    { label: 'Hotels With Photos', value: metrics.hotelsWithPhotos, color: '#10b981' },
    { label: 'Total Photos', value: metrics.totalPhotos, color: '#3b82f6', sub: 'Across all hotels' },
    { label: 'Photo Completion', value: `${metrics.photoCompletionPercentage}%`, color: 'var(--text-main)', sub: 'Hotels with at least one photo' },
    { label: 'Hotels Missing Photos', value: metrics.hotelsMissingPhotos, color: '#f59e0b' },
  ];

  const insightDotColor = (type: string) =>
    type === 'CRITICAL' ? '#ef4444' : type === 'WARNING' ? '#f59e0b' : type === 'INFO' ? '#3b82f6' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <BarChart3 size={24} style={{ color: 'var(--text-muted)' }} />
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Data Quality Dashboard</h2>
      </div>

      {/* Overall Readiness */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {readinessCards.map(card => (
          <div key={card.label} style={metricCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: card.color, marginBottom: '0.25rem' }}>
              {card.value}
            </div>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>
              {card.pct}% of {metrics.totalHotels} hotels
            </p>
            <div style={{ marginTop: 'var(--space-3)', width: '100%', background: 'var(--surface-2)', borderRadius: '999px', height: '0.5rem' }}>
              <div style={{ background: card.color, height: '0.5rem', borderRadius: '999px', width: `${card.pct}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Missing Components */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {missingCards.map(card => (
          <div key={card.label} style={smallCardStyle}>
            <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 var(--space-1)' }}>{card.label}</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: card.color, margin: 0 }}>{card.value}</p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-2) 0 0' }}>
              {card.sub ?? `${metrics.totalHotels > 0 ? Math.round((card.value / metrics.totalHotels) * 100) : 0}% of total`}
            </p>
          </div>
        ))}
      </div>

      {/* Photo Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
        {photoCards.map(card => (
          <div key={card.label} style={smallCardStyle}>
            <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 var(--space-1)' }}>{card.label}</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: card.color, margin: 0 }}>{card.value}</p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-2) 0 0' }}>
              {card.sub ?? `${metrics.totalHotels > 0 ? Math.round((Number(card.value) / metrics.totalHotels) * 100) : 0}% of total`}
            </p>
          </div>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              Readiness Insights
            </h3>
          </div>
          <div>
            {insights.map((insight, idx) => (
              <div key={idx} style={{ padding: 'var(--space-4)', borderBottom: idx < insights.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div style={{
                    flexShrink: 0, width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                    marginTop: '0.4rem', background: insightDotColor(insight.type),
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{insight.message}</p>
                    {insight.affectedHotels && (
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 0' }}>
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
      <div style={{
        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-main)', margin: 0 }}>
          <strong>Summary:</strong> Out of {metrics.totalHotels} hotels in the system, 
          <strong style={{ color: '#10b981' }}> {metrics.readinessDistribution.ready} are venue-ready</strong>,
          <strong style={{ color: '#f59e0b' }}> {metrics.readinessDistribution.partial} are partially ready</strong>, and
          <strong style={{ color: '#ef4444' }}> {metrics.readinessDistribution.notReady} need configuration</strong>.
        </p>
      </div>
    </div>
  );
}
