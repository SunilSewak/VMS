# Test Edge Function - Debugging Guide

## Step 1: Check Edge Function Logs

1. Go to **Supabase Dashboard**
2. Click **Edge Functions** → **hyper-processor**
3. Click **Logs** tab
4. Look at the most recent error entry
5. **What does it say?**

Common errors:
- "Unauthorized: Invalid token"
- "Missing required fields: email, employee_name, role, password"
- "Password must be at least 8 characters"
- "Unauthorized: Admin privileges required"

---

## Step 2: Verify Edge Function Code is Deployed

Check if the deployed function has the latest code:

1. In Dashboard → Edge Functions → hyper-processor
2. Click **Edit** or view source
3. Search for the word "password"
4. **Does it appear in these places?**
   - interface CreateUserRequest (line 17)
   - Validation section (line 77)
   - auth.admin.createUser call (line 105)

If "password" is NOT in the deployed code, you need to:
1. Copy all code from `supabase/functions/create-user/index.ts`
2. Paste into Dashboard editor
3. Click Deploy

---

## Step 3: Check Service Role Key Secret

1. Dashboard → Project Settings → Edge Functions → Secrets
2. Verify secret exists:
   - Name: `SERVICE_ROLE_KEY`
   - Value: (should be set, not empty)

If missing, add it:
1. Get service role key from: Settings → API → service_role (click reveal)
2. Add secret: SERVICE_ROLE_KEY = [your key]

---

## Step 4: Test with Browser Console

Open browser console and run this to see the actual request:

```javascript
// Get current session
const session = await supabase.auth.getSession()
console.log('Session:', session)

// Test Edge Function call
const { data, error } = await supabase.functions.invoke('hyper-processor', {
  body: {
    email: 'test@example.com',
    employee_name: 'Test User',
    password: 'TestPassword123',
    role: 'VIEWER',
    status: 'ACTIVE'
  }
})

console.log('Response data:', data)
console.log('Response error:', error)
```

---

## Expected Behavior

### If Code is Deployed Correctly

**Success:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "employee_name": "Test User",
    "role": "VIEWER"
  }
}
```

**Error (with message):**
```json
{
  "success": false,
  "error": "Unauthorized: Invalid token"
}
```

### If Old Code Still Deployed

**Error:**
```
Edge Function returned a non-2xx status code
```

Logs might show:
```
Missing required fields: email, employee_name, role
```

(Because old code doesn't expect "password" field)

---

## Quick Fix

**If the issue is that old code is still deployed:**

1. Open `supabase/functions/create-user/index.ts` in your IDE
2. Select ALL code (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to Supabase Dashboard → Edge Functions → hyper-processor
5. Click Edit
6. Select all existing code in editor
7. Paste new code (Ctrl+V)
8. Click **Deploy** button
9. Wait for deployment to complete (green checkmark)
10. Try creating user again

---

## Checklist

Before trying again, verify:

- [ ] Edge Function shows "password" in interface definition
- [ ] Edge Function shows password validation (min 8 chars)
- [ ] Edge Function passes password to auth.admin.createUser()
- [ ] SERVICE_ROLE_KEY secret is set
- [ ] Frontend form has password fields
- [ ] You're logged in as SUPER_ADMIN or ADMIN

---

## Next Steps

1. Check Edge Function logs (Step 1 above)
2. Share the exact error message
3. Verify code is deployed with password support

The logs will tell us exactly what's happening!
