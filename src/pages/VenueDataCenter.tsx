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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/administration/masters/venues')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
              title="Back to venues"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Venue Data Center</h1>
              </div>
              <p className="text-gray-600 mt-1">Manage venue repository, import data, and monitor quality</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'bulk-import' && <BulkImportTab onRefresh={handleRefresh} />}
        {activeTab === 'history' && <ImportHistoryTab refreshTrigger={refreshTrigger} />}
        {activeTab === 'quality' && <DataQualityTab refreshTrigger={refreshTrigger} />}
        {activeTab === 'zones' && <ZoneMasterTab onRefresh={handleRefresh} />}
        {activeTab === 'cities' && <CityMasterTab onRefresh={handleRefresh} />}
      </div>
    </div>
  );
}
