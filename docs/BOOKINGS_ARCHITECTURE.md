# Bookings Module Architecture Guide

## Executive Summary

The Bookings module has been refactored to operate as an **execution and fulfillment center** for confirmed events, separate from the **Meeting Requests module** which handles the planning workflow.

### Key Principle
**Bookings must ALWAYS originate from Meeting Requests. No independent booking creation is allowed.**

---

## Architecture Overview

### Workflow Separation

```
MEETING REQUESTS (Planning Workflow)
├── DRAFT
├── VENUES_SHORTLISTED
├── SUBMITTED_TO_ADMIN
├── AVAILABILITY_CHECK
└── BOOKED
    └── ✨ CREATE BOOKING HERE ✨

BOOKINGS (Execution Workflow)
├── CONFIRMED
├── ACTIVE
├── INVOICE_PENDING
├── PAYMENT_PENDING
└── COMPLETED
```

### Critical Rules

1. **No Orphan Bookings**
   - Every booking MUST reference a valid `meeting_request_id`
   - Database: NOT NULL constraint required
   - UI: Validated before creation

2. **No Standalone Creation**
   - Remove any "Create Booking" buttons from independent UI (✅ Done)
   - Booking creation ONLY through Meeting Request workflow
   - BookingCreate page redirects if no `requestId` provided

3. **Status Definitions are Context-Specific**
   - Meeting Request uses: DRAFT, VENUES_SHORTLISTED, SUBMITTED_TO_ADMIN, etc.
   - Booking uses: CONFIRMED, ACTIVE, INVOICE_PENDING, PAYMENT_PENDING, COMPLETED, CANCELLED
   - Never reuse Meeting Request statuses in Booking context

---

## Data Model

### Booking Entity Updates

**New Operational Progress Fields**

```typescript
// Rooming Progress
rooming_status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
rooming_completed_at?: string

// Invoice Progress
invoice_status?: 'PENDING' | 'RECEIVED' | 'UNDER_VERIFICATION' | 'VERIFIED' | 'APPROVED' | 'REJECTED'
invoice_count?: number
invoice_completed_at?: string

// Payment Progress
payment_status?: 'PENDING' | 'PARTIAL' | 'COMPLETED'
payment_completed_at?: string
```

**Status Mapping**

| Booking Status | Meaning | Typical Duration |
|---|---|---|
| `CONFIRMED` | Venue secured, booking issued | Days until check-in |
| `ACTIVE` | Currently live (check-in ≤ today ≤ check-out) | During event |
| `INVOICE_PENDING` | Awaiting hotel invoice | Days after check-out |
| `PAYMENT_PENDING` | Invoice received, awaiting payment | Days after invoice |
| `COMPLETED` | All operations finished | Terminal state |
| `CANCELLED` | Booking cancelled | Terminal state |

### Derived Status Logic

Booking status may be derived from operational components:

```javascript
if (rooming_status === 'PENDING' || invoice_status === 'PENDING') {
  // Booking is still in progress
  status = 'ACTIVE' or 'INVOICE_PENDING'
}

if (payment_status === 'COMPLETED' && all_tasks_done) {
  status = 'COMPLETED'
}
```

---

## UI Components

### BookingCard Component
**Location**: [src/components/BookingCard.tsx](src/components/BookingCard.tsx)

**Displays**:
- Meeting name + Booking reference
- Hotel, Hall, City
- Check-in/Check-out dates, Pax, Room count
- Operational progress (Rooming, Invoice, Payment)
- Single CTA: "View Booking"

**Design**: Consistent with MeetingRequestCard but operation-focused

### Bookings Page
**Location**: [src/pages/Bookings.tsx](src/pages/Bookings.tsx)

**Features**:
- **Default View**: Card Grid (3 cols desktop, 2 cols tablet, 1 col mobile)
- **Alt View**: Table (power user, localStorage persisted)
- **Filters**:
  - All Bookings
  - Upcoming Events (check-in > today)
  - Active Events (in-progress)
  - Rooming Pending
  - Invoice Pending
  - Payment Pending
  - Completed Events
- **Search**: By booking ref, meeting name, hotel name
- **NO Create Button** (enforces architecture)

### BookingDetails Page
**Location**: [src/pages/BookingDetails.tsx](src/pages/BookingDetails.tsx)

**Planned Sections** (enhancement needed):
1. Event Information
2. Venue Information
3. Reservation Information
4. Rooming Status
5. Invoice Status
6. Payment Status
7. Role-based Actions

---

## Access Control & Routing

### Valid Access Routes to BookingCreate

**ONLY these pages can navigate to booking creation:**

1. **MeetingRequestForm.tsx** (Meeting Details page)
   ```javascript
   navigate(`${ROUTES.bookingNew}?requestId=${id}`)
   ```

2. **MyShortlists.tsx** (My Shortlists page)
   ```javascript
   navigate(`${ROUTES.bookingNew}?requestId=${requestId}&hotelId=${item.hotel_id}`)
   ```

3. **VenueDetails.tsx** (Venue Explorer)
   ```javascript
   navigate(`${ROUTES.bookingNew}?requestId=${requestId}&hotelId=${id}`)
   ```

### Invalid Access Routes (REMOVED)

- ❌ Bookings.tsx - "Create Booking" button (REMOVED)
- ❌ Dashboard.tsx - Direct booking creation link (UPDATED to redirect to Meeting Requests)
- ❌ Direct navigation to `/bookings/new` without query params (REDIRECTS)

### Guard Implementation

**BookingCreate.tsx** enforces:
```typescript
// Redirect immediately if no requestId provided
useEffect(() => {
  if (!requestIdParam) {
    navigate(ROUTES.meetingRequests); // or ROUTES.bookings
  }
}, [requestIdParam, navigate]);
```

---

## Database Constraints (TO-DO)

### Required Constraints

```sql
-- Bookings must reference valid meeting request
ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_meeting_request
FOREIGN KEY (meeting_request_id) 
REFERENCES meeting_requests(id)
ON DELETE RESTRICT; -- Prevent orphans

-- Make meeting_request_id NOT NULL
ALTER TABLE bookings
MODIFY meeting_request_id VARCHAR(255) NOT NULL;

-- Prevent duplicate bookings for same request + venue
ALTER TABLE bookings
ADD UNIQUE KEY unique_request_venue (meeting_request_id, hotel_id);
```

---

## Operational Workflow

### Booking Lifecycle

```
1. CONFIRMED
   - Status: Created
   - User Action: Confirm venue from Meeting Request
   - System: Auto-link accommodation, invoice, payment systems

2. ACTIVE
   - Status: Event ongoing
   - Trigger: check_in_date <= today
   - Tasks: Rooming finalization, last-minute changes

3. INVOICE_PENDING
   - Status: Awaiting hotel invoice
   - Trigger: check_out_date passed, no invoice received
   - Tasks: Follow up with hotel for invoice

4. PAYMENT_PENDING
   - Status: Invoice received, awaiting payment
   - Trigger: Invoice received and verified
   - Tasks: Finance processes payment

5. COMPLETED
   - Status: All done
   - Trigger: Payment received, all tasks closed
   - Archive: Move to completed state
```

### Task Integration

**Rooming** (src/features/rooming/)
- Created automatically when booking is confirmed
- Tracks accommodation plan status
- Updates booking.rooming_status

**Invoices** (src/features/invoices/)
- Created when invoice is received from hotel
- Updates booking.invoice_status
- Triggers payment workflow

**Payments** (src/features/payments/)
- Created after invoice verification
- Updates booking.payment_status
- May indicate completion

---

## Filtering Logic

### Operational Filters Implementation

```typescript
const filteredBookings = bookings.filter((booking) => {
  switch (operationalFilter) {
    case 'upcoming':
      return booking.check_in_date > today;
      
    case 'active':
      return booking.check_in_date <= today 
        && booking.check_out_date >= today;
        
    case 'rooming_pending':
      return booking.rooming_status === 'PENDING' 
        || booking.rooming_status === 'IN_PROGRESS';
        
    case 'invoice_pending':
      return booking.invoice_status === 'PENDING' 
        || booking.invoice_status === 'UNDER_VERIFICATION';
        
    case 'payment_pending':
      return booking.payment_status === 'PENDING' 
        || booking.payment_status === 'PARTIAL';
        
    case 'completed':
      return booking.status === 'COMPLETED';
  }
});
```

---

## Status Indicators & Visual Feedback

### Operational Status Icons

| Status | Icon | Color | Meaning |
|---|---|---|---|
| COMPLETED | ✓ | Green (#10b981) | Task complete |
| IN_PROGRESS | ⟳ | Blue (#3b82f6) | Currently working |
| PENDING | ⚠ | Amber (#f59e0b) | Action needed |
| NOT_STARTED | ○ | Gray (#9ca3af) | Not yet started |
| REJECTED | ✗ | Red (#ef4444) | Rejected/Error |

### Booking Status Colors

- `CONFIRMED` - Indigo (#6366f1)
- `ACTIVE` - Green (#10b981)
- `INVOICE_PENDING` - Amber (#f59e0b)
- `PAYMENT_PENDING` - Amber (#f59e0b)
- `COMPLETED` - Dark Green (#059669)
- `CANCELLED` - Red (#ef4444)

---

## Development Guidelines

### For Backend Developers

1. **Update Booking Service** (bookingService.ts)
   - When fetching bookings, populate operational status fields
   - Join with accommodations, invoices, payments tables
   - Calculate derived status based on component states

2. **Create Status Update Endpoints**
   - `PATCH /api/bookings/:id/rooming-status`
   - `PATCH /api/bookings/:id/invoice-status`
   - `PATCH /api/bookings/:id/payment-status`
   - `PATCH /api/bookings/:id/status` (for final completion)

3. **Add Backend Validations**
   - Prevent booking creation without valid meeting_request_id
   - Enforce unique constraint on meeting_request_id + hotel_id
   - Reject booking updates from invalid workflows

### For Frontend Developers

1. **Creating New Booking Features**
   - Always start from Meeting Request context
   - Never create standalone booking creation flows
   - Use BookingCard component for display consistency

2. **Modifying BookingDetails**
   - Add role-based action buttons
   - Link to rooming, invoice, payment sub-modules
   - Show operational progress clearly

3. **Adding Filters**
   - Extend OPERATIONAL_FILTER_OPTIONS in Bookings.tsx
   - Implement corresponding filter logic in filteredBookings useMemo
   - Persist complex filter selections if needed

4. **Testing Workflow**
   - Verify cannot access `/bookings/new` without requestId
   - Verify cannot create booking from Bookings page
   - Verify all three creation routes work (Shortlists, VenueExplorer, MeetingDetails)
   - Verify operational status indicators display correctly

---

## Migration Checklist

- [ ] Add operational status columns to bookings table
- [ ] Populate existing bookings with default operational status values
- [ ] Update bookingService.ts to fetch and return operational data
- [ ] Add NOT NULL constraint on meeting_request_id
- [ ] Add UNIQUE constraint on (meeting_request_id, hotel_id)
- [ ] Test booking creation from all three valid routes
- [ ] Test redirect when accessing BookingCreate without requestId
- [ ] Test all operational filters work correctly
- [ ] Test view preference persistence (localStorage)
- [ ] Verify BookingCard displays all information correctly
- [ ] Test responsive layout (desktop, tablet, mobile)
- [ ] Verify table view works as alternative
- [ ] Test search functionality
- [ ] Ensure no "Create Booking" buttons exist in independent context

---

## Troubleshooting

### Issue: "Create Booking" button still visible on Bookings page
**Solution**: Refresh page. Button was removed from Bookings.tsx.

### Issue: Cannot create booking from VenueDetails
**Solution**: Ensure `requestId` and `hotelId` query parameters are passed to route.

### Issue: BookingCard not showing operational progress
**Solution**: Check if booking object has rooming_status, invoice_status, payment_status fields populated from database.

### Issue: Filter not working
**Solution**: Verify operational filter value is in OPERATIONAL_FILTER_OPTIONS and corresponding filter logic is implemented.

### Issue: View preference not persisting
**Solution**: Check browser localStorage is enabled and not in private/incognito mode. Clear cache and retry.

---

## References

- **Meeting Request Architecture**: [src/pages/MeetingRequests.tsx](src/pages/MeetingRequests.tsx)
- **Meeting Request Card**: [src/components/MeetingRequestCard.tsx](src/components/MeetingRequestCard.tsx)
- **Booking Types**: [src/features/bookings/types.ts](src/features/bookings/types.ts)
- **Booking Service**: [src/features/bookings/bookingService.ts](src/features/bookings/bookingService.ts)
- **Rooming Module**: [src/features/rooming/](src/features/rooming/)
- **Invoice Module**: [src/features/invoices/](src/features/invoices/)
- **Payment Module**: [src/features/payments/](src/features/payments/)

