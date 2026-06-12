# Step 4: Participant Mix & Automatic Room Estimation - Implementation Plan

## Objective
Transform room requirement capture from manual entry to automatic calculation based on participant designation mix and hotel-specific occupancy rules.

---

## Core Concept Changes

### FROM: Manual Room Entry
```
Sales Head Input:
- Expected Pax: 120
- Guaranteed Pax: 100
- Rooms Required: ??? (guesswork)
```

### TO: Automatic Room Calculation
```
Sales Head Input:
- SO: 10
- DM: 5
- RSM: 2
- CH: 1
- IBH: 1
- Others: 101

System Calculates:
- Total Planned Pax: 120
- Guaranteed Pax: 100 (manual entry)
- Estimated Rooms: 9 (based on hotel occupancy rules)
```

---

## Database Schema Changes Required

### 1. Meeting Requests Table - Add Participant Mix Columns
```sql
ALTER TABLE meeting_requests
ADD COLUMN participant_so INTEGER DEFAULT 0,
ADD COLUMN participant_dm INTEGER DEFAULT 0,
ADD COLUMN participant_rsm INTEGER DEFAULT 0,
ADD COLUMN participant_ch INTEGER DEFAULT 0,
ADD COLUMN participant_ibh INTEGER DEFAULT 0,
ADD COLUMN participant_others INTEGER DEFAULT 0;

-- Computed column alternative (if supported)
-- ADD COLUMN total_planned_pax INTEGER GENERATED ALWAYS AS 
-- (participant_so + participant_dm + participant_rsm + participant_ch + participant_ibh + participant_others) STORED;
```

### 2. Create Hotel Occupancy Rules Table
```sql
CREATE TABLE hotel_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  designation_type VARCHAR(10) NOT NULL, -- SO, DM, RSM, CH, IBH
  occupancy_type VARCHAR(10) NOT NULL,   -- SINGLE, DOUBLE, TRIPLE, QUAD
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, designation_type)
);

-- Default occupancy rules for new hotels
CREATE TABLE default_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation_type VARCHAR(10) NOT NULL UNIQUE,
  occupancy_type VARCHAR(10) NOT NULL,
  description TEXT
);

-- Insert defaults
INSERT INTO default_occupancy_rules (designation_type, occupancy_type, description) VALUES
('SO', 'TRIPLE', 'Sales Officers - Triple sharing'),
('DM', 'DOUBLE', 'District Managers - Double sharing'),
('RSM', 'SINGLE', 'Regional Sales Managers - Single occupancy'),
('CH', 'SINGLE', 'Channel Heads - Single occupancy'),
('IBH', 'SINGLE', 'Institutional Business Heads - Single occupancy');
```

### 3. Update Views/Queries
- Update meeting request queries to include participant mix columns
- Add computed total_planned_pax in application layer

---

## TypeScript Type Definitions

### 1. Participant Mix Type
```typescript
// src/features/meetings/types.ts

export interface ParticipantMix {
  so: number;
  dm: number;
  rsm: number;
  ch: number;
  ibh: number;
  others: number;
}

export type DesignationType = 'SO' | 'DM' | 'RSM' | 'CH' | 'IBH' | 'OTHERS';

export const DESIGNATION_LABELS: Record<DesignationType, string> = {
  SO: 'Sales Officer',
  DM: 'District Manager',
  RSM: 'Regional Sales Manager',
  CH: 'Channel Head',
  IBH: 'Institutional Business Head',
  OTHERS: 'Others',
};
```

### 2. Occupancy Rules Type
```typescript
// src/features/venues/types.ts

export type OccupancyType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';

export interface OccupancyRule {
  id: string;
  hotel_id: string;
  designation_type: DesignationType;
  occupancy_type: OccupancyType;
}

export interface HotelOccupancyMatrix {
  hotel_id: string;
  rules: Record<DesignationType, OccupancyType>;
}

export const OCCUPANCY_CAPACITY: Record<OccupancyType, number> = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  QUAD: 4,
};
```

### 3. Updated MeetingRequest Type
```typescript
export interface MeetingRequest {
  // ... existing fields
  participant_so: number;
  participant_dm: number;
  participant_rsm: number;
  participant_ch: number;
  participant_ibh: number;
  participant_others: number;
  // Remove: rooms_required (deprecated)
}
```

---

## Room Calculation Logic

### Algorithm
```typescript
function calculateRoomsRequired(
  participantMix: ParticipantMix,
  occupancyRules: HotelOccupancyMatrix
): number {
  let totalRooms = 0;
  
  // For each designation type
  for (const [designation, count] of Object.entries(participantMix)) {
    if (count === 0) continue;
    
    const occupancyType = occupancyRules[designation as DesignationType];
    const personsPerRoom = OCCUPANCY_CAPACITY[occupancyType];
    
    // Calculate rooms needed (round up)
    const roomsNeeded = Math.ceil(count / personsPerRoom);
    totalRooms += roomsNeeded;
  }
  
  return totalRooms;
}
```

### Example Calculation
```
Input:
- SO: 10 (Triple) → 10/3 = 4 rooms
- DM: 5 (Double) → 5/2 = 3 rooms
- RSM: 2 (Single) → 2/1 = 2 rooms
- CH: 1 (Single) → 1/1 = 1 room
- IBH: 1 (Single) → 1/1 = 1 room

Total Rooms: 4 + 3 + 2 + 1 + 1 = 11 rooms
```

---

## Component Changes Required

### 1. Meeting Request Form - Attendance Section
**Replace**:
```tsx
<input name="expected_pax" />
<input name="guaranteed_pax" />
<input name="rooms_required" /> // REMOVE
```

**With**:
```tsx
<ParticipantMixGrid 
  value={participantMix}
  onChange={setParticipantMix}
  disabled={!canEdit}
/>
<div>Total Planned Pax: {calculateTotalPax(participantMix)}</div>
<input name="guaranteed_pax" max={totalPlannedPax} />
```

### 2. Participant Mix Grid Component (NEW)
```tsx
// src/components/ParticipantMixGrid.tsx
export function ParticipantMixGrid({ value, onChange, disabled }) {
  return (
    <div className="participant-mix-grid">
      {DESIGNATIONS.map(designation => (
        <div key={designation}>
          <label>{DESIGNATION_LABELS[designation]}</label>
          <input 
            type="number"
            min="0"
            value={value[designation]}
            onChange={(e) => onChange({
              ...value,
              [designation]: parseInt(e.target.value) || 0
            })}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
```

### 3. Venue Details - Occupancy Rules Display
```tsx
// src/pages/VenueDetails.tsx - Add section
<section>
  <h3>Accommodation Suitability</h3>
  <table>
    <thead>
      <tr>
        <th>Designation</th>
        <th>Occupancy</th>
      </tr>
    </thead>
    <tbody>
      {occupancyRules.map(rule => (
        <tr key={rule.designation_type}>
          <td>{DESIGNATION_LABELS[rule.designation_type]}</td>
          <td>{rule.occupancy_type}</td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
```

### 4. Request Summary Display
**Update all places showing request details**:
```tsx
<div>
  <h4>Participant Mix</h4>
  <ul>
    <li>SO: {request.participant_so}</li>
    <li>DM: {request.participant_dm}</li>
    <li>RSM: {request.participant_rsm}</li>
    <li>CH: {request.participant_ch}</li>
    <li>IBH: {request.participant_ibh}</li>
    <li>Others: {request.participant_others}</li>
  </ul>
  <div>Total Planned Pax: {calculateTotalPax(request)}</div>
  <div>Guaranteed Pax: {request.guaranteed_pax}</div>
  <div>Estimated Rooms: {calculateRooms(request, hotelRules)}</div>
</div>
```

---

## Files to Create

1. `participant_mix_migration.sql` - Database migration
2. `src/components/ParticipantMixGrid.tsx` - Participant input grid
3. `src/features/rooms/roomCalculator.ts` - Room calculation logic
4. `src/features/rooms/types.ts` - Occupancy types
5. `src/features/venues/occupancyService.ts` - Occupancy rules API

---

## Files to Modify

1. `src/features/meetings/types.ts` - Add participant mix fields
2. `src/features/meetings/api.ts` - Update queries
3. `src/features/meetings/constants.ts` - Add participant defaults
4. `src/features/meetings/validation.ts` - Add guaranteed pax validation
5. `src/pages/MeetingRequestForm.tsx` - Replace attendance section
6. `src/pages/VenueDetails.tsx` - Add occupancy rules display
7. `src/features/venues/types.ts` - Add occupancy rule types

---

## Validation Rules

### 1. Participant Mix
- All values must be >= 0
- At least one participant required (total > 0)

### 2. Guaranteed Pax
- Must be > 0
- Cannot exceed Total Planned Pax
- Error: "Guaranteed Pax cannot exceed Total Planned Pax"

### 3. Room Estimation
- Requires hotel selection for accurate calculation
- Falls back to default occupancy rules if hotel not selected
- Display as "Estimated" (not committed)

---

## Migration Strategy

### Phase 1: Add Columns (Non-Breaking)
```sql
-- Add new columns with defaults
ALTER TABLE meeting_requests
ADD COLUMN participant_so INTEGER DEFAULT 0,
...
-- Old columns remain for backward compatibility
```

### Phase 2: Data Migration (Optional)
```sql
-- Migrate existing expected_pax to participant_others
UPDATE meeting_requests 
SET participant_others = expected_pax
WHERE participant_so IS NULL;
```

### Phase 3: Update Application
- Deploy new UI with participant mix
- Both old and new fields coexist
- Gradual migration

### Phase 4: Cleanup (Future)
```sql
-- After full migration, optionally remove old field
-- ALTER TABLE meeting_requests DROP COLUMN rooms_required;
```

---

## Testing Scenarios

### Scenario 1: Basic Room Calculation
```
Input:
- SO: 9 (Triple sharing)
- DM: 4 (Double sharing)
- RSM: 2 (Single)

Expected Output:
- SO Rooms: 3 (9/3)
- DM Rooms: 2 (4/2)
- RSM Rooms: 2 (2/1)
- Total: 7 rooms
```

### Scenario 2: Uneven Distribution
```
Input:
- SO: 10 (Triple sharing)
- DM: 5 (Double sharing)

Expected Output:
- SO Rooms: 4 (10/3 = 3.33 → ceiling)
- DM Rooms: 3 (5/2 = 2.5 → ceiling)
- Total: 7 rooms
```

### Scenario 3: Guaranteed Pax Validation
```
Input:
- Total Planned Pax: 120
- Guaranteed Pax: 140

Expected: VALIDATION ERROR
Message: "Guaranteed Pax (140) cannot exceed Total Planned Pax (120)"
```

---

## NOT Changed (Scope Protection)

✅ Dashboard/Home page  
✅ Venue filtering logic  
✅ Venue shortlisting workflow  
✅ Admin workflow screens  
✅ Booking creation logic (uses estimated rooms)  
✅ Invoice workflow  
✅ Payment workflow  
✅ Analytics/Reports  
✅ RLS policies  

---

## Success Criteria

- [ ] Participant Mix grid functional
- [ ] Total Planned Pax auto-calculates
- [ ] Guaranteed Pax validation works
- [ ] Room estimation calculates correctly
- [ ] Occupancy rules stored per hotel
- [ ] Venue details show occupancy matrix
- [ ] Request displays use participant mix
- [ ] No manual room entry in Sales Head form
- [ ] Backward compatibility maintained

---

**Status**: PLANNING COMPLETE - READY FOR IMPLEMENTATION
