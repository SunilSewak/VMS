# STEP 6 – PHASE 2 TESTING GUIDE

## Quick Start

### Access the Form

1. **Option A: From VenueAdmin**
   - Go to `/administration/masters/venues` in your browser
   - or click "📊 Venue Repository" in navigation
   - Click **"+ Create Hotel"** button

2. **Option B: From VenueMaster**
   - Go to `/administration/masters/venues/master` (if available)
   - Click **"+ Create Hotel"** button

---

## Test Case 1: Create New Hotel (Full Form)

### Test Data
```
Section A - Basic Information:
- Hotel Name: The Grand Plaza Hotel
- Hotel Brand: Marriott
- Hotel Category: 5 Star
- Zone: West (select from dropdown)
- City: Mumbai (auto-filtered after zone selection)
- Address: Marine Drive, Mumbai 400020
- GST Number: 27ABCDE1234F1Z5
- Website: www.grandplaza.com
- Latitude: 19.0760
- Longitude: 72.8856
- Status: ACTIVE

Section B - Sales Contact:
- Contact Name: Rajesh Kumar
- Designation: Sales Manager
- Mobile Number: 9876543210
- Email: rajesh@grandplaza.com

Section C - Operational Info:
- Preferred Vendor: ✓ (checked)
- Blacklisted: (unchecked)
- Remarks: Premium 5-star property, excellent for corporate events
```

### Expected Results
1. ✅ Form opens correctly with all 3 sections visible
2. ✅ Section A: Blue header with hotel icon
3. ✅ Section B: Green header with contact icon
4. ✅ Section C: Purple header with settings icon
5. ✅ Zone dropdown populated with zones from database
6. ✅ City dropdown shows "Select zone first" initially
7. ✅ When Zone "West" selected → City dropdown enables and shows filtered cities (Mumbai, Pune, Ahmedabad, etc.)
8. ✅ Form submits successfully
9. ✅ Hotel appears in VenueAdmin list
10. ✅ Data persists in database

---

## Test Case 2: Form Validation

### Test: Missing Required Fields

**Steps**:
1. Leave Hotel Name empty
2. Leave Brand empty
3. Click "Create Hotel"

**Expected**:
- ❌ Validation errors appear below each field
- Error messages: "Hotel name is required", "Hotel brand is required", etc.
- Form does NOT submit
- Red border appears on empty required fields

### Test: Invalid Phone Number

**Steps**:
1. Fill all fields correctly
2. Mobile Number: Enter "1234" (only 4 digits)
3. Click "Create Hotel"

**Expected**:
- ❌ Error appears: "Mobile number must be at least 10 digits"
- Form does NOT submit

### Test: Invalid Email

**Steps**:
1. Fill all fields correctly
2. Email: Enter "invalid-email" (no @ symbol)
3. Click "Create Hotel"

**Expected**:
- ❌ Error appears: "Invalid email format"
- Form does NOT submit

### Test: Invalid URL

**Steps**:
1. Fill all fields correctly
2. Website: Enter "not a url" (no dots or protocol)
3. Click "Create Hotel"

**Expected**:
- ❌ Error appears: "Invalid website URL"
- Form does NOT submit

### Test: Invalid Latitude

**Steps**:
1. Fill all fields correctly
2. Latitude: Enter "95" (outside -90 to 90 range)
3. Click "Create Hotel"

**Expected**:
- ❌ Error appears: "Latitude must be between -90 and 90"
- Form does NOT submit

---

## Test Case 3: Zone-City Dependency

### Test: Zone Changes Auto-Filter City

**Steps**:
1. Click Zone dropdown
2. Select "West"
3. Check City dropdown

**Expected**:
- ✅ City dropdown enables
- ✅ Shows only cities from West zone (e.g., Mumbai, Pune, Ahmedabad)
- ✅ Does NOT show cities from other zones (e.g., Delhi, Chennai)

### Test: Zone Change Clears City Selection

**Steps**:
1. Select Zone: "West"
2. Select City: "Mumbai"
3. Change Zone to: "North"
4. Check City field

**Expected**:
- ✅ City field resets to empty
- ✅ City dropdown shows new filtered list (cities from North zone)
- ✅ No orphan city-zone combination possible

### Test: Cannot Select City Before Zone

**Steps**:
1. Leave Zone field empty
2. Try to click City dropdown

**Expected**:
- ✅ City dropdown is DISABLED
- ✅ Placeholder text: "Select zone first"
- ✅ Cannot select city until zone is selected

---

## Test Case 4: Edit Existing Hotel

### Steps**:
1. From VenueAdmin list, click "Edit" on any hotel
2. Form should open with existing data pre-populated

### Expected**:
- ✅ All fields pre-filled with existing values
- ✅ Hotel Name, Brand, Category match current data
- ✅ Zone and City match current location
- ✅ Sales contact information is populated
- ✅ Operational checkboxes reflect saved state
- ✅ Modal header shows "Edit Hotel" instead of "Create Hotel"
- ✅ Submit button shows "Update Hotel" instead of "Create Hotel"

### Edit Test Steps**:
1. Change Hotel Name: "The Grand Plaza Hotel" → "The Grand Plaza Premium"
2. Change Brand: "Marriott" → "ITC"
3. Click "Update Hotel"

### Expected**:
- ✅ Changes saved successfully
- ✅ Hotel list updates with new data
- ✅ Form closes automatically

---

## Test Case 5: Error Clearing

### Steps**:
1. Try to submit form with empty Hotel Name (error appears)
2. Type in Hotel Name field
3. Check error message

**Expected**:
- ✅ Error message disappears as soon as user starts typing
- ✅ Form feels responsive and user-friendly

---

## Test Case 6: Form UI/UX

### Visual Checks**:
- [x] Form appears centered on screen
- [x] Header has modal title and X button to close
- [x] All 3 sections have color-coded headers (Blue, Green, Purple)
- [x] All input fields have proper labels and placeholders
- [x] Required fields marked with red asterisk (*)
- [x] All buttons properly styled (Cancel, Create/Update)
- [x] Loading spinner appears during submission
- [x] Form scrolls if content exceeds viewport height

### Interaction Checks**:
- [x] Clicking X button closes form
- [x] Clicking Cancel button closes form
- [x] Clicking outside modal does NOT close form (typical modal behavior)
- [x] Form preserves entered data until explicitly cleared
- [x] Tab navigation works through all fields

---

## Test Case 7: Optional Fields

### Test: Minimal Form (Only Required Fields)**

**Steps**:
1. Fill ONLY required fields:
   - Hotel Name: "Test Hotel"
   - Brand: "Test Brand"
   - Category: "Business"
   - Zone: "West"
   - City: "Mumbai"
   - Contact Name: "John"
   - Mobile: "9999999999"
   - Status: ACTIVE

2. Leave all optional fields empty:
   - Address: blank
   - GST: blank
   - Website: blank
   - Latitude: blank
   - Longitude: blank
   - Designation: blank
   - Email: blank
   - Remarks: blank
   - Preferred Vendor: unchecked
   - Blacklisted: unchecked

3. Click "Create Hotel"

**Expected**:
- ✅ Form submits successfully
- ✅ Hotel created with optional fields as NULL
- ✅ Hotel appears in list
- ✅ No errors for empty optional fields

---

## Test Case 8: Checkbox Behavior

### Test: Preferred Vendor Checkbox

**Steps**:
1. Fill form completely
2. Check "Preferred Vendor"
3. Uncheck "Preferred Vendor"
4. Check both "Preferred Vendor" and "Blacklisted"
5. Submit

**Expected**:
- ✅ Checkboxes toggle correctly
- ✅ Preferred Vendor saves when checked
- ✅ Preferred Vendor saves as FALSE when unchecked
- ✅ Can have both flags set simultaneously
- ✅ Data persists correctly

---

## Test Case 9: Performance & Loading

### Test: Loading State

**Steps**:
1. Fill form completely
2. Click "Create Hotel"
3. During submission, check button

**Expected**:
- ✅ Button text changes (if applicable)
- ✅ Button shows loading indicator (spinning circle)
- ✅ Button becomes disabled during submission
- ✅ Form cannot be submitted twice simultaneously

---

## Test Case 10: Data Persistence

### Test: Hotel Appears in Database

**Steps**:
1. Create hotel with: "Test Hotel", "Test Brand", "Business", "West", "Mumbai"
2. Refresh browser page
3. Look for created hotel in list

**Expected**:
- ✅ Hotel still appears in list after refresh
- ✅ All data matches what was entered
- ✅ No data corruption or loss
- ✅ Created timestamp should be recent

---

## Troubleshooting

### Issue: "File is not a module" Error
- This was a build error - should be fixed
- If you see this in console: npm run build in project root

### Issue: Form doesn't open
- Check browser console for JavaScript errors (F12 → Console tab)
- Verify you're on the correct page (`/administration/masters/venues`)
- Try hard refresh (Ctrl+F5)

### Issue: Cities not filtering by zone
- Verify database has cities with zone_id values
- Check that zones exist in city records
- Look in browser network tab to see if city fetch completes

### Issue: Form won't submit
- Check all required fields are filled (marked with red *)
- Verify mobile number has at least 10 digits
- Check email format if provided
- Check latitude/longitude are within valid ranges

### Issue: Data not persisting
- Check browser console for network errors
- Verify Supabase connection is working
- Check that database tables exist and have correct structure
- Try creating in incognito/private mode to avoid cache issues

---

## Success Criteria

✅ **Phase 2 Testing Complete When**:
1. Form opens correctly with all 3 sections
2. Can create hotel with all Phase 2 fields
3. Can edit existing hotel
4. All validation rules work
5. Zone-city dependency works correctly
6. Optional fields work correctly
7. Data persists to database
8. Form UI appears professional and responsive
9. No console errors during normal operation
10. Performance is acceptable (form submits within 2-3 seconds)

---

## Test Environment

- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **URL**: http://localhost:5173 (or production URL)
- **Test Data**: Use any real hotels or create dummy records
- **Database**: Should connect to your Supabase project
- **Timezone**: UTC (as per system)

---

## Questions?

If you encounter any issues during testing:
1. Check browser console (F12 → Console)
2. Check network tab for API call details
3. Verify database connection
4. Review this guide for expected behavior
