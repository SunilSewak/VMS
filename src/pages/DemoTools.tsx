import { useState, useEffect } from 'react';
import {
  Bug, Download, Upload, RotateCcw, XCircle, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useDemo } from '../contexts/DemoContext';

export function DemoTools() {
  const { isDemoMode, toggleDemoMode, resetDemoData, exportDemoData, importDemoData, isDemoAvailable } = useDemo();
  const [importJson, setImportJson] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!isDemoAvailable) {
      setStatusMessage('Demo Mode is only available in development builds');
      setStatusType('error');
    }
  }, [isDemoAvailable]);

  const handleExport = () => {
    setStatusMessage('Exporting demo data...');
    setStatusType('success');
    exportDemoData();
    setStatusMessage('Demo data exported successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImport = () => {
    try {
      setStatusMessage('Importing demo data...');
      setStatusType('success');
      importDemoData(importJson);
      setStatusMessage('Demo data imported successfully');
      setStatusType('success');
      setTimeout(() => {
        setImportJson('');
        setStatusMessage(null);
      }, 3000);
    } catch (error: any) {
      setStatusMessage(`Import failed: ${error.message}`);
      setStatusType('error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure? This will clear all current demo data and re-seed with fresh records.')) {
      setStatusMessage('Resetting demo data...');
      setStatusType('success');
      resetDemoData();
      setStatusMessage('Demo data reset successfully');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  if (!isDemoAvailable) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <XCircle size={64} style={{ color: 'var(--status-danger)', marginBottom: 'var(--space-4)' }} />
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Demo Mode Not Available</h3>
        <p style={{ fontSize: 'var(--font-sm)' }}>Demo Mode is only available in development builds.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', marginBottom: 'var(--space-2)', color: 'var(--text-main)' }}>
          Demo Tools
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          Manage demo data for development and testing purposes.
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)'
        }}>
          {statusType === 'success' ? (
            <>
              <CheckCircle size={24} style={{ color: 'var(--status-success)' }} />
              <span style={{ color: 'var(--status-success)', fontWeight: '600' }}>{statusMessage}</span>
            </>
          ) : (
            <>
              <AlertTriangle size={24} style={{ color: 'var(--status-danger)' }} />
              <span style={{ color: 'var(--status-danger)', fontWeight: '600' }}>{statusMessage}</span>
            </>
          )}
        </div>
      )}

      {/* Demo Mode Toggle */}
      <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: isDemoMode ? '#f59e0b' : '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bug size={24} style={{ color: isDemoMode ? '#fff' : 'var(--text-muted)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-main)' }}>
              Demo Mode
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
              {isDemoMode ? 'Active - All data is stored in browser localStorage' : 'Inactive - Using production database'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {isDemoMode ? (
            <button
              onClick={toggleDemoMode}
              style={{
                padding: 'var(--space-2) var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <XCircle size={18} />
              Disable Demo Mode
            </button>
          ) : (
            <button
              onClick={toggleDemoMode}
              style={{
                padding: 'var(--space-2) var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: '#d97706',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <CheckCircle size={18} />
              Enable Demo Mode
            </button>
          )}
        </div>
      </div>

      {/* Demo Data Management */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Export Section */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)',
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Download size={20} style={{ color: '#059669' }} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: 'var(--text-main)' }}>
                Export Demo Data
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                Download all demo data as JSON
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={!isDemoMode}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: '#fff',
              color: isDemoMode ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: isDemoMode ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <Download size={16} />
            Export JSON
          </button>
        </div>

        {/* Reset Section */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RotateCcw size={20} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: 'var(--text-main)' }}>
                Reset Demo Data
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                Clear all data and re-seed
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={!isDemoMode}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: '#fff',
              color: isDemoMode ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: isDemoMode ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <RotateCcw size={16} />
            Reset & Re-seed
          </button>
        </div>

        {/* Import Section */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={20} style={{ color: '#0ea5e9' }} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: 'var(--text-main)' }}>
                Import Demo Data
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                Restore from JSON file
              </p>
            </div>
          </div>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste JSON data here..."
            disabled={!isDemoMode}
            style={{
              width: '100%',
              height: '80px',
              marginBottom: 'var(--space-3)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: isDemoMode ? '#fff' : 'var(--surface)',
              color: isDemoMode ? 'var(--text-main)' : 'var(--text-muted)',
              fontFamily: 'monospace',
              fontSize: 'var(--font-xs)',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleImport}
            disabled={!isDemoMode || !importJson.trim()}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              background: isDemoMode && importJson.trim() ? 'var(--primary)' : 'var(--border)',
              color: isDemoMode && importJson.trim() ? '#fff' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: isDemoMode && importJson.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Upload size={16} style={{ marginRight: 'var(--space-2)' }} />
            Import Data
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', background: '#f8fafc' }}>
        <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>
          About Demo Mode
        </h4>
        <ul style={{ paddingLeft: 'var(--space-5)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', lineHeight: '1.6' }}>
          <li>Only available in development builds</li>
          <li>All data is stored in browser localStorage</li>
          <li>Changes persist across page reloads</li>
          <li>No impact on production database</li>
          <li>Automatic seed data included (meetings, venues, hotels)</li>
        </ul>
      </div>
    </div>
  );
}
