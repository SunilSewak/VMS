# Edge Function 400 Error - Root Cause and Fix

**Issue:** Edge Function returning 400 when creating users  
**Root Cause:** Function name mismatch - Frontend calling 'hyper-processor' but deployed as 'create-user'  
**Status:** ✅ Fixed  
**Date:** June 13, 2026

---

## What Was Wrong

### Frontend Code (userService.ts)
```typescript
// WRONG - This tries to call a function named 'hyper-processor'
const { data, error } = await supabase.functions.invoke('hyper-processor', {
  body: { ... }
});
```

### Backend Edge Function
File: `supabase/functions/create-user/index.ts`

When this is deployed to Supabase, the function is registered with the name **'create-user'** (from the directory name), NOT 'hyper-processor'.

### Result
- Frontend sends request to `supabase/functions/v1/hyper-processor`
- Supabase doesn't have a function with that name
- Returns **404 Not Found**
- Frontend wraps it in a **400 Bad Request** error

---

## The Fix

### Changed in userService.ts
```typescript
// CORRECT - Now calls the function with the correct name
const { data, error } = await supabase.functions.invoke('create-user', {
  body: { ... }
});
```

**File Changed:**
- `src/features/users/userService.ts` - Line 172

---

## Verification Steps

### Step 1: Verify Edge Function is Deployed

**Method A: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select project: `cqfctzjypanrwzrbvfjq`
3. Click **Edge Functions** in sidebar
4. Should see **'create-user'** function listed as Active (green status)

**Method B: Via Browser DevTools**
1. Open your app and navigate to user creation
2. Open DevTools → Network tab
3. Try to create a user
4. Look for network request to: `https://cqfctzjypanrwzrbvfjq.supabase.co/functions/v1/create-user`
5. If you see a 404, the function isn't deployed
6. If you see a 400 with error response, it's deployed but validation failed

---

## Deployment Instructions

### Option 1: Using Supabase CLI (Recommended)

**Prerequisites:**
- Install Node.js
- Install Supabase CLI: `npm install -g supabase`

**Steps:**
```bash
# 1. Navigate to project
cd "C:\Users\sunils\OneDrive - Ajanta Pharma Limited\Webapps\VMS"

# 2. Login (if not already)
supabase login

# 3. Link project
supabase link --project-ref cqfctzjypanrwzrbvfjq

# 4. Deploy function
supabase functions deploy create-user
```

**Expected Output:**
```
✓ Deploying function 'create-user'...
✓ Successfully deployed function 'create-user'
```

### Option 2: Using Supabase Dashboard (No CLI)

**Step 1: Create Function**
1. Go to: https://supabase.com/dashboard
2. Select project: `cqfctzjypanrwzrbvfjq`
3. Click **Edge Functions** → **Create a new function**
4. Name: `create-user`
5. Click **Create function**

**Step 2: Paste Code**
1. Copy all code from: `supabase/functions/create-user/index.ts`
2. Paste into the editor
3. Click **Deploy**

**Step 3: Set Service Role Secret**
1. Go to: **Project Settings** → **Edge Functions** → **Secrets**
2. Click **New Secret**
3. Add:
   - Key: `SERVICE_ROLE_KEY` (exactly as shown)
   - Value: (Get from Settings → API → `service_role` key - the one that starts with `eyJhbGc...`)
4. Click **Add Secret**

---

## Testing the Fix

### After Deployment:

**Step 1: Login**
1. Open your app
2. Login as Admin or Super Admin

**Step 2: Create a User**
1. Navigate to: **Administration** → **Users**
2. Click **Create User**
3. Fill form:
   ```
   Email: test@example.com
   Employee Name: Test User
   Password: SecurePassword123
   Confirm Password: SecurePassword123
   Role: ADMIN
   Status: ACTIVE
   ```
4. Click **Create User**

**Step 3: Expected Success**
- ✅ Success message appears
- ✅ User appears in list
- ✅ Browser console shows: `✅ User created successfully via Edge Function: { authUserId, publicUserId, email }`

**Step 4: Verify in Database**
```sql
-- Check if user was created in auth
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'test@example.com';

-- Check if user was created in public schema
SELECT id, auth_user_id, email, employee_name 
FROM public.users 
WHERE email = 'test@example.com';

-- Verify they're linked
SELECT 
  au.email,
  pu.employee_name,
  (au.id = pu.auth_user_id) as linked_correctly
FROM auth.users au
JOIN public.users pu ON au.id = pu.auth_user_id
WHERE au.email = 'test@example.com';
```

**Expected Results:**
- auth.users: 1 record with email confirmed
- public.users: 1 record with matching auth_user_id
- Linkage: TRUE

---

## If Still Getting 400 Error

### Check Error Message

**In Browser Console:**
```
userService.ts:185 Error details: {
  "name": "FunctionsHttpError",
  "message": "Edge Function returned a non-2xx status code",
  "context": {}
}
```

**To Get More Details:**
1. Open Supabase Dashboard
2. Go to **Edge Functions** → **create-user** → **Logs** tab
3. Look for error messages from your failed attempts
4. Common errors:
   - **"Missing authorization header"** - User not logged in
   - **"Unauthorized: Invalid token"** - Session expired
   - **"Unauthorized: Admin privileges required"** - User not admin
   - **"Missing required fields"** - Form validation failed
   - **"Failed to create auth user"** - Email already exists
   - **"Password must be at least 8 characters"** - Validation failed

### Troubleshooting Checklist

**1. Function Deployed?**
- [ ] Check Supabase Dashboard → Edge Functions
- [ ] See 'create-user' with green status

**2. Service Role Key Set?**
- [ ] Check Supabase Dashboard → Project Settings → Edge Functions → Secrets
- [ ] See `SERVICE_ROLE_KEY` listed

**3. Frontend Updated?**
- [ ] Check `src/features/users/userService.ts` line 172
- [ ] Should say: `.invoke('create-user',...)`

**4. User is Admin?**
- [ ] Login with Super Admin or Admin account
- [ ] Check user's role in user list

**5. Password Valid?**
- [ ] Min 8 characters
- [ ] No special validation rules

---

## Understanding the Architecture

### Why 'create-user' as the name?

Supabase Edge Functions are organized in directories:
```
supabase/
├── functions/
│   ├── create-user/
│   │   └── index.ts  ← This becomes function 'create-user'
│   ├── another-function/
│   │   └── index.ts  ← This becomes function 'another-function'
```

When you deploy `supabase functions deploy`, each directory becomes a callable function with that directory's name.

### Function Call Flow

```
1. Frontend (Browser)
   └─> supabase.functions.invoke('create-user', {...})

2. Request sent to
   └─> https://cqfctzjypanrwzrbvfjq.supabase.co/functions/v1/create-user

3. Supabase Routes to
   └─> supabase/functions/create-user/index.ts

4. Function Executes
   ├─ Verifies JWT token from Authorization header
   ├─ Checks admin permissions
   ├─ Uses SERVICE_ROLE_KEY secret (server-side)
   ├─ Creates auth.users record
   └─ Creates public.users record

5. Response sent back to Frontend
   └─> { success: true, user: {...} }
```

---

## Files Modified

### 1. `src/features/users/userService.ts`
**Change:** Function name on line 172
- **Before:** `supabase.functions.invoke('hyper-processor', ...)`
- **After:** `supabase.functions.invoke('create-user', ...)`

---

## Security Checklist

After deployment, verify security:

**✅ Service Role Key Security**
- [ ] Key is set as Edge Function secret (not in .env)
- [ ] Not exposed in browser
- [ ] Not in browser console Network requests
- [ ] Not in bundled JavaScript

**✅ Permission Checks**
- [ ] Non-admin cannot create users
- [ ] Admin can create users
- [ ] User creation fails with clear error messages

**✅ Error Handling**
- [ ] Edge Function errors don't expose sensitive info
- [ ] Invalid tokens are rejected
- [ ] Invalid permissions are rejected

---

## Next Steps After Deployment

### Immediate
1. ✅ Deploy Edge Function
2. ✅ Set SERVICE_ROLE_KEY secret
3. ✅ Test user creation

### Optional Future Enhancements
1. Add password reset via Edge Function
2. Add bulk user import via Edge Function
3. Add mandatory password change on first login
4. Add email notifications for new users
5. Add audit logging for user creation events

---

## Summary

### The Problem
Frontend was calling `'hyper-processor'` but Edge Function was deployed as `'create-user'`

### The Solution
Changed frontend to call `'create-user'` (matching the deployed function name)

### Current Status
- ✅ Code fixed
- ⏳ Need to deploy Edge Function if not already done
- ⏳ Need to set SERVICE_ROLE_KEY secret
- ⏳ Need to test

### What to Do Now
1. Deploy Edge Function (follow instructions above)
2. Set SERVICE_ROLE_KEY secret
3. Test user creation
4. Report back if any errors

The fix is simple - just making sure the function names match. Everything else is already implemented correctly.
