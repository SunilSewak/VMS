# PHASE 7B - UAT TEST CASES & VERIFICATION

**Purpose:** Validate Phase 7B completion before marking complete  
**Duration:** ~30 minutes total testing  
**Environment:** Staging (then Production)

---

## TEST SETUP

### Prerequisites
- [ ] Access to staging environment
- [ ] Logged in as Super Admin or Admin
- [ ] Browser dev tools open (F12) for console checking

### Test Data
- [ ] Assume at least 1 hotel exists in system
- [ ] Assume at least 1 meeting request with shortlists exists

---

## TEST SUITE 1: MY SHORTLISTS FIX

### Test 1.1: My Shortlists Page Loads
**Route:** `/my-shortlists`  
**Steps:**
1. Navigate to Venues menu > My Shortlists
2. Page should load (no blank/error screen)
3. Check browser console (F12 > Console tab)

**Expected Results:**
- ✅ Page loads within 2 seconds
- ✅ No console errors (red X icons)
- ✅ No "Failed to load shortlists" error message
- ✅ Either shows: "No Recommendations Yet" OR shortlist cards

**Actual Result:** __________ PASS / FAIL

**Screenshots:** [ ] Page loaded [ ] Console checked [ ] No errors

---

### Test 1.2: Empty State (If No Shortlists)
**Precondition:** User has no shortlisted venues

**Expected:**
- ✅ Heading: "Recommended Venues"
- ✅ Icon: Bookmark (gray)
- ✅ Message: "No Recommendations Yet"
- ✅ Button: "Start Exploring Venues" (clickable)
- ✅ Description text visible

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Empty state captured

---

### Test 1.3: Populated State (If Shortlists Exist)
**Precondition:** User has shortlisted venues

**Expected Per Shortlist Card:**
- ✅ Hotel photo displays (or placeholder)
- ✅ Hotel name visible
- ✅ City visible
- ✅ Category badge (e.g., "5 STAR")
- ✅ Shortlist date visible
- ✅ "View venue" button clickable
- ✅ "Remove recommendation" button clickable
- ✅ Card shows as responsive (no text overflow)

**Actual Result:** __________ PASS / FAIL

**Shortlist Count:** _______ cards displayed

**Screenshots:** [ ] Shortlist cards [ ] Full page

---

### Test 1.4: View Venue Button
**Steps:**
1. Click "View venue" on any shortlist card
2. Should navigate to `/venue-explorer/{hotelId}`

**Expected:**
- ✅ Navigates to venue details page
- ✅ Hotel details visible
- ✅ Halls/photos section visible
- ✅ Back button or breadcrumb works

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Venue details page

---

### Test 1.5: Remove Recommendation Button
**Steps:**
1. Click "Remove recommendation" on any card
2. Confirm dialog appears
3. Click confirm

**Expected:**
- ✅ Confirmation dialog shows
- ✅ Card disappears from list after confirmation
- ✅ Count updates
- ✅ Message: "Recommendation removed"

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Confirmation dialog [ ] After removal

---

### Test 1.6: Explore Venues Navigation
**Steps:**
1. Click "Explore Venues" button (if empty state)
2. Should navigate to `/venue-explorer`

**Expected:**
- ✅ Venue explorer loads
- ✅ Hotel list visible
- ✅ Search/filter working

**Actual Result:** __________ PASS / FAIL

---

## TEST SUITE 2: HOTEL MANAGEMENT

### Test 2.1: Navigation to Hotel Partners
**Steps:**
1. Click Venues menu
2. Click "Hotel Partners"

**Expected:**
- ✅ Navigates to `/administration/masters/venues`
- ✅ Page title: "Venue Repository"
- ✅ Hotel list visible

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Hotel list page

---

### Test 2.2: Hotel List Displays Correctly
**Expected:**
- ✅ Hotel cards visible (grid layout)
- ✅ Hotel name visible
- ✅ City visible
- ✅ Status badge visible
- ✅ Contact info visible
- ✅ Last used date visible

**Actual Result:** __________ PASS / FAIL

**Hotel Count:** _______ hotels displayed

**Screenshot:** [ ] Hotel list

---

### Test 2.3: Search Hotels
**Steps:**
1. Type hotel name in search box
2. Results should filter

**Expected:**
- ✅ Search works (hotels filtered)
- ✅ Typing is responsive
- ✅ Clear search works

**Test Data:**
- Search for: ________________
- Expected results: _______ hotels

**Actual Result:** __________ PASS / FAIL

---

### Test 2.4: Filter by Status
**Steps:**
1. Select status from dropdown (e.g., "Active")
2. List filters

**Expected:**
- ✅ Only hotels with selected status show
- ✅ "All Status" option works

**Actual Result:** __________ PASS / FAIL

---

### Test 2.5: Create Hotel
**Steps:**
1. Click "Create Hotel" button
2. Form modal opens
3. Fill required fields:
   - Hotel Name: ________________
   - Brand: ________________
   - Category: ________________
   - Zone/City: ________________
   - Contact: ________________
4. Click "Create Hotel"

**Expected:**
- ✅ Form modal opens
- ✅ All fields render
- ✅ Form validates (required fields)
- ✅ Hotel created successfully
- ✅ Modal closes
- ✅ New hotel appears in list

**Actual Result:** __________ PASS / FAIL

**New Hotel ID:** _____________________

**Screenshots:** [ ] Form modal [ ] New hotel in list

---

### Test 2.6: Edit Hotel
**Steps:**
1. Click "Edit" on any hotel card
2. Form modal opens with data pre-filled
3. Change one field: ________________
4. Click "Update Hotel"

**Expected:**
- ✅ Form shows existing data
- ✅ Changes saved
- ✅ Hotel card updated in list

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Edit form [ ] Updated card

---

### Test 2.7: View Hotel Details
**Steps:**
1. Click "View Details" on any hotel card
2. HotelDetailsWorkspace opens

**Expected:**
- ✅ Page loads to `/administration/masters/venues/{id}`
- ✅ Hotel details visible
- ✅ Tabs visible:
  - [ ] Overview
  - [ ] Halls
  - [ ] Photos
  - [ ] Accommodation
  - [ ] Occupancy Matrix

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Hotel details workspace

---

## TEST SUITE 3: HALL MANAGEMENT

### Test 3.1: View Halls Tab
**Steps:**
1. Open hotel details (Test 2.7)
2. Click "Halls" tab

**Expected:**
- ✅ Tab loads
- ✅ Existing halls listed
- ✅ "Add Hall" button visible

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Halls tab

---

### Test 3.2: Create Hall
**Steps:**
1. Click "Add Hall"
2. Form modal opens
3. Fill fields:
   - Hall Name: ________________
   - Floor: ________________
   - Type: ________________
   - Capacities: ________________
4. Click "Create Hall"

**Expected:**
- ✅ Form modal opens
- ✅ Form validates (at least 1 capacity required)
- ✅ Hall created
- ✅ Hall appears in list

**Actual Result:** __________ PASS / FAIL

**New Hall ID:** _____________________

**Screenshot:** [ ] Hall created

---

### Test 3.3: Edit Hall
**Steps:**
1. Click edit icon on any hall
2. Update field: ________________
3. Save

**Expected:**
- ✅ Form opens
- ✅ Data pre-filled
- ✅ Changes saved

**Actual Result:** __________ PASS / FAIL

---

### Test 3.4: Delete Hall
**Steps:**
1. Click delete icon on any hall
2. Confirm dialog

**Expected:**
- ✅ Confirmation appears
- ✅ Hall deleted from list after confirm

**Actual Result:** __________ PASS / FAIL

---

## TEST SUITE 4: PHOTO MANAGEMENT

### Test 4.1: View Photos Tab
**Steps:**
1. Open hotel details
2. Click "Photos" tab

**Expected:**
- ✅ Tab loads
- ✅ Photo gallery visible
- ✅ Upload section visible

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Photos tab

---

### Test 4.2: Upload Photo
**Steps:**
1. Click "Select Image" button
2. Choose image file (JPG, PNG, WEBP - max 10MB)
3. Optional: Add caption
4. Click "Upload Photo"

**Expected:**
- ✅ File input works
- ✅ File shows as selected
- ✅ Upload progresses
- ✅ Photo appears in gallery
- ✅ Success message shows

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Upload form [ ] Photo in gallery

---

### Test 4.3: Delete Photo
**Steps:**
1. Click trash icon on any photo
2. Confirm dialog

**Expected:**
- ✅ Confirmation appears
- ✅ Photo deleted from gallery

**Actual Result:** __________ PASS / FAIL

---

## TEST SUITE 5: NAVIGATION & ROUTING

### Test 5.1: Venues Menu Structure
**Expected Menu Items:**
- [ ] Venue Explorer (clickable)
- [ ] My Shortlists (clickable)
- [ ] Hotel Partners (clickable)

**Removed (Should NOT appear):**
- [ ] ❌ Venue Directory
- [ ] ❌ Hotels (duplicate)
- [ ] ❌ Halls (broken)
- [ ] ❌ Photos (broken)

**Actual Result:** __________ PASS / FAIL

**Screenshot:** [ ] Menu structure

---

### Test 5.2: Route Navigation
**Test Each Route:**

| Route | Expected Page | Status |
|-------|---|---|
| `/venue-explorer` | Venue search page | [ ] |
| `/my-shortlists` | Recommendations | [ ] |
| `/administration/masters/venues` | Hotel list | [ ] |
| `/administration/masters/venues/:id` | Hotel details | [ ] |

**Actual Result:** __________ PASS / FAIL

---

## TEST SUITE 6: ERROR HANDLING

### Test 6.1: Network Error (My Shortlists)
**Steps:**
1. Turn off network (DevTools > Network > Offline)
2. Navigate to `/my-shortlists`
3. Turn network back on

**Expected:**
- ✅ Error message displays (not blank page)
- ✅ User can retry

**Actual Result:** __________ PASS / FAIL

---

### Test 6.2: Invalid Form Input
**Steps:**
1. Try to create hotel without required fields
2. Try to create hall without capacity

**Expected:**
- ✅ Form shows validation errors
- ✅ Submit button disabled (if applicable)

**Actual Result:** __________ PASS / FAIL

---

### Test 6.3: Console Errors
**Throughout all tests:**
1. Monitor browser console (F12)
2. Check for red errors

**Expected:**
- ✅ No console errors (except expected CORS warnings)
- ✅ No 404s or 500s

**Actual Result:** __________ PASS / FAIL

**Errors Found:** 
```
(List any errors here)
```

---

## CROSS-BROWSER TESTING

### Browser Compatibility
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | [ ] PASS |
| Firefox | Latest | [ ] PASS |
| Safari | Latest | [ ] PASS |
| Edge | Latest | [ ] PASS |

---

## RESPONSIVE DESIGN

### Mobile Testing (360px width)
- [ ] My Shortlists responsive
- [ ] Hotel list responsive
- [ ] Forms mobile-friendly
- [ ] Buttons touchable (48px min)

**Actual Result:** __________ PASS / FAIL

### Tablet Testing (768px width)
- [ ] Layout adapts
- [ ] All features accessible

**Actual Result:** __________ PASS / FAIL

---

## PERFORMANCE

### Load Times
- My Shortlists: _______ seconds (target: <2s)
- Hotel List: _______ seconds (target: <2s)
- Hotel Details: _______ seconds (target: <3s)

**Actual Result:** __________ PASS / FAIL

---

## SIGN-OFF

### QA Tester
- **Name:** _____________________
- **Date:** _____________________
- **Overall Result:** ☐ PASS ☐ FAIL

### Issues Found
```
(List any issues/failures here)
```

### Recommendations
```
(List any recommendations for improvement)
```

### Approval
- [ ] QA: APPROVED FOR PRODUCTION
- [ ] Super Admin: APPROVED FOR PRODUCTION
- [ ] Product Owner: APPROVED FOR PRODUCTION

---

## PRODUCTION DEPLOYMENT CHECKLIST

After UAT passes:

- [ ] Code merged to main
- [ ] Deployed to production
- [ ] Monitoring enabled (Sentry, etc.)
- [ ] User notifications sent
- [ ] 24-hour monitoring active

---

**Phase 7B UAT Complete:** ☐ YES ☐ NO

**Phase 7B Status:** ☐ READY ☐ BLOCKED

