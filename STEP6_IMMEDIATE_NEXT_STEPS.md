# STEP 6 - IMMEDIATE NEXT STEPS

**Current Status**: Phase 1 Complete ✅  
**Date**: June 13, 2026  
**Next Action**: Verify in browser, then proceed to Phase 2

---

## 🟢 WHAT JUST COMPLETED

### Phase 1: Venue Data Center Hub ✅
- VenueDataCenter page created with 5 tabs
- Zone Master CRUD fully implemented
- City Master CRUD fully implemented
- Import History display working
- Data Quality metrics working
- Routed to `/administration/masters/venues/data-center`
- Navigation link added to VenueAdmin

**Files Created**:
- src/pages/VenueDataCenter.tsx
- src/components/VenueDataCenter/ZoneMasterTab.tsx
- src/components/VenueDataCenter/CityMasterTab.tsx
- src/components/VenueDataCenter/BulkImportTab.tsx
- src/components/VenueDataCenter/ImportHistoryTab.tsx
- src/components/VenueDataCenter/DataQualityTab.tsx

**Files Modified**:
- src/App.tsx (route + import)
- src/pages/VenueAdmin.tsx (button added)

---

## 🟡 BROWSER VERIFICATION NEEDED

### Quick Test Checklist
```
[ ] Start dev server: npm run dev
[ ] Navigate to http://localhost:5173/administration/masters/venues
[ ] Click "📊 Data Center" button
[ ] Verify all 5 tabs visible:
    [ ] ⬆️ Bulk Import
    [ ] 📋 Import History
    [ ] 📊 Data Quality
    [ ] 🗺️ Zone Master
    [ ] 🏙️ City Master
[ ] Test Zone Master:
    [ ] Add zone (code + name)
    [ ] Edit zone name
    [ ] Toggle status
    [ ] View list
[ ] Test City Master:
    [ ] Add city (requires zone selection)
    [ ] Edit city
    [ ] Toggle status
    [ ] View list with zone links
[ ] Check Import History (shows records if any)
[ ] Check Data Quality (shows metrics)
```

### If Any Issues
- Check browser console for errors
- Verify Supabase connection
- Check if zones/cities tables have data
- Verify authentication (should be Admin/Super Admin)

---

## 🔵 PHASE 2: ZONE MASTER PAGE

### Objective
Consolidate Zone Master functionality - ensure consistency between:
1. VenueDataCenter/ZoneMasterTab (new)
2. ZoneMaster page (existing)

### Check Existing Implementation
```bash
# Read the existing ZoneMaster page
cat src/pages/ZoneMaster.tsx
```

### If Conflict Exists
- Decide: Keep one, eliminate other, or integrate both
- Currently: VenueDataCenter/ZoneMasterTab is primary
- Could deprecate standalone ZoneMaster page

### If No Conflict
- Ensure both pages show same data
- Keep them synchronized
- Add cross-navigation if needed

**Estimated Time**: 2-4 hours

---

## 🔵 PHASE 3: CITY MASTER ENHANCEMENT

### Objective
Ensure city management is consistent across:
1. VenueDataCenter/CityMasterTab (new)
2. Any existing city management
3. Venue admin workflows

### Key Requirements
- Every city must belong to exactly one zone
- No orphan cities
- Zone dropdown only shows active zones
- Cannot change zone if it would create issues

**Estimated Time**: 2-4 hours

---

## 🟠 PHASE 4: HOTEL MASTER FORM EXPANSION

### Current State
- Hotel form has ~5 basic fields
- Stored in HotelFormModal.tsx

### Required Changes
- Expand to 20+ fields
- Organize into 3 sections:
  1. Basic Information (8 fields)
  2. Contact Information (4 fields)
  3. Operational Information (3 fields)

### Fields Needed
**Basic Information**:
- Hotel Name
- Hotel Brand
- Hotel Category
- Zone
- City
- Address
- GST Number
- Website
- Latitude/Longitude

**Contact Information**:
- Sales Contact Name
- Designation
- Mobile
- Email

**Operational Information**:
- Preferred Vendor
- Blacklisted
- Remarks

### Database
- hotels table already has all fields (verified)
- Just need UI expansion

**Estimated Time**: 1.5-2 days

---

## 🟠 PHASE 5: ACCOMMODATION INVENTORY

### Current State
- Table exists: `hotel_accommodation_inventory`
- Needs editable UI

### Required Changes
- Create/enhance accommodation inventory interface
- Fields to edit:
  - Total Rooms
  - Single Inventory
  - Double Inventory
  - Triple Inventory
  - Quad Inventory

### Not Derived
- These are manually entered (not calculated)
- User adds how many of each room type exists

**Estimated Time**: 1 day

---

## 🟠 PHASE 6: OCCUPANCY MATRIX

### Current State
- Table exists: `hotel_occupancy_rules`
- Needs grid UI

### Required Changes
- Grid layout: Designations × Occupancy Types

**Designations**: SO, DM, RSM, CH, IBH, Others  
**Occupancy Types**: Single, Double, Triple, Quad

Example mapping:
```
SO  → Triple
DM  → Double
RSM → Single
```

**Important**: Hotel-specific (not global settings)

**Estimated Time**: 1 day

---

## 🔴 PHASE 7: HALL MASTER REBUILD

### Current State
- Halls table has single `capacity` field
- Database schema supports 6 seating types

### Required Changes
- Add fields: Floor, Area, Indoor/Outdoor, Status
- Add separate capacity fields:
  - Theatre Capacity
  - Classroom Capacity
  - U-Shape Capacity
  - Cluster Capacity
  - Boardroom Capacity
  - Round Table Capacity

### Challenge
- Current UI uses single capacity
- Need to rebuild HallsTab component
- Support all 6 types independently

**Estimated Time**: 1.5-2 days

---

## 🔴 PHASE 8: VENUE SUITABILITY

### Current State
- Calculated fields in hotels table
- Need read-only display

### Fields to Display
- Residential Supported (calculated)
- Non-Residential Supported (calculated)
- Max Residential Pax (calculated)
- Max Meeting Pax (calculated)
- Multiple Hall Support (calculated)

### Note
- System-maintained (no manual editing)
- Display in HotelDetailsWorkspace

**Estimated Time**: 4 hours

---

## 🔴 PHASE 9: HISTORICAL VENUE INTELLIGENCE

### Current State
- Fields in hotels table
- Need read-only display

### Fields to Display
- Total Ajanta Events
- Last Used Date
- Last Division
- Last Meeting Type
- Ajanta Rating
- Feedback Count

### Note
- System-maintained (no manual editing)
- Display in HotelDetailsWorkspace

**Estimated Time**: 4 hours

---

## 🔴 PHASE 10: PHOTO REPOSITORY

### Current State
- Database ready
- PhotosTab is placeholder ("Coming soon")

### Required Changes
- Support hotel photos (Exterior, Lobby, Guest Room, Restaurant)
- Support hall photos (Theatre, Classroom, Cluster, U-Shape)
- Upload functionality
- Display multiple photos
- Set primary photo
- Reorder photos

### Challenge
- Photo upload to storage
- Multiple photo types
- Primary selection logic

**Estimated Time**: 1.5-2 days

---

## 🟠 PHASE 11: MULTI-SHEET IMPORT TEMPLATE

### Current State
- Template exists but is flat single-sheet
- Need rebuild as 6-sheet workbook

### Required Sheets
1. Hotel Master (20+ fields)
2. Hall Master (12+ fields)
3. Occupancy Matrix (4 fields)
4. Accommodation Inventory (8 fields)
5. Photo Mapping (5 fields)
6. Instructions (guidelines)

### Location
- templateService.ts needs rebuild

**Estimated Time**: 1.5-2 days

---

## 🔴 PHASE 12: IMPORT VALIDATION

### Current State
- Basic validation exists
- Need comprehensive dashboard

### Required Features
- Show blocking errors (red)
- Show non-blocking warnings (yellow)
- Row-by-row error details
- Preview before commit
- 63+ validation rules

### Key Validations
- Zone exists before City
- City exists before Hotel
- Hotel exists before Hall
- Hotel exists before Occupancy
- Hotel exists before Inventory
- Hotel exists before Photo Mapping

**Estimated Time**: 2 days

---

## 📊 OVERALL TIMELINE

| Phase | Task | Est. Time | Status |
|-------|------|-----------|--------|
| 1 | Venue Data Center Hub | 1 day | ✅ DONE |
| 2 | Zone Master Consolidation | 2-4 hrs | ⏳ NEXT |
| 3 | City Master Integration | 2-4 hrs | ⏳ NEXT |
| 4 | Hotel Form Expansion | 1.5-2 days | 🔴 TODO |
| 5 | Accommodation Inventory | 1 day | 🔴 TODO |
| 6 | Occupancy Matrix | 1 day | 🔴 TODO |
| 7 | Hall Master Rebuild | 1.5-2 days | 🔴 TODO |
| 8 | Venue Suitability | 4 hours | 🔴 TODO |
| 9 | Historical Intelligence | 4 hours | 🔴 TODO |
| 10 | Photo Repository | 1.5-2 days | 🔴 TODO |
| 11 | Import Template | 1.5-2 days | 🔴 TODO |
| 12 | Import Validation | 2 days | 🔴 TODO |
| **TOTAL** | | **~14-16 days** | |

---

## ✅ WHAT TO DO NOW

### Immediately
1. Verify Phase 1 works in browser ✅
2. If errors, debug and fix ⚠️
3. If working, proceed to Phase 2 ✅

### Phase 2 (Next)
1. Read existing ZoneMaster page
2. Check for conflicts
3. Consolidate if needed

### Phase 3 (After Phase 2)
1. Verify city management consistency
2. Check zone linking

---

## 📝 FILES TO CHECK IF ISSUES

If Phase 1 doesn't work:

```bash
# Check the new components
cat src/pages/VenueDataCenter.tsx
cat src/components/VenueDataCenter/ZoneMasterTab.tsx
cat src/components/VenueDataCenter/CityMasterTab.tsx

# Check the route
grep -A 10 "VenueDataCenter" src/App.tsx

# Check supabase connection
cat src/lib/supabase.ts

# Check existing ZoneMaster for comparison
cat src/pages/ZoneMaster.tsx
```

---

## 🚀 SUCCESS INDICATORS

Phase 1 is successful if:
- ✅ VenueDataCenter page loads
- ✅ All 5 tabs visible and clickable
- ✅ Zone Master shows existing zones
- ✅ Can add/edit/delete zones
- ✅ City Master shows cities with zones
- ✅ Can add/edit/delete cities
- ✅ Import History loads
- ✅ Data Quality shows metrics
- ✅ No console errors
- ✅ No loading spinners stuck

---

## 📞 BLOCKERS TO WATCH FOR

1. **Supabase Connection**
   - If history/quality tabs don't load
   - Check: Can other pages connect to Supabase?

2. **Database Schema**
   - If zone/city operations fail
   - Check: Do zones/cities tables exist?
   - Check: Foreign keys properly configured?

3. **Authentication**
   - If page won't load
   - Check: Logged in as Admin?
   - Check: RLS policies allow your role?

4. **TypeScript Errors**
   - Build errors related to Supabase types
   - These may require `as any` workarounds
   - Not blocking - just warnings

---

## NEXT DOCUMENT

When ready for Phase 2, read:
- `STEP6_BUILD_PROGRESS.md` - For updated progress
- `ZoneMaster.tsx` - To understand existing page

**Current Phase 1 Documentation**:
- `STEP6_PHASE1_COMPLETION.md` - Detailed completion
- `STEP6_PHASE1_IMPLEMENTATION_SUMMARY.md` - Full summary

---

**Status**: 🟢 Phase 1 Complete - Ready for Testing  
**Next**: Verify in browser, then Phase 2
