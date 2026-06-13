# VENUE MANAGEMENT - IMPLEMENTATION ROADMAP

**Status:** Post-Critical Fixes  
**Last Updated:** June 13, 2026  
**Owner:** Development Team

---

## PHASE 0: CRITICAL FIX (COMPLETED ✅)

### Completed
- ✅ Fixed `fetchMyShortlists()` API query (venue_photos relation)
- ✅ Fixed `fetchShortlistsForRequest()` API query (venue_photos relation)
- ✅ Updated Hotels.tsx placeholder alert message

### Verification
After deployment:
1. Navigate to `/my-shortlists`
2. Should load without error (shows "No Recommendations Yet" if empty)
3. Or shows shortlist cards with hotel details + photos

---

## PHASE 1: ROUTING REALIGNMENT (2-3 hours)

### Objective
Fix navigation menu to match actual functionality and create missing routes.

### 1.1 Create Route Registry Updates
**File:** Update `src/routes/routeRegistry.ts`

**Add new routes:**
```typescript
export const ROUTES = {
  // ... existing routes ...
  hotelsList: "/administration/hotels",           // NEW
  hotelNew: "/administration/hotels/new",         // NEW
  hotelDetail: "/administration/hotels/:id",      // NEW
  hallsList: "/administration/halls",             // NEW
  hallNew: "/administration/halls/new",           // NEW
  hallDetail: "/administration/halls/:id",        // NEW
  photoRepository: "/administration/photos",      // NEW
  photoGallery: "/administration/photos/:id",     // NEW
} as const;
```

**Rationale:**
- Group venue admin items under `/administration` (consistent with venues pattern)
- Use full paths to avoid conflicts with sales features

### 1.2 Update Navigation Configuration
**File:** `src/config/navigationGroups.ts`

**Replace Venues menu items:**
```typescript
{
  id: 'venues',
  name: 'Venues',
  iconName: 'Hotel',
  roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD],
  submenus: [
    {
      name: 'Venue Explorer',
      path: ROUTES.venueExplorer,
      iconName: 'Search',
      roles: [ROLES.SUPER_ADMIN, ROLES.SALES_HEAD]
    },
    {
      name: 'My Shortlists',
      path: ROUTES.myShortlists,
      iconName: 'Bookmark',
      roles: [ROLES.SUPER_ADMIN, ROLES.SALES_HEAD]
    },
    // ADMIN-ONLY ITEMS
    {
      name: 'Hotel Partners',
      path: ROUTES.hotelsList,
      iconName: 'Building2',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      name: 'Meeting Halls',
      path: ROUTES.hallsList,
      iconName: 'DoorOpen',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      name: 'Photo Gallery',
      path: ROUTES.photoRepository,
      iconName: 'Image',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }
  ]
}
```

**Changes:**
- Remove duplicate "Venue Directory" item
- Rename items for clarity
- Update paths to new routes
- Keep only 5 items (remove clutter)

### 1.3 Update App.tsx Routes
**File:** `src/App.tsx`

**Add route handlers:**
```typescript
<Route path={ROUTES.hotelsList} element={
  <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
    <AppLayout>
      <HotelsListing />
    </AppLayout>
  </ProtectedRoute>
} />

<Route path={ROUTES.hallsList} element={
  <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
    <AppLayout>
      <HallsListing />
    </AppLayout>
  </ProtectedRoute>
} />

<Route path={ROUTES.photoRepository} element={
  <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
    <AppLayout>
      <PhotoRepository />
    </AppLayout>
  </ProtectedRoute>
} />
```

### Effort
- Route registry: 10 minutes
- Navigation config: 15 minutes
- App.tsx updates: 15 minutes
- **Total:** 40 minutes

---

## PHASE 2: HOTELS MANAGEMENT PAGE (4-5 hours)

### Objective
Implement hotel listing and CRUD functionality at `/administration/hotels`

### 2.1 Create HotelsListing Component
**File:** Create `src/pages/HotelsListing.tsx`

**Features:**
- Table/grid view of all hotels
- Columns: Hotel Name, City, Category, Status, Rooms, Halls, Actions
- Filters: Zone, City, Category, Status
- Search: Hotel name, address
- Actions: View, Edit, Delete, View Details

**Code Structure:**
```typescript
import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { getHotels } from '../features/venues/venueService';
import { HotelFormModal } from '../components/HotelFormModal';
import type { Hotel } from '../features/venues/types';

export function HotelsListing() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      setLoading(true);
      const data = await getHotels();
      setHotels(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: '800', marginBottom: 'var(--space-1)' }}>
            Hotel Partners
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage {hotels.length} hotel properties and their details
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedHotel(null);
            setIsFormOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} /> Add Hotel
        </button>
      </div>

      {/* Loading */}
      {loading && <div>Loading hotels...</div>}

      {/* Error */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Table */}
      {!loading && hotels.length > 0 && (
        <div className="card">
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Hotel Name</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>City</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Category</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(hotel => (
                <tr key={hotel.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-3)' }}>{hotel.hotel_name}</td>
                  <td style={{ padding: 'var(--space-3)' }}>—</td>
                  <td style={{ padding: 'var(--space-3)' }}>{hotel.hotel_category || '—'}</td>
                  <td style={{ padding: 'var(--space-3)' }}>{hotel.status}</td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right', display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button onClick={() => {/* navigate to detail */}} title="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => {
                      setSelectedHotel(hotel);
                      setIsFormOpen(true);
                    }} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => {/* delete */}} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && hotels.length === 0 && (
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Building2 size={48} style={{ opacity: 0.3, marginBottom: 'var(--space-4)' }} />
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
            No hotels yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            Create your first hotel property to get started
          </p>
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> Create Hotel
          </button>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <HotelFormModal
          hotel={selectedHotel}
          onClose={() => setIsFormOpen(false)}
          onSave={() => {
            setIsFormOpen(false);
            loadHotels();
          }}
        />
      )}
    </div>
  );
}
```

### Effort
- Component structure: 1 hour
- Table implementation: 1 hour
- Filters/search: 1 hour
- Styling/polish: 1 hour
- **Total:** 4 hours

---

## PHASE 3: HALLS MANAGEMENT PAGE (4-5 hours)

### Objective
Extract hall management from hotel tabs into dedicated listing page

### 3.1 Create HallsListing Component
**File:** Create `src/pages/HallsListing.tsx`

**Features:**
- List all halls across all hotels
- Display: Hall Name, Hotel, Capacity, Type, Status
- Filters: Hotel, Type, Status, Min Capacity
- Search: Hall name
- Actions: View, Edit, Delete
- Bulk capacity view

**Implementation Pattern:**
- Similar to HotelsListing
- Load halls via `getHallsByHotel()` across all hotels
- Add filter controls

### 3.2 Extract Hall Detail Component
**File:** Rename/move `src/components/HotelTabs/HallsTab.tsx` → `src/components/HallFormModal.tsx` (already exists, extend it)

**Extend HallFormModal:**
- Add delete button
- Add view-only mode for details page
- Add cancel/save actions

### 3.3 Create HallDetail Page
**File:** Create `src/pages/HallDetail.tsx`

**Features:**
- Show hall details
- Edit form (modal or inline)
- Photos gallery for this hall
- Occupancy rules specific to this hall
- Back to hall listing

### Effort
- HallsListing: 3 hours
- HallDetail: 1.5 hours
- Component extraction: 0.5 hours
- **Total:** 5 hours

---

## PHASE 4: PHOTO REPOSITORY PAGE (3-4 hours)

### Objective
Create dedicated photo management page

### 4.1 Create PhotoRepository Component
**File:** Create `src/pages/PhotoRepository.tsx`

**Features:**
- Grid view of all photos (hotel + hall)
- Filters: Hotel, Hall, Photo Type, Primary Only
- Search: caption/alt text
- Upload new photos
- Set primary photo
- Reorder photos
- Delete photos

**Implementation:**
```typescript
// Load all photos for admin
const { data: photos } = await supabase
  .from('venue_photos')
  .select(`
    id, photo_url, photo_type, display_order, is_primary,
    hotel_id, hall_id, caption,
    hotel:hotel_id ( id, hotel_name ),
    hall:hall_id ( id, hall_name )
  `)
  .order('display_order');
```

### 4.2 Create PhotoGallery Component
**File:** Create `src/components/PhotoGallery.tsx`

**Features:**
- Masonry/grid layout
- Lightbox viewer
- Drag-to-reorder
- Quick edit captions
- Batch delete

### 4.3 Photo Upload Component
**File:** Extend `src/components/HotelTabs/PhotosTab.tsx` → Extract to shared component

**Location:** `src/components/PhotoUploader.tsx`

### Effort
- PhotoRepository page: 2 hours
- PhotoGallery component: 1.5 hours
- Upload/reorder logic: 1 hour
- **Total:** 4.5 hours

---

## PHASE 5: INTEGRATION & TESTING (3-4 hours)

### 5.1 Route Integration
- Test all new routes load correctly
- Test navigation between pages
- Test breadcrumbs/back buttons
- Test role-based access (admin only)

### 5.2 Cross-Page Navigation
- Link from hotel listing → hotel detail
- Link from hall listing → hall detail
- Link from photo gallery → source hotel/hall
- Link back to listings

### 5.3 Data Consistency
- Test create/edit/delete operations
- Test related data updates (e.g., delete hotel cascades to halls/photos)
- Test error handling
- Test loading states

### 5.4 UI/UX Polish
- Consistent styling across pages
- Loading spinners
- Error messages
- Empty states
- Responsive design

### 5.5 Performance Optimization
- Lazy load images in gallery
- Paginate large lists (100+ items)
- Optimize photo grid rendering
- Cache hotel/hall lookups

### Effort
- Route testing: 1 hour
- Data validation: 1 hour
- UI/UX polish: 1 hour
- Performance: 1 hour
- **Total:** 4 hours

---

## TOTAL EFFORT SUMMARY

| Phase | Name | Hours | Status |
|-------|------|-------|--------|
| 0 | Critical Fix | 0.25 | ✅ DONE |
| 1 | Routing Realignment | 0.75 | 📋 READY |
| 2 | Hotels Management | 4 | 📋 READY |
| 3 | Halls Management | 5 | 📋 READY |
| 4 | Photo Repository | 4.5 | 📋 READY |
| 5 | Integration & Testing | 4 | 📋 READY |
| **TOTAL** | | **18.5** | |

**Timeline:** 3-4 working days for one developer  
**Alternative:** 2 developers × 2 days (parallel work)

---

## PRIORITY SEQUENCE

1. **THIS SPRINT** (Today)
   - ✅ Phase 0: Critical fix (15 min)
   - ✅ Deploy & verify My Shortlists works
   - ✅ Phase 1: Routing (1 hour)

2. **TOMORROW**
   - Phase 2: Hotels listing (4 hours)
   - Phase 5: Basic testing (2 hours)

3. **NEXT 2 DAYS**
   - Phase 3: Halls management (5 hours)
   - Phase 4: Photo repository (4.5 hours)
   - Phase 5: Full integration & testing (2 hours)

---

## REUSABLE COMPONENTS TO CREATE

These components will be used across multiple pages:

1. **ListingContainer** - Common header, filters, actions
2. **DataTable** - Sortable, filterable table component
3. **GridView** - Reusable grid for photos/items
4. **FormModal** - Modal wrapper for create/edit forms
5. **FilterBar** - Reusable filter UI
6. **ActionMenu** - Dropdown for row actions

---

## TESTING CHECKLIST

- [ ] Phase 0 Fix: My Shortlists loads without error
- [ ] Phase 1: All routes accessible to admin users
- [ ] Phase 1: Navigation menu updated correctly
- [ ] Phase 2: Hotel listing shows all hotels
- [ ] Phase 2: Hotel create/edit/delete works
- [ ] Phase 2: Hotel filters work
- [ ] Phase 3: Hall listing shows all halls across hotels
- [ ] Phase 3: Hall create/edit/delete works
- [ ] Phase 3: Hall filters work
- [ ] Phase 4: Photo gallery shows all photos
- [ ] Phase 4: Photo upload works
- [ ] Phase 4: Photo reorder works
- [ ] Phase 4: Photo delete works
- [ ] All: Responsive design on mobile
- [ ] All: Error handling shows messages
- [ ] All: Loading states show spinner
- [ ] All: Empty states show helpful message
- [ ] All: Permissions block non-admin users

---

## DEFERRED ENHANCEMENTS (Phase 8+)

These are nice-to-have features that can be added later:

- Advanced photo editing (crop, rotate, filters)
- Batch photo upload with progress
- Photo AI tagging/categorization
- Hotel availability calendar
- Hall booking conflicts detection
- Email alerts for inventory changes
- Photo backup to external storage
- Hotel comparison tool
- Analytics dashboard

---

## DEPENDENCIES

**Must Complete Before:**
- ✅ Database schema (DONE)
- ✅ API services (DONE - just fixed)
- ✅ Type definitions (DONE)
- ✅ Existing components (DONE - can extend)

**Can Work In Parallel:**
- Other project features
- Database migrations
- Performance optimization

---

## NOTES FOR TEAM

1. **Component Reusability:** Extract common patterns into reusable components early
2. **Test Early:** Test each phase with real data before moving to next
3. **Mobile First:** Design responsive from start, not as afterthought
4. **Error Handling:** Comprehensive error messages for debugging
5. **Loading States:** Every async operation should show loading state
6. **Accessibility:** Use semantic HTML, ARIA labels where needed
7. **Performance:** Profile photo grid rendering, optimize if needed

---

## SUCCESS CRITERIA

✅ All 8 phase-claimed features working end-to-end  
✅ No "Coming soon" placeholder messages  
✅ All routes match navigation menu  
✅ No API errors in production  
✅ Mobile responsive design  
✅ 95%+ test coverage for CRUD operations  
✅ Phase 6-7 claims validated and proven

---

## ROLLBACK PLAN

If issues arise during implementation:

1. Keep Phase 0 fix (critical, low risk)
2. Can defer Phases 1-5 until ready
3. All changes are isolated to new files/routes
4. No breaking changes to existing functionality
5. Can safely merge Phase 0 and continue Phase 1+ separately

---

**Next Step:** Approve this roadmap and assign developer to start Phase 1 (Routing Realignment)
