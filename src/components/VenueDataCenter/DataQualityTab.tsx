import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
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

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string }> = {
  green: { bg: '#10b98112', border: '#10b98130', icon: '#10b981' },
  red: { bg: '#ef444412', border: '#ef444430', icon: '#ef4444' },
  yellow: { bg: '#f59e0b12', border: '#f59e0b30', icon: '#f59e0b' },
  blue: { bg: '#3b82f612', border: '#3b82f630', icon: '#3b82f6' },
};

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

      const { count: hotelCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true });

      const { count: completeCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .not('hall_master_id', 'is', null)
        .not('accommodation_inventory_id', 'is', null);

      const { count: missingHallsCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .is('hall_master_id', null);

      const { count: missingAccommodationCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .is('accommodation_inventory_id', null);

      const { count: historyCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .gt('total_ajanta_events', 0);

      const total = hotelCount || 0;
      const complete = completeCount || 0;

      setMetrics([
        {
          label: 'Hotels Ready',
          value: complete, total,
          percentage: total > 0 ? Math.round((complete / total) * 100) : 0,
          color: 'green',
          icon: <CheckCircle2 size={32} />,
        },
        {
          label: 'Missing Halls',
          value: missingHallsCount || 0, total,
          percentage: total > 0 ? Math.round(((missingHallsCount || 0) / total) * 100) : 0,
          color: 'red',
          icon: <AlertTriangle size={32} />,
        },
        {
          label: 'Missing Accommodation',
          value: missingAccommodationCount || 0, total,
          percentage: total > 0 ? Math.round(((missingAccommodationCount || 0) / total) * 100) : 0,
          color: 'yellow',
          icon: <AlertTriangle size={32} />,
        },
        {
          label: 'Venues with history',
          value: historyCount || 0, total,
          percentage: total > 0 ? Math.round(((historyCount || 0) / total) * 100) : 0,
          color: 'blue',
          icon: <Database size={32} />,
        },
        {
          label: 'Total Hotels',
          value: total, total,
          percentage: 100,
          color: 'blue',
          icon: <TrendingUp size={32} />,
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load quality metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Data Quality</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>Monitor venue repository completeness and quality</p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', margin: 0 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Quality Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {metrics.map(metric => {
          const colors = COLOR_MAP[metric.color];
          return (
            <div
              key={metric.label}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${colors.border}`,
                padding: 'var(--space-5)',
                background: colors.bg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ color: colors.icon }}>{metric.icon}</div>
                <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)' }}>{metric.percentage}%</span>
              </div>
              <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 var(--space-1) 0' }}>{metric.label}</p>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>
                {metric.value} of {metric.total}
              </p>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div style={{
        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>Venue Readiness Score</p>
            <p style={{ marginTop: 'var(--space-1)', margin: 'var(--space-1) 0 0 0' }}>A venue is considered "ready" when it has complete halls, accommodation inventory, occupancy rules, and photos configured.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
