# SUPER_ADMIN Authorization Governance

## Overview
This document defines the authorization governance rules for the `SUPER_ADMIN` role in the AVEMS application. SUPER_ADMIN is the platform owner role with unrestricted access to all modules, routes, and features.

## Core Principle
**SUPER_ADMIN has global, unrestricted access to ALL application resources, current and future, without requiring explicit configuration.**

## Implementation

### 1. Permission System (`src/auth/permissions.ts`)

#### `hasAccess()` Function
Centralized permission helper that implements the SUPER_ADMIN override rule:

```typescript
export function hasAccess(role: AppRole | undefined, permission: Permission): boolean {
  // SUPER_ADMIN override: Always grant access
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // All other roles follow standard permission checks
  if (!role) {
    return false;
  }
  
  return hasPermission(role, permission);
}
```

**Usage:** Use `hasAccess()` instead of `hasPermission()` in all permission checks throughout the application.

#### `canAccessRoute()` Function
Route-level access control with SUPER_ADMIN override:

```typescript
export function canAccessRoute(userRole: AppRole | undefined, allowedRoles?: AppRole[]): boolean {
  // SUPER_ADMIN override: Always grant access
  if (userRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // If no specific roles defined, allow access (public route)
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  // Check if user's role is in allowed roles
  return userRole ? allowedRoles.includes(userRole) : false;
}
```

### 2. Navigation System (`src/config/navigation.ts`)

#### `getNavigationForRole()` Function
The navigation filter implements the SUPER_ADMIN visibility rule:

```typescript
export function getNavigationForRole(role: AppRole): NavigationItem[] {
  // SUPER_ADMIN Governance Rule: Show ALL navigation items without filtering
  // This ensures platform owner sees all current and future modules
  if (role === ROLES.SUPER_ADMIN) {
    return navigationConfig;
  }
  
  // For all other roles, filter navigation based on role permissions
  return navigationConfig.filter(item => item.roles.includes(role));
}
```

**Result:** When logged in as SUPER_ADMIN, ALL menu items are visible, including:
- Dashboard
- Requests/Meetings
- Venue Explorer
- Venue Comparison
- My Shortlists
- Venues
- Commercials/Quotations
- Bookings
- Invoices
- Payments
- Reports
- Masters

### 3. Route Protection (`src/contexts/AuthContext.tsx`)

#### `ProtectedRoute` Component
Enhanced with SUPER_ADMIN override logic:

```typescript
export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // ... authentication checks ...

  // SUPER_ADMIN Governance Rule: Override all route restrictions
  // SUPER_ADMIN is platform owner and must access ALL modules without configuration
  if (user?.role === ROLES.SUPER_ADMIN) {
    return <>{children}</>;
  }

  // For other roles, check if they have access to this route
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

#### `RoleGuard` Component
Component-level role guard with SUPER_ADMIN override:

```typescript
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  // SUPER_ADMIN Governance Rule: Override all role restrictions
  // SUPER_ADMIN is platform owner and can view all content
  if (user?.role === ROLES.SUPER_ADMIN) {
    return <>{children}</>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
}
```

## Verified Routes

SUPER_ADMIN has verified access to:

✅ `/dashboard` - Dashboard  
✅ `/meeting-requests` - Meeting Requests  
✅ `/venue-explorer` - Venue Explorer  
✅ `/venue-explorer/:id` - Venue Details  
✅ `/venue-comparison` - Venue Comparison  
✅ `/my-shortlists` - My Shortlists  
✅ `/hotels` - Venues Master  
✅ `/quotations` - Commercials/Quotations  
✅ `/bookings` - Bookings  
✅ `/finance` - Invoices & Payments  
✅ `/reports` - Reports  
✅ `/settings/users` - Masters (User Management)  

## Future Module Governance

### Automatic Access Rule
When adding new modules to the application:

1. **Navigation:** Add the new route to `navigationConfig` in `src/config/navigation.ts`
2. **No SUPER_ADMIN Configuration Required:** The `getNavigationForRole()` function automatically shows all items to SUPER_ADMIN
3. **Route Protection:** SUPER_ADMIN bypasses all `allowedRoles` checks in `ProtectedRoute`
4. **Permission Checks:** SUPER_ADMIN bypasses all permission checks via `hasAccess()`

### Example: Adding a New "Analytics" Module

```typescript
// 1. Add route to routeRegistry.ts
export const ROUTES = {
  // ... existing routes ...
  analytics: "/analytics"
};

// 2. Add navigation item (SUPER_ADMIN gets it automatically)
export const navigationConfig: NavigationItem[] = [
  // ... existing items ...
  {
    name: 'Analytics',
    path: ROUTES.analytics,
    iconName: 'TrendingUp',
    roles: [ROLES.ADMIN, ROLES.SALES_HEAD] // Note: SUPER_ADMIN not listed but gets access
  }
];

// 3. Add protected route (SUPER_ADMIN bypasses allowedRoles)
<Route path={ROUTES.analytics} element={
  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SALES_HEAD]}>
    <AppLayout>
      <Analytics />
    </AppLayout>
  </ProtectedRoute>
} />
```

**Result:** SUPER_ADMIN automatically sees and can access the Analytics module without any additional configuration.

## Testing Checklist

When testing SUPER_ADMIN access:

- [ ] Login as SUPER_ADMIN
- [ ] Verify all navigation items are visible
- [ ] Test access to each route (no "Access Denied" messages)
- [ ] Verify functionality within each module
- [ ] Test that permission-gated UI elements are visible/enabled
- [ ] Add a new module and verify automatic SUPER_ADMIN access

## Best Practices

### ✅ DO:
- Use `hasAccess()` for all permission checks
- Use `canAccessRoute()` for route-level checks
- Trust the SUPER_ADMIN override - don't add SUPER_ADMIN to every `allowedRoles` array
- Document new modules in `navigationConfig` with their role restrictions

### ❌ DON'T:
- Use `hasPermission()` directly (use `hasAccess()` instead)
- Add explicit SUPER_ADMIN checks in feature code
- Create special cases for SUPER_ADMIN in business logic
- Forget to add new routes to `navigationConfig`

## Security Considerations

1. **Role Assignment:** SUPER_ADMIN role should only be assigned to trusted platform administrators
2. **Audit Logging:** Consider implementing audit logs for SUPER_ADMIN actions
3. **Production Access:** Limit SUPER_ADMIN accounts in production environments
4. **Session Management:** SUPER_ADMIN sessions should have appropriate timeout policies

## Troubleshooting

### SUPER_ADMIN Cannot See a Module
1. Check `navigationConfig` - ensure the route is defined
2. Verify `getNavigationForRole()` is not modified
3. Check if navigation component is using the function correctly

### SUPER_ADMIN Gets "Access Denied"
1. Verify `ProtectedRoute` SUPER_ADMIN check is implemented
2. Check if `user.role` is correctly set to `ROLES.SUPER_ADMIN`
3. Ensure no custom access checks bypass the governance rules

### New Module Not Visible to SUPER_ADMIN
1. Confirm route is added to `navigationConfig`
2. Check if a custom navigation filter is being used
3. Verify the navigation component calls `getNavigationForRole()`

## Version History

- **v1.0** (2026-06-06): Initial SUPER_ADMIN governance implementation
  - Added `hasAccess()` and `canAccessRoute()` helpers
  - Updated `getNavigationForRole()` with SUPER_ADMIN override
  - Enhanced `ProtectedRoute` and `RoleGuard` with override logic
  - Added Venue Comparison route
