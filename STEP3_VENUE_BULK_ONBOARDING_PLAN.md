# STEP 3: Venue Bulk Onboarding Platform - Implementation Plan

## 📋 Executive Summary

**Objective**: Build a complete venue repository onboarding system to populate and maintain the venue database at scale.

**Status**: STARTING  
**Phases**: 8 phases (Upload → Templates → Multi-sheet Import → Validation → Preview → Execution → History → Quality Dashboard)  
**Estimated Components**: 8 major components + supporting services

---

## 🎯 Phase-by-Phase Breakdown

### PHASE 1: Venue Upload Center
**Component**: `VenueUploadCenter.tsx`
- Central page accessible at: `/administration/masters/venues/bulk-upload`
- Navigation from VenueAdmin list page
- Sticky header with breadcrumbs
- Tab-based interface with steps

**Deliverables**:
- Route added to App.tsx
- Navigation button in VenueAdmin.tsx

---

### PHASE 2: Template Downloads
**Component**: `TemplateDownloadPanel.tsx`
- Downloadable templates for 5 sheets:
  1. Hotel Master (hotel_name, city, address, etc.)
  2. Hall Master (hall_name, capacity, type, etc.)
  3. Accommodation Inventory (room types, occupancy, etc.)
  4. Occupancy Rules (designation → occupancy mapping)
  5. Photo Mapping (placeholder)
- Single workbook download with all sheets

**Service**: `templateService.ts`
- Generate Excel templates using XLSX library
- Each template with example rows and validation hints

---

### PHASE 3: Multi-Sheet Import
**Component**: Already started in `VenueBulkUpload.tsx`
- Upload single workbook file
- Extract all 5 sheets
- Single validation cycle for all sheets
- Validate references between sheets

**Service**: Enhancement to `importService.ts`
- Parse all 5 sheets from single workbook
- Validate sheet structure
- Map hotel/hall references across sheets

---

### PHASE 4: Pre-Upload Validation
**Service**: `validationService.ts`
**Validation Rules**:
- Zone exists (via City → Zone relationship)
- City exists
- Hotel references valid (for halls, accommodations, occupancy)
- Hall references valid hotel
- Accommodation references valid hotel
- Occupancy references valid hotel
- Required fields populated
- Duplicate hotels detected (same name + city)
- Duplicate halls detected (same hotel + hall_name)

---

### PHASE 5: Preview Screen
**Component**: `ImportPreviewScreen.tsx`
- Display validation results before commit
- Show Hotels (Valid/Invalid count)
- Show Halls (Valid/Invalid count)
- Show Inventory (Valid/Invalid count)
- Show Occupancy (Valid/Invalid count)
- Display exact row errors with context
- Summary statistics

**Data Structure**:
```
{
  hotels: { valid: N, invalid: N, errors: [] },
  halls: { valid: N, invalid: N, errors: [] },
  inventory: { valid: N, invalid: N, errors: [] },
  occupancy: { valid: N, invalid: N, errors: [] },
  photos: { valid: N, invalid: N, errors: [] }
}
```

---

### PHASE 6: Import Execution
**Service**: Enhancement to `importService.ts`
**Import Logic**:
1. Validate all data first (pre-validation)
2. Import only valid records
3. Create/Update hotels
4. Create/Update halls (with hotel references)
5. Create/Update accommodation inventory
6. Create/Update occupancy rules
7. Process photo mappings (if provided)

**Result Summary**:
- Hotels Created: N
- Hotels Updated: N
- Halls Created: N
- Halls Updated: N
- Inventory Records Created: N
- Occupancy Rules Created: N
- Failed Records: N with reasons

---

### PHASE 7: Import History
**Component**: `ImportHistoryPanel.tsx`
- Display import history table
- Columns: Import Date, User, Status, Records Processed, Records Failed, Duration
- Pagination (20 per page)
- Detail view for each import
- Download error reports

**Database Table**: `venue_import_history` (already exists)

---

### PHASE 8: Data Quality Dashboard
**Component**: `DataQualityDashboard.tsx`
- Display venue readiness metrics
- Hotels Missing Halls: N (%)
- Hotels Missing Accommodation: N (%)
- Hotels Missing Occupancy Rules: N (%)
- Hotels Missing Photos: N (%)
- Hotels Not Venue Ready: N (%)
- Visual progress indicators
- Drill-down capability

**Service**: Enhancement to `importService.ts`
- Calculate readiness scores for all hotels
- Aggregate quality metrics

---

## 📁 File Structure

```
src/
├── pages/
│   ├── VenueUploadCenter.tsx      [NEW] Main upload workflow
│   ├── VenueBulkUpload.tsx        [EXISTS - enhance]
│   └── VenueAdmin.tsx             [MODIFY - add bulk upload button]
├── components/
│   ├── TemplateDownloadPanel.tsx  [NEW] Download templates
│   ├── ImportPreviewScreen.tsx    [NEW] Validation preview
│   ├── ImportHistoryPanel.tsx     [NEW] History display
│   ├── DataQualityDashboard.tsx   [NEW] Quality metrics
│   └── ImportStepIndicator.tsx    [NEW] Step progress indicator
├── features/venues/
│   ├── importService.ts           [ENHANCE] Multi-sheet logic
│   ├── validationService.ts       [NEW] Validation rules
│   ├── templateService.ts         [NEW] Template generation
│   ├── qualityService.ts          [NEW] Quality metrics
│   └── types.ts                   [ENHANCE] Add new types
└── routes/
    └── [MODIFY App.tsx]           Add route for bulk upload
```

---

## 🔄 Workflow Sequence

```
1. Admin clicks "Bulk Upload" from Venues page
   ↓
2. Navigate to /administration/masters/venues/bulk-upload
   ↓
3. VenueUploadCenter shows step indicator (1-6)
   ↓
4. Step 1: Download Template (Excel)
   ↓
5. Step 2: Upload Workbook File
   ↓
6. Step 3: Parse & Validate (generateImportPreview)
   ↓
7. Step 4: Display Preview (show validation results)
   ↓
8. Step 5: Confirm Import (user clicks button)
   ↓
9. Step 6: Execute Import (executeImport)
   ↓
10. Step 7: Show Summary & Navigate to History
    ↓
11. Import History Panel shows recent imports
    ↓
12. Data Quality Dashboard shows metrics
```

---

## ✅ Validation Checklist

Each phase will be validated with:
- [ ] Excel parsing correct
- [ ] Validation rules enforce correctly
- [ ] Database inserts/updates work
- [ ] Error messages clear and actionable
- [ ] UI responsive and intuitive
- [ ] History recorded properly
- [ ] Quality metrics calculated correctly

---

## 🚀 Implementation Sequence

1. **Setup**: Add types and enhance importService
2. **Phase 1**: Create VenueUploadCenter page and route
3. **Phase 2**: Create TemplateDownloadPanel and templateService
4. **Phase 3**: Enhance VenueBulkUpload for multi-sheet handling
5. **Phase 4-5**: Create validation and preview components
6. **Phase 6**: Complete import execution logic
7. **Phase 7**: Create import history panel
8. **Phase 8**: Create data quality dashboard

---

## 📊 Database Schema (Already Exists)

```sql
-- Main tables (pre-existing)
hotels (id, hotel_name, city_id, address, contact_phone, contact_email, ...)
halls (id, hotel_id, hall_name, theatre_capacity, classroom_capacity, ...)
accommodation_inventory (id, hotel_id, single_rooms, double_rooms, ...)
occupancy_rules (id, hotel_id, rule_type, min_occupancy, ...)
venue_photos (id, hotel_id, hall_id, photo_url, ...)

-- Import tracking
venue_import_history (
  id, 
  import_session_id, 
  file_name, 
  uploaded_by,
  rows_processed,
  hotels_created, 
  hotels_updated,
  halls_created,
  halls_updated,
  status,
  created_at
)
```

---

## ⚙️ Excel Template Structure

### Sheet 1: Hotel Master
| Column | Type | Required | Example |
|--------|------|----------|---------|
| hotel_name | String | ✓ | Taj Hotel |
| city | String | ✓ | Mumbai |
| address | String | | 123 Business Park |
| contact_person | String | | Rajesh Sharma |
| contact_phone | String | | 9876543210 |
| contact_email | String | | sales@taj.com |
| total_rooms | Integer | | 250 |
| check_in_time | String | | 14:00 |
| check_out_time | String | | 11:00 |
| status | String | | ACTIVE |

### Sheet 2: Hall Master
| Column | Type | Required | Example |
|--------|------|----------|---------|
| hotel_name | String | ✓ | Taj Hotel |
| city | String | ✓ | Mumbai |
| hall_name | String | ✓ | Grand Ballroom |
| hall_type | String | ✓ | BALLROOM |
| theatre_capacity | Integer | ✓ | 500 |
| classroom_capacity | Integer | | 250 |
| u_shape_capacity | Integer | | 80 |
| cluster_capacity | Integer | | 200 |
| boardroom_capacity | Integer | | 40 |
| reception_capacity | Integer | | 700 |

### Sheet 3: Accommodation Inventory
| Column | Type | Required | Example |
|--------|------|----------|---------|
| hotel_name | String | ✓ | Taj Hotel |
| city | String | ✓ | Mumbai |
| total_rooms | Integer | ✓ | 250 |
| single_rooms | Integer | | 50 |
| double_rooms | Integer | | 150 |
| triple_rooms | Integer | | 30 |
| quad_rooms | Integer | | 10 |
| suite_rooms | Integer | | 10 |
| occupancy_rate | Integer | | 75 |

### Sheet 4: Occupancy Rules
| Column | Type | Required | Example |
|--------|------|----------|---------|
| hotel_name | String | ✓ | Taj Hotel |
| city | String | ✓ | Mumbai |
| designation | String | ✓ | SO |
| occupancy_type | String | ✓ | DOUBLE |
| min_occupancy | Integer | | 10 |

### Sheet 5: Photo Mapping
| Column | Type | Required | Example |
|--------|------|----------|---------|
| hotel_name | String | ✓ | Taj Hotel |
| city | String | ✓ | Mumbai |
| photo_type | String | | EXTERIOR |
| photo_url | String | | http://... |

---

## 🔒 Security & Permissions

- Only SUPER_ADMIN and ADMIN can access bulk upload
- RLS policies enforced at database level
- Session tracking for audit trail
- User tracking (uploaded_by field)

---

## ✨ Success Criteria

- ✅ Workbook upload works
- ✅ Multi-sheet parsing works
- ✅ Validation executes correctly
- ✅ Preview displays accurately
- ✅ Import processes valid records only
- ✅ Import history tracked
- ✅ Data quality dashboard shows metrics
- ✅ No existing workflows modified
- ✅ Zero breaking changes
- ✅ All components are type-safe
- ✅ Error messages are clear
- ✅ UI is responsive

---

## 📍 Current Status

**Phase**: Planning  
**Date**: June 13, 2026  
**Next**: Start implementation with Phase 1 & 2

