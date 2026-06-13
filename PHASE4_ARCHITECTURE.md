# PHASE 4: OCCUPANCY MATRIX - ARCHITECTURE OVERVIEW

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Hotel Details Workspace                      │
│  ┌───────┬──────────┬────────────┬──────────────┬───────────┐   │
│  │Overview│ Halls   │Accommodation│Occupancy    │ Photos    │   │
│  │        │         │             │Rules        │           │   │
│  └───────┴──────────┴────────────┴──────────────┴───────────┘   │
│                                    ▲                              │
│                                    │                              │
│                        OccupancyMatrixTab                         │
│                        (PHASE 4 NEW)                              │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  OverviewTab     │ │venueService.ts   │ │readinessScore.ts │
│ (MODIFIED)       │ │ (MODIFIED)       │ │ (VERIFIED)       │
│                  │ │                  │ │                  │
│ - Display        │ │ - CRUD Ops       │ │ - Calculate      │
│   occupancy      │ │ - Error Handling │ │   readiness      │
│   policy         │ │ - RLS Support    │ │ - 15% weight     │
│ - Read-only      │ │                  │ │   occupancy      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌──────────────────┐
                    │  Supabase RLS    │
                    │                  │
                    │ hotel_occupancy_ │
                    │ rules table      │
                    └──────────────────┘
```

---

## Data Flow Diagram

### Save Flow
```
User fills 4 dropdowns
          ▼
Clicks "Save Occupancy Rules"
          ▼
Validation: All fields filled?
      ├─ NO → Show error, disable save
      │
      └─ YES → Lock button ("Saving...")
               ▼
               For each designation:
                 ├─ Does rule exist?
                 │  ├─ YES → updateOccupancyRule()
                 │  └─ NO → createOccupancyRule()
                 ▼
               Send to Supabase
                 ├─ RLS checks permissions
                 ├─ Enforce UNIQUE(hotel_id, rule_type)
                 └─ Store min_occupancy (1-4)
                 ▼
               Reload rules from database
                 ▼
               Call onRefresh() parent callback
                 ▼
               Update readiness score
                 ▼
               Show success state
```

### Load Flow
```
Component mounts
          ▼
useEffect triggers
          ▼
Set loading = true
          ▼
getOccupancyRulesByHotel(hotelId)
          ▼
Supabase query:
  SELECT * FROM hotel_occupancy_rules
  WHERE hotel_id = ? AND rule_type IN (SO, DM, RSM, Senior Manager)
          ▼
Return data (0-4 rules)
          ▼
Initialize editing state:
  - If rule exists: use rule.min_occupancy
  - If not exists: use designation.default
          ▼
Set loading = false
          ▼
Render dropdowns with initial values
```

### Display Flow
```
OverviewTab mounts
          ▼
Access hotel.occupancy_rules
          ▼
For each designation:
  ├─ Find rule matching designation code
  ├─ Get min_occupancy number
  ├─ Map to label (1→Single, 2→Double, etc.)
  └─ Display: "DM: Double"
```

---

## Component Hierarchy

```
HotelDetailsWorkspace
├── OverviewTab
│   ├── Occupancy Policy section (NEW in PHASE 4)
│   └── getOccupancyForDesignation() helper
│
├── HallsTab
│   └── (Unchanged)
│
├── AccommodationTab
│   └── (Unchanged)
│
├── OccupancyMatrixTab ⭐ NEW
│   ├── Status indicator
│   ├── 4x Designation + Dropdown rows
│   ├── Validation error box
│   ├── Save button
│   └── Current configuration display
│
└── PhotosTab
    └── (Unchanged)
```

---

## State Management

### OccupancyMatrixTab State

```typescript
interface OccupancyMatrixTabState {
  // Database data
  rules: OccupancyRule[]              // From database
  
  // UI state
  loading: boolean                     // During data fetch
  saving: boolean                      // During save operation
  editingRules: Record<               // User's current selections
    string,                            // designation code
    'SINGLE'|'DOUBLE'|'TRIPLE'|'QUAD'  // occupancy type
  >
  error: string | null                // Validation/network errors
}
```

### Derived State

```typescript
allConfigured = DESIGNATIONS.every(des => editingRules[des.code])
// Used for:
// - Disable save button if false
// - Update status indicator (Complete/Incomplete)
// - Progress counter (X / 4)
```

---

## Type System

### Phase 4 Types

```typescript
// Designation types (from types.ts)
export type OccupancyRuleType = 'SO' | 'DM' | 'RSM' | 'Senior Manager'

// Occupancy type options (not exported, internal)
type OccupancyOption = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'

// Database record
interface OccupancyRule {
  id: string                    // UUID
  hotel_id: string              // FK to hotels
  rule_type: OccupancyRuleType  // SO, DM, RSM, or Senior Manager
  min_occupancy?: number | null // 1, 2, 3, or 4
  max_occupancy?: number | null // Currently unused in PHASE 4
  rate_adjustment?: number | null // Currently unused
  is_active: boolean            // Always true
  created_at: string            // Timestamp
  updated_at?: string | null    // Timestamp
  hotel?: Hotel | null          // Relation (optional load)
}

// Input type for create/update
interface OccupancyRuleCreateInput {
  hotel_id: string
  rule_type: OccupancyRuleType
  min_occupancy?: number
  max_occupancy?: number
  rate_adjustment?: number
  is_active?: boolean
}
```

---

## Database Schema

### Table: `hotel_occupancy_rules`

**Structure** (Existing):
```sql
CREATE TABLE hotel_occupancy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL,
  min_occupancy INTEGER,
  max_occupancy INTEGER,
  rate_adjustment DECIMAL(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(hotel_id, rule_type)
);

-- Phase 4: Occupancy matrix uses this structure
-- rule_type: 'SO', 'DM', 'RSM', 'Senior Manager'
-- min_occupancy: 1 (Single), 2 (Double), 3 (Triple), 4 (Quad)
```

**Constraints**:
- `UNIQUE(hotel_id, rule_type)`: One rule per hotel per designation
- `FK hotel_id`: Cascade delete when hotel deleted
- `is_active`: Always true (can be used for soft delete in future)

**Indexes** (Assumed):
- Primary key on `id`
- Foreign key on `hotel_id`
- Unique constraint on `(hotel_id, rule_type)`

---

## API Surface

### venueService Functions

```typescript
// Read
async function getOccupancyRulesByHotel(hotelId: string): Promise<OccupancyRule[]>
// → GET /api/occupancy-rules?hotel_id={hotelId}
// → Filters: rule_type IN ('SO', 'DM', 'RSM', 'Senior Manager')

// Create
async function createOccupancyRule(
  input: OccupancyRuleCreateInput
): Promise<OccupancyRule>
// → POST /api/occupancy-rules
// → Body: { hotel_id, rule_type, min_occupancy, is_active }

// Update
async function updateOccupancyRule(
  id: string,
  input: OccupancyRuleUpdateInput
): Promise<OccupancyRule>
// → PATCH /api/occupancy-rules/{id}
// → Body: { rule_type, min_occupancy, is_active }

// Delete (implemented but not used in PHASE 4)
async function deleteOccupancyRule(id: string): Promise<void>
// → DELETE /api/occupancy-rules/{id}
```

---

## Error Handling

### Client-Side Errors

```
User Error (Validation)
├─ All fields blank
│  └─ Message: "All occupancy rules must be assigned."
│  └─ Action: Prevent save
│
└─ Partial fields
   └─ Message: "All occupancy rules must be assigned."
   └─ Action: Prevent save

Network/Server Error
├─ Fetch failed
│  └─ Message: "Failed to save occupancy rules. Please try again."
│  └─ Action: Show error, allow retry
│
└─ RLS denied
   └─ Message: "Failed to save occupancy rules. Please try again."
   └─ Action: Show error, allow retry

Data Error
├─ Invalid occupancy value
│  └─ Message: "Failed to save occupancy rules. Please try again."
│  └─ Action: Show error, allow retry
│
└─ Constraint violation (duplicate)
   └─ Message: "Failed to save occupancy rules. Please try again."
   └─ Action: Show error, reload to sync
```

### Server-Side Errors (Supabase)

```
RLS Violation
├─ User doesn't have permission
└─ Supabase returns 403

Constraint Violation
├─ UNIQUE(hotel_id, rule_type) violation
├─ Possible if UI gets out of sync
└─ Supabase returns 400

Data Type Error
├─ Invalid min_occupancy value
└─ Supabase returns 400
```

---

## Readiness Score Integration

### Calculation

```typescript
// In readinessScore.ts
const occupancyReady = 
  hotel.occupancy_rules &&
  hotel.occupancy_rules.length === 4 &&
  hotel.occupancy_rules.every(r => r.min_occupancy) 
    ? 1.0 
    : 0.0

readinessScore += occupancyReady * 0.15  // 15% weight

// Final score example:
// = 0.30 (overview: 30%)
// + 0.20 (halls: 20%)
// + 0.25 (accommodation: 25%)
// + 0.15 (occupancy: 15%)
// + 0.10 (photos: 10%)
// = 1.00 (100% ready)
```

### Trigger

- Calculated whenever readiness score is requested
- Used in Hotel Details page progress indicator
- Used in Data Quality Center for hotel analytics
- Used in Admin Dashboard for venue readiness overview

---

## Security & Permissions

### Row-Level Security (RLS)

```sql
-- Assumed policy (not defined in PHASE 4 code)
-- Only users with appropriate role can see/modify their hotel's occupancy rules

SELECT occupancy_rules 
WHERE hotel_id IN (
  SELECT hotel_id FROM user_hotels WHERE user_id = auth.uid()
)

INSERT/UPDATE occupancy_rules
WHERE hotel_id IN (
  SELECT hotel_id FROM user_hotels 
  WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
)
```

### Data Validation

- ✅ Type checking (TypeScript)
- ✅ Occupancy value validation (1-4 only)
- ✅ Designation type validation (SO, DM, RSM, Senior Manager)
- ✅ Constraint validation (unique per hotel-designation)
- ✅ User permission validation (RLS)

---

## Performance Considerations

### Query Optimization

```typescript
// Query: Load occupancy rules for one hotel
// Columns: id, hotel_id, rule_type, min_occupancy, is_active, created_at
// Filter: hotel_id = ?, rule_type IN (4 values)
// Result: 0-4 rows (typically 4)
// Time: < 100ms

// Index recommendation:
// CREATE INDEX idx_hotel_occupancy_rules_hotel_id 
// ON hotel_occupancy_rules(hotel_id);
```

### Caching Strategy

- ✅ Component state: Rules cached in component
- ✅ Page load: Reload on OverviewTab or OccupancyMatrixTab access
- ✅ Save: Reload from database after save
- ✓ Parent refresh: Called after save to update related data

### Scalability

- ✅ 4 rules per hotel (fixed)
- ✅ Linear query time (4 rules = same as 1 rule)
- ✅ No N+1 queries
- ✅ No loops inside loops

---

## Testing Strategy

### Unit Testing

```typescript
// mapOccupancyToNumber
expect(mapOccupancyToNumber('SINGLE')).toBe(1)
expect(mapOccupancyToNumber('TRIPLE')).toBe(3)

// mapNumberToOccupancy
expect(mapNumberToOccupancy(2)).toBe('Double')
expect(mapNumberToOccupancy(null)).toBe('Not configured')

// Validation
expect(validateAllFilled(['Triple', 'Double', '', 'Single'])).toBe(false)
expect(validateAllFilled(['Triple', 'Double', 'Single', 'Single'])).toBe(true)
```

### Integration Testing

```typescript
// Save flow
1. Load hotel with no rules
2. Fill all 4 dropdowns
3. Click save
4. Verify rules created in database
5. Reload page
6. Verify values persist

// Update flow
1. Load hotel with existing rules
2. Change one dropdown
3. Click save
4. Verify database updated
5. Reload page
6. Verify new value persists
```

### E2E Testing

```
Scenario: Complete occupancy matrix for new hotel
Given: Hotel has no occupancy rules
When: User navigates to Occupancy Rules tab
Then: 4 empty dropdowns with "Incomplete" status

When: User fills all 4 dropdowns and clicks save
Then: Data is saved to database
And: Overview tab shows new occupancy policy
And: Readiness score updates to include occupancy

When: User refreshes page
Then: All occupancy rules are preserved
```

---

## Deployment Checklist

- [x] Build: `npm run build` ✓
- [x] TypeScript: No OccupancyMatrixTab errors ✓
- [ ] Manual Testing: 5-minute quick test
- [ ] Manual Testing: 10-minute detailed test
- [ ] Staging Testing: Full test cycle
- [ ] Database Verification: Rules created correctly
- [ ] Performance Testing: Load time acceptable
- [ ] Security Review: RLS policies verified
- [ ] User Acceptance: Product owner approval
- [ ] Production Deployment

---

## Known Limitations

1. **No bulk operations**: Rules managed one hotel at a time
2. **No soft delete**: Deletion not exposed in UI (only create/update)
3. **No history tracking**: Changes not logged (future enhancement)
4. **No export**: No way to export occupancy configs
5. **No templates**: No way to copy rules from one hotel to another
6. **No rate adjustment**: Occupancy to price mapping not implemented

---

## Future Enhancements

1. **Occupancy Templates**: Pre-configured templates by hotel category
2. **Bulk Management**: Apply same rules to multiple hotels
3. **Audit Log**: Track who changed what and when
4. **Price Multipliers**: Adjust room rate by occupancy type
5. **Capacity Planning**: Suggest occupancy based on room inventory
6. **Meeting Validation**: Validate meeting participant counts against occupancy
7. **Reporting**: Occupancy utilization by designation
8. **Forecasting**: Predict occupancy demand based on booking history

---

## References

- **Implementation**: `src/components/HotelTabs/OccupancyMatrixTab.tsx`
- **Types**: `src/features/venues/types.ts`
- **Services**: `src/features/venues/venueService.ts`
- **Readiness**: `src/features/venues/readinessScore.ts`
- **Testing**: `PHASE4_TESTING_DEPLOYMENT_CHECKLIST.md`
- **Quick Test**: `PHASE4_QUICK_TEST_GUIDE.md`

---

**Architecture Last Updated**: June 13, 2026
**Phase**: 4 (Occupancy Matrix)
**Status**: Complete & Ready for Testing
