# Issue Identified: HTTP 406 Error Blocking Role Lookup

## 🎯 Root Cause Found

### Console Output Analysis:

```
❌ LOGIN USER ERROR: 406
👥 LOGIN APP_USER from public.users: null
⚠️ LOGIN: Using role from metadata (fallback): VIEWER
🎯 LOGIN FINAL ROLE: VIEWER
🔍 LOGIN: Is SUPER_ADMIN? false
```

**Problem:** The query to `public.users` table fails with **HTTP 406 (Not Acceptable)** error.

**Effect:** Application falls back to `auth.user_metadata.role`, which is empty/undefined, so defaults to `VIEWER`.

**Result:** User gets VIEWER role instead of SUPER_ADMIN, sees only Dashboard + Reports.

---

## 🔍 HTTP 406 Error Explained

**HTTP 406 - Not Acceptable** from Supabase REST API typically means:

1. **Wildcard Select Issue**: Using `SELECT *` with joined tables can cause serialization problems
2. **Column Type Mismatch**: Some column types can't be JSON-serialized
3. **Accept Header**: The client's Accept header doesn't match available formats
4. **Ambiguous Columns**: Duplicate column names in joined tables

### Original Query (FAILED):
```javascript
.select('*, roles(*)')
```

This tries to select ALL columns from `users` and ALL columns from `roles`, which can cause:
- Duplicate `id` columns (users.id and roles.id)
- Potential type serialization issues
- Ambiguous field references

---

## ✅ Fix Applied

### Updated Query (Explicit Columns):
```javascript
.select(`
  id,
  employee_name,
  status,
  role_id,
  roles:role_id (
    id,
    role_code,
    role_name
  )
`)
```

**Benefits:**
- ✅ No wildcard selects
- ✅ Explicit column names (no ambiguity)
- ✅ Uses proper foreign key syntax (`roles:role_id`)
- ✅ Only selects needed columns
- ✅ Should avoid 406 error

---

## 🔄 Expected Outcome After Fix

### After Login:
```
🔍 Querying public.users table...
👥 LOGIN APP_USER from public.users: {
  id: "6e351755-b9d1-4eda-a4fc-361cec2c66f9",
  employee_name: "APL Training Team",
  status: "ACTIVE",
  role_id: "211037bc-1ff0-486c-9e35-b922a8ef1202",
  roles: {
    id: "211037bc-1ff0-486c-9e35-b922a8ef1202",
    role_code: "SUPER_ADMIN",
    role_name: "Super Admin"
  }
}
✅ LOGIN: Using role from database: SUPER_ADMIN
🎯 LOGIN FINAL ROLE: SUPER_ADMIN
🔍 LOGIN: Is SUPER_ADMIN? true
```

### Navigation:
```
🔍 getNavigationForRole called with role: SUPER_ADMIN
✅ SUPER_ADMIN detected - returning ALL navigation items
📋 Total items: 14
👁️ VISIBLE_MODULES for user: 14 items
```

---

## 📋 Alternative: If 406 Still Occurs

If the explicit select still fails with 406, the issue might be:

### 1. RLS Policy Blocking Access
```sql
-- Check if policy exists:
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Create policy if needed:
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### 2. Foreign Key Relationship Not Defined
```sql
-- Check foreign key:
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY';

-- If missing, create it:
ALTER TABLE public.users
ADD CONSTRAINT users_role_id_fkey
FOREIGN KEY (role_id) REFERENCES public.roles(id);
```

### 3. Role Code Mismatch
**Database might have:**
```
role_code = 'ROLE_SUPER_ADMIN'
```

**Code expects:**
```typescript
ROLES.SUPER_ADMIN = 'SUPER_ADMIN'
```

**Quick check query:**
```sql
SELECT role_code FROM roles WHERE id = '211037bc-1ff0-486c-9e35-b922a8ef1202';
```

**If returns `ROLE_SUPER_ADMIN`, update code:**
```typescript
export const ROLES = {
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN',  // ← Add ROLE_ prefix
  ADMIN: 'ROLE_ADMIN',
  // ... etc
}
```

---

## 🔧 Testing Steps

1. **Clear browser cache:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Hard refresh:** `Ctrl + Shift + R`

3. **Login again** with `apltrainingteam@gmail.com`

4. **Check console for:**
   - ✅ No 406 error
   - ✅ `APP_USER from public.users: {...}` (not null)
   - ✅ `role_code` value retrieved
   - ✅ `FINAL ROLE: SUPER_ADMIN` (not VIEWER)
   - ✅ `VISIBLE_MODULES: 14` (not 2)

5. **Verify navigation:** Should see all 14 menu items

---

## 📊 Comparison: Before vs After

### Before Fix:
| Step | Result |
|------|--------|
| Query public.users | ❌ 406 Error |
| APP_USER | null |
| Role from metadata | undefined → VIEWER |
| Final role | VIEWER |
| Visible modules | 2 (Dashboard, Reports) |

### After Fix:
| Step | Result |
|------|--------|
| Query public.users | ✅ Success |
| APP_USER | {employee_name, role_id, roles: {...}} |
| Role from database | SUPER_ADMIN (or actual value) |
| Final role | SUPER_ADMIN |
| Visible modules | 14 (All items) |

---

## 🎯 Next Actions

1. **Test the updated code**
2. **If still 406:** Check RLS policies and foreign key
3. **If role mismatch:** Verify `role_code` value in database
4. **If success:** Remove debug logging before production

---

## 📝 Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `src/contexts/AuthContext.tsx` | Changed `SELECT *, roles(*)` to explicit columns | Fix 406 error |
| `src/contexts/AuthContext.tsx` | Added error detail logging | Debug if 406 persists |

---

**Status:** ✅ Fix applied - Ready for testing  
**Expected:** Query succeeds, SUPER_ADMIN role loaded, all navigation visible
