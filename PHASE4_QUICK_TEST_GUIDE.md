# PHASE 4: OCCUPANCY MATRIX - QUICK TEST GUIDE

## 5-MINUTE TEST (Verify Implementation Works)

### Setup
1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to Hotel Details page

3. Select any hotel to view details

### Test Steps

#### Step 1: Check Tab Exists (30 seconds)
- [ ] Look for tabs at top of hotel details
- [ ] Verify you see: **Overview | Halls | Accommodation | Occupancy Rules | Photos**
- [ ] "Occupancy Rules" tab should be between "Accommodation" and "Photos"

#### Step 2: Click Occupancy Rules Tab (30 seconds)
- [ ] Click the "Occupancy Rules" tab
- [ ] Page should show:
  - Status card with "⚠ Incomplete" (red text)
  - "0 / 4 Designations Configured"
  - 4 dropdown fields

#### Step 3: Fill All Fields (1 minute)
- [ ] Click first dropdown (SO - Sales Officer)
- [ ] Select "Triple"
- [ ] Click second dropdown (DM - District Manager)
- [ ] Select "Double"
- [ ] Click third dropdown (RSM - Regional Sales Manager)
- [ ] Select "Single"
- [ ] Click fourth dropdown (Senior Manager)
- [ ] Select "Single"

#### Step 4: Verify Save Button Enabled (30 seconds)
- [ ] Save button should now be **BLUE** and clickable (not grayed out)
- [ ] Status should show "✓ Complete" (green text)
- [ ] "4 / 4 Designations Configured" should display

#### Step 5: Save Data (1 minute)
- [ ] Click "Save Occupancy Rules" button
- [ ] Wait for "Saving..." feedback
- [ ] Button should return to normal state
- [ ] "Current Configuration" section should show your selections:
  - SO: Single
  - DM: Double
  - RSM: Single
  - Senior Manager: Single

#### Step 6: Verify Persistence (1 minute)
- [ ] Refresh page (F5 or Ctrl+R)
- [ ] Navigate back to same hotel
- [ ] Click "Occupancy Rules" tab again
- [ ] All fields should still show your selections
- [ ] Status should show "✓ Complete"

#### Step 7: Check Overview Tab (30 seconds)
- [ ] Click "Overview" tab
- [ ] Scroll down to find "Occupancy Policy" section
- [ ] Verify it shows all 4 designations with their assignments:
  ```
  Sales Officer (SO): Single
  District Manager (DM): Double
  Regional Sales Manager (RSM): Single
  Senior Manager: Single
  ```
- [ ] Text should say "Edit in Occupancy Rules tab"

### RESULT: ✅ PASSED
If all steps complete without errors, Phase 4 is working correctly!

---

## 10-MINUTE DETAILED TEST (Edge Cases & Error Handling)

### Test 1: Validation Check (2 minutes)
1. Click "Occupancy Rules" tab on any hotel
2. Leave all dropdowns blank
3. Click "Save Occupancy Rules" button
4. **Expected**: Error message appears: "All occupancy rules must be assigned."
5. **Expected**: Save button stays disabled
6. **Result**: Validation working ✓

### Test 2: Partial Fill (2 minutes)
1. Select SO = "Triple"
2. Select DM = "Double"
3. Leave RSM blank
4. Leave Senior Manager blank
5. Try to save
6. **Expected**: Error message appears
7. **Expected**: Save button disabled
8. **Result**: Partial fill prevented ✓

### Test 3: Update Existing (2 minutes)
1. Edit SO from "Triple" to "Quad"
2. Edit DM from "Double" to "Single"
3. Keep RSM and Senior Manager as is
4. Click "Save Occupancy Rules"
5. Wait for save to complete
6. Refresh page
7. **Expected**: New values persist
8. **Result**: Update working ✓

### Test 4: Multiple Hotels (3 minutes)
1. Create/select 2 different hotels
2. Set Hotel A occupancy:
   - SO: Triple
   - DM: Double
   - RSM: Single
   - Senior Manager: Single
3. Save Hotel A
4. Switch to Hotel B
5. Set Hotel B occupancy:
   - SO: Quad
   - DM: Single
   - RSM: Triple
   - Senior Manager: Double
6. Save Hotel B
7. Switch back to Hotel A
8. **Expected**: Hotel A still shows its original values (Triple, Double, Single, Single)
9. **Result**: Multi-hotel isolation working ✓

### Test 5: UI States (1 minute)
1. Check loading state: Should show "Loading occupancy rules..." briefly on page load
2. Check saving state: Save button should show "Saving..." during operation
3. Check error state: Try invalid input, error box should appear red
4. Check completion status: Should update from red ⚠ to green ✓

---

## DATABASE VERIFICATION (Optional)

### Verify Data was Saved to Database

```sql
-- Run in your Supabase SQL editor
SELECT 
  h.hotel_name,
  hor.rule_type,
  hor.min_occupancy,
  CASE 
    WHEN hor.min_occupancy = 1 THEN 'Single'
    WHEN hor.min_occupancy = 2 THEN 'Double'
    WHEN hor.min_occupancy = 3 THEN 'Triple'
    WHEN hor.min_occupancy = 4 THEN 'Quad'
  END as occupancy_label,
  hor.is_active
FROM hotels h
LEFT JOIN hotel_occupancy_rules hor ON h.id = hor.hotel_id
WHERE h.hotel_name = 'YOUR_TEST_HOTEL_NAME'
ORDER BY 
  CASE 
    WHEN hor.rule_type = 'SO' THEN 1
    WHEN hor.rule_type = 'DM' THEN 2
    WHEN hor.rule_type = 'RSM' THEN 3
    WHEN hor.rule_type = 'Senior Manager' THEN 4
  END;
```

**Expected Output**:
```
hotel_name           | rule_type     | min_occupancy | occupancy_label | is_active
--------------------|---------------|---------------|-----------------|----------
YOUR_TEST_HOTEL_NAME | SO            | 3             | Triple          | true
YOUR_TEST_HOTEL_NAME | DM            | 2             | Double          | true
YOUR_TEST_HOTEL_NAME | RSM           | 1             | Single          | true
YOUR_TEST_HOTEL_NAME | Senior Manager| 1             | Single          | true
```

If you see all 4 rows with correct values, database save is working! ✓

---

## TROUBLESHOOTING

### Issue: Tab doesn't appear
**Solution**: 
- Rebuild: `npm run build`
- Check browser console for errors (F12 → Console tab)
- Clear browser cache and refresh

### Issue: Dropdowns don't populate
**Solution**:
- Check browser console for errors
- Verify hotel.occupancy_rules is loading
- Check that Supabase connection is working

### Issue: Save doesn't work
**Solution**:
- Check browser console for network errors
- Verify you have internet connection
- Check that Supabase RLS allows your user to save

### Issue: Data doesn't persist after refresh
**Solution**:
- Check database query above to verify data was saved
- Check if you're still authenticated (session valid?)
- Check Supabase RLS policies allow SELECT for your role

### Issue: Getting error message
**Solution**:
- Most errors are validation (must fill all fields)
- Check error message text carefully
- Screenshot and share with development team if unclear

---

## BROWSER CONSOLE CHECKS

Open browser DevTools (F12 or Ctrl+Shift+I) and check Console tab:

### Expected
- No red error messages related to "occupancy"
- Possibly some warnings about unused variables (pre-existing)

### Not Expected
- "Cannot read property 'occupancy_rules' of undefined"
- "OccupancyMatrixTab is not a function"
- "supabase error: relation 'hotel_occupancy_rules' does not exist"

If you see errors, screenshot and report to development team.

---

## PERFORMANCE CHECK

### Verify Load Times
1. Click "Occupancy Rules" tab
2. Should load within **2 seconds**
3. Should not freeze or hang
4. Should show loading spinner briefly (if data takes time)

### Verify Save Speed
1. Fill all dropdowns
2. Click "Save Occupancy Rules"
3. Should save within **3 seconds**
4. Should show "Saving..." feedback
5. Should complete without hanging

If either takes longer, may indicate:
- Database performance issue
- Network connectivity issue
- Supabase RLS overhead

---

## SIGN-OFF

### 5-Minute Test ✓
- [ ] All 5 steps completed successfully
- [ ] No errors or crashes
- [ ] Data persisted correctly

### 10-Minute Detailed Test ✓
- [ ] All validation tests passed
- [ ] Multi-hotel isolation verified
- [ ] UI states working correctly
- [ ] Database verification passed

### Ready for Deployment ✓
- [ ] Tested on Chrome, Firefox, Safari (if available)
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Team approval obtained

---

## NEXT: Full Testing Checklist

For comprehensive testing including readiness score integration, data quality metrics, and admin dashboard, refer to:
**`PHASE4_TESTING_DEPLOYMENT_CHECKLIST.md`**

---

**Quick Test Date**: _____________
**Tested By**: _____________
**Status**: ✓ Ready / ✗ Issues Found
**Issues**: _____________

---

**Last Updated**: June 13, 2026
