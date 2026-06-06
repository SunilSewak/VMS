# AVEMS Venue Bulk Import
## Architecture Review v1.0

**Status:** Final Review Before Implementation Planning  
**Date:** 2026-06-06

---

## 1. Database Impact Analysis

### Tables Affected

| Table | Change Type | Description |
|-------|-------------|-------------|
| `hotels` | Add Columns | Add new fields for import support |
| `halls` | Add Columns | Add new fields for import support |
| `cities` | No Changes | Already exists, will be reused |
| `venue_import_history` | **NEW TABLE** | Track import sessions |

---

### 1.1 hotels Table Changes

**Current Columns (from seed script):**
```sql
- id UUID PRIMARY KEY
- hotel_name TEXT
- category_id UUID
- city_id UUID
- address TEXT
- gst_number TEXT
- contact_person TEXT
- contact_number TEXT
- email TEXT
- remarks TEXT
- status TEXT
- created_at TIMESTAMPTZ
- created_by UUID
- updated_at TIMESTAMPTZ
- updated_by UUID
- deleted_at TIMESTAMPTZ
- deleted_by UUID
- is_deleted BOOLEAN
```

**New Columns Required:**
```sql
-- Add these columns if not present (use ADD COLUMN IF NOT EXISTS)
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;
ALTER COLUMN contact_person TYPE TEXT;  -- Already exists
ALTER COLUMN contact_number TYPE TEXT;  -- Already exists, rename to mobile?
```

**Issue:** Current table uses `contact_number` but requirements specify `mobile`. Need to decide:
- Option A: Use existing `contact_number` column
- Option B: Add new `mobile` column and migrate data

**Recommended:** Use existing `contact_number` as `mobile` field for simplicity.

---

### 1.2 halls Table Changes

**Current Columns (from seed script):**
```sql
- id UUID PRIMARY KEY
- hotel_id UUID REFERENCES hotels(id)
- hall_name TEXT
- capacity INTEGER
- area TEXT
- floor_name TEXT
- seating_types TEXT
```

**New Columns Required:**
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

**Note:** Current `capacity` column is different from requirements (specific capacity types). Keep both or migrate?

**Recommended:** Keep `capacity` for backward compatibility, use new columns for specific capacities.

---

### 1.3 venue_import_history Table (NEW)

```sql
CREATE TABLE venue_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_processed INTEGER NOT NULL,
  hotels_created INTEGER NOT NULL DEFAULT 0,
  hotels_updated INTEGER NOT NULL DEFAULT 0,
  halls_created INTEGER NOT NULL DEFAULT 0,
  halls_updated INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
  error_report_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_import_history_uploaded_by ON venue_import_history(uploaded_by);
CREATE INDEX idx_import_history_uploaded_at ON venue_import_history(uploaded_at);
CREATE INDEX idx_import_history_status ON venue_import_history(status);
```

---

### 1.4 Indexes Added

| Index | Table | Purpose |
|-------|-------|---------|
| `idx_import_history_uploaded_by` | venue_import_history | Quick lookup by user |
| `idx_import_history_uploaded_at` | venue_import_history | Sort by date |
| `idx_import_history_status` | venue_import_history | Filter by status |

---

### 1.5 Unique Constraints

| Constraint | Table | Columns | Description |
|------------|-------|---------|-------------|
| hotels_name_city_uk | hotels | hotel_name, city_id | Prevent duplicate hotels |
| halls_hotel_name_uk | halls | hotel_id, hall_name | Prevent duplicate halls within hotel |

```sql
-- Add unique constraints (if not present)
ALTER TABLE hotels 
  ADD CONSTRAINT hotels_name_city_uk UNIQUE (hotel_name, city_id);

ALTER TABLE halls 
  ADD CONSTRAINT halls_hotel_name_uk UNIQUE (hotel_id, hall_name);
```

---

### 1.6 Migration Plan

**Phase 1: Add Columns**
```sql
-- Hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;

-- Halls table
ALTER TABLE halls ADD COLUMN IF NOT EXISTS hall_type TEXT;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS theatre_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS u_shape_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS cluster_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS boardroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS reception_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
```

**Phase 2: Add Constraints**
```sql
-- Add unique constraints
ALTER TABLE hotels 
  ADD CONSTRAINT hotels_name_city_uk UNIQUE (hotel_name, city_id);

ALTER TABLE halls 
  ADD CONSTRAINT halls_hotel_name_uk UNIQUE (hotel_id, hall_name);
```

**Phase 3: Create New Table**
```sql
CREATE TABLE venue_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_processed INTEGER NOT NULL,
  hotels_created INTEGER NOT NULL DEFAULT 0,
  hotels_updated INTEGER NOT NULL DEFAULT 0,
  halls_created INTEGER NOT NULL DEFAULT 0,
  halls_updated INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
  error_report_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_history_uploaded_by ON venue_import_history(uploaded_by);
CREATE INDEX idx_import_history_uploaded_at ON venue_import_history(uploaded_at);
CREATE INDEX idx_import_history_status ON venue_import_history(status);
```

---

## 2. Upsert Strategy

### 2.1 Hotel Uniqueness: Hotel Name + City

**Logic:** Find existing hotel by name + city, update if found, create if not.

**SQL Approach:**
```sql
-- Step 1: Find or create city
INSERT INTO cities (city_name, state)
VALUES ('Mumbai', 'Maharashtra')
ON CONFLICT (city_name) DO NOTHING
RETURNING id;

-- Step 2: Upsert hotel using ON CONFLICT
INSERT INTO hotels (
  hotel_name, city_id, state, star_rating, total_rooms, residential_capacity,
  contact_person, mobile, email, status
)
VALUES (
  'Taj Lands End', city_id, 'Maharashtra', 5, 250, 200,
  'Rajesh Sharma', '9876543210', 'sales@taj.com', 'ACTIVE'
)
ON CONFLICT (hotel_name, city_id) DO UPDATE
SET
  state = EXCLUDED.state,
  star_rating = EXCLUDED.star_rating,
  total_rooms = EXCLUDED.total_rooms,
  residential_capacity = EXCLUDED.residential_capacity,
  contact_person = EXCLUDED.contact_person,
  mobile = EXCLUDED.mobile,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  updated_at = NOW()
RETURNING id, CASE WHENxmax = 0 THEN 'created' ELSE 'updated' END AS action;
```

**Alternative: Explicit Select + Insert/Update**
```sql
-- Find existing hotel
SELECT id, hotel_name, city_id
FROM hotels
WHERE hotel_name = 'Taj Lands End'
  AND city_id = (SELECT id FROM cities WHERE city_name = 'Mumbai');

-- If found, UPDATE
UPDATE hotels SET
  star_rating = 5,
  total_rooms = 250,
  ...
WHERE id = found_hotel_id;

-- If not found, INSERT
INSERT INTO hotels (...)
VALUES (...);
```

---

### 2.2 Hall Uniqueness: Hotel + Hall Name

**Logic:** Find existing hall by hotel + name, update if found, create if not.

**SQL Approach:**
```sql
-- Find hotel ID by name + city
WITH hotel_lookup AS (
  SELECT h.id
  FROM hotels h
  JOIN cities c ON h.city_id = c.id
  WHERE h.hotel_name = 'Taj Lands End'
    AND c.city_name = 'Mumbai'
)

-- Upsert hall
INSERT INTO halls (
  hotel_id, hall_name, hall_type, theatre_capacity, classroom_capacity,
  u_shape_capacity, cluster_capacity, boardroom_capacity, reception_capacity, status
)
SELECT
  hotel_id,
  'Regency Ballroom',
  'Ballroom',
  500, 250, 80, 200, 40, 700,
  'ACTIVE'
FROM hotel_lookup
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
RETURNING id, CASE WHENxmax = 0 THEN 'created' ELSE 'updated' END AS action;
```

---

## 3. Transaction Strategy

### 3.1 If Row 500 Fails

**Current Approach:** Process rows individually with error collection

**Behavior:**
- Rows 1-499: Committed successfully
- Row 500: Marked as error, not committed
- Rows 501+: Not processed

**Recovery:**
- User downloads error report showing row 500 issue
- User fixes data and re-uploads
- Previous 499 rows are already in database

---

### 3.2 Commit Behavior

**Per-Operation Commits:**
- City creation: Auto-commits (if already exists, no-op)
- Hotel upsert: Auto-commits
- Hall upsert: Auto-commits
- Import history: Auto-commits

**No Single Transaction for Entire Import**

**Reason:** Allows partial success and provides clear recovery points.

---

### 3.3 Recovery Behavior

**Steps for Recovery:**
1. User identifies error from error report
2. User fixes data in Excel
3. User re-uploads file
4. System detects duplicates by hotel_name + city
5. System updates existing records instead of creating

**Idempotent Design:** Re-uploading same data multiple times produces same result.

---

## 4. Concurrency Strategy

### 4.1 Two Admins Importing Simultaneously

**Scenario:** User A and User B upload files at the same time.

**Race Condition Prevention:**
- Each import runs in isolation
- Unique constraints (hotel_name + city_id) prevent duplicate hotels
- Unique constraints (hotel_id + hall_name) prevent duplicate halls

**Locking Strategy:**
- **No explicit locks** - rely on database constraints
- If conflict occurs, PostgreSQL returns error
- Error is caught and logged in error report

**Duplicate Prevention:**
- PostgreSQL unique constraints handle this
- Import error report shows duplicate rows
- User must fix duplicates before re-uploading

---

## 5. Performance Strategy

### 5.1 Expected Loads

| Load | Expected Time | Processing Approach |
|------|---------------|---------------------|
| 500 rows | < 5 seconds | Batch processing with parallel upserts |
| 1000 rows | < 10 seconds | Batch processing with parallel upserts |
| 5000 rows | < 30 seconds | Batch processing with parallel upserts |

### 5.2 Processing Design

**Step 1: Parse Excel (In-Memory)**
- Read all rows into array
- Validate format (milliseconds)

**Step 2: Validate (In-Memory)**
- Check required fields
- Validate formats (email, mobile)
- Check business rules (star rating, hall type)
- Time: < 1 second for 5000 rows

**Step 3: Dry Run (In-Memory)**
- Resolve city IDs
- Count hotels to create/update
- Count halls to create/update
- Time: < 2 seconds for 5000 rows

**Step 4: Import (Database)**
- Batch city inserts (upsert)
- Batch hotel inserts (upsert) - 100 rows per batch
- Batch hall inserts (upsert) - 100 rows per batch
- Update hotel.largest_hall_capacity
- Time: < 10 seconds for 5000 rows

---

## 6. Security Review

### 6.1 RLS Impact

**Current RLS Policies (from enable_anonymous_access.sql):**
```sql
-- Hotels
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON hotels FOR SELECT USING (true);

-- Cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON cities FOR SELECT USING (true);

-- Halls
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON halls FOR SELECT USING (true);
```

**Import Process RLS:**
- Imports run as authenticated user
- RLS does NOT apply to inserts/updates
- Imports bypass RLS (as expected for admin operations)

---

### 6.2 Permissions Required

**For Import Service:**
```sql
-- Minimum permissions
GRANT INSERT, UPDATE ON hotels TO authenticated;
GRANT INSERT, UPDATE ON halls TO authenticated;
GRANT INSERT, UPDATE ON cities TO authenticated;
GRANT INSERT, SELECT ON venue_import_history TO authenticated;
```

**For Import History:**
```sql
-- Allow viewing all import history
CREATE POLICY "Admins can view import history" ON venue_import_history
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role_id IN (
        SELECT id FROM roles WHERE role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN')
      )
    )
  );
```

---

### 6.3 Audit Fields

**venue_import_history:**
```sql
uploaded_by UUID NOT NULL  -- From auth.uid()
uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- Auto-populated
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- Auto-populated
```

**Hotels and Halls:**
- Current table has `created_by`, `updated_by` fields
- Import should populate these with `auth.uid()`

---

## 7. Existing Data Compatibility

### 7.1 Venue Explorer
**Impact:** None  
**Reason:** Uses `hotels` and `halls` tables, new columns have defaults.

### 7.2 Venue Comparison
**Impact:** None  
**Reason:** Uses existing columns, new columns are additive.

### 7.3 My Shortlists
**Impact:** None  
**Reason:** Uses existing tables, no changes required.

### 7.4 Meeting Requests
**Impact:** None  
**Reason:** Uses separate tables, no overlap.

---

## 8. Future Compatibility

### 8.1 Commercials Support
**Current:** `quotations` table  
**Future:** May need `hotel_id` reference  
**Compatibility:** Existing hotels table has UUID primary key, ready for foreign key.

### 8.2 Quotations Support
**Current:** `quotations` table  
**Future:** May need hotel reference  
**Compatibility:** Existing hotels table has UUID primary key, ready.

### 8.3 Bookings Support
**Current:** `bookings` table  
**Future:** May need hotel reference  
**Compatibility:** Existing hotels table has UUID primary key, ready.

### 8.4 Vendor Portal Support
**Future:** May need `status` column on hotels  
**Compatibility:** `status` column already added (ACTIVE, INACTIVE, etc.)

### 8.5 Schema Design
**Approach:** Additive changes only  
**Result:** No breaking changes, always backward compatible.

---

## 9. Build Sequence

### Phase 1: Database Migration
**Priority:** Highest  
**Tasks:**
- [ ] Add columns to hotels table
- [ ] Add columns to halls table
- [ ] Create venue_import_history table
- [ ] Add indexes
- [ ] Add unique constraints
- [ ] Test migration in staging

### Phase 2: Import History Service
**Priority:** High  
**Tasks:**
- [ ] Implement import history CRUD
- [ ] Add pagination
- [ ] Implement error report generation
- [ ] Test history retrieval

### Phase 3: Template Generator
**Priority:** Medium  
**Tasks:**
- [ ] Generate Excel template with headers
- [ ] Include hall type dropdown values
- [ ] Add sample row with comments
- [ ] Download functionality

### Phase 4: Validation Engine
**Priority:** High  
**Tasks:**
- [ ] Required field validation
- [ ] Format validation (email, mobile)
- [ ] Business rule validation (star rating, hall type)
- [ ] Duplicate detection within file
- [ ] Error collection and reporting

### Phase 5: Dry Run Engine
**Priority:** High  
**Tasks:**
- [ ] Parse Excel file (in-memory)
- [ ] Resolve city IDs
- [ ] Count hotels to create/update
- [ ] Count halls to create/update
- [ ] Return summary without DB writes

### Phase 6: Import Engine
**Priority:** Highest  
**Tasks:**
- [ ] City upsert logic
- [ ] Hotel upsert logic
- [ ] Hall upsert logic
- [ ] Update hotel.largest_hall_capacity
- [ ] Generate import summary
- [ ] Write to venue_import_history

### Phase 7: UI Components
**Priority:** Medium  
**Tasks:**
- [ ] Upload page layout
- [ ] Drag & drop zone
- [ ] Validation preview cards
- [ ] Validation detail grid (tabs)
- [ ] Import summary cards
- [ ] Import history modal

### Phase 8: Testing
**Priority:** High  
**Tasks:**
- [ ] Unit tests for validation engine
- [ ] Integration tests for import engine
- [ ] End-to-end tests for upload flow
- [ ] Performance tests (500, 1000, 5000 rows)
- [ ] Concurrency tests

---

## 10. Conclusion

**Status:** Architecture Review Complete  
**Ready for:** Implementation Planning

### Key Decisions:
1. **Upsert Strategy:** Explicit SELECT + INSERT/UPDATE (clearer than ON CONFLICT)
2. **Transaction Strategy:** Per-operation commits (allows partial success)
3. **Concurrency:** Database constraints handle duplicates (no explicit locks)
4. **Validation:** Two-pass (Dry Run, then Import)
5. **Error Reporting:** Excel format with row-level details

### Risks:
- Minor: Current table schema differs from requirements (requires migration)
- Medium: Concurrency may require additional testing at scale

### Recommendations:
1. Start with Phase 1 (Database Migration) first
2. Test migration in staging environment before production
3. Add unique constraints gradually to avoid locking
4. Monitor performance on 5000 row imports

---

## Appendix A: Migration Script

```sql
-- venue_bulk_import_migration.sql
-- Run this in Supabase SQL Editor

-- Step 1: Add columns to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;

-- Step 2: Add columns to halls table
ALTER TABLE halls ADD COLUMN IF NOT EXISTS hall_type TEXT;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS theatre_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS u_shape_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS cluster_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS boardroom_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS reception_capacity INTEGER DEFAULT 0;
ALTER TABLE halls ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- Step 3: Add unique constraints
ALTER TABLE hotels 
  ADD CONSTRAINT IF NOT EXISTS hotels_name_city_uk UNIQUE (hotel_name, city_id);

ALTER TABLE halls 
  ADD CONSTRAINT IF NOT EXISTS halls_hotel_name_uk UNIQUE (hotel_id, hall_name);

-- Step 4: Create import history table
CREATE TABLE IF NOT EXISTS venue_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_processed INTEGER NOT NULL,
  hotels_created INTEGER NOT NULL DEFAULT 0,
  hotels_updated INTEGER NOT NULL DEFAULT 0,
  halls_created INTEGER NOT NULL DEFAULT 0,
  halls_updated INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
  error_report_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_import_history_uploaded_by ON venue_import_history(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_import_history_uploaded_at ON venue_import_history(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON venue_import_history(status);
```

---

**Document Status:** ✅ Complete  
**Next Step:** Implementation Planning (awaiting approval)
