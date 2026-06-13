# PHASE 7B.1 – VENUE ADMINISTRATION & UX STABILIZATION
## Comprehensive UAT Test Plan & Validation Checklist

**Date:** June 13, 2026  
**Scope:** 7 Priorities for Full Admin UX Validation  
**Status:** ✅ Fixes Applied, Ready for Testing  
**Expected Completion:** ~2 hours testing

---

## PRIORITY 1 ✅ HOTEL PARTNERS DATA SOURCE
**Status:** FIX APPLIED  
**Fix:** Added city relationship to getHotels() query

### Tests

#### Test 1.1: Page Load
```
ACTION: Navigate to Administration → Masters → Venues
EXPECTED:
  ✅ Page loads within 3 seconds
  ✅ No error messages
  ✅ Hotel list displays
  ✅ Shows "Showing X of Y hotels" message
  ✅ No console errors
```

#### Test 1.2: Hotel Display
```
ACTION: Observe hotel list
EXPECTED:
  ✅ See 3+ hotel cards
  ✅ Each card shows:
     - Hotel name (not blank)
     - City name (Mumbai, Pune, etc. - NOT "N/A")
     - Status badge (green for ACTIVE, red for INACTIVE)
     - Contact email
     - Contact phone
     - Total Ajanta events count
     - Last used date
  ✅ Hotel names match database
  ✅ Cities correctly assigned
```

#### Test 1.3: Data Consistency
```
ACTION: Compare Hotel Partners with Venue Explorer
EXPECTED:
  ✅ Hotels appearing in both pages are same
  ✅ Hotel Partners shows ALL hotels (including inactive)
  ✅ Venue Explorer shows ACTIVE hotels only
  ✅ Same hotels appear in both when filtered for ACTIVE
```

#### Test 1.4: Search Functionality
```
ACTION: Type hotel name in search box (e.g., "ITC")
EXPECTED:
  ✅ List filters instantly
  ✅ Shows only matching hotels
  ✅ City field still visible

ACTION: Type city name in search box (e.g., "Mumbai")
EXPECTED:
  ✅ List filters by city
  ✅ Shows hotels in that city
```

#### Test 1.5: Status Filter
```
ACTION: Select "ACTIVE" from status filter
EXPECTED:
  ✅ Shows only active hotels
  ✅ Count updates

ACTION: Select "INACTIVE" from status filter
EXPECTED:
  ✅ Shows only inactive hotels
  ✅ Count updates

ACTION: Select "All Status"
EXPECTED:
  ✅ Shows all hotels
```

**Sign-off:** _____  
**Date:** _____

---

## PRIORITY 2 REGISTER HOTEL WORKFLOW
**Status:** Manual Verification Required

### Tests

#### Test 2.1: Create Hotel Button
```
ACTION: Click "Create Hotel" button in Hotel Partners
EXPECTED:
  ✅ HotelFormModal opens
  ✅ Form title shows "Create New Hotel"
  ✅ All form fields visible and empty
  ✅ Submit button says "Create"
```

#### Test 2.2: Fill Hotel Form
```
ACTION: Fill in required fields:
  - Hotel Name: "Test Hotel XYZ"
  - City: [Select from dropdown]
  - Address: "123 Test Street"
  - Status: "ACTIVE"
  - Hotel Category: [Select one]

EXPECTED:
  ✅ All fields accept input
  ✅ Dropdowns work
  ✅ No validation errors during input
```

#### Test 2.3: Submit Form
```
ACTION: Click "Create" button
EXPECTED:
  ✅ Modal closes
  ✅ New hotel appears in list
  ✅ Hotel name visible
  ✅ City name visible
  ✅ Status shows as entered
```

#### Test 2.4: Data Persistence
```
ACTION: Refresh page (F5)
EXPECTED:
  ✅ New hotel still in list
  ✅ Data persisted to database
  ✅ All fields saved correctly
```

**Sign-off:** _____  
**Date:** _____

---

## PRIORITY 3 HOTEL DETAILS WORKSPACE
**Status:** Manual Verification Required

### Tests

#### Test 3.1: Navigate to Details
```
ACTION: Click "View Details" button on any hotel
EXPECTED:
  ✅ HotelDetailsWorkspace page opens
  ✅ Hotel name shows in header
  ✅ All tabs visible: Overview, Halls, Photos, Accommodation, Occupancy Matrix
  ✅ Overview tab active by default
```

#### Test 3.2: Overview Tab
```
ACTION: View Overview tab content
EXPECTED:
  ✅ Hotel details displayed:
     - Name
     - City
     - Address
     - Category
     - Status
     - Contact info
  ✅ All fields visible
  ✅ Data matches what was shown in list
```

#### Test 3.3: Tabs Load Without Error
```
ACTION: Click each tab:
  - Halls
  - Photos
  - Accommodation
  - Occupancy Matrix

EXPECTED FOR EACH:
  ✅ Tab content loads
  ✅ No console errors
  ✅ No API errors
  ✅ Content renders properly
```

#### Test 3.4: Back Navigation
```
ACTION: Click back or navigate to Hotel Partners
EXPECTED:
  ✅ Returns to hotel list
  ✅ Hotel list still intact
  ✅ No data lost
```

**Sign-off:** _____  
**Date:** _____

---

## PRIORITY 4 HALL MANAGEMENT VALIDATION
**Status:** Manual Verification Required

### Tests

#### Test 4.1: View Halls Tab
```
ACTION: Open hotel details and click "Halls" tab
EXPECTED:
  ✅ Tab opens
  ✅ Shows list of halls (if any exist)
  ✅ Each hall shows:
     - Hall name
     - Floor
     - Capacities (classroom, theatre, u-shape, cluster)
     - Indoor/Outdoor status
  ✅ "Add Hall" button visible
```

#### Test 4.2: Create Hall
```
ACTION: Click "Add Hall" button
EXPECTED:
  ✅ HallFormModal opens
  ✅ Form fields:
     - Hall name (text input)
     - Floor (text input)
     - Area (number)
     - Indoor/Outdoor (select)
     - Capacities (classroom, theatre, u-shape, cluster, boardroom)
     - Status (select)

ACTION: Fill in sample data:
  - Hall name: "Grand Ballroom"
  - Floor: "1"
  - Classroom capacity: 200
  - Theatre capacity: 300

ACTION: Click "Create"
EXPECTED:
  ✅ Modal closes
  ✅ New hall appears in list
  ✅ Data shows correctly
```

#### Test 4.3: Edit Hall
```
ACTION: Click "Edit" on any hall
EXPECTED:
  ✅ HallFormModal opens
  ✅ Form pre-filled with current data
  ✅ Change a field (e.g., capacity)
  ✅ Click "Save"
  ✅ Modal closes
  ✅ Change reflected in list
```

#### Test 4.4: Delete Hall
```
ACTION: Click "Delete" on any hall
EXPECTED:
  ✅ Confirmation dialog appears
  ✅ Click "Confirm"
  ✅ Hall removed from list
  ✅ Hall no longer visible
```

**Sign-off:** _____  
**Date:** _____

---

## PRIORITY 5 PHOTO MANAGEMENT VALIDATION
**Status:** Manual Verification Required

### Tests

#### Test 5.1: View Photos Tab
```
ACTION: Open hotel details and click "Photos" tab
EXPECTED:
  ✅ Tab opens
  ✅ Shows photo gallery (if any photos exist)
  ✅ "Upload Photo" button visible
  ✅ Each photo shows:
     - Image thumbnail
     - Caption (if set)
     - Photo type
     - Display order
```

#### Test 5.2: Upload Photo
```
ACTION: Click "Upload Photo"
EXPECTED:
  ✅ File upload dialog appears
  
ACTION: Select a test image file
EXPECTED:
  ✅ File selected
  ✅ File input shows filename

ACTION: Fill in caption (optional): "Hotel Lobby"
ACTION: Click "Upload"
EXPECTED:
  ✅ Upload completes
  ✅ Photo appears in gallery
  ✅ Thumbnail visible
  ✅ Caption shows below
```

#### Test 5.3: View Photo Details
```
ACTION: Click on uploaded photo
EXPECTED:
  ✅ Full-size photo displays
  ✅ Caption visible
  ✅ Photo metadata visible
```

#### Test 5.4: Delete Photo
```
ACTION: Click "Delete" button on any photo
EXPECTED:
  ✅ Confirmation dialog
  ✅ Click "Confirm"
  ✅ Photo removed from gallery
  ✅ File removed from storage
```

#### Test 5.5: Storage Bucket Integration
```
ACTION: Verify uploaded photos in browser
EXPECTED:
  ✅ Photos display without broken image icons
  ✅ Load time < 2 seconds
  ✅ Images clear and visible
  ✅ Verify via browser DevTools → Network tab
```

**Sign-off:** _____  
**Date:** _____

---

## PRIORITY 6 ADMIN MENU CLEANUP
**Status:** Review Required

### Current Navigation Structure
```
Administration
├─ Demo Tools
├─ Users
├─ Venue Import
├─ Masters [DISABLED]
└─ Settings [DISABLED]
```

### Tests

#### Test 6.1: Check Menu State
```
ACTION: Navigate to Administration menu
EXPECTED:
  ✅ See menu items as listed above
  ✅ "Masters" appears disabled (grayed out)
  ✅ "Settings" appears disabled

QUESTION: Should "Masters" be enabled for venue administration?
```

#### Test 6.2: Masters Menu Item
```
IF "Masters" should be enabled:
  ACTION: Enable in navigationGroups.ts
  
VERIFY:
  ✅ Click "Masters" → Opens submenu with venue options
  ✅ Sub-items visible:
     - Venue Explorer
     - Hotel Partners
     - [Other masters]
```

#### Test 6.3: Settings Menu
```
IF "Settings" should be enabled:
  ACTION: Enable in navigationGroups.ts

VERIFY:
  ✅ Click "Settings" → Opens settings page
  ✅ Can configure settings
```

#### Test 6.4: Menu Navigation
```
ACTION: Test menu navigation
EXPECTED:
  ✅ Click "Demo Tools" → Works
  ✅ Click "Users" → Works
  ✅ Click "Venue Import" → Works
  ✅ All navigations work correctly
```

**Sign-off:** _____  
**Date:** _____

---

## PRIORITY 7 DATA CONSISTENCY AUDIT
**Status:** Verification Required

### Tests

#### Test 7.1: Hotel Count Verification
```
ACTION: Open Venue Explorer
EXPECTED:
  ✅ Note hotel count displayed
  
ACTION: Open Hotel Partners
EXPECTED:
  ✅ Hotel count should be >= Venue Explorer count
  ✅ (because Hotel Partners shows all hotels including INACTIVE)
```

#### Test 7.2: Hotel Name Consistency
```
ACTION: List all visible hotels in Venue Explorer
  - Write down: Hotel1, Hotel2, Hotel3, ...

ACTION: Open Hotel Partners
EXPECTED:
  ✅ Same hotels appear in Hotel Partners
  ✅ Order may differ (alphabetical vs filtered)
  ✅ All names match exactly
```

#### Test 7.3: City Assignment Consistency
```
ACTION: Check a hotel in Venue Explorer
  - Note: Name, City, Category

ACTION: Find same hotel in Hotel Partners
EXPECTED:
  ✅ Same city assigned
  ✅ Same category
  ✅ Same contact info
  ✅ No discrepancies
```

#### Test 7.4: Status Filtering Consistency
```
ACTION: In Venue Explorer, note visible hotels (all are ACTIVE)

ACTION: In Hotel Partners, set status filter to "ACTIVE"
EXPECTED:
  ✅ Same hotels appear
  ✅ No additional hotels
```

#### Test 7.5: Database Verification
```
ACTION: Run SQL query in Supabase:

SELECT COUNT(*) as total_hotels FROM hotels;
SELECT COUNT(*) as active_hotels FROM hotels WHERE status = 'ACTIVE';
SELECT hotel_name, city_id, status FROM hotels ORDER BY hotel_name;

VERIFY:
  ✅ Count matches what appears in Hotel Partners (total)
  ✅ Count matches what appears in Venue Explorer (active)
  ✅ City assignments correct
  ✅ Status values correct
```

**Sign-off:** _____  
**Date:** _____

---

## FINAL VALIDATION

### System State Verification

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Hotel Partners displays hotels | ✅ / ❌ | Screenshot |
| Register Hotel works | ✅ / ❌ | New hotel appears |
| Hotel Details workspace loads | ✅ / ❌ | All tabs work |
| Halls CRUD works | ✅ / ❌ | Can create/edit/delete |
| Photos CRUD works | ✅ / ❌ | Can upload/view/delete |
| Hotel counts consistent | ✅ / ❌ | Database matches UI |
| No runtime errors | ✅ / ❌ | Console clean |
| No placeholder behavior | ✅ / ❌ | All data loads real |

### Console Error Check
```
Open DevTools Console for each page:
  ✅ Hotel Partners - No red errors
  ✅ Hotel Details - No red errors
  ✅ Halls Tab - No red errors
  ✅ Photos Tab - No red errors
  ✅ Admin Home - No red errors
```

### Network Requests Check
```
DevTools → Network tab:
  ✅ All API requests return 200 OK
  ✅ No failed requests
  ✅ No timeouts
  ✅ Response times < 2 seconds
```

---

## UAT Sign-Off

### QA Tester Verification
```
Name: ___________________
Date: ___________________
All tests passed: ✅ / ❌

Comments:
_______________________________________
_______________________________________
```

### Development Sign-Off
```
Name: ___________________
Date: ___________________
Fixes reviewed: ✅ / ❌
Ready for production: ✅ / ❌

Notes:
_______________________________________
_______________________________________
```

### Super Admin Approval
```
Name: ___________________
Date: ___________________
Phase 7B.1 approved: ✅ / ❌
Ready to deploy: ✅ / ❌

Comments:
_______________________________________
_______________________________________
```

---

## Success Criteria Summary

### MUST HAVE ✅
- [ ] Hotel Partners loads and displays hotels
- [ ] Create hotel workflow works end-to-end
- [ ] Hotel details workspace functions
- [ ] Hall CRUD operations work
- [ ] Photo upload/delete works
- [ ] No runtime errors or console errors
- [ ] Data consistent across modules

### NICE TO HAVE
- [ ] All admin menu items accessible
- [ ] Smooth user experience
- [ ] Fast page load times
- [ ] Intuitive navigation

---

## Issues Found During Testing

### If tests fail:

**Issue Template:**
```
ID: [Priority #, Test #]
Description: [What failed]
Steps to reproduce: [1. 2. 3.]
Expected: [What should happen]
Actual: [What actually happened]
Screenshots: [Attach]
Console errors: [Copy/paste]
Severity: 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW
```

---

## Timeline

- **Phase 7B.1 Start:** Session begins
- **Fixes Applied:** All 1 critical fix deployed
- **Testing Window:** ~2 hours
- **Sign-off:** Today
- **Deployment:** Ready

---

**Prepared by:** Kiro Development  
**Date:** June 13, 2026  
**Scope:** Complete Phase 7B.1 UAT  
**Expected Result:** Venue Administration Layer Complete

