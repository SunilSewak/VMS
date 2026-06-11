# Step 3: Request-Driven Venue Discovery - Implementation Plan

## Objective
Transform venue discovery from a generic hotel directory into a request-driven workflow where Meeting Requests become the starting point for venue exploration.

---

## Critical Fixes Required

### 1. **City Filtering Bug** (CRITICAL - P0)
**Issue**: When Delhi is selected, venues from multiple cities appear
**Root Cause**: VenueExplorer auto-populates filters from request but doesn't force immediate search
**Fix**: 
- Ensure `cityId` filter is properly passed to venue query
- Set `hasSearched=true` when loading from request context
- Verify filter actually applies before displaying results

### 2. **Zone Support** (P1)
**Current State**: Zones exist in `meeting_requests.zone` field but cities don't have zone relationships
**Implementation**:
- Add zone mapping constant (North, South, East, West)
- Map cities to zones:
  - Delhi → North
  - Mumbai → West  
  - Chennai → South
  - Bengaluru → South
  - Hyderabad → South
  - Kolkata → East
- Implement zone filtering logic
- City takes precedence over zone when both selected

### 3. **Explore Matching Venues Button** (P1)
**Location**: Meeting Request View page (when viewing a request in read mode)
**Requirements**:
- Only enabled when mandatory fields complete:
  - Zone
  - City
  - Meeting Type
  - Residential/Non-Residential
  - Expected Pax
- Auto-passes filters to Venue Explorer
- Opens Venue Explorer with pre-populated search

### 4. **Shortlist Limit** (P1)
**Current**: No limit
**Required**: Maximum 3 venues per request
**Implementation**:
- Check shortlist count before allowing add
- Display validation message when limit reached
- Show count indicator: "2/3 venues shortlisted"

### 5. **Request Status Updates** (P2)
**Behavior**:
- DRAFT → First venue shortlisted → VENUES_SHORTLISTED
- Don't auto-transition other statuses

---

## Files to Modify

### 1. `src/features/venues/types.ts`
- Add `zone?` field to `City` interface
- Add zone filter to `VenueSearchFilters`

### 2. `src/features/venues/api.ts`
- Add zone filtering logic to `searchVenues()`

### 3. `src/features/venues/hooks.ts`
- Update `useShortlist` to enforce 3-venue limit
- Return shortlist count and canAdd boolean

### 4. `src/pages/VenueExplorer.tsx`
- **FIX**: Ensure city filter applies correctly when loaded from request
- Add zone filter UI
- Implement zone filtering logic
- Show shortlist limit indicator
- Enforce shortlist limit with validation message

### 5. `src/pages/MeetingRequestForm.tsx` (View Mode)
- Add "Explore Matching Venues" button
- Validate mandatory fields before enabling
- Pass request context to Venue Explorer

### 6. NEW: `src/constants/zones.ts`
- Create zone mapping constants
- Export ZONES enum and CITY_ZONE_MAP

---

## Implementation Steps

### Step 1: Create Zone Constants
```typescript
// src/constants/zones.ts
export enum ZONES {
  NORTH = 'North',
  SOUTH = 'South',
  EAST = 'East',
  WEST = 'West',
}

export const CITY_ZONE_MAP: Record<string, ZONES> = {
  // Will map city IDs to zones
};
```

### Step 2: Fix City Filtering Bug
```typescript
// VenueExplorer.tsx - Line ~85
useEffect(() => {
  if (!requestId || !request || hasSearched) return;

  // CRITICAL FIX: Set city filter
  if (request.city_id) {
    console.log('[VenueExplorer] Setting cityId filter:', request.city_id);
    setSelectedCityId(request.city_id);
  }
  
  // Force search to execute
  setHasSearched(true); // THIS MUST HAPPEN
}, [requestId, request, hasSearched]);
```

### Step 3: Add Shortlist Limit
```typescript
// hooks.ts - useShortlist
return {
  shortlistedIds,
  shortlistCount: shortlistedIds.length,
  canAddMore: shortlistedIds.length < 3,
  maxReached: shortlistedIds.length >= 3,
  toggleShortlist,
  loading
};
```

### Step 4: Add Explore Button to Meeting Request View
```typescript
// MeetingRequestForm.tsx - View Mode
const canExploreVenues = !!(
  request.zone &&
  request.city_id &&
  request.meeting_type_id &&
  request.residential_flag !== null &&
  request.expected_pax
);

<button
  disabled={!canExploreVenues}
  onClick={() => navigate(`${ROUTES.venueExplorer}?requestId=${request.id}`)}
  className="btn btn-primary"
>
  <Search size={16} />
  Explore Matching Venues
</button>
```

### Step 5: Implement Zone Filtering
```typescript
// api.ts - searchVenues
// Add zone-based city filtering
if (filters.zoneId && filters.zoneId !== 'all') {
  const citiesInZone = getCitiesForZone(filters.zoneId);
  query = query.in('city_id', citiesInZone);
}

// City overrides zone
if (filters.cityId && filters.cityId !== 'all') {
  query = query.eq('city_id', filters.cityId);
}
```

---

## Validation Checklist

- [ ] Delhi filter shows ONLY Delhi venues
- [ ] Mumbai filter shows ONLY Mumbai venues
- [ ] Zone filtering works (North shows Delhi, Jaipur, etc.)
- [ ] City overrides zone (North + Delhi = Delhi only)
- [ ] "Explore Matching Venues" appears in Meeting Request view
- [ ] Button disabled when mandatory fields missing
- [ ] Filters auto-populate from request
- [ ] User doesn't re-enter information
- [ ] Shortlist limit = 3 enforced
- [ ] Validation message shown at limit
- [ ] Shortlisted venues persist with request
- [ ] Status changes DRAFT → VENUES_SHORTLISTED on first shortlist

---

## Testing Scenarios

### Scenario 1: City Filtering
1. Create request for Delhi
2. Click "Explore Matching Venues"
3. **Verify**: Only Delhi venues appear
4. Change filter to Mumbai
5. **Verify**: Only Mumbai venues appear

### Scenario 2: Zone Filtering
1. Select "North" zone only
2. **Verify**: Delhi, Jaipur, Chandigarh venues appear
3. Select "North" zone + "Delhi" city
4. **Verify**: Only Delhi venues appear (city takes precedence)

### Scenario 3: Shortlist Limit
1. Shortlist Venue 1 → Success
2. Shortlist Venue 2 → Success
3. Shortlist Venue 3 → Success
4. Attempt Venue 4 → **Error**: "Maximum 3 venues can be shortlisted"

### Scenario 4: Request-Driven Flow
1. Create new meeting request (DRAFT)
2. Fill mandatory fields (zone, city, type, pax)
3. **Verify**: "Explore Matching Venues" button enabled
4. Click button
5. **Verify**: Venue Explorer opens with pre-filled filters
6. **Verify**: Search executes automatically
7. Shortlist a venue
8. **Verify**: Request status changes to VENUES_SHORTLISTED

---

## NOT Changed (Scope Boundaries)

✅ Participant Mix - NO CHANGES
✅ Guaranteed Pax - NO CHANGES
✅ Room calculations - NO CHANGES
✅ Occupancy rules - NO CHANGES
✅ Venue upload schema - NO CHANGES
✅ Admin workflow - NO CHANGES
✅ Booking workflow - NO CHANGES
✅ Invoice workflow - NO CHANGES
✅ Payment workflow - NO CHANGES
✅ Dashboard/Home pages - NO CHANGES
✅ RLS policies - NO CHANGES

---

## Success Criteria

1. ✅ City filtering works 100% accurately
2. ✅ Zone filtering implemented
3. ✅ Request-driven venue discovery enabled
4. ✅ Filters auto-populate from request
5. ✅ Shortlist limit enforced
6. ✅ No unrelated module changes

---

**Status**: PLANNING COMPLETE - READY FOR IMPLEMENTATION
