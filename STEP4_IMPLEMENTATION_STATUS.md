# Step 4: Participant Mix & Automatic Room Estimation - Implementation Status

## ✅ Core Architecture: COMPLETED

---

## What Has Been Implemented

### 1. Database Schema ✅
**File**: `participant_mix_migration.sql`

**Changes Made**:
- Added 6 participant mix columns to `meeting_requests`:
  - `participant_so` (Sales Officer)
  - `participant_dm` (District Manager)
  - `participant_rsm` (Regional Sales Manager)
  - `participant_ch` (Channel Head)
  - `participant_ibh` (Institutional Business Head)
  - `participant_others` (Other participants)

- Created `hotel_occupancy_rules` table:
  - Hotel-specific occupancy rules
  - Maps designation → occupancy type (SINGLE/DOUBLE/TRIPLE/QUAD)
  - RLS policies enabled

- Created `default_occupancy_rules` table:
  - Fallback rules when hotel-specific not available
  - Default configuration:
    - SO → TRIPLE
    - DM → DOUBLE
    - RSM, CH, IBH → SINGLE

- Added database functions:
  - `calculate_total_planned_pax()` - Sum of participant mix
  - `estimate_rooms_required()` - Automatic room calculation

---

### 2. TypeScript Type System ✅
**Files Created**:
- `src/features/rooms/types.ts`
- `src/features/rooms/roomCalculator.ts`

**Key Types**:
```typescript
interface ParticipantMix {
  so: number;
  dm: number;
  rsm: number;
  ch: number;
  ibh: number;
  others: number;
}

type OccupancyType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
type DesignationType = 'SO' | 'DM' | 'RSM' | 'CH' | 'IBH';

interface RoomEstimation {
  designation: DesignationType;
  participant_count: number;
  occupancy_type: OccupancyType;
  persons_per_room: number;
  rooms_required: number;
}
```

---

### 3. Room Calculation Engine ✅
**File**: `src/features/rooms/roomCalculator.ts`

**Functions**:
- `calculateTotalPlannedPax()` - Sum participants
- `estimateRooms()` - Calculate total rooms
- `estimateRoomsWithBreakdown()` - Detailed calculation
- `validateGuaranteedPax()` - Validation logic
- `formatRoomEstimation()` - Display formatting

**Algorithm**:
```
For each designation:
  rooms = CEIL(count / occupancy_capacity)

Example:
- SO: 10 ÷ 3 (TRIPLE) = 4 rooms
- DM: 5 ÷ 2 (DOUBLE) = 3 rooms
- RSM: 2 ÷ 1 (SINGLE) = 2 rooms
Total: 9 rooms
```

---

### 4. UI Components ✅
**File**: `src/components/ParticipantMixGrid.tsx`

**Components**:
1. `<ParticipantMixGrid />` - Input form
   - 6 numeric inputs (SO, DM, RSM, CH, IBH, Others)
   - Auto-calculated total display
   - Validation messages
   - Disabled state support

2. `<ParticipantMixDisplay />` - Read-only view
   - Shows non-zero designations
   - Total planned pax
   - Compact layout

---

### 5. Updated Meeting Request Type ✅
**File**: `src/features/meetings/types.ts`

**Changes**:
- Added participant mix fields to `MeetingRequest` interface
- Marked `rooms_required` as deprecated
- Backward compatible (old fields preserved)

---

## What Still Needs To Be Done

### 1. Meeting Request Form Updates ⏳
**File**: `src/pages/MeetingRequestForm.tsx`

**TODO**:
- [ ] Import `ParticipantMixGrid` component
- [ ] Replace attendance section with participant mix grid
- [ ] Remove "Rooms Required" input field
- [ ] Add guaranteed pax validation
- [ ] Update form state to include participant mix
- [ ] Update save/submit logic

**Current Section** (to be replaced):
```tsx
<input name="expected_pax" />
<input name="guaranteed_pax" />
<input name="rooms_required" /> // REMOVE THIS
```

**New Section** (to be implemented):
```tsx
<ParticipantMixGrid 
  value={participantMix}
  onChange={setParticipantMix}
  disabled={!canEdit}
/>
<div>
  <label>Guaranteed Pax</label>
  <input 
    type="number"
    value={guaranteedPax}
    onChange={handleGuaranteedPaxChange}
    max={totalPlannedPax}
  />
  {validationError && <div className="error">{validationError}</div>}
</div>
```

---

### 2. Meeting Request Constants ⏳
**File**: `src/features/meetings/constants.ts`

**TODO**:
- [ ] Add participant mix default values
- [ ] Update initial form state

**Add**:
```typescript
export const INITIAL_PARTICIPANT_MIX: ParticipantMix = {
  so: 0,
  dm: 0,
  rsm: 0,
  ch: 0,
  ibh: 0,
  others: 0,
};
```

---

### 3. Meeting Request API ⏳
**File**: `src/features/meetings/api.ts`

**TODO**:
- [ ] Update SELECT queries to include participant mix columns
- [ ] Update INSERT/UPDATE mutations

**Update SELECT**:
```typescript
.select(`
  id, request_number, meeting_name,
  participant_so, participant_dm, participant_rsm,
  participant_ch, participant_ibh, participant_others,
  // ... other fields
`)
```

---

### 4. Venue Details - Occupancy Rules Display ⏳
**File**: `src/pages/VenueDetails.tsx`

**TODO**:
- [ ] Create occupancy service API
- [ ] Fetch hotel occupancy rules
- [ ] Display occupancy matrix
- [ ] Show "Accommodation Suitability" section

**New Section**:
```tsx
<section>
  <h3>Accommodation Suitability</h3>
  <table>
    <thead>
      <tr>
        <th>Designation</th>
        <th>Occupancy</th>
        <th>Persons/Room</th>
      </tr>
    </thead>
    <tbody>
      {occupancyRules.map(rule => (
        <tr key={rule.designation_type}>
          <td>{DESIGNATION_LABELS[rule.designation_type]}</td>
          <td>{rule.occupancy_type}</td>
          <td>{OCCUPANCY_CAPACITY[rule.occupancy_type]}</td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
```

---

### 5. Request Display Components ⏳
**Files**: Various (Dashboard, Request Cards, etc.)

**TODO**:
- [ ] Update request summary displays
- [ ] Show participant mix instead of just "expected pax"
- [ ] Display estimated rooms (not manual entry)
- [ ] Update MeetingRequestCard component

**Replace**:
```tsx
<div>Expected Pax: {request.expected_pax}</div>
<div>Rooms: {request.rooms_required}</div>
```

**With**:
```tsx
<ParticipantMixDisplay value={getParticipantMix(request)} />
<div>Total Planned Pax: {calculateTotalPlannedPax(request)}</div>
<div>Guaranteed Pax: {request.guaranteed_pax}</div>
<div>Estimated Rooms: {estimateRooms(request, hotelRules)}</div>
```

---

### 6. Occupancy Service API ⏳
**File**: `src/features/venues/occupancyService.ts` (NEW)

**TODO**:
- [ ] Create API functions for occupancy rules
- [ ] `fetchHotelOccupancyRules(hotelId)`
- [ ] `fetchDefaultOccupancyRules()`
- [ ] `updateHotelOccupancyRules(hotelId, rules)` (Admin only)

---

### 7. Validation Updates ⏳
**File**: `src/features/meetings/validation.ts`

**TODO**:
- [ ] Add participant mix validation
- [ ] Add guaranteed pax validation
- [ ] Remove rooms_required from required fields

**Add**:
```typescript
guaranteedPax: z.number()
  .min(1, 'Guaranteed pax must be at least 1')
  .refine(
    (val) => val <= calculateTotalPlannedPax(participantMix),
    'Guaranteed pax cannot exceed total planned pax'
  ),
```

---

## Implementation Roadmap

### Phase 1: Database Migration (15 min)
1. Run `participant_mix_migration.sql` in Supabase
2. Verify columns added
3. Verify tables created
4. Test database functions

### Phase 2: Form Updates (30 min)
1. Update MeetingRequestForm.tsx
2. Integrate ParticipantMixGrid
3. Remove rooms_required input
4. Add guaranteed pax validation
5. Update form submission logic

### Phase 3: API Updates (20 min)
1. Update meeting request queries
2. Include participant mix columns
3. Update constants with defaults
4. Test CRUD operations

### Phase 4: Display Updates (25 min)
1. Update request summary displays
2. Create occupancy service
3. Add occupancy rules to venue details
4. Update dashboard cards

### Phase 5: Testing (30 min)
1. Test participant mix input
2. Test room calculation
3. Test guaranteed pax validation
4. Test occupancy rules display

**Total Estimated Time**: ~2 hours

---

## Example Room Calculations

### Example 1: Standard Conference
```
Participant Mix:
- SO: 10 (Triple) → 10 ÷ 3 = 4 rooms
- DM: 5 (Double) → 5 ÷ 2 = 3 rooms
- RSM: 2 (Single) → 2 ÷ 1 = 2 rooms
- CH: 1 (Single) → 1 ÷ 1 = 1 room

Total Planned Pax: 18
Estimated Rooms: 10
```

### Example 2: Large Cycle Meeting
```
Participant Mix:
- SO: 45 (Triple) → 45 ÷ 3 = 15 rooms
- DM: 12 (Double) → 12 ÷ 2 = 6 rooms
- RSM: 8 (Single) → 8 ÷ 1 = 8 rooms
- CH: 3 (Single) → 3 ÷ 1 = 3 rooms
- IBH: 2 (Single) → 2 ÷ 1 = 2 rooms

Total Planned Pax: 70
Estimated Rooms: 34
```

### Example 3: With Guaranteed Pax
```
Participant Mix Total: 120
Guaranteed Pax: 100

Meaning:
- 120 participants expected
- 100 participants commercially committed
- Commercial calculations use 100
- Room booking uses 120
```

---

## Validation Examples

### Valid Input
```
SO: 10
DM: 5
RSM: 2
Total Planned Pax: 17
Guaranteed Pax: 15

Result: ✅ Valid (guaranteed ≤ total)
```

### Invalid Input
```
SO: 10
DM: 5
RSM: 2
Total Planned Pax: 17
Guaranteed Pax: 20

Result: ❌ Error
Message: "Guaranteed Pax (20) cannot exceed Total Planned Pax (17)"
```

---

## NOT Changed (Scope Protection)

✅ Dashboard/Home page structure  
✅ Venue filtering logic  
✅ Venue shortlisting workflow  
✅ Admin workflow screens  
✅ Booking creation logic (will use estimated rooms)  
✅ Invoice workflow  
✅ Payment workflow  
✅ Analytics/Reports  
✅ RLS policies (only added for new tables)  

---

## Next Steps

To complete Step 4 implementation:

1. **Run Database Migration**
   ```sql
   -- Run participant_mix_migration.sql in Supabase SQL Editor
   ```

2. **Update Meeting Request Form**
   - Integrate ParticipantMixGrid
   - Remove rooms_required field
   - Add validation

3. **Update API Queries**
   - Include participant mix columns
   - Update constants

4. **Update Display Components**
   - Use ParticipantMixDisplay
   - Show estimated rooms

5. **Create Occupancy Service**
   - API for hotel occupancy rules
   - Display in venue details

6. **Test End-to-End**
   - Create request with participant mix
   - Verify room calculation
   - Test validation

---

## Current Status

**Completed**:
- ✅ Database schema design
- ✅ Migration SQL script
- ✅ TypeScript types
- ✅ Room calculation engine
- ✅ Participant Mix Grid component
- ✅ Planning documentation

**In Progress**:
- ⏳ Form integration
- ⏳ API updates
- ⏳ Display updates

**Not Started**:
- ⏹ Occupancy service API
- ⏹ Venue details updates
- ⏹ End-to-end testing

---

**Implementation Date**: June 11, 2026  
**Status**: 60% COMPLETE - Core architecture done, integration pending  
**Estimated Completion**: 2 hours remaining
