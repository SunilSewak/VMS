# AVEMS Project Foundation & Architecture Documentation

Welcome to the Ajanta Venue & Event Management System (AVEMS) developer documentation.

---

## 📂 Folder Architecture

```text
VMS/
├── docs/                      # Architectural documentation
│   └── architecture.md
├── src/
│   ├── app/                   # App configurations (routing integrations)
│   ├── auth/                  # RBAC definition registries
│   │   └── permissions.ts     # Permission models & Role constants
│   ├── components/            # Reusable components (ErrorBoundary, LoadingScreen, EmptyState)
│   ├── contexts/              # Context providers (AuthProvider, RoleGuards)
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
│   │   ├── Approvals.tsx
│   │   ├── Bookings.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Finance.tsx
│   │   ├── Hotels.tsx
│   │   ├── Login.tsx
│   │   ├── Quotations.tsx
│   │   ├── Reports.tsx
│   │   ├── UserSettings.tsx
│   │   └── VenueRequests.tsx
│   ├── routes/                # Central routing architecture
│   │   └── routeRegistry.ts   # Single source of truth for routing paths
│   ├── styles/                # CSS theme configurations
│   │   └── theme.css          # Design system & CSS variables
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
|---|---|---|---|
| `ROUTES.login` | `/login` | `Login` | Sandbox switch to select user roles |
| `ROUTES.dashboard` | `/dashboard` | `Dashboard` | Core statistics cards & active vendor log |
| `ROUTES.requests` | `/requests` | `VenueRequests` | Requests datatable log with status filters |
| `ROUTES.hotels` | `/hotels` | `Hotels` | Reusable `EmptyState` placeholder for partners |
| `ROUTES.quotations` | `/quotations` | `Quotations` | Quotations upload comparison interface |
| `ROUTES.approvals` | `/approvals` | `Approvals` | Approval workflows log |
| `ROUTES.bookings` | `/bookings` | `Bookings` | Confirmed event timelines & calendars |
| `ROUTES.finance` | `/finance` | `Finance` | Transaction list advances / billings |
| `ROUTES.reports` | `/reports` | `Reports` | Analytical log & spend indicators |
| `ROUTES.users` | `/settings/users` | `UserSettings` | User accounts & role policy controls |

---

## 🔒 Permission Registry & RBAC

Defined in [permissions.ts](file:///c:/Users/sunils/OneDrive%20-%20Ajanta%20Pharma%20Limited/Webapps/VMS/src/auth/permissions.ts):

- **Roles**: `SUPER_ADMIN`, `ADMIN`, `SALES_HEAD`, `FINANCE`, `VIEWER`
- **Permissions**: Core action tags like `create:request`, `view:request`, `approve:request`, `manage:hotels`, `manage:quotations`, `manage:bookings`, `manage:finance`, `view:reports`, `manage:users`.

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
