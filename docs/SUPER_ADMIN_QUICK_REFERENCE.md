# SUPER_ADMIN Quick Reference Card

## 🎯 Core Rule
**SUPER_ADMIN bypasses ALL permission and role checks automatically.**

---

## 🔧 Developer Usage

### Permission Checks
```typescript
// ✅ DO THIS (uses SUPER_ADMIN override)
import { hasAccess } from '../auth/permissions';

if (hasAccess(user.role, PERMISSIONS.MANAGE_HOTELS)) {
  // Show admin features
}

// ❌ DON'T DO THIS (no SUPER_ADMIN override)
import { hasPermission } from '../auth/permissions';

if (hasPermission(user.role, PERMISSIONS.MANAGE_HOTELS)) {
  // SUPER_ADMIN won't have access!
}
```

### Route Protection
```typescript
// ✅ CORRECT - SUPER_ADMIN automatically allowed
<Route path="/new-feature" element={
  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SALES_HEAD]}>
    <NewFeature />
  </ProtectedRoute>
} />

// ❌ WRONG - Don't add SUPER_ADMIN explicitly
<Route path="/new-feature" element={
  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]}>
    <NewFeature />
  </ProtectedRoute>
} />
```

### Component Role Guards
```typescript
// ✅ CORRECT - SUPER_ADMIN automatically allowed
<RoleGuard allowedRoles={[ROLES.ADMIN]}>
  <AdminOnlyButton />
</RoleGuard>

// ❌ WRONG - Don't add SUPER_ADMIN explicitly
<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
  <AdminOnlyButton />
</RoleGuard>
```

### Navigation Items
```typescript
// ✅ CORRECT - SUPER_ADMIN sees it automatically
{
  name: 'New Module',
  path: ROUTES.newModule,
  iconName: 'Icon',
  roles: [ROLES.ADMIN, ROLES.SALES_HEAD]
}

// ❌ WRONG - Don't add SUPER_ADMIN to roles array
{
  name: 'New Module',
  path: ROUTES.newModule,
  iconName: 'Icon',
  roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
}
```

---

## 📦 Available Helper Functions

### `hasAccess(role, permission)`
**Use for:** Feature-level permission checks  
**Returns:** `true` if user has permission (always `true` for SUPER_ADMIN)

```typescript
import { hasAccess, PERMISSIONS } from '../auth/permissions';

const canEdit = hasAccess(user.role, PERMISSIONS.MANAGE_HOTELS);
```

### `canAccessRoute(userRole, allowedRoles)`
**Use for:** Programmatic route access checks  
**Returns:** `true` if user can access route (always `true` for SUPER_ADMIN)

```typescript
import { canAccessRoute, ROLES } from '../auth/permissions';

const canViewAdminPage = canAccessRoute(user.role, [ROLES.ADMIN]);
```

### `getNavigationForRole(role)`
**Use for:** Getting navigation items for a user  
**Returns:** All items for SUPER_ADMIN, filtered items for others

```typescript
import { getNavigationForRole } from '../config/navigation';

const navItems = getNavigationForRole(user.role);
```

---

## ⚡ Adding a New Module (Checklist)

- [ ] Add route to `src/routes/routeRegistry.ts`
- [ ] Create page component
- [ ] Add navigation item to `src/config/navigation.ts` (don't include SUPER_ADMIN in roles)
- [ ] Add route to `src/App.tsx` with `<ProtectedRoute>` (don't include SUPER_ADMIN in allowedRoles)
- [ ] Use `hasAccess()` for permission checks in the component
- [ ] Test with SUPER_ADMIN - should have automatic access
- [ ] Test with other roles - should respect role restrictions

---

## 🐛 Troubleshooting

### SUPER_ADMIN can't see a new module
- ✅ Check: Is it in `navigationConfig`?
- ✅ Check: Is `getNavigationForRole()` being used?
- ❌ Don't: Add SUPER_ADMIN to the roles array

### SUPER_ADMIN gets "Access Denied"
- ✅ Check: Is `ProtectedRoute` component unmodified?
- ✅ Check: Is `user.role` correctly set?
- ❌ Don't: Add custom access checks that bypass governance

### Permission check failing for SUPER_ADMIN
- ✅ Check: Are you using `hasAccess()` instead of `hasPermission()`?
- ✅ Check: Is the role check happening before user is loaded?
- ❌ Don't: Use direct role checks instead of helper functions

---

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Right |
|---------|---------|
| `hasPermission(role, perm)` | `hasAccess(role, perm)` |
| `roles: [SUPER_ADMIN, ADMIN]` | `roles: [ADMIN]` |
| `allowedRoles={[SUPER_ADMIN, ADMIN]}` | `allowedRoles={[ADMIN]}` |
| `if (role === SUPER_ADMIN \|\| ...)` | `if (hasAccess(role, ...))` |

---

## 📖 Documentation Links

- **Full Documentation:** `docs/super_admin_governance.md`
- **Implementation Summary:** `docs/SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md`
- **Code Locations:**
  - Permission helpers: `src/auth/permissions.ts`
  - Navigation filter: `src/config/navigation.ts`
  - Route guards: `src/contexts/AuthContext.tsx`

---

## 🎓 Key Takeaways

1. **Never explicitly add SUPER_ADMIN to role arrays**
2. **Always use `hasAccess()` for permission checks**
3. **Trust the governance system - it handles SUPER_ADMIN automatically**
4. **New modules get SUPER_ADMIN access for free**
5. **Keep role restrictions focused on actual role-based access, not SUPER_ADMIN**

---

**Remember:** SUPER_ADMIN is the platform owner. The system is designed to give them automatic access to everything. Your job is to define access for OTHER roles, not to grant access to SUPER_ADMIN.
