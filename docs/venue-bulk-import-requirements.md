# AVEMS - Venue Bulk Import Module

## Phase 1: Requirements

### 1.1 Overview

**Feature Name:** Venue Bulk Import Module v1.0  
**Priority:** High  
**Status:** In Planning  
**Last Updated:** 2026-06-06  

#### 1.1.1 Objective
Replace manual hotel and hall creation with a bulk Excel import process. Bulk Import is the primary onboarding method for AVEMS. Manual hotel creation is secondary and used only for corrections and maintenance.

#### 1.1.2 Business Rationale
- **Scale:** AVEMS needs to onboard hundreds of hotels and thousands of halls efficiently
- **Accuracy:** Manual entry is error-prone; Excel templates ensure consistency
- **User Experience:** Modern SaaS import workflows are faster and more intuitive than ERP-style data entry
- **Maintainability:** Import history provides audit trail and rollback capability

---

### 1.2 User Stories

#### 1.2.1 Role-Based Access

| Role | Can Import? | Can View History? | Can Download Template? |
|------|-------------|-------------------|------------------------|
| ROLE_SUPER_ADMIN | ✅ Yes | ✅ Yes | ✅ Yes |
| ROLE_ADMIN | ✅ Yes | ✅ Yes | ✅ Yes |
| ROLE_SALES_HEAD | ❌ No | ❌ No | ❌ No |
| ROLE_MANAGEMENT | ❌ No | ❌ No | ❌ No |

#### 1.2.2 User Stories

**US-001: Download Excel Template**
> As a Super Admin or Admin  
> I want to download a standardized Excel template  
> So that I can fill in venue data offline with clear guidance

**US-002: Upload Excel File**
> As a Super Admin or Admin  
> I want to upload an Excel file with venue data  
> So that hotels and halls are automatically created in the system

**US-003: Validate Data Before Import**
> As a Super Admin or Admin  
> I want to see a validation preview before importing  
> So that I can fix errors and avoid importing invalid data

**US-004: Handle Duplicates Gracefully**
> As a Super Admin or Admin  
> I want hotels with the same name+city to be reused, not duplicated  
> So that the database remains clean and accurate

**US-005: Auto-Create Cities**
> As a Super Admin or Admin  
> I want cities to be automatically created if they don't exist  
> So that I don't need to maintain a separate city list

**US-006: Review Import Results**
> As a Super Admin or Admin  
> I want to see a summary of what was created/updated  
> So that I can verify the import was successful

**US-007: Download Error Report**
> As a Super Admin or Admin  
> I want to download a detailed error report  
> So that I can fix data issues and re-import

**US-008: View Import History**
> As a Super Admin or Admin  
> I want to view past import sessions  
> So that I can track data changes over time

---

### 1.3 Functional Requirements

#### 1.3.1 Import Workflow

| Step | Action | Description |
|------|--------|-------------|
| 1 | Download Template | User downloads the Excel template |
| 2 | Fill Template | User fills Excel with venue data |
| 3 | Upload File | User uploads the completed Excel file |
| 4 | Dry Run | System validates data without writing to database |
| 5 | Preview Results | System shows validation results and counts |
| 6 | Confirm Import | User confirms to proceed with import |
| 7 | Process Data | System creates hotels, halls, and cities |
| 8 | Show Summary | System displays import results |

#### 1.3.2 Data Validation Rules

| Rule | Severity | Description |
|------|----------|-------------|
| HOTEL_NAME_REQUIRED | ERROR | Hotel name must not be blank |
| CITY_REQUIRED | ERROR | City must not be blank |
| STAR_RATING_VALID | ERROR | Star rating must be 3, 4, or 5 |
| TOTAL_ROOMS_VALID | ERROR | Total rooms must be >= 0 |
| RESIDENTIAL_CAPACITY_VALID | WARNING | Residential capacity must be >= 0 |
| HALL_NAME_REQUIRED | ERROR | Hall name must not be blank |
| HALL_TYPE_REQUIRED | ERROR | Hall type must not be blank |
| HALL_TYPE_VALID | ERROR | Hall type must be one of: Ballroom, Conference Room, Board Room, Banquet Hall, Lawn, Rooftop, Meeting Room |
| THEATRE_CAPACITY_VALID | ERROR | Theatre capacity must be >= 0 |
| CLASSROOM_CAPACITY_VALID | WARNING | Classroom capacity must be >= 0 |
| U_SHAPE_CAPACITY_VALID | WARNING | U-shape capacity must be >= 0 |
| CLUSTER_CAPACITY_VALID | WARNING | Cluster capacity must be >= 0 |
| BOARDROOM_CAPACITY_VALID | WARNING | Boardroom capacity must be >= 0 |
| RECEPTION_CAPACITY_VALID | WARNING | Reception capacity must be >= 0 |
| EMAIL_VALID | ERROR | Email must be valid format |
| MOBILE_VALID | ERROR | Mobile must be numeric (10 digits) |
| HALL_NAME_UNIQUE | ERROR | Hall name must be unique within hotel |
| VENUE_STATUS_VALID | WARNING | Venue status must be one of: ACTIVE, INACTIVE, UNDER_REVIEW, BLACKLISTED |

#### 1.3.3 Import Logic

**Hotel Creation Logic:**
- **Unique Key:** Hotel Name + City
- **If hotel exists:** Reuse existing hotel, update contact info
- **If hotel does not exist:** Create new hotel with status=ACTIVE
- **Duplicate prevention:** No hotels with same name+city

**Hall Creation Logic:**
- **Unique Key:** Hotel + Hall Name
- **If hall exists:** Update hall capacities
- **If hall does not exist:** Create new hall with status=ACTIVE
- **Duplicate prevention:** No halls with same name within hotel

**City Handling:**
- **If city exists:** Reuse city_id
- **If city does not exist:** Auto-create city with state from city master

**Largest Hall Capacity:**
- **Automatically calculated** from halls table
- **No user input required** in Excel template
- **System maintains** hotel.largest_hall_capacity field

#### 1.3.4 Data Mapping

**Hotels Table:**
| Excel Column | Database Column | Required | Notes |
|--------------|-----------------|----------|-------|
| Hotel Name | hotel_name | Yes | |
| City | city_id | Yes | Foreign key to cities (state comes from cities table) |
| Star Rating | star_rating | Yes | 3, 4, or 5 |
| Total Rooms | total_rooms | Yes | >= 0 |
| Residential Capacity | residential_capacity | No | >= 0, for delegate counting |
| Contact Person | contact_person | No | |
| Mobile | mobile | No | |
| Email | email | No | |
| Venue Status | status | No | ACTIVE (default), or INACTIVE, UNDER_REVIEW, BLACKLISTED |

**Halls Table:**
| Excel Column | Database Column | Required | Notes |
|--------------|-----------------|----------|-------|
| Hotel Name | hotel_id | Yes | Foreign key to hotels |
| Hall Name | hall_name | Yes | |
| Hall Type | hall_type | Yes | Must be: Ballroom, Conference Room, Board Room, Banquet Hall, Lawn, Rooftop, Meeting Room |
| Theatre Capacity | theatre_capacity | Yes | >= 0 |
| Classroom Capacity | classroom_capacity | No | >= 0 |
| U Shape Capacity | u_shape_capacity | No | >= 0 |
| Cluster Capacity | cluster_capacity | No | >= 0 |
| Boardroom Capacity | boardroom_capacity | No | >= 0 |
| Reception Capacity | reception_capacity | No | >= 0 |

#### 1.3.5 Import History

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| file_name | TEXT | Original Excel filename |
| imported_by | UUID | Foreign key to auth.users |
| import_date | TIMESTAMPTZ | When import completed |
| rows_processed | INTEGER | Total rows in Excel |
| hotels_created | INTEGER | Count of new hotels |
| hotels_updated | INTEGER | Count of updated hotels |
| halls_created | INTEGER | Count of new halls |
| halls_updated | INTEGER | Count of updated halls |
| rows_skipped | INTEGER | Count of invalid rows |
| status | TEXT | 'SUCCESS' or 'FAILED' |
| error_report_url | TEXT | URL to download error report |

---

### 1.4 Security Requirements

| Requirement | Description |
|-------------|-------------|
| SR-001: Role-Based Access | Only SUPER_ADMIN and ADMIN can access import module |
| SR-002: Authentication | User must be logged in to import |
| SR-003: Authorization | User must have correct role for import action |
| SR-004: Audit Trail | All imports must be logged with user identity |
| SR-005: Error Report Access | Import history visible to all admins (not user-specific) |
| SR-006: No Deletion | Import should never delete hotels, halls, or cities |

---

### 1.5 Data Validation Requirements

#### 1.5.1 Required Fields (ERROR level)
- Hotel Name: Must not be blank
- City: Must not be blank
- Star Rating: Must be 3, 4, or 5
- Total Rooms: Must be >= 0
- Hall Name: Must not be blank
- Hall Type: Must not be blank and must be in allowed list
- Theatre Capacity: Must be >= 0

#### 1.5.2 Optional Fields (WARNING level if invalid)
- Residential Capacity: Should be >= 0
- Classroom Capacity: Should be >= 0
- U Shape Capacity: Should be >= 0
- Cluster Capacity: Should be >= 0
- Boardroom Capacity: Should be >= 0
- Reception Capacity: Should be >= 0
- Venue Status: If provided, must be valid status

#### 1.5.3 Format Validation
- Email: Must be valid email format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- Mobile: Must be numeric (regex: `^[0-9]{10}$`)

#### 1.5.4 Business Rules
- Hotel Name + City must be unique (no duplicates)
- Hall Name must be unique within a hotel
- Star rating must be 3, 4, or 5
- Hall type must be one of: Ballroom, Conference Room, Board Room, Banquet Hall, Lawn, Rooftop, Meeting Room

---

### 1.6 Import Rules

#### 1.6.1 File Format
- **Format:** Excel (.xlsx only)
- **Sheet Name:** `Venue_Master`
- **Maximum Rows:** 5,000 rows (including header)
- **Maximum File Size:** 25 MB (increased from 5 MB)

#### 1.6.2 Processing Constraints
- **Validation:** Must complete before import proceeds
- **Dry Run:** Must complete within 5 seconds for 500 rows
- **Import:** Must complete within 30 seconds for 500 rows
- **Error Handling:** Invalid rows should be skipped, not stop import

#### 1.6.3 Unique Key Rules
- **Hotels:** Hotel Name + City combination must be unique
- **Halls:** Hotel Name + Hall Name combination must be unique

#### 1.6.4 Soft Delete Protection
- **Import never deletes:** Hotels, Halls, or Cities
- **Deletion is separate:** Manual admin workflow only

---

### 1.7 Import Workflow Details

#### 1.7.1 Step 1: Download Template
- User clicks "Download Template" button
- System generates Excel template with:
  - Column headers
  - Sample row
  - Data validation hints in comments
  - Hall type dropdown values

#### 1.7.2 Step 2: Fill Template
- User fills Excel offline
- User can add multiple hotels and halls

#### 1.7.3 Step 3: Upload File
- User clicks "Upload Excel" button
- System validates file format (must be .xlsx)
- System reads `Venue_Master` sheet

#### 1.7.4 Step 4: Dry Run (NEW)
- System validates ALL data in memory
- NO database writes occur
- System calculates:
  - Hotels to create/update
  - Halls to create/update
  - Validation errors and warnings

#### 1.7.5 Step 5: Preview Results
System displays:
- **Hotels To Create:** Count of new hotels
- **Hotels To Update:** Count of existing hotels with changes
- **Halls To Create:** Count of new halls
- **Halls To Update:** Count of existing halls with changes
- **Errors:** List of validation errors (blocks import)
- **Warnings:** List of validation warnings

**Import cannot proceed if critical validation errors exist.**

#### 1.7.6 Step 6: Confirm Import
- User reviews preview
- User clicks "Confirm Import" button
- Import process begins

#### 1.7.7 Step 7: Process Data
System processes in order:
1. Create cities (if missing)
2. Create/update hotels (by unique key)
3. Create/update halls (by unique key)
4. Update hotel.largest_hall_capacity
5. Generate error report (if any errors)

#### 1.7.8 Step 8: Import Summary
System displays:
- **Hotels Created:** Count
- **Hotels Updated:** Count
- **Halls Created:** Count
- **Halls Updated:** Count
- **Rows Skipped:** Count
- **Errors:** Count and download link

---

### 1.8 Reporting Requirements

#### 1.8.1 Import History Report
| Column | Description |
|--------|-------------|
| Import Date | When import completed |
| File Name | Original Excel filename |
| Rows Processed | Total rows in Excel |
| Hotels Created | Count of new hotels |
| Hotels Updated | Count of updated hotels |
| Halls Created | Count of new halls |
| Halls Updated | Count of updated halls |
| Status | SUCCESS or FAILED |
| Download Report | Link to error report |

#### 1.8.2 Import Summary (per import session)
- Total hotels created/updated
- Total halls created/updated
- Rows skipped due to errors
- Error count and details

---

### 1.9 Acceptance Criteria

#### 1.9.1 US-001: Download Template
- [ ] "Download Template" button is visible to SUPER_ADMIN and ADMIN
- [ ] Clicking button downloads `Venue_Master_Template.xlsx`
- [ ] Template contains all required columns
- [ ] Template includes sample row with comments
- [ ] Template includes hall type dropdown values

#### 1.9.2 US-002: Upload Excel File
- [ ] "Upload Excel" button is visible to SUPER_ADMIN and ADMIN
- [ ] System accepts .xlsx files up to 25 MB
- [ ] System validates sheet name is `Venue_Master`
- [ ] System reads data from correct sheet

#### 1.9.3 US-003: Validate Data Before Import
- [ ] System validates all required fields
- [ ] System shows validation preview with counts
- [ ] Import blocked if critical errors exist
- [ ] User can see error details before confirming

#### 1.9.4 US-004: Handle Duplicates Gracefully
- [ ] Hotels with same name+city are detected
- [ ] Existing hotels are reused (not duplicated)
- [ ] Contact info is updated if changed
- [ ] Halls are detected and updated, not duplicated

#### 1.9.5 US-005: Auto-Create Cities
- [ ] System checks if city exists
- [ ] If city doesn't exist, system creates it
- [ ] City_id is assigned correctly

#### 1.9.6 US-006: Review Import Results
- [ ] Summary shows hotels created/updated
- [ ] Summary shows halls created/updated
- [ ] Summary shows rows skipped
- [ ] Summary shows error count

#### 1.9.7 US-007: Download Error Report
- [ ] Error report is generated on import
- [ ] Report includes row numbers and error descriptions
- [ ] User can download error report (.xlsx)
- [ ] Report shows only rows with errors

#### 1.9.8 US-008: View Import History
- [ ] Import history table displays past imports
- [ ] Table shows all required columns
- [ ] History is visible to all admins (not filtered by user)
- [ ] User can click to view specific import details

#### 1.9.9 Security Requirements
- [ ] Non-authorized users (SALES_HEAD, MANAGEMENT) cannot access import module
- [ ] Import action requires authentication
- [ ] Import history includes user identity
- [ ] Import never deletes hotels, halls, or cities

#### 1.9.10 Performance Requirements
- [ ] 500 rows validated within 5 seconds
- [ ] 5,000 rows validated within 30 seconds
- [ ] Import process completes within 30 seconds
- [ ] Error report generates within 5 seconds

---

### 1.10 Out of Scope

The following features are explicitly out of scope for this version:

| Feature | Reason | Future Phase |
|---------|--------|--------------|
| Photo bulk upload | Photos managed separately via Hotel Details screen | Phase 2 |
| Vendor self-service portal | Central admin only for now | Phase 2 |
| Scheduled imports | Manual import only for now | Phase 2 |
| API-based venue synchronization | Web interface only for now | Phase 2 |

---

### 1.11 Assumptions

1. Excel files will be filled by Central Admin staff with domain knowledge
2. City list is managed automatically (no manual city master maintenance)
3. State information comes from cities table, not Excel
4. Star rating is always 3, 4, or 5 (no decimal values)
5. One Excel file can contain multiple hotels and halls
6. Error reports are generated even for successful imports
7. Import history is retained for 12 months
8. Import process never deletes data (soft delete protection)
9. Residential capacity is optional but recommended for delegate planning

---

### 1.12 Dependencies

| Dependency | Description |
|------------|-------------|
| Supabase Auth | User authentication and role checking |
| Hotels Table | Must exist in database |
| Halls Table | Must exist in database |
| Cities Table | Must exist in database |
| Import History Table | Must be created for this feature |

---

## Status: ✅ Requirements Complete

**Next Phase:** Phase 2 - Design (awaiting approval)

**Approval Checklist:**
- [x] State column removed (uses city master)
- [x] Residential capacity added
- [x] Hall type is controlled (dropdown validation)
- [x] Largest hall capacity auto-calculated
- [x] File size increased to 25 MB
- [x] Dry run mode added (no DB writes until confirmation)
- [x] Import history visible to all admins (not user-specific)
- [x] Soft delete protection (import never deletes)
- [x] Venue status support added

**Ready for Design:** Yes - Awaiting approval
