# AVEMS Auth State Bug Analysis - CRITICAL

## Current Behavior
1. **After Login / Hard Refresh**: All 14 modules visible (correct)
2. **After Navigation**: Navigation collapses to Dashboard + Reports only (incorrect)
3. **Database User Lookup**: Works correctly
4. **ROLE_SUPER_ADMIN Loading**: Correctly loaded after refresh

## Root Cause Identified

### THE BUG: `onAuthStateChange` Callback Ignores Database Role

**File**: `src/contexts/AuthContext.tsx`  
**Lines**: 116-136

```typescript
// Listen for auth state changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (session?.user) {
      const role = (session.user.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
      setUser(mapSupabaseUserToProfile(session.user, role));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }
);
```

**Problem**: This callback is triggered on EVERY navigation/page change and:
1. ❌ Does NOT query the `public.users` table
2. ❌ Does NOT look up the database role
3. ❌ Falls back to `session.user_metadata.role` which is `undefined`
4. ❌ Defaults to `ROLES.VIEWER` as fallback

## State Transition Flow

### ✅ CORRECT PATH (Login/Refresh)
```
1. User logs in or page hard refreshes
2. getSession() runs → queries public.users table
3. DB returns ROLE_SUPER_ADMIN
4. User state set with SUPER_ADMIN role
5. Navigation shows all 14 modules
```

### ❌ BUG PATH (Navigation)
```
1. User navigates to another page (e.g., /venue-explorer)
2. React Router triggers history change
3. Supabase auth.onAuthStateChange fires
4. Callback runs WITHOUT database lookup
5. user_metadata.role is undefined
6. Falls back to ROLES.VIEWER
7. setUser() overwrites SUPER_ADMIN with VIEWER
8. Navigation now shows only Dashboard + Reports
```

## Logging Output Expected

### On Login (CORRECT)
```
🔄 AUTH_CONTEXT_RENDER
👤 CURRENT_USER: null
🎭 CURRENT_ROLE: undefined

🔍 === AUTH DEBUG: Login Started ===
📧 Email: apltrainingteam@gmail.com

✅ LOGIN: Using role from database (normalized): SUPER_ADMIN
📝 LOGIN: ROLE_SOURCE: database
🔄 mapSupabaseUserToProfile called with role: SUPER_ADMIN
```

### On Navigation (BUG TRIGGERED)
```
🔄 AUTH_CONTEXT_RENDER
👤 CURRENT_USER: { role: "SUPER_ADMIN", ... }
🎭 CURRENT_ROLE: SUPER_ADMIN

🔔 === AUTH STATE CHANGE TRIGGERED ===
🎯 EVENT: SIGNED_IN
📦 SESSION: { ... }
👤 SESSION_USER: { id: "...", email: "apltrainingteam@gmail.com", user_metadata: {} }

🏷️ USER_METADATA: {}  (EMPTY - role is not stored here!)
⚠️ ❌ USING METADATA ROLE (FALLBACK): VIEWER
📝 ROLE_SOURCE: user_metadata (IGNORING DATABASE)
🚨 THIS IS THE BUG - NO DATABASE LOOKUP IN onAuthStateChange

🔄 mapSupabaseUserToProfile called with role: VIEWER  (OVERWRITES SUPER_ADMIN!)
🔔 === AUTH STATE CHANGE COMPLETE ===

🔄 AUTH_CONTEXT_RENDER
👤 CURRENT_USER: { role: "VIEWER", ... }  (NOW VIEWER!)
🎭 CURRENT_ROLE: VIEWER
```

## Files to Modify

### Primary Fix: `src/contexts/AuthContext.tsx`

**The Fix Required**: Add database lookup in `onAuthStateChange` callback

**Current Code (BUGGY)**:
```typescript
if (session?.user) {
  const role = (session.user.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
  setUser(mapSupabaseUserToProfile(session.user, role));
}
```

**Required Fix**:
```typescript
if (session?.user) {
  const authUser = session.user;
  
  // Query public.users table to get the app user profile
  const { data: appUser, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      employee_name,
      status,
      role_id,
      auth_user_id,
      roles:role_id (
        id,
        role_code,
        role_name
      )
    `)
    .eq('auth_user_id', authUser.id)
    .single() as { data: AppUser | null; error: any };
  
  // Determine the role - use database role if available, fallback to metadata
  let role: AppRole;
  if (appUser?.roles?.role_code) {
    const dbRoleCode = appUser.roles.role_code;
    if (dbRoleCode === 'ROLE_SUPER_ADMIN') {
      role = ROLES.SUPER_ADMIN;
    } else {
      role = dbRoleCode as AppRole;
    }
  } else {
    role = (authUser.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
  }
  
  setUser(mapSupabaseUserToProfile(authUser, role));
}
```

## Summary

| Aspect | Status |
|--------|--------|
| Database Role Lookup | ✅ Working in `getSession()` and `login()` |
| onAuthStateChange Callback | ❌ BUG: Ignores database, uses VIEWER fallback |
| Role Downgrade Location | ✅ Identified: Line 126 in AuthContext.tsx |
| State Overwrite Cause | ✅ Identified: setUser() with VIEWER in onAuthStateChange |

## Recommendation

**DO NOT** implement any workaround (like storing role in localStorage or using React Context to preserve state).

**DO** add the database lookup to the `onAuthStateChange` callback to ensure the database role is always used, regardless of navigation events.

This ensures that:
1. Role is always fetched from the authoritative source (database)
2. Role changes in the database are immediately reflected in the UI
3. No state synchronization issues between navigation events
