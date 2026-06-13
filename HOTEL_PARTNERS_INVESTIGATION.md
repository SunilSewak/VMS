# Hotel Partners (VenueAdmin) Data Investigation
**Issue:** Hotel Partners page shows "No hotels created yet"  
**Severity:** 🟡 Medium (May be data issue, not code issue)  
**Status:** 🔍 Investigation Required

---

## Understanding the Issue

### What's Happening
The **Hotel Partners** page (at route `/administration/masters/venues`) displays:
```
No hotels created yet
```

But the **Venue Explorer** page (at route `/venue-explorer`) shows hotels properly.

### Why This Is Happening
Both pages use DIFFERENT data sources:

| Page | Component | Query Function | Data Source | Filters |
|------|-----------|---|---|---|
| **Hotel Partners** | VenueAdmin.tsx | `getHotels()` | ALL hotels | ✗ NONE |
| **Venue Explorer** | VenueExplorer.tsx | `searchVenues()` | ACTIVE hotels | ✓ status=ACTIVE, NOT blacklisted |

The difference: `getHotels()` gets everything, `searchVenues()` filters for ACTIVE.

---

## Three Possible Root Causes

### Scenario 1: Database is Empty 📭
**Question:** Are there actually any hotels in the database?

**Investigation:**
```sql
SELECT COUNT(*) as total_hotels FROM hotels;
```

**Expected Results:**
- If result is `0` → Database is empty → This is normal for new setup
- If result is `> 0` → Hotels exist → Check other causes

**Action if Empty:**
- Create first hotel using "Create Hotel" button
- No code issues, just database setup

---

### Scenario 2: Hotels Exist But Are Inactive 🔴
**Question:** Are hotels marked as INACTIVE or BLACKLISTED?

**Investigation:**
```sql
SELECT 
  id,
  hotel_name,
  status,
  blacklisted,
  created_at
FROM hotels
ORDER BY created_at DESC;
```

**Expected Results:**
```
id                  | hotel_name    | status     | blacklisted | created_at
-----------         | ------------- | ---------- | ----------- | ----
550e8400-...        | Taj Lands End | INACTIVE   | false       | 2024-01-15
660e8400-...        | Hyatt Mumbai  | ACTIVE     | true        | 2024-02-20
```

**Action if Inactive Hotels Found:**
- Update hotel status to ACTIVE
- Update blacklist to false
- Then they'll appear in both pages

```sql
UPDATE hotels 
SET status = 'ACTIVE', blacklisted = false 
WHERE hotel_name = 'Taj Lands End';
```

---

### Scenario 3: RLS Policy Blocking Access 🚫
**Question:** Is the Row Level Security policy denying reads?

**Investigation:**
```sql
SELECT 
  policy_name,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hotels'
ORDER BY policy_name;
```

**Expected Results:**
```
policy_name                 | permissive | roles       | qual
--------------------------- | ---------- | ----------- | ----
Hotels are publicly readable | true       | {authenticated} | (true)
Admin can manage hotels      | true       | {authenticated} | (auth.uid()=user_id)
```

**If RLS policy is MISSING or BLOCKING:**
- Policy might have restrictive conditions
- Current user role might not match policy
- Check if logged-in user has admin role

**Action if RLS Issue:**
1. Review the RLS policy
2. Check if current user role is in allowed roles
3. Ask super admin to verify policy grants access

---

## Step-by-Step Investigation

### Step 1: Check Database Data
Go to **Supabase Console** → **SQL Editor** → Run:

```sql
SELECT COUNT(*) as total_hotels FROM hotels;
```

**Result:** How many hotels?
- [ ] 0 → Database empty (normal)
- [ ] 1+ → Hotels exist (continue to Step 2)

---

### Step 2: Check Hotel Status
Run:

```sql
SELECT 
  hotel_name,
  status,
  blacklisted,
  created_at
FROM hotels
ORDER BY hotel_name;
```

**Result:** What are the hotel details?
- [ ] All ACTIVE, NOT blacklisted → Check RLS (Step 3)
- [ ] Some INACTIVE or blacklisted → Update status (see Scenario 2)

---

### Step 3: Check RLS Policies
Run:

```sql
SELECT 
  policy_name,
  expression
FROM pg_policies
WHERE tablename = 'hotels';
```

**Result:** What policies exist?
- [ ] Policies exist and look correct → Likely user/role issue
- [ ] Policies missing or restrictive → May need to be fixed

---

### Step 4: Test with Browser Console
1. Open Hotel Partners page
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Paste and run:

```javascript
// Check what error is happening
console.log('Checking page state...');
```

5. Look for error messages

---

### Step 5: Test with Network Tab
1. Open Hotel Partners page
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. **Refresh** the page
5. Look for a request like: `hotels` or `hotelsList`
6. **Click** the request
7. Go to **Response** tab
8. Check if:
   - [ ] Response shows `[]` (empty array) → Database is empty
   - [ ] Response shows data → RLS or rendering issue
   - [ ] Response shows error → Check error message

---

## Common Error Messages & Solutions

### Error: "PGRST116"
```
ERROR: PGRST116 - The maximum number of rows specified in the result was surpassed
```
**Cause:** Too many hotels  
**Solution:** Add pagination limit

---

### Error: "Permission denied"
```
ERROR: permission denied for schema public
```
**Cause:** RLS policy blocking access  
**Solution:** Review RLS policy grants access to user's role

---

### Error: "401 Unauthorized"
```
ERROR: 401 Unauthorized
```
**Cause:** User not authenticated or session expired  
**Solution:** Re-login

---

## Data Consistency Check

Once verified, run this comprehensive check:

```sql
-- Comprehensive hotel data audit
SELECT 
  'Total Hotels' as metric,
  COUNT(*)::text as value
FROM hotels

UNION ALL

SELECT 
  'Hotels (ACTIVE)',
  COUNT(*)::text
FROM hotels
WHERE status = 'ACTIVE'

UNION ALL

SELECT 
  'Hotels (NOT blacklisted)',
  COUNT(*)::text
FROM hotels
WHERE blacklisted = false

UNION ALL

SELECT 
  'Hotels (ACTIVE + NOT blacklisted)',
  COUNT(*)::text
FROM hotels
WHERE status = 'ACTIVE' AND blacklisted = false

UNION ALL

SELECT 
  'Hotels with photos',
  COUNT(DISTINCT h.id)::text
FROM hotels h
LEFT JOIN venue_photos vp ON h.id = vp.hotel_id
WHERE vp.id IS NOT NULL

UNION ALL

SELECT 
  'Total venue photos',
  COUNT(*)::text
FROM venue_photos

ORDER BY metric;
```

---

## Findings Template

Use this template to document findings:

### Investigation Results

**Date:** [Date]  
**Investigator:** [Name]

#### 1. Database Count
```
Total hotels: [count]
```
Status: [Empty / Has data]

#### 2. Hotel Status
```
ACTIVE: [count]
INACTIVE: [count]
Blacklisted: [count]
```
Status: [All good / Needs fixing]

#### 3. RLS Policies
```
Found policies: [yes/no]
Policies allow reads: [yes/no]
```
Status: [OK / Needs review]

#### 4. Root Cause
[Scenario 1/2/3 applies]

#### 5. Action Taken
[What was done to fix]

#### 6. Verification
Before: [Status]  
After: [Status]

---

## Quick Reference: SQL Commands

### Create Test Hotel
```sql
INSERT INTO hotels (
  hotel_name, 
  city_id, 
  address, 
  status, 
  blacklisted
) 
SELECT 
  'Test Hotel ' || NOW(),
  (SELECT id FROM cities LIMIT 1),
  '123 Test Street',
  'ACTIVE',
  false;
```

### Activate All Hotels
```sql
UPDATE hotels 
SET status = 'ACTIVE', blacklisted = false 
WHERE status != 'ACTIVE' OR blacklisted = true;
```

### Check City Reference
```sql
SELECT 
  h.hotel_name,
  c.city_name,
  h.status,
  h.blacklisted
FROM hotels h
LEFT JOIN cities c ON h.city_id = c.id
ORDER BY h.hotel_name;
```

### Check Foreign Key Issues
```sql
SELECT 
  h.id,
  h.hotel_name,
  h.city_id,
  c.id as city_exists
FROM hotels h
LEFT JOIN cities c ON h.city_id = c.id
WHERE h.city_id IS NOT NULL AND c.id IS NULL;
```

---

## When to Escalate

Escalate to super admin if:

1. **RLS Policy is blocking:** Admin permission needed to fix
2. **City references broken:** Data integrity issue
3. **Cannot connect to Supabase:** Connection issue
4. **Repeated errors after fixes:** Possible database corruption

---

## Next: After Investigation Complete

Once you've completed investigation:

1. **If Database Empty:**
   - No action needed (normal)
   - Create first hotel via UI

2. **If Hotels Inactive:**
   - Run UPDATE query to activate
   - Test page should now show data

3. **If RLS Issue:**
   - Document exact policy
   - Ask super admin to review
   - May need policy modification

---

**Investigation Checklist:**
- [ ] Ran database count query
- [ ] Checked hotel status values
- [ ] Reviewed RLS policies
- [ ] Tested in browser console
- [ ] Checked network response
- [ ] Documented findings
- [ ] Took corrective action (if needed)
- [ ] Verified fix works

---

**Status:** 🔍 Awaiting Investigation Results  
**Prepared by:** Kiro Development  
**Date:** June 13, 2026

