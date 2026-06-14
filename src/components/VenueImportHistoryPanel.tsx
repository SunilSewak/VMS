import { useEffect, useState } from 'react';
import { History, Check, AlertCircle, Clock, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { VenueImportHistory } from '../features/venues/types';

interface VenueImportHistoryPanelProps {
  limit?: number;
}

export function VenueImportHistoryPanel({ limit = 10 }: VenueImportHistoryPanelProps) {
  const [history, setHistory] = useState<VenueImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('venue_import_history')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;
      setHistory(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load import history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'SUCCESS':
        return <Check size={20} style={{ color: '#10b981' }} />;
      case 'FAILED':
        return <AlertCircle size={20} style={{ color: '#ef4444' }} />;
      case 'IMPORTING':
        return <Clock size={20} style={{ color: '#3b82f6', animation: 'spin 2s linear infinite' }} />;
      default:
        return <Clock size={20} style={{ color: 'var(--text-light)' }} />;
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'SUCCESS': return 'Completed Successfully';
      case 'FAILED': return 'Failed';
      case 'PARTIAL': return 'Partial Success';
      case 'IMPORTING': return 'Importing...';
      case 'VALIDATED': return 'Validated';
      case 'UPLOADED': return 'Uploaded';
      default: return status;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)' }}>
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

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <History size={20} style={{ color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Import History</h2>
          <span style={{ marginLeft: 'auto', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Last {limit} imports</span>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <History size={48} style={{ color: 'var(--border)', margin: '0 auto var(--space-3)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No import history available</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {history.map((item, index) => {
            const borderColor = item.status === 'SUCCESS' ? '#10b981' : item.status === 'FAILED' ? '#ef4444' : '#f59e0b';
            const badgeBg = item.status === 'SUCCESS' ? '#10b98118' : item.status === 'FAILED' ? '#ef444418' : '#f59e0b18';
            
            return (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  borderBottom: index < history.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `4px solid ${borderColor}`,
                  background: 'var(--surface)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  {/* Left Side: Status and Details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                    <div style={{ marginTop: '0.25rem' }}>{getStatusIcon(item.status)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.file_name}</p>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem',
                          borderRadius: '999px', fontSize: 'var(--font-xs)', fontWeight: 600,
                          background: badgeBg, color: borderColor,
                        }}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {formatDate(item.uploaded_at)}
                      </div>
                      
                      {/* Stats Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', fontSize: 'var(--font-xs)' }}>
                        <div style={{ background: 'var(--surface-2)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hotels Created</p>
                          <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{item.hotels_created}</p>
                        </div>
                        <div style={{ background: 'var(--surface-2)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hotels Updated</p>
                          <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{item.hotels_updated}</p>
                        </div>
                        <div style={{ background: 'var(--surface-2)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Halls Created</p>
                          <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{item.halls_created}</p>
                        </div>
                        <div style={{ background: 'var(--surface-2)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Records Processed</p>
                          <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{item.rows_processed}</p>
                        </div>
                      </div>

                      {/* Failure Summary */}
                      {item.rows_skipped > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: 'var(--font-xs)' }}>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>{item.rows_skipped} records skipped</span>
                          <span style={{ color: 'var(--text-muted)' }}> (validation errors)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Quick Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {item.error_report_path && (
                      <button
                        title="Download error report"
                        style={{
                          padding: '0.5rem', borderRadius: 'var(--radius-md)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ef444418'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <FileText size={16} style={{ color: '#ef4444' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <button
          onClick={loadHistory}
          style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Refresh History
        </button>
      </div>
    </div>
  );
}
