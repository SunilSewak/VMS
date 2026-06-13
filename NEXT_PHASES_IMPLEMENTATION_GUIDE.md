# Step 3 Next Phases Implementation Guide

**Status**: After Critical Phase Completion  
**Date**: June 13, 2026  
**Phases Remaining**: Phase 6 (History UI) + Phase 7 (Quality Dashboard) + Testing

---

## PHASE 6: IMPORT HISTORY UI (3 Hours)

### Component: ImportHistoryModal.tsx

**Create file**: `src/components/ImportHistoryModal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { X, ChevronDown, Download } from 'lucide-react';
import { getImportHistory, getImportDetails } from '../features/venues/importService';
import type { VenueImportHistory } from '../features/venues/types';

interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportHistoryModal({ isOpen, onClose }: ImportHistoryModalProps) {
  const [history, setHistory] = useState<VenueImportHistory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<VenueImportHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await getImportHistory(10, currentPage * 10);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(importSessionId: string) {
    setLoading(true);
    try {
      const data = await getImportDetails(importSessionId);
      setDetails(data);
      setSelectedId(importSessionId);
    } catch (err) {
      console.error('Failed to load details:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Import History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : selectedId && details ? (
            // Details View
            <div>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setDetails(null);
                }}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                ← Back to List
              </button>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">File Name</p>
                    <p className="font-medium">{details.file_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{details.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Uploaded By</p>
                    <p className="font-medium">{details.uploaded_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Uploaded At</p>
                    <p className="font-medium">
                      {new Date(details.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{details.hotels_created}</p>
                    <p className="text-sm text-gray-600">Hotels Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{details.hotels_updated}</p>
                    <p className="text-sm text-gray-600">Hotels Updated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{details.halls_created}</p>
                    <p className="text-sm text-gray-600">Halls Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{details.rows_skipped}</p>
                    <p className="text-sm text-gray-600">Rows Skipped</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // History List
            <div>
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No import history yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.import_session_id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(item.import_session_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.file_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(item.uploaded_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm font-semibold">{item.rows_processed} rows</p>
                          <p className={`text-sm ${item.status === 'SUCCESS' ? 'text-green-600' : 'text-orange-600'}`}>
                            {item.status}
                          </p>
                        </div>
                        <ChevronDown size={20} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {history.length > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setCurrentPage(Math.max(0, currentPage - 1));
                      loadHistory();
                    }}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage + 1}</span>
                  <button
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      loadHistory();
                    }}
                    disabled={history.length < 10}
                    className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Integration into VenueBulkUpload

1. Add state:
```typescript
const [showHistory, setShowHistory] = useState(false);
const [historyModalOpen, setHistoryModalOpen] = useState(false);
```

2. Add button handler:
```typescript
<button
  onClick={() => setHistoryModalOpen(true)}
  className="flex items-center gap-2 px-4 py-2..."
>
  <History size={18} />
  View History
</button>
```

3. Add modal component:
```typescript
<ImportHistoryModal
  isOpen={historyModalOpen}
  onClose={() => setHistoryModalOpen(false)}
/>
```

---

## PHASE 7: DATA QUALITY DASHBOARD (3 Hours)

### Component: DataQualityDashboard.tsx

**Create file**: `src/components/DataQualityDashboard.tsx`

```typescript
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';
import { calculateDataQuality } from '../features/venues/importService';
import type { DataQualityMetrics } from '../features/venues/types';

export function DataQualityDashboard() {
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    try {
      const data = await calculateDataQuality();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading metrics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error || 'Failed to load metrics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Hotels</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalHotels}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-600">Missing Halls</p>
          <p className="text-3xl font-bold text-yellow-600">{metrics.hotelsMissingHalls}</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingHalls / metrics.totalHotels) * 100)}% of hotels
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg shadow p-6 border-l-4 border-orange-400">
          <p className="text-sm text-gray-600">Missing Inventory</p>
          <p className="text-3xl font-bold text-orange-600">{metrics.hotelsMissingInventory}</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsMissingInventory / metrics.totalHotels) * 100)}% of hotels
          </p>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-400">
          <p className="text-sm text-gray-600">Not Ready</p>
          <p className="text-3xl font-bold text-red-600">{metrics.hotelsNotVenueReady}</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((metrics.hotelsNotVenueReady / metrics.totalHotels) * 100)}% of hotels
          </p>
        </div>
      </div>

      {/* Readiness Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Readiness Distribution</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Optimized</span>
              <span className="text-sm font-bold">{metrics.readinessDistribution.optimized}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(metrics.readinessDistribution.optimized / metrics.totalHotels) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Ready</span>
              <span className="text-sm font-bold">{metrics.readinessDistribution.ready}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(metrics.readinessDistribution.ready / metrics.totalHotels) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Partial</span>
              <span className="text-sm font-bold">{metrics.readinessDistribution.partial}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{
                  width: `${(metrics.readinessDistribution.partial / metrics.totalHotels) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Not Ready</span>
              <span className="text-sm font-bold">{metrics.readinessDistribution.notReady}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${(metrics.readinessDistribution.notReady / metrics.totalHotels) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quality Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        
        <div className="space-y-3">
          {metrics.hotelsMissingHalls > 0 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">
                  {metrics.hotelsMissingHalls} hotels missing halls
                </p>
                <p className="text-sm text-yellow-700">
                  Configure halls to enable meeting space bookings
                </p>
              </div>
            </div>
          )}

          {metrics.hotelsMissingInventory > 0 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">
                  {metrics.hotelsMissingInventory} hotels missing inventory
                </p>
                <p className="text-sm text-orange-700">
                  Add room inventory to enable accommodation bookings
                </p>
              </div>
            </div>
          )}

          {metrics.hotelsMissingOccupancy > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  {metrics.hotelsMissingOccupancy} hotels missing occupancy rules
                </p>
                <p className="text-sm text-red-700">
                  Define occupancy rules for accurate pricing and availability
                </p>
              </div>
            </div>
          )}

          {metrics.hotelsMissingPhotos > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  {metrics.hotelsMissingPhotos} hotels missing photos
                </p>
                <p className="text-sm text-blue-700">
                  Upload photos to improve venue attractiveness
                </p>
              </div>
            </div>
          )}

          {metrics.hotelsNotVenueReady === 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">All systems go!</p>
                <p className="text-sm text-green-700">
                  All hotels are fully configured and ready for bookings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadMetrics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Refresh Metrics
        </button>
      </div>
    </div>
  );
}
```

### Add to Admin Menu

Add route in `src/routes/routeRegistry.ts`:
```typescript
venueQualityDashboard: "/administration/venue-repository/quality-dashboard"
```

Create page wrapper:
```typescript
// src/pages/VenueQualityDashboard.tsx
import { DataQualityDashboard } from '../components/DataQualityDashboard';

export function VenueQualityDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Quality Dashboard</h1>
        <p className="text-gray-600 mb-6">Monitor venue repository completeness and readiness</p>
        <DataQualityDashboard />
      </div>
    </div>
  );
}
```

---

## TESTING IMPLEMENTATION (4-5 Hours)

### Unit Tests

**File**: `src/features/venues/__tests__/importService.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  parseExcelFile,
  ensureCityExists,
  resolveHotelId,
  validateHotelRow,
  validateHallRow,
} from '../importService';

describe('parseExcelFile', () => {
  it('should parse valid Excel file', async () => {
    // Test implementation
  });

  it('should handle empty rows', async () => {
    // Test implementation
  });

  it('should process multiple sheets', async () => {
    // Test implementation
  });
});

describe('ensureCityExists', () => {
  it('should return existing city ID', async () => {
    // Test implementation
  });

  it('should create new city if not found', async () => {
    // Test implementation
  });

  it('should use cache for repeated lookups', async () => {
    // Test implementation
  });
});

describe('Validation Functions', () => {
  it('should validate hotel rows correctly', () => {
    // Test implementation
  });

  it('should validate hall rows correctly', () => {
    // Test implementation
  });

  it('should collect multiple errors', () => {
    // Test implementation
  });
});
```

### Integration Tests

**File**: `src/features/venues/__tests__/import.integration.test.ts`

```typescript
describe('Import Flow', () => {
  it('should complete full import workflow', async () => {
    // 1. Parse file
    // 2. Generate preview
    // 3. Execute import
    // 4. Verify database
  });

  it('should handle duplicate hotels', async () => {
    // Upload same hotel twice
    // Verify update vs insert
  });

  it('should auto-create cities', async () => {
    // Import with new city names
    // Verify cities created
  });

  it('should record import history', async () => {
    // Complete import
    // Verify history entry
  });
});
```

### E2E Tests

Test scenarios:
1. Small file (10 rows) - success path
2. Medium file (100 rows) - with some errors
3. Large file (1000 rows) - performance
4. File with duplicates - upsert behavior
5. File with errors - error handling
6. Malformed Excel - error reporting

---

## TIMELINE

**Today (June 13)**: Core implementation complete ✅

**Tomorrow (June 14)**: 
- Phase 6: Import History UI (3h)
- Phase 7: Quality Dashboard (3h)
- Total: 6h

**Friday (June 15)**:
- Unit tests (2h)
- Integration tests (1.5h)
- E2E tests (1.5h)
- Total: 5h

**Monday (June 18)**:
- Bug fixes & polish (2h)
- Documentation (2h)
- Final testing (2h)
- Total: 6h

**Launch**: June 18, 2026 EOD

---

## SUCCESS CRITERIA

✅ File parsing working with multiple Excel formats
✅ City auto-creation functioning
✅ Hotels/halls upserting correctly
✅ Duplicate detection and updates working
✅ Import history recording
✅ Error reporting accurate and helpful
✅ Performance acceptable (500+ rows in <10s)
✅ All tests passing (unit + integration + E2E)
✅ No security vulnerabilities
✅ User documentation complete

---

## REFERENCE

**Key Files**:
- Core: `src/features/venues/importService.ts`
- UI: `src/pages/VenueBulkUpload.tsx`
- Components: `src/components/ImportHistoryModal.tsx` (todo)
- Components: `src/components/DataQualityDashboard.tsx` (todo)

**Type Definitions**: `src/features/venues/types.ts`

**Database**: Import history tracked in `venue_import_history` table

**Route**: `/administration/venue-repository/bulk-upload`

