# Supabase Configuration Guide for AVEMS

## 🎯 Quick Fix: Update Redirect URLs

### Your Vite App Runs On:
```
http://localhost:5175
```

### Supabase Currently Redirects To:
```
http://localhost:3000  ❌ WRONG
```

---

## 📝 Step-by-Step Configuration

### 1. Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Login to your account
3. Click on your **AVEMS project**

---

### 2. Navigate to Authentication Settings

**Path 1 (Recommended):**
- Left sidebar → Click **"Authentication"**
- Top tabs → Click **"URL Configuration"**

**Path 2 (Alternative):**
- Left sidebar → Click **"Settings"** (gear icon at bottom)
- Left menu → Click **"Authentication"**
- Scroll to **"Site URL"** and **"Redirect URLs"** sections

---

### 3. Update Site URL

Find the **"Site URL"** field:

```
Current:  http://localhost:3000        ❌
Change to: http://localhost:5175       ✅
```

**What is Site URL?**
- Primary URL of your application
- Used as default redirect after login
- Used for email confirmation links

**Click "Save" after changing!**

---

### 4. Update Redirect URLs

Find the **"Redirect URLs"** section:

#### Current (Wrong):
```
http://localhost:3000
http://localhost:3000/login
```

#### Should Be (Correct):
```
http://localhost:5175
http://localhost:5175/*
http://localhost:5175/login
http://localhost:5175/dashboard
```

**How to Add:**
- Some Supabase versions: Enter URLs one per line
- Some Supabase versions: Enter comma-separated
- Some Supabase versions: Click "+ Add URL" button for each

**What are Redirect URLs?**
- List of allowed URLs that Supabase can redirect to
- After login, signup, password reset, etc.
- Security feature to prevent redirect attacks
- Use `/*` wildcard to allow all routes under base URL

**Click "Save" after adding!**

---

### 5. Remove Old URLs

**Remove these if present:**
```
http://localhost:3000           ❌
http://localhost:3000/*         ❌
http://localhost:5173           ❌ (Vite default, not your port)
http://localhost:5173/*         ❌
```

**Keep these:**
```
http://localhost:5175           ✅
http://localhost:5175/*         ✅
```

---

## 🔍 Visual Checklist

### Site URL Section:
```
┌─────────────────────────────────────────┐
│ Site URL                                │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:5175               │ │ ✅
│ └─────────────────────────────────────┘ │
│                                         │
│ [ Save ]                                │
└─────────────────────────────────────────┘
```

### Redirect URLs Section:
```
┌─────────────────────────────────────────┐
│ Redirect URLs                           │
│                                         │
│ • http://localhost:5175                 │ ✅
│ • http://localhost:5175/*               │ ✅
│ • http://localhost:5175/login           │ ✅
│ • http://localhost:5175/dashboard       │ ✅
│                                         │
│ [ + Add URL ]  [ Save ]                 │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Steps

### After Saving Settings:

1. **Confirm Settings Saved:**
   - Refresh the Supabase Dashboard page
   - Check Site URL still shows `http://localhost:5175`
   - Check Redirect URLs still show port 5175

2. **Clear Browser Cache:**
   ```javascript
   // Open DevTools (F12) → Console
   localStorage.clear();
   sessionStorage.clear();
   ```
   - Then hard refresh: `Ctrl+Shift+R`

3. **Restart Vite Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Test Login:**
   - Navigate to: `http://localhost:5175/login`
   - Login with: `superadmin@ajantapharma.com` / `Test@123`
   - Should redirect to: `http://localhost:5175/dashboard` ✅
   - Should NOT redirect to: `http://localhost:3000` ❌

---

## 🐛 Troubleshooting

### "Settings won't save"
- Check you clicked the "Save" button
- Try refreshing the Supabase Dashboard
- Check browser console for errors
- Try different browser

### "Still redirects to port 3000"
- Double-check Site URL is `5175` not `3000`
- Clear ALL browser data (Settings → Clear browsing data)
- Try incognito/private mode
- Restart Vite dev server

### "Can't find URL Configuration"
- Try: Settings → Authentication
- Try: Authentication → Configuration
- Try: Project Settings → API → Auth
- Supabase UI updates frequently, look for "Site URL" or "Redirect"

### "Redirect URLs field is missing"
- Some Supabase versions auto-accept all localhost URLs
- Site URL is still important - make sure it's correct
- If you see "Additional Redirect URLs", use that

---

## 📋 Complete Settings Summary

### Authentication Settings You Need:

| Setting | Value | Required |
|---------|-------|----------|
| Site URL | `http://localhost:5175` | ✅ YES |
| Redirect URLs | `http://localhost:5175/*` | ✅ YES |
| Enable Email Auth | ✅ Enabled | ✅ YES |
| Confirm Email | Optional (disable for dev) | 📝 Optional |
| Enable Email Signup | ✅ Enabled | ✅ YES |

### Don't Change These (Use Defaults):

| Setting | Leave As Is |
|---------|-------------|
| JWT expiry | 3600 seconds |
| Refresh token rotation | Enabled |
| Session duration | 604800 seconds |
| Password strength | Default |

---

## 🌐 Production Configuration (Future)

When deploying to production:

### Site URL:
```
https://avems.ajantapharma.com
```

### Redirect URLs:
```
https://avems.ajantapharma.com
https://avems.ajantapharma.com/*
https://avems.ajantapharma.com/login
https://avems.ajantapharma.com/dashboard

# Keep localhost for dev:
http://localhost:5175
http://localhost:5175/*
```

---

## 🎯 Expected Flow After Fix

### Login Flow:
1. User visits: `http://localhost:5175/login`
2. User enters credentials and clicks "Sign in"
3. Supabase authenticates user
4. Supabase redirects to: `http://localhost:5175/dashboard` ✅
5. App shows dashboard with user session
6. Console shows: SESSION, USER, ROLE, HOTELS

### Wrong Flow (Before Fix):
1. User visits: `http://localhost:5175/login`
2. User enters credentials and clicks "Sign in"
3. Supabase authenticates user
4. Supabase redirects to: `http://localhost:3000/dashboard` ❌
5. Browser shows 404 or "Cannot connect"
6. User stuck, session lost

---

## 📞 Still Not Working?

If you've completed all steps and it still doesn't work:

1. **Check Console Errors:**
   - Open DevTools (F12) → Console tab
   - Look for red errors
   - Share error messages

2. **Check Network Tab:**
   - Open DevTools (F12) → Network tab
   - Filter: "auth"
   - Look at redirect responses
   - Check response headers

3. **Verify Supabase Connection:**
   ```javascript
   // In browser console:
   console.log(import.meta.env.VITE_SUPABASE_URL);
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
   // Should show your project URL and key
   ```

4. **Check `.env` File:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

---

## ✨ Success Indicators

After fixing redirect URLs, you should see:

- ✅ Login form at `http://localhost:5175/login`
- ✅ Successful login redirects to `http://localhost:5175/dashboard`
- ✅ Console shows session object
- ✅ Console shows user with email and role
- ✅ Console shows 6 hotels loaded
- ✅ Venue Explorer displays hotel cards
- ✅ No 404 errors
- ✅ No "Cannot connect" errors
- ✅ URL bar stays on port 5175

---

**Next:** After fixing redirect URLs, test login again and check the console output!
