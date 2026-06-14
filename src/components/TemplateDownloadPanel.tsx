import { Download, FileSpreadsheet, Info } from 'lucide-react';
import { generateMasterTemplate, downloadTemplate, TEMPLATE_INFO } from '../features/venues/templateService';

interface TemplateDownloadPanelProps {
  onDownload?: () => void;
}

export function TemplateDownloadPanel({ onDownload }: TemplateDownloadPanelProps) {
  const handleDownloadMaster = () => {
    const blob = generateMasterTemplate();
    downloadTemplate('Venue_Master_Workbook', blob);
    onDownload?.();
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>Step 1: Download Template</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Download the Excel template and fill in your venue data. The template includes all required sheets and helpful instructions.
        </p>
      </div>

      {/* Template Info */}
      <div style={{
        marginBottom: 'var(--space-6)', padding: 'var(--space-4)',
        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>
            <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Master Workbook Includes:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {TEMPLATE_INFO.master.sheets.map((sheet, idx) => (
                <li key={idx}>
                  <strong>{sheet.name}</strong> - {sheet.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadMaster}
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '0.75rem 1.5rem', fontSize: 'var(--font-sm)' }}
      >
        <Download size={20} />
        Download Master Workbook
      </button>

      {/* Template Details */}
      <div style={{ marginTop: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
        {TEMPLATE_INFO.master.sheets.map((sheet, idx) => (
          <div key={idx} style={{ padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <FileSpreadsheet size={20} style={{ color: 'var(--text-muted)', marginTop: '4px', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-1)' }}>{sheet.name}</h3>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{sheet.description}</p>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', background: 'var(--surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'inline-block', margin: 0 }}>
                  {sheet.rows}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>Template Guidelines</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
            <span><strong>Hotel Master:</strong> One row per hotel with basic details</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
            <span><strong>Hall Master:</strong> One row per hall in each hotel</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
            <span><strong>Accommodation:</strong> One row per hotel with room inventory</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
            <span><strong>Occupancy Rules:</strong> Designation-to-occupancy mappings</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
            <span><strong>Photos:</strong> Photo references (optional)</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
            <span>All required fields must be filled (marked with *)</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
            <span>Hotel names + City combinations must be unique</span>
          </li>
          <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
            <span>City names must match master city list</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
