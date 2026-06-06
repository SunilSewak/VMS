# AVEMS Project Foundation & Architecture Documentation

Welcome to the Ajanta Venue & Event Management System (AVEMS) developer documentation.

---

## 📂 Folder Architecture

```text
VMS/
├── docs/                      # Architectural documentation
│   ├── architecture.md        # This file
│   └── AVEMS_ARCHITECTURE_SYNCHRONIZED.md  # Current state audit
├── src/
│   ├── app/                   # App configurations (routing integrations)
│   ├── auth/                  # RBAC definition registries
│   │   └── permissions.ts     # Permission models & Role constants
│   ├── components/            # Reusable components (ErrorBoundary, LoadingScreen, EmptyState, CommandSearch)
│   ├── config/                # Configuration modules (navigation)
│   ├── contexts/              # Context providers (AuthProvider, RoleGuards)
│   ├── features/              # Feature modules (venues, meetings)
│   ├── hooks/                 # Custom React hooks (placeholders)
│   ├── layouts/               # Common structures (AppLayout with Header & Sidebar)
│   ├── lib/                   # External library clients
│   │   ├── env.ts             # Type-safe environment loader
│   │   ├── supabase.ts        # Supabase singleton client
│   │   └── shims/             # Custom offline shims for restricted network environments
│   │       ├── react-hook-form.tsx
│   │       ├── react-query.tsx
│   │       ├── react-router-dom.tsx
│   │       └── zod.ts
│   ├── pages/                 # Visual page components
│   │   ├── Dashboard.tsx
│   │   ├── VenueRequests.tsx
│   │   ├── MeetingRequests.tsx
│   │   ├── MeetingRequestForm.tsx
│   │   ├── Hotels.tsx
│   │   ├── VenueExplorer.tsx
│   │   ├── VenueDetails.tsx
│   │   ├── VenueComparison.tsx
│   │   ├── MyShortlists.tsx
│   │   ├── Quotations.tsx
│   │   ├── Approvals.tsx
│   │   ├── Bookings.tsx
│   │   ├── Finance.tsx
│   │   ├── Reports.tsx
│   │   ├── UserSettings.tsx
│   │   └── Login.tsx
│   ├── routes/                # Central routing architecture
│   │   └── routeRegistry.ts   # Single source of truth for routing paths
│   ├── styles/                # CSS theme configurations
│   │   ├── theme.css          # Design system & CSS variables
│   │   ├── tokens.css         # Design tokens
│   │   ├── semantic.css       # Semantic variables
│   │   ├── layout.css         # Layout utilities
│   │   ├── components.css     # Component styles
│   │   └── theme.css          # Theme configuration
│   ├── types/                 # Shared TypeScript models
│   │   └── index.ts
│   ├── App.tsx                # Main Router config
│   └── main.tsx               # Mounting point script
├── index.html                 # Entry template
├── package.json               # Root dependencies
├── tsconfig.json              # TypeScript compilation setup
└── vite.config.ts             # Vite bundler setup
```

---

## 🚦 Route Registry

Mapped dynamically in [routeRegistry.ts](file:///c:/Users/sunils/OneDrive%20-%20Ajanta%20Pharma%20Limited/Webapps/VMS/src/routes/routeRegistry.ts):

| Registry constant | Path | Element | Description |
|-------------------|------|---------|-------------|
| `ROUTES.login` | `/login` | `Login` | Sandbox switch to select user roles |
| `ROUTES.dashboard` | `/dashboard` | `Dashboard` | Core statistics cards & active vendor log |
| `ROUTES.requests` | `/requests` | `VenueRequests` | Requests datatable log with status filters |
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

---

## 🔒 Permission Registry & RBAC

Defined in [permissions.ts](file:///c:/Users/sunils/OneDrive%20-%20Ajanta%20Pharma%20Limited/Webapps/VMS/src/auth/permissions.ts):

- **Roles**: `SUPER_ADMIN`, `ADMIN`, `SALES_HEAD`, `FINANCE`, `VIEWER`
- **Permissions**: Core action tags like `create:request`, `view:request`, `approve:request`, `manage:hotels`, `manage:quotations`, `manage:bookings`, `manage:finance`, `view:reports`, `manage:users`

### Navigation Access Control

| Navigation Item | Super Admin | Admin | Sales Head | Finance | Viewer |
|-----------------|-------------|-------|------------|---------|--------|
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

## 🔧 Environment Configuration Setup Guide

The project utilizes a type-safe schema validator built with Zod to parse and secure settings.

1. **Local Configuration (`.env`)**
   Create a `.env` in the root folder with the following variables:
   ```env
   VITE_SUPABASE_URL=https://cqfctzjypanrwzrbvfjq.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_JvVHwyav962md-MnJRF1yQ_IB16jbQ3
   ```

2. **Template Reference (`.env.example`)**
   Use this file as a baseline template during CI/CD deployments.
