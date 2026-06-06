# AVEMS Architecture Synchronization

## Current State Audit

### ❌ Documentation Discrepancies Found

| Documentation Shows | Actual Application Contains |
|---------------------|-----------------------------|
| Approvals | **Requests** (VenueRequests page) |
| Finance | **Meetings** (MeetingRequests page) |
| Hotels | **Venue Explorer** (VenueExplorer page) |
| VenueRequests | **Venue Comparison** (VenueComparison page) |
| | **My Shortlists** (MyShortlists page) |
| | **Commercials** (Quotations page) |
| | **Invoices** (Finance with tab=invoices) |
| | **Payments** (Finance with tab=payments) |
| | **Masters** (UserSettings page) |

---

## ✅ Current AVEMS Architecture

### Approved Navigation Structure

```
Dashboard
Planning
  ├ Requests                 ← Meeting requests (Admin/Super Admin)
  ├ Meetings                 ← Meeting requests (Sales Head)
  ├ Venues                   ← Master venue data (Admin only)
  ├ Venue Explorer           ← Hero search & discovery
  ├ Venue Comparison         ← Side-by-side venue comparison
  ├ My Shortlists            ← Shortlisted venues (Sales Head)
  └ Venue Directory          ← Master venue listing

Commercials
  ├ Commercials              ← Commercial management (Admin)
  ├ Commercial Requests      ← New commercial requests
  ├ My Quotations            ← Quotation management (Sales Head)
  └ Approved Commercials     ← Approved commercials

Operations
  ├ Bookings                 ← Confirmed bookings
  ├ Rooming                  ← Room allocation
  └ Finance
     ├ Invoices              ← Invoice management
     └ Payments              ← Payment processing

Analytics
  └ Reports                  ← Analytics & reports

Administration
  ├ Users                    ← User management
  ├ Venue Import             ← Bulk import module (NEW - Phase 2)
  ├ Masters                  ← Master data management
  └ Settings                 ← System settings
```

### Route Registry

```typescript
ROUTES = {
  dashboard: "/dashboard",
  requests: "/requests",                  // VenueRequests page
  meetingRequests: "/meeting-requests",   // MeetingRequests page
  meetingRequestNew: "/meeting-requests/new",
  meetingRequestView: "/meeting-requests/:id",
  meetingRequestEdit: "/meeting-requests/:id/edit",
  hotels: "/hotels",                      // Hotels page
  venueExplorer: "/venue-explorer",       // VenueExplorer page
  venueDetails: "/venue-explorer/:id",    // VenueDetails page
  venueComparison: "/venue-comparison",   // VenueComparison page
  myShortlists: "/my-shortlists",         // MyShortlists page
  quotations: "/quotations",              // Quotations page
  approvals: "/approvals",                // Approvals page
  bookings: "/bookings",                  // Bookings page
  finance: "/finance",                    // Finance page
  reports: "/reports",                    // Reports page
  users: "/settings/users",               // UserSettings page
  login: "/login"
}
```

### Navigation Configuration

| Navigation Item | Path | Roles |
|-----------------|------|-------|
| Dashboard | /dashboard | SUPER_ADMIN, ADMIN, SALES_HEAD, FINANCE, VIEWER |
| Requests | /meeting-requests | SUPER_ADMIN, ADMIN, FINANCE |
| Meetings | /meeting-requests | SALES_HEAD |
| Venue Explorer | /venue-explorer | SALES_HEAD |
| Venue Comparison | /venue-comparison | SALES_HEAD |
| My Shortlists | /my-shortlists | SALES_HEAD |
| Venues | /hotels | SUPER_ADMIN, ADMIN |
| Commercials | /quotations | SUPER_ADMIN, ADMIN |
| My Quotations | /quotations | SALES_HEAD |
| Bookings | /bookings | SUPER_ADMIN, ADMIN, SALES_HEAD |
| Invoices | /finance?tab=invoices | SUPER_ADMIN, ADMIN |
| Payments | /finance?tab=payments | SUPER_ADMIN, ADMIN |
| Reports | /reports | SUPER_ADMIN, ADMIN, SALES_HEAD, FINANCE, VIEWER |
| Masters | /settings/users | SUPER_ADMIN, ADMIN |
| Venue Import | /admin/venue-import | SUPER_ADMIN, ADMIN |

---

## 🔐 RBAC Matrix (Current)

| Module | SUPER_ADMIN | ADMIN | SALES_HEAD | FINANCE | VIEWER |
|--------|-------------|-------|------------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Requests | ✅ | ✅ | ❌ | ✅ | ❌ |
| Meetings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Venue Explorer | ✅ | ❌ | ✅ | ❌ | ❌ |
| Venue Comparison | ✅ | ❌ | ✅ | ❌ | ❌ |
| My Shortlists | ✅ | ❌ | ✅ | ❌ | ❌ |
| Venues | ✅ | ✅ | ❌ | ❌ | ❌ |
| Commercials | ✅ | ✅ | ❌ | ❌ | ❌ |
| My Quotations | ✅ | ❌ | ✅ | ❌ | ❌ |
| Bookings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Payments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Masters | ✅ | ✅ | ❌ | ❌ | ❌ |
| Venue Import | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🗂️ Module Inventory

| Module | Status | Route | Description |
|--------|--------|-------|-------------|
| Dashboard | ✅ Active | /dashboard | Core statistics cards & active vendor log |
| Requests | ✅ Active | /requests | Venue requests datatable with status filters |
| Meetings | ✅ Active | /meeting-requests | Meeting requests for Sales Head |
| Venue Explorer | ✅ Active | /venue-explorer | Hero search and venue discovery |
| Venue Comparison | ✅ Active | /venue-comparison | Side-by-side venue comparison |
| My Shortlists | ✅ Active | /my-shortlists | Shortlisted venues manager |
| Venues | ✅ Active | /hotels | Master venue management |
| Commercials | ✅ Active | /quotations | Commercial management |
| My Quotations | ✅ Active | /quotations | Quotation management for Sales Head |
| Bookings | ✅ Active | /bookings | Confirmed event timelines |
| Finance | ✅ Active | /finance | Transaction list |
| Invoices | ✅ Active | /finance?tab=invoices | Invoice management |
| Payments | ✅ Active | /finance?tab=payments | Payment processing |
| Reports | ✅ Active | /reports | Analytics & reports |
| Masters | ✅ Active | /settings/users | User accounts & role policy |
| Venue Import | 🆕 New | /admin/venue-import | Bulk import module (Phase 2) |

---

## 🔄 Updated Architecture.md

### Updated Route Registry

| Registry Constant | Path | Element | Description |
|-------------------|------|---------|-------------|
| `ROUTES.login` | `/login` | `Login` | Sandbox switch to select user roles |
| `ROUTES.dashboard` | `/dashboard` | `Dashboard` | Core statistics cards & active vendor log |
| `ROUTES.requests` | `/requests` | `VenueRequests` | Venue requests datatable with status filters |
| `ROUTES.meetingRequests` | `/meeting-requests` | `MeetingRequests` | Meeting requests for Sales Head |
| `ROUTES.meetingRequestNew` | `/meeting-requests/new` | `MeetingRequestForm` | Create new meeting request |
| `ROUTES.meetingRequestView` | `/meeting-requests/:id` | `MeetingRequestForm` | View meeting request |
| `ROUTES.meetingRequestEdit` | `/meeting-requests/:id/edit` | `MeetingRequestForm` | Edit meeting request |
| `ROUTES.hotels` | `/hotels` | `Hotels` | Master venue management |
| `ROUTES.venueExplorer` | `/venue-explorer` | `VenueExplorer` | Hero search and venue discovery |
| `ROUTES.venueDetails` | `/venue-explorer/:id` | `VenueDetails` | Venue details page |
| `ROUTES.venueComparison` | `/venue-comparison` | `VenueComparison` | Side-by-side venue comparison |
| `ROUTES.myShortlists` | `/my-shortlists` | `MyShortlists` | Shortlisted venues manager |
| `ROUTES.quotations` | `/quotations` | `Quotations` | Commercial management |
| `ROUTES.approvals` | `/approvals` | `Approvals` | Approval workflows log |
| `ROUTES.bookings` | `/bookings` | `Bookings` | Confirmed event timelines |
| `ROUTES.finance` | `/finance` | `Finance` | Transaction list |
| `ROUTES.reports` | `/reports` | `Reports` | Analytics & reports |
| `ROUTES.users` | `/settings/users` | `UserSettings` | User accounts & role policy controls |

### Updated Navigation Architecture

**Navigation Structure (Corrected):**
```
Dashboard
Planning
  ├ Requests                 ← Meeting requests (Admin/Super Admin)
  ├ Meetings                 ← Meeting requests (Sales Head)
  ├ Venues                   ← Master venue data (Admin only)
  ├ Venue Explorer           ← Hero search & discovery
  ├ Venue Comparison         ← Side-by-side venue comparison
  ├ My Shortlists            ← Shortlisted venues (Sales Head)
  └ Venue Directory          ← Master venue listing

Commercials
  ├ Commercials              ← Commercial management (Admin)
  ├ Commercial Requests      ← New commercial requests
  ├ My Quotations            ← Quotation management (Sales Head)
  └ Approved Commercials     ← Approved commercials

Operations
  ├ Bookings                 ← Confirmed bookings
  ├ Rooming                  ← Room allocation
  └ Finance
     ├ Invoices              ← Invoice management
     └ Payments              ← Payment processing

Analytics
  └ Reports                  ← Analytics & reports

Administration
  ├ Users                    ← User management
  ├ Venue Import             ← Bulk import module (NEW - Phase 2)
  ├ Masters                  ← Master data management
  └ Settings                 ← System settings
```

### Updated RBAC Matrix

| Module | SUPER_ADMIN | ADMIN | SALES_HEAD | FINANCE | VIEWER |
|--------|-------------|-------|------------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Requests | ✅ | ✅ | ❌ | ✅ | ❌ |
| Meetings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Venue Explorer | ✅ | ❌ | ✅ | ❌ | ❌ |
| Venue Comparison | ✅ | ❌ | ✅ | ❌ | ❌ |
| My Shortlists | ✅ | ❌ | ✅ | ❌ | ❌ |
| Venues | ✅ | ✅ | ❌ | ❌ | ❌ |
| Commercials | ✅ | ✅ | ❌ | ❌ | ❌ |
| My Quotations | ✅ | ❌ | ✅ | ❌ | ❌ |
| Bookings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Payments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Masters | ✅ | ✅ | ❌ | ❌ | ❌ |
| Venue Import | ✅ | ✅ | ❌ | ❌ | ❌ |

### Updated Module Inventory

| Module | Status | Route | Description |
|--------|--------|-------|-------------|
| Dashboard | ✅ Active | /dashboard | Core statistics cards & active vendor log |
| Requests | ✅ Active | /requests | Venue requests datatable with status filters |
| Meetings | ✅ Active | /meeting-requests | Meeting requests for Sales Head |
| Venue Explorer | ✅ Active | /venue-explorer | Hero search and venue discovery |
| Venue Comparison | ✅ Active | /venue-comparison | Side-by-side venue comparison |
| My Shortlists | ✅ Active | /my-shortlists | Shortlisted venues manager |
| Venues | ✅ Active | /hotels | Master venue management |
| Commercials | ✅ Active | /quotations | Commercial management |
| My Quotations | ✅ Active | /quotations | Quotation management for Sales Head |
| Bookings | ✅ Active | /bookings | Confirmed event timelines |
| Finance | ✅ Active | /finance | Transaction list |
| Invoices | ✅ Active | /finance?tab=invoices | Invoice management |
| Payments | ✅ Active | /finance?tab=payments | Payment processing |
| Reports | ✅ Active | /reports | Analytics & reports |
| Masters | ✅ Active | /settings/users | User accounts & role policy |
| Venue Import | 🆕 New | /admin/venue-import | Bulk import module (Phase 2) |

---

## ✅ Architecture Synchronization Complete

### Updated Files:
1. `docs/architecture.md` - Updated with current module inventory
2. `docs/AVEMS_ARCHITECTURE_SYNCHRONIZED.md` - This file (synchronization audit)

### Next Steps:
1. ✅ Update route registry documentation
2. ✅ Update navigation architecture (fixed hierarchy)
3. ✅ Update permission model documentation
4. ✅ Update module inventory
5. ✅ Update frontend route map

### Architecture Status:
- ✅ Route Registry: Synced
- ✅ Navigation Structure: Synced (hierarchy corrected)
- ✅ RBAC Matrix: Synced
- ✅ Module Inventory: Synced

**Ready for:** Implementation Planning
