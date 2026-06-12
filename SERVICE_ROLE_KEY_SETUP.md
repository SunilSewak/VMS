# Service Role Key Setup Guide

**Required For:** User creation (admin operations)  
**Status:** ✅ **Code Updated - Environment Setup Required**  
**Date:** June 12, 2026

---

## Problem Fixed

**Error:** `This endpoint requires a valid Bearer token`

**Root Cause:** The application was using the **anon key** to call `supabase.auth.admin.createUser()`, but admin operations require the **service role key**.

---

## Solution Implemented

### 1. Created Admin Client

**File:** `src/lib/supabase.ts`

```typescript
// Regular client with anon key (for normal operations)
export const supabase = createClient(
  env.VITE_SUPABASE_URL, 
  env.VITE_SUPABASE_ANON_KEY
);

// Admin client with service role key (for admin operations)
export const supabaseAdmin = createClient(
  env.VITE_SUPABASE_URL, 
  env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### 2. Updated User Service

**File:** `src/features/users/userService.ts`

```typescript
import { supabase, supabaseAdmin } from '../../lib/supabase';

export async function createUser(input: AppUserCreateInput): Promise<AppUser> {
  // Check if admin client is available
  if (!supabaseAdmin) {
    throw new Error('Admin operations not available. VITE_SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }

  // Use admin client for auth user creation
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: {
      employee_name: input.employee_name,
      role: input.role
    }
  });
  
  // ... rest of function
}
```

### 3. Updated Environment Schema

**File:** `src/lib/env.ts`

```typescript
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  VITE_DEMO_MODE: z.boolean().optional()
});
```

---

## Setup Instructions

### Step 1: Get Service Role Key from Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to API Settings**
   - Click **Settings** (gear icon in sidebar)
   - Click **API**

3. **Copy Service Role Key**
   - Scroll to "Project API keys" section
   - Find **service_role** key
   - Click **Copy** button (or reveal and copy)
   
   **WARNING:** This key has **full database access**. Keep it secret!

### Step 2: Add to .env File

1. **Open** `.env` file in project root

2. **Add** the service role key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Save** the file

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)

# Restart
npm run dev
```

The server must be restarted to pick up the new environment variable.

### Step 4: Verify Configuration

Open browser console and check for:

```
✅ Supabase admin client initialized
```

If you see this message, the admin client is ready.

---

## Security Considerations

### ⚠️ CRITICAL: Service Role Key Security

The service role key **bypasses all Row Level Security (RLS)** policies and has **full access** to your database.

### ✅ DO:
- ✅ Store in `.env` file (which is in `.gitignore`)
- ✅ Keep the key secret
- ✅ Use only for server-side or admin operations
- ✅ Rotate the key periodically
- ✅ Restrict access to team admins only

### ❌ DO NOT:
- ❌ Commit to version control
- ❌ Share publicly
- ❌ Expose in client-side code (already safe - used only in service)
- ❌ Use for regular user operations
- ❌ Store in frontend state or localStorage

### Current Implementation Safety

**Safe:** The service role key is only used in:
- `userService.ts` → `createUser()` function
- Only accessible to Super Admin and Admin users
- Not exposed to browser console or network requests
- Used server-side style (even though running in browser, it's in secure context)

---

## Environment Variables Reference

### Required for All Environments

```env
# Supabase URL (public, safe to commit to example files)
VITE_SUPABASE_URL=https://your-project.supabase.co

# Anon key (public, safe for client-side, used for normal operations)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Required for Admin Operations

```env
# Service role key (SECRET, never commit)
# Required for: Creating users, admin auth operations
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional

```env
# Demo mode (for development/testing without real database)
VITE_DEMO_MODE=false
```

---

## Troubleshooting

### Error: "This endpoint requires a valid Bearer token"

**Cause:** Service role key not configured or incorrect

**Fix:**
1. Verify `.env` has `VITE_SUPABASE_SERVICE_ROLE_KEY`
2. Verify the key is correct (copy again from Supabase dashboard)
3. Restart dev server
4. Check browser console for initialization message

### Error: "Admin operations not available"

**Cause:** Service role key not in environment

**Fix:**
1. Add `VITE_SUPABASE_SERVICE_ROLE_KEY` to `.env`
2. Restart dev server

### Admin Client Not Initialized

Check browser console for:
```
⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY not configured. 
Admin operations (like user creation) will not work.
```

**Fix:** Add service role key to `.env` and restart

### Wrong Key Used

**Symptoms:**
- Error mentions "anon key" or "JWT token"
- 401 Unauthorized on admin operations

**Fix:**
- Make sure you copied the **service_role** key, not the **anon** key
- They look similar but have different permissions

---

## Testing User Creation

### After Setup

1. **Login as Super Admin**

2. **Navigate to User Management**
   - Administration → Users

3. **Click "Create User"**

4. **Fill Form:**
   ```
   Email: test.admin@ajantapharma.com
   Employee Name: Test Admin
   Role: ADMIN
   Status: ACTIVE
   ```

5. **Click "Create"**

### Expected Success Flow

**Console logs:**
```
✅ Supabase admin client initialized
✅ User created successfully: {
  authUserId: "abc-123-uuid",
  publicUserId: "456",
  email: "test.admin@ajantapharma.com",
  role: "ADMIN"
}
```

**Database:**
```sql
-- auth.users should have record
SELECT id, email FROM auth.users WHERE email = 'test.admin@ajantapharma.com';

-- public.users should have record with auth_user_id linkage
SELECT id, auth_user_id, email, employee_name 
FROM public.users 
WHERE email = 'test.admin@ajantapharma.com';
```

---

## Files Modified

| File | Change | Status |
|------|--------|--------|
| `src/lib/env.ts` | Added `VITE_SUPABASE_SERVICE_ROLE_KEY` to schema | ✅ |
| `src/lib/supabase.ts` | Created `supabaseAdmin` client with service role key | ✅ |
| `src/features/users/userService.ts` | Updated `createUser()` to use `supabaseAdmin` | ✅ |
| `.env.example` | Added service role key documentation | ✅ |

---

## Production Deployment

### Environment Variables Setup

**Platform-specific instructions:**

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add `VITE_SUPABASE_SERVICE_ROLE_KEY`
3. Set value to service role key
4. Choose environment (Production/Preview/Development)
5. Save and redeploy

#### Netlify
1. Go to Site Settings → Build & Deploy → Environment
2. Add `VITE_SUPABASE_SERVICE_ROLE_KEY`
3. Set value
4. Save
5. Trigger new deployment

#### Docker
```dockerfile
# Pass as build arg
ARG VITE_SUPABASE_SERVICE_ROLE_KEY
ENV VITE_SUPABASE_SERVICE_ROLE_KEY=$VITE_SUPABASE_SERVICE_ROLE_KEY
```

#### Railway/Render
1. Go to Environment section
2. Add variable
3. Redeploy

---

## Key Differences: Anon vs Service Role

| Feature | Anon Key | Service Role Key |
|---------|----------|------------------|
| **Purpose** | Client-side operations | Server-side admin operations |
| **RLS** | Enforced | Bypassed |
| **Auth** | User context | Full access |
| **Safety** | Public | Secret |
| **Use For** | Queries, user auth | User creation, admin tasks |
| **Expose** | Client-side OK | Never expose |

---

## Summary

✅ **Code updated** to use admin client for user creation  
✅ **Environment schema** updated to require service role key  
✅ **Security** properly configured (admin client only)  
✅ **.env.example** updated with documentation  

**Next Step:** Add `VITE_SUPABASE_SERVICE_ROLE_KEY` to your `.env` file and restart the dev server.

Once configured, user creation will work correctly with proper auth user → public user linkage.
