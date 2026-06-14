import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImportRecord {
  id: string;
  import_date: string;
  user_email: string;
  status: string;
  records_processed: number;
  records_failed: number;
  duration_seconds: number;
  notes?: string;
}

interface ImportHistoryTabProps {
  refreshTrigger: number;
}

const statusBadgeStyle = (status: string) => {
  const color = status === 'COMPLETED' ? '#10b981' : status === 'FAILED' ? '#ef4444' : '#f59e0b';
  return {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: 'var(--font-xs)',
    fontWeight: 600 as const,
    background: `${color}18`,
    color,
  };
};

export function ImportHistoryTab({ refreshTrigger }: ImportHistoryTabProps) {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImportHistory();
  }, [refreshTrigger]);

  async function loadImportHistory() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: queryError } = await supabase
        .from('venue_import_history')
        .select('*')
        .order('import_date', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;
      setImports(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load import history');
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

  const thStyle = {
    padding: '0.75rem 1.25rem',
    textAlign: 'left' as const,
    fontSize: 'var(--font-xs)',
    fontWeight: 700 as const,
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface-2)',
  };

  const tdStyle = {
    padding: '0.85rem 1.25rem',
    fontSize: 'var(--font-sm)',
    borderBottom: '1px solid var(--border)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Import History</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>Track all venue data imports</p>
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

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Processed</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Failed</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {imports.map(record => (
              <tr key={record.id}>
                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                  {new Date(record.import_date).toLocaleString()}
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-main)', fontWeight: 500 }}>{record.user_email}</td>
                <td style={tdStyle}>
                  <span style={statusBadgeStyle(record.status)}>{record.status}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
                  {record.records_processed}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
                  {record.records_failed}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    {record.duration_seconds}s
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {imports.length === 0 && (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No import history available</p>
          </div>
        )}
      </div>
    </div>
  );
}
