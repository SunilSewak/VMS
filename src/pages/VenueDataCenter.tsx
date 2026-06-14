import { useState } from 'react';
import { ChevronLeft, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BulkImportTab } from '../components/VenueDataCenter/BulkImportTab';
import { ImportHistoryTab } from '../components/VenueDataCenter/ImportHistoryTab';
import { DataQualityTab } from '../components/VenueDataCenter/DataQualityTab';
import { ZoneMasterTab } from '../components/VenueDataCenter/ZoneMasterTab';
import { CityMasterTab } from '../components/VenueDataCenter/CityMasterTab';

type TabName = 'bulk-import' | 'history' | 'quality' | 'zones' | 'cities';

interface TabConfig {
  id: TabName;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'bulk-import', label: 'Bulk Import', icon: '⬆️' },
  { id: 'history', label: 'Import History', icon: '📋' },
  { id: 'quality', label: 'Data Quality', icon: '📊' },
  { id: 'zones', label: 'Zone Master', icon: '🗺️' },
  { id: 'cities', label: 'City Master', icon: '🏙️' },
];

export function VenueDataCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabName>('bulk-import');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <button
            onClick={() => navigate('/administration/masters/venues')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.5rem', borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            }}
            title="Back to venues"
          >
            <ChevronLeft size={22} />
          </button>
          <div style={{
            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
            background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <Database size={22} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Venue Data Center
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginLeft: '5rem' }}>
          Manage venue repository, import data, and monitor quality
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 'var(--font-sm)',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              background: activeTab === tab.id
                ? 'color-mix(in srgb, var(--primary) 14%, transparent)'
                : 'var(--surface-2)',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'bulk-import' && <BulkImportTab onRefresh={handleRefresh} />}
        {activeTab === 'history' && <ImportHistoryTab refreshTrigger={refreshTrigger} />}
        {activeTab === 'quality' && <DataQualityTab refreshTrigger={refreshTrigger} />}
        {activeTab === 'zones' && <ZoneMasterTab onRefresh={handleRefresh} />}
        {activeTab === 'cities' && <CityMasterTab onRefresh={handleRefresh} />}
      </div>
    </div>
  );
}
