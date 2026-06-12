# Step 4: Participant Mix - Next Actions Required

## 🎯 Current Status

**Implementation**: ✅ **95% COMPLETE**  
**Database Migration**: ⏳ **PENDING USER ACTION**  
**Testing**: ⏳ **READY AFTER MIGRATION**

---

## ⚠️ CRITICAL: Database Migration Required

Before the new participant mix functionality will work, you **MUST** run the database migration.

### Step-by-Step Migration Instructions

#### 1. Open Supabase Dashboard
- Go to: https://app.supabase.com
- Select your project: **AVEMS**

#### 2. Navigate to SQL Editor
- Click on **SQL Editor** in left sidebar
- Click **New Query**

#### 3. Run the Migration
- Open file: `participant_mix_migration.sql` in your workspace
- Copy the **entire contents** of the file
- Paste into Supabase SQL Editor
- Click **Run** (or press Ctrl+Enter / Cmd+Enter)

#### 4. Verify Success
The migration should complete in a few seconds. Look for:
```
✅ Columns added to meeting_requests
✅ hotel_occupancy_rules table created
✅ default_occupancy_rules table created
✅ RLS policies enabled
✅ Database functions created
```

#### 5. Confirm Changes
Run this verification query:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'meeting_requests'
AND column_name LIKE 'participant_%'
ORDER BY column_name;
```

**Expected Result**: Should show 6 columns:
- participant_ch
- participant_dm
- participant_ibh
- participant_others
- participant_rsm
- participant_so

---

## 🧪 Testing After Migration

Once migration is complete, test the new functionality:

### Test 1: Create New Meeting Request

1. Navigate to: **Meeting Requests** → **New Request**

2. Fill in basic details:
   - Meeting Name: "Test Participant Mix"
   - Division: Select any
   - Meeting Type: Select any
   - City: Select any
   - Zone: Enter "West"
   - Dates: Select dates

3. **NEW SECTION**: Participant Mix
   - Enter SO: 10
   - Enter DM: 5
   - Enter RSM: 2
   - Enter CH: 1
   - Enter IBH: 1
   - Enter Others: 2

4. Verify:
   - ✅ Total Planned Pax shows: **21**
   - ✅ Auto-calculated (no manual input)

5. Enter Guaranteed Pax: **18**
   - ✅ Should accept (18 ≤ 21)

6. Click **Save Draft**
   - ✅ Should save successfully

7. Verify in Database:
   ```sql
   SELECT 
     meeting_name,
     participant_so,
     participant_dm,
     participant_rsm,
     participant_ch,
     participant_ibh,
     participant_others,
     guaranteed_pax
   FROM meeting_requests
   ORDER BY created_at DESC
   LIMIT 1;
   ```

**Expected Result**:
```
meeting_name: "Test Participant Mix"
participant_so: 10
participant_dm: 5
participant_rsm: 2
participant_ch: 1
participant_ibh: 1
participant_others: 2
guaranteed_pax: 18
```

---

### Test 2: Validation - Guaranteed Pax Exceeds Total

1. Create new request or edit existing
2. Enter Participant Mix:
   - SO: 10
   - Total Planned Pax: **10**
3. Enter Guaranteed Pax: **15** (exceeds 10)
4. Try to save

**Expected Result**:
- ❌ Error displayed: "Guaranteed Pax (15) cannot exceed Total Planned Pax (10)"
- ❌ Cannot save/submit
- ✅ Validation working

---

### Test 3: Validation - Empty Participant Mix

1. Create new request
2. Leave all participant fields at **0**
3. Try to save

**Expected Result**:
- ❌ Error displayed: "At least one participant is required"
- ❌ Cannot save/submit
- ✅ Validation working

---

### Test 4: Edit Existing Request

1. Navigate to existing request (if any)
2. Verify participant mix fields show correctly
3. Edit participant counts
4. Verify total pax updates automatically
5. Save changes

**Expected Result**:
- ✅ Form loads with participant mix
- ✅ Total updates in real-time
- ✅ Changes save successfully

---

## 📊 What Changed - File Summary

### New Files Created (4)
1. **participant_mix_migration.sql**
   - Database schema changes
   - 6 new columns on meeting_requests
   - 2 new tables for occupancy rules
   - Database functions

2. **src/features/rooms/types.ts**
   - Type definitions for participant mix
   - Occupancy types and constants

3. **src/features/rooms/roomCalculator.ts**
   - Room estimation logic
   - Validation functions
   - Calculation engine

4. **src/components/ParticipantMixGrid.tsx**
   - UI component for participant input
   - Real-time total calculation display
   - Read-only display variant

### Files Modified (4)
1. **src/features/meetings/constants.ts**
   - Added INITIAL_PARTICIPANT_MIX constant
   - Updated DEFAULT_FORM_VALUES

2. **src/features/meetings/api.ts**
   - Updated SELECT queries to include participant columns

3. **src/features/meetings/types.ts**
   - Added participant fields to MeetingRequest interface

4. **src/pages/MeetingRequestForm.tsx**
   - Complete refactoring
   - Integrated ParticipantMixGrid
   - Removed "Rooms Required" field
   - Removed "Expected Pax" field
   - Added validation logic
   - Enhanced guaranteed pax handling

---

## 🔍 What to Look For

### ✅ Success Indicators
- Participant Mix Grid appears in form
- 6 input boxes for designations (SO, DM, RSM, CH, IBH, Others)
- Total Planned Pax auto-calculates
- Guaranteed Pax validates against total
- "Rooms Required" field is **gone**
- Form saves participant mix to database
- No TypeScript errors in console

### ❌ Problem Indicators
If you see these, something went wrong:

**UI Issues**:
- Participant Mix Grid doesn't appear
- Total Planned Pax shows 0 when values entered
- "Rooms Required" field still visible
- Form layout broken

**Data Issues**:
- Save fails with database error
- Participant columns not found
- Data doesn't persist

**Migration Issues**:
- SQL errors during migration
- Columns not created
- Tables not created

---

## 🐛 Troubleshooting

### Problem: Migration Fails

**Error**: "column already exists"
```
Solution: Columns may already exist from previous attempt.
Check if columns exist:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'meeting_requests'
AND column_name LIKE 'participant_%';

If they exist, migration already ran successfully.
```

**Error**: "relation does not exist"
```
Solution: Check table name spelling.
Ensure you're connected to correct database.
```

---

### Problem: Form Doesn't Show Participant Mix

**Check**:
1. Open browser console (F12)
2. Look for import errors
3. Check if ParticipantMixGrid component loads

**Fix**:
```bash
# Ensure all dependencies installed
npm install

# Restart dev server
npm run dev
```

---

### Problem: Total Pax Doesn't Calculate

**Check**:
1. Open React DevTools
2. Inspect ParticipantMixGrid component
3. Verify `onChange` is being called

**Verify**:
- calculateTotalPlannedPax function imported
- State updates on input change

---

### Problem: Validation Not Working

**Check**:
1. Enter guaranteed pax > total pax
2. Look for error message
3. Check console for errors

**Verify**:
- validateGuaranteedPax function working
- guaranteedPaxError state updating
- Error message displaying

---

## 📝 Optional Enhancements (Future)

These are **NOT required** for Step 4 completion but would enhance the feature:

### 1. Display Participant Mix in Request Summary
**Location**: Dashboard, Request Cards  
**Change**: Show designation breakdown instead of just total pax

### 2. Create Occupancy Service API
**File**: `src/features/venues/occupancyService.ts` (new)  
**Purpose**: Fetch hotel-specific occupancy rules  
**Functions**: 
- `fetchHotelOccupancyRules(hotelId)`
- `fetchDefaultOccupancyRules()`

### 3. Show Occupancy Matrix in Venue Details
**Location**: Venue Details page  
**Change**: Display accommodation suitability table

### 4. Show Room Estimation in Request View
**Location**: Meeting Request view page  
**Change**: Display estimated rooms based on participant mix

### 5. Admin UI for Managing Occupancy Rules
**Location**: Admin settings  
**Purpose**: Allow admins to customize hotel occupancy rules

---

## ✅ Completion Checklist

Before considering Step 4 complete:

- [ ] Database migration executed successfully
- [ ] Verification query shows 6 participant columns
- [ ] Test: Create new meeting request
- [ ] Test: Participant mix saves to database
- [ ] Test: Total planned pax calculates correctly
- [ ] Test: Guaranteed pax validation works
- [ ] Test: Cannot exceed total validation works
- [ ] Test: Empty participant mix validation works
- [ ] Test: Edit existing request (if any exist)
- [ ] No console errors in browser
- [ ] No TypeScript errors in VS Code

---

## 🎉 When Complete

Once all checklist items are done, Step 4 is **COMPLETE**!

**You will have**:
- ✅ Participant mix architecture fully functional
- ✅ Sales Heads enter designations, not room counts
- ✅ Total pax auto-calculated
- ✅ Guaranteed pax validated
- ✅ Data rich for analytics
- ✅ Foundation for automatic room estimation

**Step 4 Objectives Met**:
- ✅ Remove "Rooms Required" manual entry
- ✅ Implement Participant Mix Grid
- ✅ Auto-calculate Total Planned Pax
- ✅ Validate Guaranteed Pax
- ✅ Support hotel-specific occupancy rules
- ✅ Enable automatic room estimation

---

## 📞 Need Help?

If you encounter issues:

1. **Check Documentation**:
   - `STEP4_IMPLEMENTATION_COMPLETE.md` - Full implementation details
   - `STEP4_VISUAL_GUIDE.md` - Visual before/after guide
   - `STEP4_IMPLEMENTATION_STATUS.md` - Technical status

2. **Check Files**:
   - All TypeScript files compile without errors
   - Migration SQL is valid SQL

3. **Common Issues**:
   - Migration not run → Run `participant_mix_migration.sql`
   - Cache issues → Clear browser cache, restart dev server
   - Type errors → Run `npm install`, restart VS Code

---

## 🚀 After Step 4

Once Step 4 is complete and tested, you can:

1. **Continue to Step 5** (if defined in your roadmap)
2. **Implement optional enhancements** (occupancy display, etc.)
3. **Train users** on new participant mix workflow
4. **Monitor usage** and gather feedback

---

**Next Immediate Action**: 
## 🔴 RUN THE DATABASE MIGRATION NOW

Open `participant_mix_migration.sql` and execute it in Supabase SQL Editor.

---

**Document Created**: June 12, 2026  
**Step 4 Status**: Implementation Complete, Migration Pending  
**Estimated Time to Complete**: 15-30 minutes (migration + testing)

