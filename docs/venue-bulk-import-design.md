# AVEMS - Venue Bulk Import Module

## Phase 2: Design Specification

### 2.1 Navigation Placement

**Route:** `/admin/venue-import`

**Navigation Structure:**
```
Masters ▼
  ├ Users
  ├ Venue Import       ← New route
  ├ Masters
  └ Settings
```

**Access Control:**
- **Visible to:** ROLE_SUPER_ADMIN, ROLE_ADMIN
- **Hidden from:** ROLE_SALES_HEAD, ROLE_MANAGEMENT

**Navigation Configuration:**
```typescript
{
  name: 'Venue Import',
  path: '/admin/venue-import',
  iconName: 'FileArchive',
  roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
}
```

---

### 2.2 Screen Layout

#### 2.2.1 Page Header
```
Venue Bulk Import
Upload hotels and halls using Excel template
```

#### 2.2.2 Top Action Bar
Three primary buttons (left-aligned):
- `[ Download Template ]` - Download Excel template
- `[ Upload Excel ]` - Upload file (enabled after file selected)
- `[ Import History ]` - View past imports (modal)

#### 2.2.3 Section A: Import Instructions Card
**Visual:** Modern SaaS onboarding card  
**Content:**
```
Import Workflow
1. Download Template
2. Fill Template
3. Upload File
4. Review Validation
5. Confirm Import
```

#### 2.2.4 Section B: Upload Area
**Visual:** Drag & Drop Zone  
**Features:**
- Drag & drop .xlsx files
- Click to browse
- Display: File Name, File Size, Rows Detected
- Validate file format on drop/select

#### 2.2.5 Section C: Validation Preview (Hidden until upload)
**Visual:** Summary Cards  
**Cards:**
- 🟢 Hotels To Create (count)
- 🟦 Hotels To Update (count)
- 🟢 Halls To Create (count)
- 🟦 Halls To Update (count)
- 🔴 Errors (count)
- 🟡 Warnings (count)

**Color Coding:**
- Green (🟢): Creates/Success
- Blue (🟦): Updates/In-progress
- Amber (🟡): Warnings
- Red (🔴): Errors/Blocks

#### 2.2.6 Section D: Validation Detail Grid (Hidden until upload)
**Visual:** Tabs with data grid  
**Tabs:**
- `Errors` - Critical validation failures
- `Warnings` - Non-critical issues
- `Preview Data` - Sample of parsed data

**Columns:**
- Row Number
- Field
- Current Value
- Issue

#### 2.2.7 Section E: Import Summary (Visible after import)
**Visual:** Success cards  
**Cards:**
- ✅ Hotels Created: 12
- ✅ Hotels Updated: 3
- ✅ Halls Created: 45
- ✅ Halls Updated: 12
- ⚠️ Rows Skipped: 2
- [ Download Error Report ] (if errors)

---

### 2.3 Dry Run Architecture

**Critical Requirement:** No database writes occur during validation.

**Workflow:**
```
Upload → Parse Excel → Validate → Dry Run Analysis → Preview Results → User Confirmation → Import
```

**Dry Run Process:**
1. Parse Excel file into memory
2. Validate workbook format
3. Validate sheet name (Venue_Master)
4. Validate columns
5. Resolve city IDs
6. Create missing cities (in memory only)
7. Upsert hotels (in memory only)
8. Upsert halls (in memory only)
9. Recalculate hotel summaries (in memory only)

**Dry Run Output:**
```typescript
{
  hotelsToCreate: number,
  hotelsToUpdate: number,
  hallsToCreate: number,
  hallsToUpdate: number,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  previewData: ParsedRow[]
}
```

---

### 2.4 Database Design

#### 2.4.1 New Table: venue_import_history

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

-- Index for quick lookups
CREATE INDEX idx_import_history_uploaded_by ON venue_import_history(uploaded_by);
CREATE INDEX idx_import_history_uploaded_at ON venue_import_history(uploaded_at);
```

#### 2.4.2 Existing Table Changes

**cities table:** No changes (already exists)

**hotels table:** Ensure these columns exist
```sql
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS residential_capacity INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS largest_hall_capacity INTEGER DEFAULT 0;
```

**halls table:** Ensure these columns exist
```sql
-- halls table already has all required columns
-- status should be added if not present
ALTER TABLE halls ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
```

---

### 2.5 Import Engine Design

#### 2.5.1 Processing Order

| Step | Action | Description |
|------|--------|-------------|
| 1 | Validate Workbook | Check file format, size, structure |
| 2 | Validate Sheet Name | Must be `Venue_Master` |
| 3 | Validate Columns | Check required columns exist |
| 4 | Resolve City IDs | Map city names to city IDs |
| 5 | Create Missing Cities | Auto-create cities if needed |
| 6 | Upsert Hotels | Create or update hotels |
| 7 | Upsert Halls | Create or update halls |
| 8 | Recalculate Summaries | Update largest_hall_capacity |
| 9 | Generate Report | Create error report |

#### 2.5.2 Duplicate Detection

**Inside Upload File:**
- Detect: Hotel Name + City duplicates
- Detect: Hotel + Hall duplicates

**Duplicate rows become:**
- Validation Errors
- Import blocked until resolved

**Error Message:**
```
Row XX: Duplicate [Hotel Name] + [City] combination
Row XX: Duplicate [Hall Name] within [Hotel Name]
```

---

### 2.6 Error Report Design

#### 2.6.1 Format

**Format:** Excel (.xlsx)  
**Filename:** `Import_Errors_YYYYMMDD_HHMM.xlsx`  
**Sheet:** `Error_Report`

#### 2.6.2 Columns

| Column | Description | Example |
|--------|-------------|---------|
| Row Number | Excel row (1-based) | 25 |
| Field | Column name | Hall Name |
| Error | Validation error type | Missing value |
| Value | The value that failed | blank |

#### 2.6.3 Example

| Row Number | Field | Error | Value |
|------------|-------|-------|-------|
| 25 | Hall Name | Missing value | blank |
| 41 | Email | Invalid format | not-an-email |
| 62 | Hall Name | Duplicate within hotel | Regency Ballroom |

---

### 2.7 Template Design

#### 2.7.1 File Information

**Filename:** `AVEMS_Venue_Import_Template.xlsx`  
**Worksheet Name:** `Venue_Master`

#### 2.7.2 Columns

**Hotel Information (Rows 1-5 required for all hotels):**
| Column | Required | Notes |
|--------|----------|-------|
| Hotel Name | Yes | |
| City | Yes | |
| Star Rating | Yes | 3, 4, or 5 |
| Total Rooms | Yes | >= 0 |
| Residential Capacity | No | >= 0 |
| Contact Person | No | |
| Mobile | No | 10 digits |
| Email | No | Valid format |
| Venue Status | No | ACTIVE, INACTIVE, UNDER_REVIEW, BLACKLISTED |

**Hall Information (Required for each hall):**
| Column | Required | Notes |
|--------|----------|-------|
| Hall Name | Yes | |
| Hall Type | Yes | Ballroom, Conference Room, etc. |
| Theatre Capacity | Yes | >= 0 |
| Classroom Capacity | No | >= 0 |
| U Shape Capacity | No | >= 0 |
| Cluster Capacity | No | >= 0 |
| Boardroom Capacity | No | >= 0 |
| Reception Capacity | No | >= 0 |

#### 2.7.3 Sample Row

| Hotel Name | City | Star Rating | Total Rooms | Residential Capacity | Contact Person | Mobile | Email | Venue Status | Hall Name | Hall Type | Theatre Capacity | Classroom Capacity | U Shape Capacity | Cluster Capacity | Boardroom Capacity | Reception Capacity |
|------------|------|-------------|-------------|---------------------|----------------|--------|-------|--------------|-----------|-----------|------------------|------------------|------------------|------------------|------------------|-------------------|
| Taj Lands End | Mumbai | 5 | 250 | 200 | Rajesh Sharma | 9876543210 | sales@taj.com | ACTIVE | Regency Ballroom | Ballroom | 500 | 250 | 80 | 200 | 40 | 700 |

#### 2.7.4 Hall Type Validation

**Allowed Values:**
- Ballroom
- Conference Room
- Board Room
- Banquet Hall
- Lawn
- Rooftop
- Meeting Room

**Anything else:** Validation Error

---

### 2.8 UX Design Rules

#### 2.8.1 Follow AVEMS Design Governance
- Use: Card layouts
- Use: Progress indicators
- Use: Validation counters
- Use: Modern SaaS appearance

#### 2.8.2 Avoid
- ERP grids
- Dense forms
- Technical screens

#### 2.8.3 Reference Styles
- Stripe Import Hub
- HubSpot Import
- Zoho Data Import

---

### 2.9 Implementation Deliverables

**Deliver 1: UI Wireframe**
- Upload page layout
- Validation preview UI
- Import summary UI
- Import history modal

**Deliver 2: Route Design**
```typescript
{
  path: '/admin/venue-import',
  element: <VenueBulkImport />,
  allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
}
```

**Deliver 3: Database Migration Design**
- Create `venue_import_history` table
- Add missing columns to hotels table

**Deliver 4: Import Service Design**
- Excel parsing service
- Validation service
- Upsert service
- Error report generation

**Deliver 5: Validation Service Design**
- Required field validation
- Format validation
- Business rule validation
- Duplicate detection

**Deliver 6: Error Report Design**
- Excel report generation
- Row-level error tracking

**Deliver 7: Import History Design**
- History table queries
- Pagination support

---

### 2.10 Task Breakdown

**Phase 2: Design Complete**  
**Next Step:** Implementation Planning (awaiting approval)

**Implementation Tasks (To be defined after design approval):**
1. Database migration
2. Import service implementation
3. Validation service implementation
4. Error report generation
5. UI component implementation
6. Import history UI
7. Template download functionality
8. Integration testing

---

## Status: ✅ Design Complete

**Ready for:** Implementation Planning

**Approval Checklist:**
- [ ] Navigation placement reviewed
- [ ] Screen layout approved
- [ ] Dry run architecture confirmed
- [ ] Database design reviewed
- [ ] Import engine design approved
- [ ] Error report format approved
- [ ] Template design approved
- [ ] UX design rules followed
