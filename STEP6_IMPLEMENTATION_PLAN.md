# STEP 6: VENUE INTELLIGENCE PLATFORM - IMPLEMENTATION PLAN

**Status**: IN PROGRESS  
**Start Date**: June 13, 2026  
**Target**: Complete UI layer for all 12 phases  

## 📋 PHASE BREAKDOWN & IMPLEMENTATION SEQUENCE

### PHASE 1: VENUE DATA CENTER (Central Hub)
**Component**: `VenueDataCenter.tsx` (NEW - replaces VenueBulkImport)
**Route**: `/administration/masters/venues/data-center`

**5-Tab Interface**:
1. **Bulk Import** - Multi-sheet Excel upload
2. **Import History** - Past import tracking
3. **Data Quality** - Readiness metrics
4. **Zone Master** - Zone management (CRUD)
5. **City Master** - City↔Zone management

**Current State**: ❌ MISSING - Need to create entire component

---

### PHASE 2: ZONE MASTER UI
**Database**: ✅ Complete (step1_zone_master_foundation.sql)
**UI Status**: ❌ MISSING

**Component**: `ZoneMasterTab.tsx`
**Features**:
- List view (5 standard zones: NORTH, SOUTH, EAST, WEST, HO)
- Add new zone (admin only)
- Edit zone name/status
- Activate/Deactivate toggle
- Delete protection (trigger prevents if cities exist)

**Fields**:
- Zone Code (NORTH, SOUTH, EAST, WEST, HO)
- Zone Name
- Active Status

---

### PHASE 3: CITY MASTER ENHANCEMENT
**Database**: ✅ Enhanced (zone_id column added)
**UI Status**: ❌ MISSING Zone linking

**Component**: `CityMasterTab.tsx`
**Modifications**:
- Add Zone dropdown to existing city form
- Validation: Every city must belong to exactly one zone
- No orphan cities allowed
- Show zone in city list

**New Fields**:
- Zone (required dropdown)
- City Name (existing)
- State (existing)
- Active Status (existing)

---

### PHASE 4: HOTEL MASTER REBUILD
**Database**: ✅ Enhanced (20+ new fields)
**UI Status**: ⚠️ PARTIAL - Only basic fields exist

**Component**: `HotelFormModal.tsx` - REBUILD + `HotelDetailsTab.tsx` - NEW

**Sections**:

#### 4a. Basic Information
- Hotel Name
- Hotel Brand
- Hotel Category (5_STAR, 4_STAR, 3_STAR, BUSINESS, BUDGET, RESORT, BOUTIQUE)
- Zone (read-only, derived from city)
- City
- Address
- GST Number
- Website
- Latitude/Longitude

#### 4b. Contact Information
- Sales Contact Name
- Designation
- Mobile
- Email

#### 4c. Operational Information
- Preferred Vendor (toggle)
- Blacklisted (toggle)
- Remarks (text area)

**Current State**: Basic form exists, needs extensive enhancement

---

### PHASE 5: ACCOMMODATION INVENTORY
**Database**: ✅ Table created (hotel_accommodation_inventory)
**UI Status**: ❌ MISSING

**Component**: `AccommodationInventoryTab.tsx` (Already exists but may need enhancement)
**Edit Capability**: ✅ Required and must be fully editable

**Fields**:
- Total Rooms (required, >= 0)
- Single Rooms (optional, >= 0)
- Double Rooms (optional, >= 0)
- Triple Rooms (optional, >= 0)
- Quad Rooms (optional, >= 0)
- Suite Rooms (optional, >= 0)

**Validation**: Sum of room types must not exceed Total Rooms

**Data Entry**: Direct editable form (not derived, user-entered)

---

### PHASE 6: OCCUPANCY MATRIX
**Database**: ✅ Tables created (hotel_occupancy_rules, default_occupancy_rules)
**UI Status**: ⚠️ PARTIAL - Tab exists but may need enhancement

**Component**: `OccupancyMatrixTab.tsx` (Already exists, verify completeness)

**Grid View**:
- Designations (rows): SO, DM, RSM, CH, IBH, OTHERS
- Occupancy Types (columns): SINGLE, DOUBLE, TRIPLE, QUAD
- Hotel-specific mappings (not global)
- Edit capability (set occupancy type per designation)

**Example**:
```
SO  → TRIPLE
DM  → DOUBLE
RSM → SINGLE
CH  → SINGLE
IBH → SINGLE
OTHERS → SINGLE
```

---

### PHASE 7: HALL MASTER REBUILD
**Database**: ✅ Enhanced (seating capacities, floor, area, indoor/outdoor)
**UI Status**: ⚠️ PARTIAL - May need enhancement

**Component**: `HallsTab.tsx` - REBUILD

**Fields** (currently missing):
- Hall Name (existing)
- Floor
- Area (sqft)
- Indoor/Outdoor (INDOOR, OUTDOOR, BOTH)
- Status (ACTIVE, INACTIVE, UNDER_RENOVATION)

**Seating Capacities** (6 types - currently missing):
- Theatre Capacity
- Classroom Capacity
- U-Shape Capacity
- Cluster Capacity
- Boardroom Capacity
- Round Table Capacity

**Current Issue**: Single capacity model needs to support 6 independent capacities

---

### PHASE 8: VENUE SUITABILITY (System-Maintained)
**Database**: ✅ Fields added to hotels table
**UI Status**: ❌ MISSING - Read-only display

**Component**: Inside `HotelDetailsWorkspace.tsx` - ADD suitability section

**Fields** (read-only, system-calculated):
- Residential Supported (Yes/No)
- Non-Residential Supported (Yes/No)
- Maximum Residential Pax (auto-calculated from rooms × 2)
- Maximum Meeting Pax (auto-calculated from largest hall)
- Multiple Hall Support (Yes/No if 2+ halls)

**Calculation Logic**:
- residential_pax = total_rooms × 2
- meeting_pax = largest_hall_capacity
- multiple_halls = halls.count() > 1

---

### PHASE 9: HISTORICAL VENUE INTELLIGENCE
**Database**: ✅ Fields added to hotels table
**UI Status**: ❌ MISSING - Read-only display

**Component**: Inside `HotelDetailsWorkspace.tsx` - ADD intelligence section

**Fields** (read-only, system-maintained):
- Total Ajanta Events (auto-incremented from bookings)
- Last Used Date (from booking)
- Last Division (which division last booked)
- Last Meeting Type (type of meeting)
- Ajanta Rating (0-5 average)
- Feedback Count (number of ratings)

**Note**: No manual editing, purely informational

---

### PHASE 10: PHOTO REPOSITORY
**Database**: ✅ venue_photos table created with 13 photo types
**UI Status**: ❌ MISSING

**Component**: `PhotosTab.tsx` - REBUILD

**Support**:
- Hotel Photos (HOTEL_EXTERIOR, HOTEL_LOBBY, HOTEL_GUEST_ROOM, HOTEL_RESTAURANT, HOTEL_AMENITY)
- Hall Photos (HALL_EMPTY, HALL_THEATRE, HALL_CLASSROOM, HALL_CLUSTER, HALL_U_SHAPE, HALL_BOARDROOM, HALL_SETUP)
- Other (OTHER)

**Features**:
- Upload multiple photos
- Set primary photo (for thumbnail)
- Display order
- Photo type classification
- Caption support

---

### PHASE 11: MULTI-SHEET IMPORT TEMPLATE
**Database**: ✅ Tables ready
**Template Current State**: ❌ UNACCEPTABLE - Flat template needs rebuild

**Rebuild Requirements**:

**Sheet 1: Hotel Master**
- Hotel Name, City, Brand, Category, Address, GST, Website, Latitude, Longitude
- Sales Contact Name, Designation, Mobile, Email
- Status, Preferred Vendor, Blacklisted, Remarks

**Sheet 2: Hall Master**
- Hotel Name, City, Hall Name, Floor, Area, Indoor/Outdoor, Status
- Theatre Cap, Classroom Cap, U-Shape Cap, Cluster Cap, Boardroom Cap, Round Table Cap

**Sheet 3: Occupancy Matrix**
- Hotel Name, City, Designation, Occupancy Type

**Sheet 4: Accommodation Inventory**
- Hotel Name, City, Total Rooms, Single, Double, Triple, Quad, Suite

**Sheet 5: Photo Mapping**
- Hotel Name, City, Photo Type, Photo URL, Display Order, Caption

**Sheet 6: Instructions**
- Comprehensive guidelines
- Column descriptions
- Validation rules
- Examples

---

### PHASE 12: IMPORT VALIDATION
**Current State**: ⚠️ PARTIAL - Basic validation exists

**Validation Rules Required**:

**Pre-Import Checks**:
- Zone exists (before City)
- City exists (before Hotel)
- Hotel exists (before Hall, Occupancy, Inventory)
- Hall exists (before Photo Mapping)

**Field-Level Validation**:
- Hotel Name: Required, unique with City
- City: Required, must exist
- Zone: Derived from City, validated
- Hall Name: Required, unique within Hotel
- Hall Type: Must be valid type
- Capacity values: Non-negative integers
- Email/Phone: Format validation
- URL: Valid HTTPS format

**Error Reporting**:
- Show blocking errors (red)
- Show non-blocking warnings (yellow)
- Provide exact row numbers
- Show exact error messages
- Allow preview before commit

---

## 🎯 IMPLEMENTATION ORDER

1. ✅ Database: Already complete (from audit)
2. → **Phase 1**: VenueDataCenter component (central hub)
3. → **Phase 2**: Zone Master tab + CRUD operations
4. → **Phase 3**: City Master tab enhancements
5. → **Phase 4**: Hotel Master form rebuild
6. → **Phase 5**: Accommodation Inventory tab verification
7. → **Phase 6**: Occupancy Matrix tab verification
8. → **Phase 7**: Hall Master rebuild with 6 capacities
9. → **Phase 8**: Suitability fields display
10. → **Phase 9**: Historical Intelligence display
11. → **Phase 10**: Photos tab rebuild
12. → **Phase 11**: Multi-sheet template rebuild
13. → **Phase 12**: Validation dashboard implementation

---

## 📦 DELIVERABLES FOR STEP 6

✅ **Database**:
- Zone Master table
- Enhanced City Master (zone_id)
- Enhanced Hotel Master (20+ fields)
- Accommodation Inventory table
- Occupancy Rules tables
- Enhanced Halls (6 capacities)
- Venue Photos table
- All relationships, constraints, indexes
- RLS policies
- Helper functions

❌ **UI Components** (TODO):
- [ ] VenueDataCenter.tsx (central 5-tab hub)
- [ ] ZoneMasterTab.tsx (CRUD)
- [ ] CityMasterTab.tsx (with zone linking)
- [ ] Enhanced HotelFormModal.tsx
- [ ] HotelDetailsTab.tsx (suitability + intelligence)
- [ ] Rebuilt HallsTab.tsx (6 capacities)
- [ ] Rebuilt PhotosTab.tsx (multi-type upload)
- [ ] Enhanced AccommodationInventoryTab.tsx
- [ ] Enhanced OccupancyMatrixTab.tsx
- [ ] ValidationDashboard.tsx (error reporting)

❌ **Services** (TODO):
- [ ] Enhanced templateService.ts (multi-sheet)
- [ ] Enhanced validationService.ts (full rules)
- [ ] zoneService.ts (CRUD)
- [ ] cityService.ts (with zone linking)
- [ ] photoService.ts (upload, display)

❌ **Routes** (TODO):
- [ ] /administration/masters/venues/data-center
- [ ] /administration/masters/zones
- [ ] /administration/masters/cities

❌ **Template** (TODO):
- [ ] Rebuild workbook (6 sheets, proper structure)

---

## ⚠️ CRITICAL ISSUES TO ADDRESS

1. **Single Hall Capacity**: Current model uses single `capacity` field
   - Must support 6 independent capacities
   - Theatre, Classroom, U-Shape, Cluster, Boardroom, Round Table

2. **Hotel Form Complexity**: Current form insufficient
   - Must support 20+ fields organized into sections
   - Form modal may need to become full page

3. **Photo Support**: Currently placeholder only
   - Need full upload/display capability
   - 13 photo types to support

4. **Template**: Current template is flat
   - Needs rebuild as proper 6-sheet workbook
   - Each sheet with specific structure

5. **Navigation**: VenueBulkImport needs to become VenueDataCenter
   - Replace simple import with 5-tab hub

---

## 🔄 PROGRESS TRACKING

| Phase | Component | Database | UI | Status |
|-------|-----------|----------|----|---------| 
| 1 | Venue Data Center | ✅ | ❌ | STARTING |
| 2 | Zone Master | ✅ | ❌ | STARTING |
| 3 | City Master | ✅ | ❌ | STARTING |
| 4 | Hotel Master | ✅ | ⚠️ | NEEDS REBUILD |
| 5 | Accommodation | ✅ | ⚠️ | VERIFY |
| 6 | Occupancy | ✅ | ⚠️ | VERIFY |
| 7 | Hall Master | ✅ | ⚠️ | NEEDS REBUILD |
| 8 | Suitability | ✅ | ❌ | STARTING |
| 9 | Intelligence | ✅ | ❌ | STARTING |
| 10 | Photos | ✅ | ❌ | STARTING |
| 11 | Template | ⚠️ | ❌ | NEEDS REBUILD |
| 12 | Validation | ⚠️ | ❌ | NEEDS REBUILD |

---

## 🚫 DO NOT PROCEED TO STEP 7 UNTIL:

- [ ] VenueDataCenter fully functional (central 5-tab hub visible and working)
- [ ] Zone Master CRUD complete (list, add, edit, toggle, delete protection)
- [ ] City Master zone-linking complete (every city must have zone)
- [ ] Hotel Master form complete (all 20+ fields, organized sections)
- [ ] Accommodation Inventory editable (user can add/update room counts)
- [ ] Occupancy Matrix complete (SO→Triple, DM→Double, etc. mappings)
- [ ] Hall Master complete (6 seating capacities independent)
- [ ] Suitability fields display (read-only, calculated)
- [ ] Historical Intelligence display (read-only, system-maintained)
- [ ] Photos tab functional (upload, display, primary selection)
- [ ] Multi-sheet template rebuilt (6 sheets with proper structure)
- [ ] Import validation dashboard working (preview errors before commit)
- [ ] All UI visible and functional in browser
- [ ] No placeholders remaining

---

**Current Status**: Planning complete, ready to implement Phase 1

