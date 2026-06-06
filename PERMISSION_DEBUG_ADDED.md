# Permission System Debug - Comprehensive Logging Added

## ✅ Debug Logging Implemented

### Files Modified:

1. **`src/contexts/AuthContext.tsx`**
   - Added logging in session initialization
   - Added logging in login function
   - Now queries `public.users` table to get actual role
   - Logs comparison between database role and metadata role

2. **`src/config/navigation.ts`**
   - Added logging in `getNavigationForRole()` function
   - Shows which role is being checked
   - Shows if SUPER_ADMIN detected
   - Shows all available vs filtered navigation items

3. **`src/layouts/AppLayout.tsx`**
   - Added useEffect to log navigation state
   - Shows current user and role
   - Shows all modules vs visible modules

---

## 🔍 Debug Output Reference

When you login with `apltrainingteam@gmail.com`, you should see this console output:

### 1. Authentication Debug:
```
🔍 === AUTH DEBUG: Login Started ===
📧 Email: apltrainingteam@gmail.com
📦 LOGIN SESSION: {...}
👤 LOGIN AUTH_USER: {...}
🔑 LOGIN AUTH_USER ID: [uuid]
📧 LOGIN AUTH_USER EMAIL: apltrainingteam@gmail.com
🏷️ LOGIN AUTH_USER METADATA: {...}

🔍 Querying public.users table...
👥 LOGIN APP_USER from public.users: {...}
🆔 LOGIN APP_USER ID: [uuid]
👤 LOGIN APP_USER employee_name: APL Training Team
📍 LOGIN APP_USER status: ACTIVE
🎭 LOGIN APP_USER role_id: 211037bc-1ff0-486c-9e35-b922a8ef1202
🔗 LOGIN APP_USER roles: {...}
🎭 LOGIN ROLE_CODE: ROLE_SUPER_ADMIN (or other value)
📛 LOGIN ROLE_NAME: Super Admin (or other value)

✅ LOGIN: Using role from database: ROLE_SUPER_ADMIN
🎯 LOGIN FINAL ROLE: ROLE_SUPER_ADMIN
🔍 LOGIN: Is SUPER_ADMIN? true/false

🏨 HOTELS AFTER LOGIN: 6 records
🔍 === AUTH DEBUG: Login Complete ===
```

### 2. Navigation Debug:
```
🔍 getNavigationForRole called with role: ROLE_SUPER_ADMIN
🔍 ROLES.SUPER_ADMIN constant: SUPER_ADMIN
🔍 role === ROLES.SUPER_ADMIN? true/false

✅ SUPER_ADMIN detected - returning ALL navigation items
📋 Total items: 14
📋 Items: [Dashboard, Requests, Meetings, Venue Explorer, ...]
```

### 3. AppLayout Debug:
```
🧭 === NAVIGATION DEBUG ===
👤 Current user: {...}
🎭 User role: ROLE_SUPER_ADMIN
🔍 Is SUPER_ADMIN? true/false
📋 ALL_MODULES available in system: [14 items]
👁️ VISIBLE_MODULES for user: [2 items] or [14 items]
🧭 === NAVIGATION DEBUG END ===
```

---

## 🎯 What to Look For

### Issue 1: Role Mismatch
**Symptom:** Only Dashboard + Reports visible

**Check:**
```
🎭 LOGIN ROLE_CODE: ROLE_SUPER_ADMIN
🎯 LOGIN FINAL ROLE: ROLE_SUPER_ADMIN
```

**Problem:** The role_code in database is `ROLE_SUPER_ADMIN` but the code expects `SUPER_ADMIN`

**Expected in code:**
```typescript
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',  // ← Code expects this
  ...
}
```

**If database has:**
```
ROLE_SUPER_ADMIN  // ← With "ROLE_" prefix
```

**Then the comparison fails:**
```javascript
role === ROLES.SUPER_ADMIN  // 'ROLE_SUPER_ADMIN' === 'SUPER_ADMIN' → false
```

### Issue 2: Missing Database Query
**Check:**
```
👥 LOGIN APP_USER from public.users: null
❌ LOGIN USER ERROR: {...}
```

**Problem:** RLS policy blocking access to `public.users` table

### Issue 3: Role Not in Allowed List
**Check:**
```
👁️ VISIBLE_MODULES for user: [Dashboard, Reports]
```

**Problem:** Navigation config only includes these roles, missing SUPER_ADMIN in the array

---

## 🔧 Expected Root Causes

Based on the facts provided, the most likely issues are:

### 1. Role Code Mismatch (MOST LIKELY)
```sql
-- Database has:
roles.role_code = 'ROLE_SUPER_ADMIN'

-- Code expects:
ROLES.SUPER_ADMIN = 'SUPER_ADMIN'
```

**Fix:** Either:
- Update database: `UPDATE roles SET role_code = 'SUPER_ADMIN' WHERE role_code = 'ROLE_SUPER_ADMIN'`
- Update code: Change `SUPER_ADMIN: 'SUPER_ADMIN'` to `SUPER_ADMIN: 'ROLE_SUPER_ADMIN'`

### 2. RLS Policy Blocking public.users
```
❌ LOGIN USER ERROR: {message: "...permission denied..."}
```

**Fix:** Add RLS policy:
```sql
CREATE POLICY "Allow authenticated users to read own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### 3. Navigation Config Missing SUPER_ADMIN
```typescript
// If navigation items only have:
roles: [ROLES.ADMIN, ROLES.SALES_HEAD]
// And not:
roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
```

**But:** The governance rules should handle this automatically with the override check.

---

## 📋 Diagnostic Checklist

Run through the console logs and check:

### Authentication:
- [ ] `auth.users` query succeeds
- [ ] `public.users` query succeeds (check for RLS error)
- [ ] `role_id` is retrieved
- [ ] `roles` table lookup succeeds
- [ ] `role_code` value is retrieved
- [ ] Compare: role_code value vs ROLES.SUPER_ADMIN constant

### Navigation:
- [ ] `getNavigationForRole()` receives correct role
- [ ] SUPER_ADMIN comparison result (true/false)
- [ ] All navigation items count (should be ~14)
- [ ] Visible items count (should be 14 for SUPER_ADMIN, less for others)

### Role Constants:
- [ ] Check what ROLES.SUPER_ADMIN actually equals
- [ ] Check what role value is passed from database
- [ ] Are they exactly equal? (case-sensitive, no extra spaces/prefixes)

---

## 🎯 Next Steps

1. **Login with apltrainingteam@gmail.com**
2. **Open browser console (F12)**
3. **Copy ALL console output** starting from "AUTH DEBUG: Login Started"
4. **Look for these specific values:**
   - `LOGIN ROLE_CODE:` what value?
   - `LOGIN FINAL ROLE:` what value?
   - `ROLES.SUPER_ADMIN constant:` what value?
   - `role === ROLES.SUPER_ADMIN?` true or false?
   - `VISIBLE_MODULES for user:` how many items?

5. **Report findings:**
   - Exact role_code from database
   - Exact comparison result
   - Any RLS errors
   - Visible module count

---

## 📊 Files Changed

| File | Changes | Purpose |
|------|---------|---------|
| `src/contexts/AuthContext.tsx` | Added extensive logging | Debug role resolution |
| `src/contexts/AuthContext.tsx` | Query public.users + roles | Get actual role from database |
| `src/config/navigation.ts` | Added logging | Debug navigation filtering |
| `src/layouts/AppLayout.tsx` | Added logging | Debug visible modules |

---

## ⚠️ Important Notes

1. **This is DEBUG code** - Remove these console.log statements after identifying the issue
2. **Do not commit** these debug logs to production
3. **Check browser console** immediately after login
4. **Scroll to find** the "AUTH DEBUG" sections (lots of output)
5. **Copy the output** to share for analysis

---

**Status:** ✅ Debug logging added - Ready for testing
**Next Action:** Login and check console output
**Expected Outcome:** Identify exact cause of navigation filtering issue
