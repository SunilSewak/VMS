# AVEMS Venue Bulk Import
## Implementation Planning v1.0

**Status:** Implementation Planning (after Architecture Review Approval)  
**Date:** 2026-06-06  
**Architecture Review:** Approved (Commit: a4ff347)

---

## Implementation Constraints

### Architecture Review Corrections Applied:
1. ✅ **Atomic Import Transaction** - Single transaction for entire import
2. ✅ **ON CONFLICT Upsert Pattern** - Faster, race-condition safe
3. ✅ **Admin-only RLS Policies** - No GRANT to authenticated users
4. ✅ **vendor_code Field** - Reserved for future procurement
5. ✅ **import_session_id** - Traceable session ID per import
6. ✅ **Expanded Import Status** - UPLOADED, VALIDATED, IMPORTING, SUCCESS, FAILED
7. ✅ **preferred_vendor_status** - Future commercial negotiation field

---

## Phase 1: Database Migration

### Task 1.1: Add New Columns to Hotels Table
```sql
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS vendor_code TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS preferred_vendor_status TEXT CHECK (
  preferred_vendor_status IS NULL OR 
  preferred_vendor_status IN ('PREFERRED', 'APPROVED', 'UNDER_REVIEW', 'BLACKLISTED')
);
```

### Task 1.2: Add New Columns to Halls Table
```sql
ALTER TABLE halls ADD COLUMN IF NOT EXISTS hall_type TEXT;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS theatre_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS u_shape_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS cluster_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS boardroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS reception_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
```

### Task 1.3: Create venue_import_history Table
```sql
CREATE TABLE IF NOT EXISTS venue_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_processed INTEGER NOT NULL,
  hotels_created INTEGER NOT NULL DEFAULT 0,
  hotels_updated INTEGER NOT NULL DEFAULT 0,
  halls_created INTEGER NOT NULL DEFAULT 0,
  halls_updated INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'VALIDATED', 'IMPORTING', 'SUCCESS', 'FAILED')),
  error_report_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Task 1.4: Add Unique Constraints
```sql
ALTER TABLE hotels 
  ADD CONSTRAINT IF NOT EXISTS hotels_name_city_uk UNIQUE (hotel_name, city_id);

ALTER TABLE halls 
  ADD CONSTRAINT IF NOT EXISTS halls_hotel_name_uk UNIQUE (hotel_id, hall_name);
```

### Task 1.5: Add Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_import_history_import_session_id ON venue_import_history(import_session_id);
CREATE INDEX IF NOT EXISTS idx_import_history_uploaded_by ON venue_import_history(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_import_history_uploaded_at ON venue_import_history(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON venue_import_history(status);
```

### Task 1.6: Add RLS Policies
```sql
-- Import hotels by Super Admin and Admin
CREATE POLICY IF NOT EXISTS "Import venues by Super Admin and Admin"
  ON hotels FOR INSERT
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
    )
  );

-- Import halls by Super Admin and Admin
CREATE POLICY IF NOT EXISTS "Import halls by Super Admin and Admin"
  ON halls FOR INSERT
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
    )
  );

-- View import history by Super Admin and Admin
CREATE POLICY IF NOT EXISTS "Admins can view import history"
  ON venue_import_history FOR SELECT
  USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
    )
  );
```

---

## Phase 2: Backend Services

### Task 2.1: Create Import Service File Structure
```
src/features/venues/
├── services/
│   ├── import/
│   │   ├── index.ts              # Export all import services
│   │   ├── validation.ts         # Validation engine
│   │   ├── dryRun.ts             # Dry run engine
│   │   ├── importEngine.ts       # Import engine
│   │   └── history.ts            # Import history service
│   └── types.ts                  # Shared types
```

### Task 2.2: Import Service Interface
```typescript
// src/features/venues/services/import/index.ts
export interface ImportResult {
  importSessionId: string;
  status: 'SUCCESS' | 'FAILED';
  hotelsCreated: number;
  hotelsUpdated: number;
  hallsCreated: number;
  hallsUpdated: number;
  rowsSkipped: number;
  errors: ValidationIssue[];
}

export interface DryRunResult {
  hotelsToCreate: number;
  hotelsToUpdate: number;
  hallsToCreate: number;
  hallsToUpdate: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidationIssue {
  rowNumber: number;
  field: string;
  error: string;
  value: string;
}
```

### Task 2.3: Import History Service
**File:** `src/features/venues/services/import/history.ts`

**Functions:**
- `createImportRecord(importSessionId, filePath, uploadedBy, rowsProcessed)`: Create initial record with status=UPLOADED
- `updateImportStatus(importSessionId, status, counts)`: Update status and counts
- `getImportHistory(limit, offset)`: Get paginated history
- `getImportById(importSessionId)`: Get single import details
- `generateErrorReportPath(importSessionId)`: Generate error report path

---

## Phase 3: Validation Engine

### Task 3.1: Validation Service File
**File:** `src/features/venues/services/import/validation.ts`

### Task 3.2: Required Field Validation
```typescript
function validateRequiredField(value: string, fieldName: string, rowNumber: number): ValidationIssue | null {
  if (!value || value.trim() === '') {
    return {
      rowNumber,
      field: fieldName,
      error: 'Missing value',
      value: 'blank'
    };
  }
  return null;
}
```

### Task 3.3: Format Validation
```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateMobile(mobile: string): boolean {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
}
```

### Task 3.4: Business Rule Validation
```typescript
const ALLOWED_STAR_RATINGS = [3, 4, 5];
const ALLOWED_HALL_TYPES = [
  'Ballroom', 'Conference Room', 'Board Room', 
  'Banquet Hall', 'Lawn', 'Rooftop', 'Meeting Room'
];
const ALLOWED_VENUE_STATUSES = [
  'ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'BLACKLISTED'
];

function validateStarRating(rating: string, rowNumber: number): ValidationIssue | null {
  const num = parseInt(rating, 10);
  if (!ALLOWED_STAR_RATINGS.includes(num)) {
    return {
      rowNumber,
      field: 'Star Rating',
      error: 'Must be 3, 4, or 5',
      value: rating
    };
  }
  return null;
}

function validateHallType(hallType: string, rowNumber: number): ValidationIssue | null {
  if (!ALLOWED_HALL_TYPES.includes(hallType)) {
    return {
      rowNumber,
      field: 'Hall Type',
      error: `Must be one of: ${ALLOWED_HALL_TYPES.join(', ')}`,
      value: hallType
    };
  }
  return null;
}
```

### Task 3.5: Duplicate Detection
```typescript
function detectHotelDuplicates(rows: ParsedRow[]): ValidationIssue[] {
  const seen = new Map<string, number>();
  const errors: ValidationIssue[] = [];

  rows.forEach((row, idx) => {
    const key = `${row.hotelName}|${row.city}`;
    if (seen.has(key)) {
      errors.push({
        rowNumber: idx + 2, // +2 for header + 1-indexed
        field: 'Hotel Name',
        error: 'Duplicate Hotel + City combination',
        value: row.hotelName
      });
    } else {
      seen.set(key, idx);
    }
  });

  return errors;
}

function detectHallDuplicates(rows: ParsedRow[]): ValidationIssue[] {
  const seen = new Map<string, number>();
  const errors: ValidationIssue[] = [];

  rows.forEach((row, idx) => {
    const key = `${row.hotelName}|${row.hallName}`;
    if (seen.has(key)) {
      errors.push({
        rowNumber: idx + 2,
        field: 'Hall Name',
        error: 'Duplicate Hall + Hotel combination',
        value: row.hallName
      });
    } else {
      seen.set(key, idx);
    }
  });

  return errors;
}
```

### Task 3.6: Validation Engine Main Function
```typescript
export async function validateExcelData(rows: ParsedRow[]): Promise<{
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Check for duplicates within file
  errors.push(...detectHotelDuplicates(rows));
  errors.push(...detectHallDuplicates(rows));

  // Validate each row
  rows.forEach((row, idx) => {
    const rowNumber = idx + 2; // +2 for header

    // Required field validation
    if (!row.hotelName) errors.push({ rowNumber, field: 'Hotel Name', error: 'Missing value', value: 'blank' });
    if (!row.city) errors.push({ rowNumber, field: 'City', error: 'Missing value', value: 'blank' });
    if (!row.hallName) errors.push({ rowNumber, field: 'Hall Name', error: 'Missing value', value: 'blank' });

    // Format validation
    if (row.email && !validateEmail(row.email)) {
      warnings.push({ rowNumber, field: 'Email', error: 'Invalid format', value: row.email });
    }
    if (row.mobile && !validateMobile(row.mobile)) {
      errors.push({ rowNumber, field: 'Mobile', error: 'Must be 10 digits', value: row.mobile });
    }

    // Business rule validation
    if (row.starRating && !ALLOWED_STAR_RATINGS.includes(parseInt(row.starRating, 10))) {
      errors.push({ rowNumber, field: 'Star Rating', error: 'Must be 3, 4, or 5', value: row.starRating });
    }
    if (row.hallType && !ALLOWED_HALL_TYPES.includes(row.hallType)) {
      errors.push({ rowNumber, field: 'Hall Type', error: 'Invalid value', value: row.hallType });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## Phase 4: Dry Run Engine

### Task 4.1: Dry Run Service File
**File:** `src/features/venues/services/import/dryRun.ts`

### Task 4.2: Dry Run Function
```typescript
export async function runDryRun(rows: ParsedRow[]): Promise<DryRunResult> {
  const hotelsToCreate = new Set<string>();
  const hotelsToUpdate = new Set<string>();
  const hallsToCreate = new Set<string>();
  const hallsToUpdate = new Set<string>();

  // In-memory deduplication
  const hotelMap = new Map<string, ParsedRow>();
  const hallMap = new Map<string, ParsedRow>();

  rows.forEach((row) => {
    const hotelKey = `${row.hotelName}|${row.city}`;
    const hallKey = `${row.hotelName}|${row.hallName}`;

    // Hotel deduplication
    if (!hotelMap.has(hotelKey)) {
      hotelMap.set(hotelKey, row);
      hotelsToCreate.add(hotelKey);
    } else {
      hotelsToUpdate.add(hotelKey);
    }

    // Hall deduplication
    if (!hallMap.has(hallKey)) {
      hallMap.set(hallKey, row);
      hallsToCreate.add(hallKey);
    } else {
      hallsToUpdate.add(hallKey);
    }
  });

  return {
    hotelsToCreate: hotelsToCreate.size,
    hotelsToUpdate: hotelsToUpdate.size,
    hallsToCreate: hallsToCreate.size,
    hallsToUpdate: hallsToUpdate.size,
    errors: [],
    warnings: []
  };
}
```

---

## Phase 5: Import Engine

### Task 5.1: Import Engine Service File
**File:** `src/features/venues/services/import/importEngine.ts`

### Task 5.2: Single Transaction Import
```typescript
export async function runImport(
  rows: ParsedRow[],
  importSessionId: string,
  userId: string
): Promise<ImportResult> {
  try {
    // Start single transaction
    const result = await supabase.rpc('bulk_import_venues', {
      p_import_session_id: importSessionId,
      p_rows: rows,
      p_user_id: userId
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      importSessionId,
      status: 'SUCCESS',
      hotelsCreated: result.data.hotels_created,
      hotelsUpdated: result.data.hotels_updated,
      hallsCreated: result.data.halls_created,
      hallsUpdated: result.data.halls_updated,
      rowsSkipped: result.data.rows_skipped,
      errors: []
    };
  } catch (error) {
    return {
      importSessionId,
      status: 'FAILED',
      hotelsCreated: 0,
      hotelsUpdated: 0,
      hallsCreated: 0,
      hallsUpdated: 0,
      rowsSkipped: rows.length,
      errors: [{ rowNumber: 0, field: 'System', error: error.message, value: '' }]
    };
  }
}
```

### Task 5.3: PostgreSQL Upsert Logic (for trigger/procedure)
```sql
-- Upsert hotel using ON CONFLICT
INSERT INTO hotels (
  hotel_name, city_id, star_rating, total_rooms, residential_capacity,
  contact_person, contact_number, email, status, vendor_code, preferred_vendor_status
)
VALUES (
  p_hotel_name, city_id, p_star_rating, p_total_rooms, p_residential_capacity,
  p_contact_person, p_mobile, p_email, p_status, p_vendor_code, p_preferred_vendor_status
)
ON CONFLICT (hotel_name, city_id) DO UPDATE
SET
  star_rating = EXCLUDED.star_rating,
  total_rooms = EXCLUDED.total_rooms,
  residential_capacity = EXCLUDED.residential_capacity,
  contact_person = EXCLUDED.contact_person,
  contact_number = EXCLUDED.contact_number,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  vendor_code = EXCLUDED.vendor_code,
  preferred_vendor_status = EXCLUDED.preferred_vendor_status,
  largest_hall_capacity = EXCLUDED.largest_hall_capacity,
  updated_at = NOW()
RETURNING id;

-- Upsert hall using ON CONFLICT
INSERT INTO halls (
  hotel_id, hall_name, hall_type, theatre_capacity, classroom_capacity,
  u_shape_capacity, cluster_capacity, boardroom_capacity, reception_capacity, status
)
VALUES (
  hotel_id, p_hall_name, p_hall_type, p_theatre_capacity, p_classroom_capacity,
  p_u_shape_capacity, p_cluster_capacity, p_boardroom_capacity, p_reception_capacity, p_status
)
ON CONFLICT (hotel_id, hall_name) DO UPDATE
SET
  hall_type = EXCLUDED.hall_type,
  theatre_capacity = EXCLUDED.theatre_capacity,
  classroom_capacity = EXCLUDED.classroom_capacity,
  u_shape_capacity = EXCLUDED.u_shape_capacity,
  cluster_capacity = EXCLUDED.cluster_capacity,
  boardroom_capacity = EXCLUDED.boardroom_capacity,
  reception_capacity = EXCLUDED.reception_capacity,
  status = EXCLUDED.status,
  updated_at = NOW()
RETURNING id;
```

### Task 5.4: Update Largest Hall Capacity
```sql
-- After all halls are inserted/updated, recalculate largest_hall_capacity
UPDATE hotels h
SET largest_hall_capacity = COALESCE(
  (SELECT MAX(ha.theatre_capacity) FROM halls ha WHERE ha.hotel_id = h.id),
  0
);
```

---

## Phase 6: UI Components

### Task 6.1: Create Venue Import Page
**File:** `src/pages/VenueBulkImport.tsx`

**Components:**
- `VenueBulkImportPage` - Main page component
- `ImportInstructions` - Step-by-step guide
- `UploadZone` - Drag & drop upload
- `ValidationPreview` - Summary cards
- `ValidationErrorGrid` - Error details tab
- `ImportSummary` - Success summary

### Task 6.2: Route Configuration
**File:** `src/App.tsx`

```typescript
import { VenueBulkImportPage } from './pages/VenueBulkImport';

<Route path={ROUTES.venueImport} element={
  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
    <AppLayout>
      <VenueBulkImportPage />
    </AppLayout>
  </ProtectedRoute>
} />
```

**File:** `src/routes/routeRegistry.ts`

```typescript
export const ROUTES = {
  // ... existing routes
  venueImport: "/admin/venue-import"
};
```

### Task 6.3: Navigation Configuration
**File:** `src/config/navigation.ts`

```typescript
{
  name: 'Venue Import',
  path: ROUTES.venueImport,
  iconName: 'FileArchive',
  roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
}
```

### Task 6.4: Upload Zone Component
```typescript
interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="card"
      style={{ 
        padding: 'var(--space-8)', 
        textAlign: 'center',
        border: '2px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
        transition: 'all 0.2s'
      }}
    >
      <FileUpload size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }} />
      <h3 style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>Upload Excel File</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
        Drag & drop .xlsx file or click to browse
      </p>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label
        htmlFor="file-input"
        style={{
          display: 'inline-block',
          padding: 'var(--space-3) var(--space-5)',
          background: 'var(--primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        Browse Files
      </label>
    </div>
  );
}
```

### Task 6.5: Validation Preview Component
```typescript
interface ValidationPreviewProps {
  hotelsToCreate: number;
  hotelsToUpdate: number;
  hallsToCreate: number;
  hallsToUpdate: number;
  errors: number;
  warnings: number;
  onImport: () => void;
  isLoading: boolean;
}

function ValidationPreview({ 
  hotelsToCreate, hotelsToUpdate, hallsToCreate, hallsToUpdate,
  errors, warnings, onImport, isLoading 
}: ValidationPreviewProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-3)' }}>
      <SummaryCard 
        label="Hotels to Create" 
        value={hotelsToCreate} 
        color="green"
      />
      <SummaryCard 
        label="Hotels to Update" 
        value={hotelsToUpdate} 
        color="blue"
      />
      <SummaryCard 
        label="Halls to Create" 
        value={hallsToCreate} 
        color="green"
      />
      <SummaryCard 
        label="Halls to Update" 
        value={hallsToUpdate} 
        color="blue"
      />
      <SummaryCard 
        label="Errors" 
        value={errors} 
        color="red"
        disabled={errors > 0}
      />
      <SummaryCard 
        label="Warnings" 
        value={warnings} 
        color="amber"
      />
    </div>
  );
}
```

### Task 6.6: Import Summary Component
```typescript
interface ImportSummaryProps {
  hotelsCreated: number;
  hotelsUpdated: number;
  hallsCreated: number;
  hallsUpdated: number;
  rowsSkipped: number;
  errorReportUrl?: string;
  onDownloadErrorReport?: () => void;
}

function ImportSummary({ 
  hotelsCreated, hotelsUpdated, hallsCreated, hallsUpdated,
  rowsSkipped, errorReportUrl, onDownloadErrorReport
}: ImportSummaryProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)' }}>
      <SummaryCard label="Hotels Created" value={hotelsCreated} color="success" />
      <SummaryCard label="Hotels Updated" value={hotelsUpdated} color="info" />
      <SummaryCard label="Halls Created" value={hallsCreated} color="success" />
      <SummaryCard label="Halls Updated" value={hallsUpdated} color="info" />
      <SummaryCard label="Rows Skipped" value={rowsSkipped} color="warning" />
    </div>
  );
}
```

### Task 6.7: Import History Modal
```typescript
interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ImportHistoryModal({ isOpen, onClose }: ImportHistoryModalProps) {
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadImportHistory();
    }
  }, [isOpen]);

  async function loadImportHistory() {
    const { data, error } = await supabase
      .from('venue_import_history')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(50);

    if (data) setHistory(data);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={onClose}>
      <div 
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'var(--surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          width: 'min(90vw, 800px)',
          maxHeight: '85vh',
          overflow: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontWeight: '800', fontSize: 'var(--font-size-xl)' }}>Import History</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Date</th>
              <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>File</th>
              <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Hotels</th>
              <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Halls</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-2)' }}>{new Date(item.uploaded_at).toLocaleString()}</td>
                <td style={{ padding: 'var(--space-2)' }}>{item.file_name}</td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '11px',
                    background: item.status === 'SUCCESS' ? 'color-mix(in srgb, var(--status-success) 15%, transparent)' : 'color-mix(in srgb, var(--status-danger) 15%, transparent)',
                    color: item.status === 'SUCCESS' ? 'var(--status-success)' : 'var(--status-danger)'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                  {item.hotels_created} / {item.hotels_updated}
                </td>
                <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                  {item.halls_created} / {item.halls_updated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Phase 7: Testing Plan

### Task 7.1: Unit Tests

**Test File:** `src/features/venues/services/import/__tests__/validation.test.ts`

**Test Cases:**
- [ ] Validate required fields (hotel name, city, hall name)
- [ ] Validate email format
- [ ] Validate mobile format (10 digits)
- [ ] Validate star rating (3, 4, 5 only)
- [ ] Validate hall type (allowed values)
- [ ] Detect duplicate hotels within file
- [ ] Detect duplicate halls within file
- [ ] Return correct error counts

**Test File:** `src/features/venues/services/import/__tests__/dryRun.test.ts`

**Test Cases:**
- [ ] Count hotels to create correctly
- [ ] Count hotels to update correctly
- [ ] Count halls to create correctly
- [ ] Count halls to update correctly
- [ ] Handle empty rows

**Test File:** `src/features/venues/services/import/__tests__/importEngine.test.ts`

**Test Cases:**
- [ ] Import single hotel successfully
- [ ] Update existing hotel correctly
- [ ] Import single hall successfully
- [ ] Update existing hall correctly
- [ ] Handle database errors gracefully

---

### Task 7.2: Integration Tests

**Test File:** `src/features/venues/services/import/__tests__/integration.test.ts`

**Test Cases:**
- [ ] Full import flow with 10 hotels
- [ ] Full import flow with 100 halls
- [ ] Atomic transaction rollback on error
- [ ] Import history record created
- [ ] Largest hall capacity updated

---

### Task 7.3: E2E Tests

**Test File:** `e2e/venue-bulk-import.spec.ts`

**Test Cases:**
- [ ] Download template button visible to ADMIN
- [ ] Upload Excel file successfully
- [ ] Validation preview shows correct counts
- [ ] Import succeeds for valid data
- [ ] Import fails for invalid data
- [ ] Error report downloadable
- [ ] Import history visible
- [ ] Non-admin user cannot access import page

---

### Task 7.4: Performance Tests

**Load Test Cases:**
- [ ] 500 rows import completes in < 5 seconds
- [ ] 1000 rows import completes in < 10 seconds
- [ ] 5000 rows import completes in < 30 seconds
- [ ] Error report generates in < 5 seconds

---

## Phase 8: Deployment Plan

### Task 8.1: Pre-Deployment Checklist

- [ ] Database migration script tested in staging
- [ ] RLS policies validated in staging
- [ ] Import service tested with sample data
- [ ] Error report generation verified
- [ ] Import history retrieval tested
- [ ] Performance tests passed
- [ ] Security audit completed

---

### Task 8.2: Deployment Steps

**Step 1: Database Migration**
```bash
# Run migration in production
# Connect to Supabase SQL Editor
# Execute: venue_bulk_import_migration.sql
# Verify: All tables created, indexes added, RLS policies applied
```

**Step 2: Deploy Application**
```bash
# Build production bundle
npm run build

# Deploy to hosting provider
# (Vercel, Netlify, or self-hosted)
```

**Step 3: Verify Deployment**
```bash
# Test upload with small sample file
# Verify import history is created
# Verify hotel/hall records created
# Test download error report
```

---

### Task 8.3: Post-Deployment Monitoring

**Checklist:**
- [ ] Import history table populated correctly
- [ ] RLS policies functioning as expected
- [ ] Import performance within SLA
- [ ] Error reports generated correctly
- [ ] Largest hall capacity updated

**Metrics to Monitor:**
- Import success rate
- Average import time
- Error report download rate
- Import history view count

---

### Task 8.4: Rollback Plan

**If deployment fails:**
1. Identify failure point
2. Restore previous application version
3. If database migration failed, manually revert changes
4. If RLS policies caused issues, temporarily disable and debug

**Emergency Contacts:**
- Database Admin: [Name]
- Application Admin: [Name]
- On-Call Engineer: [Name]

---

**Document Status:** ✅ Implementation Planning Complete  
**Next Step:** Implementation (awaiting final approval)
