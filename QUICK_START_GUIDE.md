# 🚀 Quick Start Guide - Testing Real Authentication

## Prerequisites Checklist
- [ ] Supabase project is running
- [ ] `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Test users created in Supabase Dashboard
- [ ] RLS policies applied

---

## 1️⃣ Create Test Users (5 minutes)

### Option A: Via Supabase Dashboard (Recommended)

1. Open Supabase Dashboard: `https://supabase.com/dashboard`
2. Select your project
3. Go to: **Authentication** → **Users**
4. Click **"Add User"** button

#### Create SUPER_ADMIN User:
- **Email:** `superadmin@ajantapharma.com`
- **Password:** `Test@123`
- **Auto Confirm User:** ✅ (checked)
- **User Metadata (click "Additional User Data"):**
  ```json
  {
    "role": "SUPER_ADMIN",
    "full_name": "Super Admin"
  }
  ```
- Click **"Create User"**

#### Create ADMIN User:
- **Email:** `admin@ajantapharma.com`
- **Password:** `Test@123`
- **Auto Confirm User:** ✅
- **User Metadata:**
  ```json
  {
    "role": "ADMIN",
    "full_name": "Admin User"
  }
  ```

#### Create SALES_HEAD User:
- **Email:** `saleshead@ajantapharma.com`
- **Password:** `Test@123`
- **Auto Confirm User:** ✅
- **User Metadata:**
  ```json
  {
    "role": "SALES_HEAD",
    "full_name": "Sales Head"
  }
  ```

---

## 2️⃣ Apply RLS Policies (2 minutes)

1. Open Supabase Dashboard
2. Go to: **SQL Editor**
3. Click **"New Query"**
4. Copy and paste from `enable_anonymous_access.sql` OR use this:

```sql
-- Allow authenticated users to read venue data
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON hotels
  FOR SELECT TO authenticated USING (true);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON cities
  FOR SELECT TO authenticated USING (true);

ALTER TABLE hotel_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON hotel_categories
  FOR SELECT TO authenticated USING (true);

ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON halls
  FOR SELECT TO authenticated USING (true);

ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON venue_photos
  FOR SELECT TO authenticated USING (true);

ALTER TABLE venue_shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON venue_shortlists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

5. Click **"Run"**

---

## 3️⃣ Start Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:5173`

---

## 4️⃣ Test Login (1 minute)

1. **Clear Browser Cache:**
   - Open DevTools (F12)
   - Go to Console tab
   - Run:
     ```javascript
     localStorage.clear();
     sessionStorage.clear();
     ```
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

2. **Navigate to Login:**
   - Go to: `http://localhost:5173/login`
   - You should see email/password form

3. **Login:**
   - **Email:** `superadmin@ajantapharma.com`
   - **Password:** `Test@123`
   - Click **"Sign in"**

4. **Check Console (F12):**
   - Look for these logs:
     ```
     🔐 LOGIN SESSION: { ... }
     👤 LOGIN USER: { ... }
     🎭 ROLE: SUPER_ADMIN
     🏨 HOTELS AFTER LOGIN: [6 hotels]
     ```

5. **Expected Result:**
   - Redirected to `/dashboard`
   - No errors in console
   - User is authenticated

---

## 5️⃣ Test Venue Explorer (30 seconds)

1. **Navigate to Venue Explorer:**
   - Click "Venue Explorer" in sidebar OR
   - Go to: `http://localhost:5173/venue-explorer`

2. **Expected Result:**
   - ✅ Page loads without errors
   - ✅ Shows 6 hotel cards
   - ✅ Can search and filter venues
   - ✅ No "No venues match" message (if using real data)

---

## 6️⃣ Verify Diagnostics

### Open Browser Console (F12)

You should see:

```javascript
✅ 🔐 SESSION: { access_token: "...", user: {...} }
✅ 👤 USER: { email: "superadmin@ajantapharma.com", ... }
✅ 🎭 ROLE: SUPER_ADMIN
✅ 🏨 HOTELS: [array with 6 hotels]
```

### If You See Errors:

#### ❌ `hotels: []` (empty array)
**Problem:** RLS policies blocking access  
**Fix:** Re-run RLS policy SQL from Step 2

#### ❌ `SESSION: null`
**Problem:** User not authenticated  
**Fix:** 
- Verify user exists in Supabase Dashboard
- Check `.env` has correct Supabase credentials
- Clear cache and try again

#### ❌ `ROLE: undefined`
**Problem:** User metadata missing role  
**Fix:** 
- Edit user in Supabase Dashboard
- Add user_metadata with role field
- Or re-create user with metadata

---

## 7️⃣ Test All Roles

### Login as Different Roles:

**SUPER_ADMIN:**
- Email: `superadmin@ajantapharma.com`
- Should see: All navigation items (12+ items)
- Can access: All routes

**ADMIN:**
- Email: `admin@ajantapharma.com`
- Should see: Dashboard, Requests, Venues, Commercials, Bookings, Invoices, Payments, Reports, Masters
- Cannot access: Venue Explorer, My Shortlists (Sales Head features)

**SALES_HEAD:**
- Email: `saleshead@ajantapharma.com`
- Should see: Dashboard, Meetings, Venue Explorer, My Shortlists, Bookings, Reports
- Cannot access: Venues Master, Masters (Admin features)

---

## 🎉 Success Criteria

- [x] Login page shows email/password form (not role buttons)
- [x] Can login with test credentials
- [x] Console shows session, user, role, and hotels
- [x] Hotels array has 6 items
- [x] Venue Explorer displays 6 hotel cards
- [x] Navigation shows correct items for role
- [x] No RLS or authentication errors

---

## 🐛 Common Issues & Fixes

### Issue: "Invalid login credentials"
**Cause:** User doesn't exist or wrong password  
**Fix:** Verify user created in Supabase Dashboard, check email spelling

### Issue: Empty hotels array
**Cause:** RLS policies blocking access  
**Fix:** Run RLS policy SQL, ensure user is authenticated

### Issue: "Network error" or CORS error
**Cause:** Wrong Supabase URL or CORS misconfiguration  
**Fix:** Check `.env` file, verify Supabase project URL

### Issue: Role is undefined
**Cause:** Missing user_metadata  
**Fix:** Edit user in Dashboard, add metadata with role field

### Issue: Page refresh logs out user
**Cause:** Session not persisting  
**Fix:** Check localStorage in DevTools, verify Supabase session exists

---

## 📋 Verification Checklist

After completing all steps:

- [ ] Test users created (SUPER_ADMIN, ADMIN, SALES_HEAD)
- [ ] RLS policies applied and working
- [ ] Can login with email/password
- [ ] Console shows session and hotels
- [ ] Venue Explorer displays hotels
- [ ] SUPER_ADMIN sees all navigation items
- [ ] ADMIN sees limited navigation items
- [ ] SALES_HEAD sees different limited items
- [ ] Logout works correctly
- [ ] Session persists after page refresh

---

## 🔧 Next Steps

Once everything works:

1. **Remove diagnostic logs** from `AuthContext.tsx`
2. **Test all features** with different roles
3. **Create production users** with secure passwords
4. **Document production setup** process
5. **Add password reset functionality** (optional)
6. **Enable email verification** (optional)

---

## 📞 Need Help?

1. Check `AUTH_FIX_SUMMARY.md` for detailed changes
2. Check `FIX_VENUE_EXPLORER_RLS.md` for RLS troubleshooting
3. Check `SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md` for role governance
4. Review Supabase logs in Dashboard
5. Check browser console for errors

---

**Ready to start?** Begin with Step 1! 🚀
