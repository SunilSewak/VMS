# Deploy Edge Function - Quick Start Guide

**Error:** "Failed to send a request to the Edge Function"  
**Cause:** Edge Function not deployed yet  
**Solution:** Deploy the Edge Function to Supabase

---

## Quick Setup (Windows)

### Step 1: Install Supabase CLI

**Option A: Using npm (Recommended)**
```bash
npm install -g supabase
```

**Option B: Using Scoop**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option C: Download Binary**
1. Go to: https://github.com/supabase/cli/releases
2. Download latest Windows release
3. Extract and add to PATH

### Step 2: Verify Installation
```bash
supabase --version
```

Expected: `1.x.x` or higher

### Step 3: Login to Supabase
```bash
supabase login
```

This will open a browser window. Login with your Supabase account.

### Step 4: Link to Your Project
```bash
cd "C:\Users\sunils\OneDrive - Ajanta Pharma Limited\Webapps\VMS"

supabase link --project-ref cqfctzjypanrwzrbvfjq
```

When prompted for database password, enter your Supabase database password.

### Step 5: Deploy the Edge Function
```bash
supabase functions deploy create-user
```

**Expected output:**
```
Deploying function: create-user
Function deployed successfully!
Function URL: https://cqfctzjypanrwzrbvfjq.supabase.co/functions/v1/create-user
```

### Step 6: Set Service Role Key Secret
```bash
# Get your service role key from Supabase Dashboard
# Dashboard → Settings → API → service_role key (click reveal/copy)

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 7: Test User Creation

Now go back to your React app and try creating a user. It should work!

---

## Alternative: Deploy via Supabase Dashboard (No CLI Needed)

If you don't want to install CLI, you can deploy via the dashboard:

### Step 1: Copy Edge Function Code

Open: `supabase/functions/create-user/index.ts`

Copy all the code.

### Step 2: Create Edge Function in Dashboard

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `cqfctzjypanrwzrbvfjq`
3. Click **Edge Functions** in left sidebar
4. Click **Create a new function**
5. Name: `create-user`
6. Paste the code from `index.ts`
7. Click **Deploy function**

### Step 3: Set Service Role Key

1. In Supabase Dashboard, go to **Project Settings**
2. Click **Edge Functions**
3. Click **Secrets**
4. Add new secret:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (Your service role key from Settings → API)
5. Save

### Step 4: Test

Try creating a user in your app again.

---

## Verify Edge Function is Deployed

### Method 1: Check Dashboard
1. Supabase Dashboard → Edge Functions
2. You should see `create-user` listed
3. Status should be "Active"

### Method 2: Test with Curl

```bash
# First, login to your app and get your JWT token from browser console:
# const session = await supabase.auth.getSession()
# console.log(session.data.session.access_token)

curl -X POST https://cqfctzjypanrwzrbvfjq.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","employee_name":"Test","role":"ADMIN","status":"ACTIVE"}'
```

**Success Response:**
```json
{
  "success": true,
  "user": {...}
}
```

---

## Troubleshooting

### "supabase command not found"

**Fix:** Supabase CLI not installed
```bash
npm install -g supabase
```

### "Project not linked"

**Fix:**
```bash
supabase link --project-ref cqfctzjypanrwzrbvfjq
```

### "Function not found"

**Fix:** Deploy the function
```bash
supabase functions deploy create-user
```

### "Unauthorized" Error

**Fix:** Check that:
1. You're logged in as Admin/Super Admin
2. Service role key secret is set correctly
3. Edge Function has the secret

### "Invalid service role key"

**Fix:**
1. Get correct key from Dashboard → Settings → API → service_role
2. Set secret again:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=correct-key-here
   ```

---

## What Happens After Deployment

### Before Deployment
```
Frontend → supabase.functions.invoke('create-user')
           ❌ 404 Not Found (function doesn't exist)
```

### After Deployment
```
Frontend → supabase.functions.invoke('create-user')
           ↓
Edge Function (Deployed on Supabase)
├── Verifies JWT token
├── Checks admin permissions
├── Creates auth user (with service role key)
├── Creates public.users record
└── Returns success
           ↓
Frontend ← Success response
```

---

## Quick Commands Reference

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref cqfctzjypanrwzrbvfjq

# Deploy function
supabase functions deploy create-user

# Set secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key

# View logs
supabase functions logs create-user

# List functions
supabase functions list

# List secrets
supabase secrets list
```

---

## File Structure (Already Created)

```
VMS/
├── supabase/
│   └── functions/
│       └── create-user/
│           └── index.ts  ✅ Already created
├── src/
│   └── features/
│       └── users/
│           └── userService.ts  ✅ Already updated to call Edge Function
└── .env  ✅ No service role key (secure)
```

---

## Summary

**Current Status:**
- ✅ Edge Function code created (`supabase/functions/create-user/index.ts`)
- ✅ Frontend updated to call Edge Function
- ✅ Service role key removed from frontend
- ❌ Edge Function not deployed yet

**Next Steps:**
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref cqfctzjypanrwzrbvfjq`
4. Deploy: `supabase functions deploy create-user`
5. Set secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`
6. Test user creation in app

Once deployed, the "Failed to send request" error will be fixed and user creation will work securely!
