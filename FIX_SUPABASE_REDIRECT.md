# Fix: Supabase Redirect URL Configuration

## Problem
- Authentication succeeds in Supabase
- User record exists in `auth.users`
- Supabase redirects to `http://localhost:3000` (wrong port)
- AVEMS runs on Vite at `http://localhost:5175` (correct port)
- Result: Login succeeds but callback fails (404 or blank page)

## Root Cause
Supabase authentication redirect URLs are configured for port 3000 (default React/Next.js) instead of port 5175 (Vite configuration).

---

## Solution: Update Supabase Redirect URLs

### Step 1: Update Supabase Dashboard Settings

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your AVEMS project

2. **Navigate to Authentication Settings:**
   - Click **"Authentication"** in the left sidebar
   - Click **"URL Configuration"** tab
   - (Or go to: Settings → Authentication)

3. **Update Site URL:**
   - Find the **"Site URL"** field
   - Current value: `http://localhost:3000` ❌
   - Change to: `http://localhost:5175` ✅
   - Click **"Save"**

4. **Update Redirect URLs:**
   - Find the **"Redirect URLs"** section (sometimes called "Additional Redirect URLs")
   - Add these URLs (one per line or comma-separated):
     ```
     http://localhost:5175
     http://localhost:5175/*
     http://localhost:5175/login
     http://localhost:5175/dashboard
     ```
   - **Remove** any URLs with port 3000 or 5173
   - Click **"Save"**

### Step 2: Clear Browser State

After updating Supabase settings:

```javascript
// Open browser DevTools console (F12)
localStorage.clear();
sessionStorage.clear();
```

Then hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

### Step 3: Test Login

1. **Navigate to:** `http://localhost:5175/login`
2. **Login with:**
   - Email: `superadmin@ajantapharma.com`
   - Password: `Test@123`
3. **Expected Result:**
   - Successful login
   - Redirect to: `http://localhost:5175/dashboard`
   - Console shows session, user, role, hotels
   - No 404 or redirect errors

---

## Verification

### Check 1: Verify Supabase Settings
In Supabase Dashboard → Authentication → URL Configuration:
- ✅ Site URL: `http://localhost:5175`
- ✅ Redirect URLs include: `http://localhost:5175/*`

### Check 2: Verify Vite is Running
```bash
npm run dev
```

Expected output:
```
VITE v5.3.1  ready in XXX ms

➜  Local:   http://localhost:5175/
➜  Network: http://192.168.x.x:5175/
```

### Check 3: Test Authentication Flow

1. **Open:** `http://localhost:5175/login`
2. **Login** with test credentials
3. **Check console** for diagnostic logs:
   ```javascript
   🔐 LOGIN SESSION: { access_token: "...", ... }
   👤 LOGIN USER: { email: "superadmin@ajantapharma.com", ... }
   🎭 ROLE: SUPER_ADMIN
   🏨 HOTELS AFTER LOGIN: [6 hotels]
   ```
4. **Check URL** after login: Should be `http://localhost:5175/dashboard`

---

## Troubleshooting

### Issue: Still redirects to port 3000

**Possible causes:**
1. Supabase settings not saved
2. Browser cached old redirect URL
3. Multiple redirect URLs conflict

**Fix:**
1. Re-check Supabase Dashboard settings
2. Clear all browser data (not just localStorage)
3. Try incognito/private browsing mode
4. Restart Vite dev server

### Issue: 404 after login

**Possible causes:**
1. Redirect URL not in allowed list
2. Route doesn't exist in app

**Fix:**
1. Verify `/dashboard` route exists in `App.tsx`
2. Add more specific redirect URLs in Supabase
3. Check browser Network tab for actual redirect URL

### Issue: Authentication succeeds but no session

**Possible causes:**
1. Cookies blocked
2. CORS issue
3. Supabase client not initialized

**Fix:**
1. Check browser settings allow cookies
2. Verify `.env` has correct Supabase URL and key
3. Check console for Supabase errors

---

## Production Configuration

When deploying to production, update Supabase redirect URLs:

1. **Site URL:**
   ```
   https://your-production-domain.com
   ```

2. **Redirect URLs:**
   ```
   https://your-production-domain.com
   https://your-production-domain.com/*
   https://your-production-domain.com/login
   https://your-production-domain.com/dashboard
   ```

3. **Keep localhost URLs** for development:
   ```
   http://localhost:5175
   http://localhost:5175/*
   ```

---

## Quick Reference

### Correct URLs for AVEMS:

| Environment | URL | Port |
|-------------|-----|------|
| Development | `http://localhost:5175` | 5175 |
| Production | `https://your-domain.com` | 443 |

### Incorrect URLs (Remove):

| URL | Issue |
|-----|-------|
| `http://localhost:3000` | Wrong port (React default) |
| `http://localhost:5173` | Wrong port (Vite default) |

### Why Port 5175?

Check `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5175  // ← Custom port configured
  }
});
```

---

## After Fix Checklist

- [ ] Supabase Site URL updated to `http://localhost:5175`
- [ ] Supabase Redirect URLs include `http://localhost:5175/*`
- [ ] Old port 3000 URLs removed from Supabase
- [ ] Browser cache cleared
- [ ] Vite dev server running on port 5175
- [ ] Can access `http://localhost:5175/login`
- [ ] Login succeeds and redirects to dashboard
- [ ] Console shows session and hotels data
- [ ] No 404 or redirect errors

---

## Test the Fix

```bash
# 1. Ensure Vite is running
npm run dev

# 2. Open browser to
http://localhost:5175/login

# 3. Clear cache (F12 console)
localStorage.clear();
sessionStorage.clear();

# 4. Login
Email: superadmin@ajantapharma.com
Password: Test@123

# 5. Verify
# - Redirects to http://localhost:5175/dashboard
# - Console shows session and hotels
# - No errors
```

---

**Status:** Configuration fix required  
**Effort:** 2 minutes  
**Risk:** None (configuration only)  
**Impact:** Fixes authentication redirect issue
