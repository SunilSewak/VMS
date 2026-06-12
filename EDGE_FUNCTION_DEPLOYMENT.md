# Edge Function Deployment Guide

**Security Fix:** User creation now uses Supabase Edge Function (server-side)  
**Status:** ✅ Code Complete - Deployment Required  
**Date:** June 12, 2026

---

## What Was Fixed

### Security Issue (CRITICAL)
**Before:** Service role key was being exposed in frontend via `VITE_SUPABASE_SERVICE_ROLE_KEY`  
**After:** Service role key stays on server-side, accessed only by Edge Function

### Architecture Change

**Before (INSECURE):**
```
Frontend (Browser)
├── Has service role key (❌ EXPOSED IN BUNDLE)
├── Calls supabase.auth.admin.createUser() directly
└── Full database access from browser (❌ SECURITY RISK)
```

**After (SECURE):**
```
Frontend (Browser)
├── Only has anon key (✅ SAFE)
└── Calls Edge Function with user's JWT token

Edge Function (Server-side)
├── Verifies JWT token
├── Checks admin permissions
├── Uses service role key (✅ SERVER-SIDE ONLY)
├── Creates auth user
├── Creates public.users record
└── Returns success/failure
```

---

## Files Created/Modified

### New Files
1. **`supabase/functions/create-user/index.ts`** - Edge Function for secure user creation
2. **`EDGE_FUNCTION_DEPLOYMENT.md`** - This deployment guide

### Modified Files
1. **`src/features/users/userService.ts`** - Now calls Edge Function instead of direct admin API
2. **`src/lib/supabase.ts`** - Removed `supabaseAdmin` client
3. **`src/lib/env.ts`** - Removed `VITE_SUPABASE_SERVICE_ROLE_KEY` from schema
4. **`.env`** - Removed service role key
5. **`.env.example`** - Removed service role key documentation

---

## Deployment Steps

### Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase CLI**
   ```bash
   supabase login
   ```

3. **Link to your project**
   ```bash
   supabase link --project-ref cqfctzjypanrwzrbvfjq
   ```

### Step 1: Deploy Edge Function

```bash
# Navigate to project root
cd "c:\Users\sunils\OneDrive - Ajanta Pharma Limited\Webapps\VMS"

# Deploy the create-user function
supabase functions deploy create-user
```

**Expected output:**
```
Deploying function: create-user
Function deployed successfully!
Function URL: https://cqfctzjypanrwzrbvfjq.supabase.co/functions/v1/create-user
```

### Step 2: Set Environment Secrets (Edge Function)

The Edge Function needs access to Supabase secrets (server-side only):

```bash
# Get your service role key from Supabase Dashboard
# Settings → API → service_role key

# Set as secret (NOT exposed to client)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**These secrets are automatically available to Edge Functions:**
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_ANON_KEY` - Auto-provided  
- `SUPABASE_SERVICE_ROLE_KEY` - Set via command above

### Step 3: Test Edge Function

```bash
# Get your auth token (login as admin first)
# Then test the function

curl -X POST \
  https://cqfctzjypanrwzrbvfjq.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "employee_name": "Test User",
    "role": "ADMIN",
    "status": "ACTIVE"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "auth_user_id": "uuid",
    "email": "test@example.com",
    "employee_name": "Test User",
    "role": "ADMIN",
    "status": "ACTIVE",
    "created_at": "2026-06-12T..."
  }
}
```

### Step 4: Deploy Frontend

```bash
# Build the frontend
npm run build

# Deploy to your hosting platform (Vercel, Netlify, etc.)
```

**No environment variables needed** - Service role key is NOT in frontend anymore!

---

## How It Works

### 1. User Clicks "Create User"

Frontend form collects:
- Email
- Employee Name
- Role
- Division (if Sales Head)
- Status

### 2. Frontend Calls Edge Function

```typescript
// src/features/users/userService.ts
const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: input.email,
    employee_name: input.employee_name,
    role: input.role,
    division_id: input.division_id || null,
    status: input.status || 'ACTIVE',
  },
  headers: {
    Authorization: `Bearer ${session.access_token}` // User's JWT
  }
});
```

### 3. Edge Function Validates Request

```typescript
// supabase/functions/create-user/index.ts

// 1. Verify JWT token
const { data: { user } } = await supabaseClient.auth.getUser()

// 2. Check if user has admin role
const { data: userData } = await supabaseAdmin
  .from('users')
  .select('roles!inner(role_code)')
  .eq('auth_user_id', user.id)
  .single()

// 3. Verify ROLE_SUPER_ADMIN or ROLE_ADMIN
if (!['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(userRole)) {
  throw new Error('Unauthorized')
}
```

### 4. Edge Function Creates User

```typescript
// Step 1: Create auth user (with service role key)
const { data: authData } = await supabaseAdmin.auth.admin.createUser({
  email: requestData.email,
  email_confirm: true,
  user_metadata: { ... }
})

// Step 2: Create public.users record
const { data: publicUser } = await supabaseAdmin
  .from('users')
  .insert({
    auth_user_id: authData.user.id,
    email: requestData.email,
    ...
  })
```

### 5. Frontend Receives Response

```typescript
if (data.success) {
  // User created successfully
  console.log('✅ User created:', data.user)
} else {
  // Show error
  throw new Error(data.error)
}
```

---

## Security Benefits

### ✅ Service Role Key Protection
- **Before:** Exposed in browser bundle (anyone can extract it)
- **After:** Only exists on Supabase Edge Function (server-side)

### ✅ Permission Verification
- Edge Function verifies caller is ADMIN or SUPER_ADMIN
- Regular users cannot create users even if they know the endpoint

### ✅ RLS Bypass Controlled
- Service role key bypasses RLS but only in trusted server context
- Not accessible from browser console or developer tools

### ✅ Audit Trail
- All Edge Function calls are logged in Supabase
- Can track who created which users

---

## Testing in Development

### Option 1: Deploy to Supabase (Recommended)
```bash
supabase functions deploy create-user
# Then test from your React app
```

### Option 2: Local Development (Advanced)
```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve create-user

# Test with localhost URL
```

---

## Troubleshooting

### Error: "Failed to invoke function"

**Check:**
1. Edge Function deployed: `supabase functions list`
2. Function URL correct in logs
3. User is authenticated (JWT token present)

### Error: "Unauthorized: Admin privileges required"

**Check:**
1. Logged-in user has ROLE_ADMIN or ROLE_SUPER_ADMIN
2. User exists in public.users table
3. Role linkage is correct

### Error: "Missing authorization header"

**Check:**
1. User session exists: `supabase.auth.getSession()`
2. JWT token being sent in Authorization header

### Error: "Failed to create auth user"

**Check:**
1. Service role key secret is set: `supabase secrets list`
2. Email not already in use
3. Supabase project has auth enabled

---

## Monitoring

### View Edge Function Logs

```bash
# View recent logs
supabase functions logs create-user

# Follow logs in real-time
supabase functions logs create-user --follow
```

### Supabase Dashboard

1. Go to Edge Functions section
2. Click on `create-user`
3. View metrics:
   - Invocations
   - Errors
   - Response times

---

## Cost Considerations

### Edge Function Pricing (Supabase)

**Free Tier:**
- 500,000 invocations/month
- 400,000 GB-seconds compute
- More than enough for user creation

**Typical Usage:**
- 10 users created/day = 300/month
- Well within free tier limits

---

## Rollback Plan

If Edge Function has issues:

1. **Temporary Fix:** Disable user creation in UI
2. **Manual Creation:** Use Supabase Dashboard → Authentication → Add User
3. **Fix and Redeploy:** Debug Edge Function, deploy fix

**DO NOT** revert to exposing service role key in frontend!

---

## Summary

✅ **Secure Implementation Complete**
- Service role key never exposed to browser
- Edge Function handles all admin operations
- Permission checks in place
- Proper error handling and rollback

✅ **Deployment Ready**
- Edge Function code created
- Frontend updated to call Edge Function
- No environment secrets needed in frontend

✅ **Next Steps**
1. Deploy Edge Function: `supabase functions deploy create-user`
2. Set service role key secret: `supabase secrets set ...`
3. Test user creation from UI
4. Monitor Edge Function logs

The architecture is now secure and follows Supabase best practices for admin operations.
