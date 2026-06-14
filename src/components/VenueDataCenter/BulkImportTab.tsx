import { Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface BulkImportTabProps {
  onRefresh: () => void;
}

export function BulkImportTab({ onRefresh }: BulkImportTabProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // TODO: Implement multi-sheet import logic
      // This will handle Excel workbook with 6 sheets:
      // 1. Hotel Master
      // 2. Hall Master
      // 3. Occupancy Matrix
      // 4. Accommodation Inventory
      // 5. Photo Mapping
      // 6. Instructions
      
      onRefresh();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Bulk Import</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>Upload venue data from multi-sheet workbook</p>
      </div>

      {/* Upload Area */}
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Upload size={48} style={{ color: 'var(--primary)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Drop workbook here or click to upload
              </p>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                Excel workbook with 6 sheets (Hotel Master, Hall Master, etc.)
              </p>
            </div>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Requirements */}
      <div style={{
        background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontWeight: 600, color: 'var(--text-main)', margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-sm)' }}>Required Workbook Structure</h3>
            <ul style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)', margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>Sheet 1: Hotel Master (20+ fields)</li>
              <li>Sheet 2: Hall Master (12+ fields)</li>
              <li>Sheet 3: Occupancy Matrix (4 fields)</li>
              <li>Sheet 4: Accommodation Inventory (8 fields)</li>
              <li>Sheet 5: Photo Mapping (5 fields)</li>
              <li>Sheet 6: Instructions (guidelines)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
