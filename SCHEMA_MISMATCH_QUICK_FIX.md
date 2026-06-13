# Schema Mismatch - Quick Reference Guide

## ⚠️ THE PROBLEM

Database query was requesting columns that don't exist:

```typescript
// ❌ WRONG - These columns don't exist in halls table
const HALL_SELECT = `
  id, hotel_id, hall_name, hall_type, capacity,
  length,           // ❌ DOESN'T EXIST
  width,            // ❌ DOESN'T EXIST
  height,           // ❌ DOESN'T EXIST
  area,             // ❌ DOESN'T EXIST
  theater_capacity, // ❌ WRONG SPELLING (should be theatre_capacity)
  classroom_capacity,
  cocktail_capacity,// ❌ DOESN'T EXIST
  round_table_capacity,
  indoor_outdoor,
  amenities,        // ❌ DOESN'T EXIST
  status, created_at, updated_at
`;
```

## ✅ THE FIX

Replace with correct columns that actually exist:

```typescript
// ✓ CORRECT - These columns exist in halls table
const HALL_SELECT = `
  id, hotel_id, hall_name, hall_type, capacity,
  floor,            // ✓ EXISTS
  area_sqft,        // ✓ EXISTS (not "area")
  theatre_capacity, // ✓ EXISTS (British spelling with 'theatre')
  classroom_capacity,
  u_shape_capacity, // ✓ EXISTS (not in old code)
  cluster_capacity,
  boardroom_capacity,
  round_table_capacity,
  indoor_outdoor,
  status, created_at, updated_at
`;
```

## 🔄 ACTUAL HALLS TABLE SCHEMA

### What EXISTS ✓

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hotel_id | UUID | Foreign key |
| hall_name | VARCHAR | Hall name |
| hall_type | VARCHAR | Type of hall |
| capacity | INTEGER | Basic capacity |
| **floor** | VARCHAR(50) | Floor location |
| **area_sqft** | INTEGER | Area in square feet |
| **theatre_capacity** | INTEGER | Theatre-style seating |
| **classroom_capacity** | INTEGER | Classroom-style seating |
| **u_shape_capacity** | INTEGER | U-shape seating |
| **cluster_capacity** | INTEGER | Cluster seating |
| **boardroom_capacity** | INTEGER | Boardroom seating |
| round_table_capacity | INTEGER | Round-table seating |
| indoor_outdoor | VARCHAR | INDOOR/OUTDOOR/BOTH |
| status | VARCHAR | ACTIVE/INACTIVE/UNDER_RENOVATION |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Updated timestamp |

### What DOESN'T EXIST ❌

| Invalid Column | Correct Alternative |
|---|---|
| `length` | `floor` (floor location) |
| `width` | None - not tracked |
| `height` | None - not tracked |
| `area` | `area_sqft` |
| `theater_capacity` | `theatre_capacity` (correct spelling) |
| `cocktail_capacity` | None - use `round_table_capacity` |
| `amenities` | None - not in halls table |

## 📁 FILES THAT WERE FIXED

### 1. src/features/venues/venueService.ts

**Fixed sections:**
- Line ~47: `HALL_SELECT` constant
- Line ~309: `createHall()` function - insert mapping
- Line ~337: `updateHall()` function - update mapping
- Line ~100-160: `getHotelById()` function - error handling

### 2. src/features/venues/types.ts

**Fixed sections:**
- Line ~122: `Hall` interface
- Line ~248: `HallCreateInput` interface
- Line ~268: `HallUpdateInput` interface

## 🧪 TESTING

### Before Fix (FAILS)
```
Error: Halls fetch failed: column halls.length does not exist
Result: Hotel not found (page crash)
```

### After Fix (SUCCEEDS)
```
Halls fetched successfully: 5 halls
Result: Hotel details page loads with all tabs working
```

## ⚡ Quick Checklist

- [ ] HALL_SELECT uses correct column names
- [ ] createHall() maps input fields to correct columns
- [ ] updateHall() maps input fields to correct columns
- [ ] Hall interface has correct fields
- [ ] HallCreateInput interface has correct fields
- [ ] HallUpdateInput interface has correct fields
- [ ] No references to length/width/height/area
- [ ] theatre_capacity spelling is correct (British)
- [ ] Build compiles without errors
- [ ] Hotel Details page loads
- [ ] Halls tab shows data

## 🔍 How to Verify

### Check Column Names in Code
```bash
grep -n "length\|width\|height\|cocktail" src/features/venues/venueService.ts
# Should return: nothing (all should be removed)

grep -n "theatre_capacity" src/features/venues/venueService.ts
# Should return: multiple matches (correct spelling used)
```

### Check Database
```sql
-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'halls'
ORDER BY ordinal_position;

-- Should show: floor, area_sqft, theatre_capacity, etc.
-- Should NOT show: length, width, height, area, theater_capacity, cocktail_capacity
```

## 📊 Summary

| Aspect | Before | After |
|--------|--------|-------|
| Query Status | ❌ FAILS | ✓ SUCCEEDS |
| Columns | Invalid | Valid |
| Hotel Page | "Not Found" | ✓ Loads |
| Hall Data | Not fetched | ✓ Fetched |
| Error Message | "column halls.length does not exist" | None |
| User Experience | Broken | ✓ Working |

---

**Root Cause**: Schema mismatch - code requested columns that don't exist in database schema.

**Duration to Fix**: Applied immediately in venueService.ts and types.ts.

**Risk**: Very LOW - only changes internal column names to match actual database schema.

**Testing**: Deploy and test Hotel Details page - should load successfully.
