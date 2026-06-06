# SUPER_ADMIN Testing & Verification Guide

## 🎯 Purpose
This guide provides step-by-step instructions to verify that the SUPER_ADMIN authorization governance is working correctly.

---

## 🚀 Pre-Testing Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open the Application
Navigate to `http://localhost:5173` (or your configured port)

---

## 📝 Test Plan

### Test 1: SUPER_ADMIN Login & Navigation Visibility

#### Steps:
1. Navigate to the login page
2. Login using SUPER_ADMIN credentials or mock login:
   ```typescript
   signInWithMock(ROLES.SUPER_ADMIN)
   ```
3. Observe the navigation menu (sidebar/header)

#### Expected Results:
✅ **All navigation items should be visible:**
- Dashboard
- Requests
- Meetings
- Venue Explorer
- Venue Comparison (newly added)
- My Shortlists
- Venues
- Commercials
- My Quotations
- Bookings
- Invoices
- Payments
- Reports
- Masters

#### Screenshot Requirements:
📸 Capture the full navigation menu showing all items

#### Pass Criteria:
- [ ] All 14+ navigation items visible
- [ ] No items hidden or filtered out
- [ ] Navigation renders without errors

---

### Test 2: Venue Explorer Route Access

#### Steps:
1. While logged in as SUPER_ADMIN
2. Click "Venue Explorer" in navigation OR navigate to `/venue-explorer`
3. Verify page loads successfully
4. Navigate to a venue detail page `/venue-explorer/123`
5. Navigate to venue comparison `/venue-comparison`
6. Navigate to my shortlists `/my-shortlists`

#### Expected Results:
✅ **All venue-related pages should load without restriction:**
- `/venue-explorer` - Loads successfully
- `/venue-explorer/:id` - Loads successfully
- `/venue-comparison` - Loads successfully (placeholder page)
- `/my-shortlists` - Loads successfully

#### Screenshot Requirements:
📸 Capture each of the 4 venue pages:
1. Venue Explorer main page
2. Venue Details page
3. Venue Comparison page
4. My Shortlists page

#### Pass Criteria:
- [ ] No "Access Denied" messages
- [ ] No redirect to login or dashboard
- [ ] Pages render correctly
- [ ] No console errors related to permissions

---

### Test 3: All Module Access Verification

#### Steps:
Test each module by clicking navigation items or entering URLs directly:

1. **Dashboard:** `/dashboard`
2. **Meeting Requests:** `/meeting-requests`
3. **Venues (Hotels):** `/hotels`
4. **Quotations (Commercials):** `/quotations`
5. **Bookings:** `/bookings`
6. **Finance:** `/finance`
7. **Reports:** `/reports`
8. **Masters (Users):** `/settings/users`
9. **Approvals:** `/approvals`

#### Expected Results:
✅ **All modules should be accessible:**
- Each route loads successfully
- No "Access Denied" or "Unauthorized" messages
- Full functionality available (buttons, forms, data)

#### Screenshot Requirements:
📸 Capture at least 3-4 different module pages showing successful access

#### Pass Criteria:
- [ ] All routes accessible
- [ ] No permission errors
- [ ] UI elements not disabled or hidden
- [ ] Can perform actions (view, create, edit based on UI)

---

### Test 4: Compare with Other Roles

#### Steps:
1. **Logout from SUPER_ADMIN**
2. **Login as SALES_HEAD:**
   ```typescript
   signInWithMock(ROLES.SALES_HEAD)
   ```
3. Observe navigation menu
4. Try accessing ADMIN-only routes like `/hotels` or `/settings/users`

5. **Logout and Login as ADMIN:**
   ```typescript
   signInWithMock(ROLES.ADMIN)
   ```
6. Observe navigation menu
7. Try accessing SALES_HEAD-only routes like `/venue-explorer`

8. **Compare navigation visibility across roles**

#### Expected Results:

**SALES_HEAD sees (limited view):**
- Dashboard
- Meetings
- Venue Explorer
- Venue Comparison
- My Shortlists
- My Quotations
- Bookings
- Reports

**SALES_HEAD should get "Access Denied" for:**
- `/hotels` (Venues Master)
- `/settings/users` (Masters)
- `/finance` routes

**ADMIN sees (limited view):**
- Dashboard
- Requests
- Venues
- Commercials
- Bookings
- Invoices
- Payments
- Reports
- Masters

**ADMIN should get "Access Denied" for:**
- `/venue-explorer` (Sales Head specific)
- `/my-shortlists` (Sales Head specific)

**SUPER_ADMIN sees (UNION of all):**
- ALL items from SALES_HEAD view
- ALL items from ADMIN view
- Any future modules

#### Screenshot Requirements:
📸 Capture navigation menu for:
1. SUPER_ADMIN (all items)
2. SALES_HEAD (limited items)
3. ADMIN (different limited items)

📸 Capture "Access Denied" screens for:
1. SALES_HEAD trying to access `/hotels`
2. ADMIN trying to access `/venue-explorer`

#### Pass Criteria:
- [ ] SUPER_ADMIN sees MORE items than any other role
- [ ] Other roles get "Access Denied" for restricted routes
- [ ] SUPER_ADMIN never gets "Access Denied"
- [ ] Navigation reflects role-based filtering for non-SUPER_ADMIN

---

### Test 5: Permission-Gated Features

#### Steps:
1. Login as SUPER_ADMIN
2. Navigate to a page with create/edit/delete functionality (e.g., `/hotels`, `/meeting-requests`)
3. Verify action buttons are visible and enabled:
   - "Add New" buttons
   - "Edit" buttons
   - "Delete" buttons
   - "Approve/Reject" buttons
   - Form inputs not disabled

4. Perform a test action (e.g., open create form, fill fields)

#### Expected Results:
✅ **SUPER_ADMIN should have full UI access:**
- All action buttons visible
- No disabled/greyed-out buttons due to permissions
- Forms fully functional
- Can initiate CRUD operations

#### Screenshot Requirements:
📸 Capture pages showing enabled action buttons:
1. Meeting Requests page with "New Request" button
2. Hotels/Venues page with admin actions
3. Any form showing all fields enabled

#### Pass Criteria:
- [ ] All administrative buttons visible
- [ ] No permission-based UI restrictions
- [ ] Forms and inputs fully functional
- [ ] No tooltips saying "You don't have permission"

---

### Test 6: Future Module Simulation

#### Steps:
1. **Add a test navigation item** (temporarily for testing):
   
   Edit `src/config/navigation.ts`:
   ```typescript
   {
     name: 'Test Module',
     path: '/test-module',
     iconName: 'TestTube',
     roles: [ROLES.ADMIN] // Note: SUPER_ADMIN NOT in list
   }
   ```

2. **Create a simple test route** in `src/App.tsx`:
   ```typescript
   <Route path="/test-module" element={
     <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
       <AppLayout>
         <div>Test Module - Future Feature</div>
       </AppLayout>
     </ProtectedRoute>
   } />
   ```

3. **Login as SUPER_ADMIN**
4. Check if "Test Module" appears in navigation
5. Navigate to `/test-module`
6. Verify access is granted

7. **Login as SALES_HEAD**
8. Check if "Test Module" appears in navigation (should NOT)
9. Navigate to `/test-module` directly
10. Verify "Access Denied" is shown

#### Expected Results:
✅ **SUPER_ADMIN automatically gets access to new module:**
- "Test Module" visible in SUPER_ADMIN navigation
- `/test-module` route accessible to SUPER_ADMIN
- No code changes needed for SUPER_ADMIN access

❌ **SALES_HEAD does NOT get access:**
- "Test Module" NOT visible in SALES_HEAD navigation
- `/test-module` shows "Access Denied" for SALES_HEAD

#### Screenshot Requirements:
📸 Capture:
1. SUPER_ADMIN navigation with "Test Module" visible
2. SUPER_ADMIN accessing `/test-module` successfully
3. SALES_HEAD navigation WITHOUT "Test Module"
4. SALES_HEAD getting "Access Denied" at `/test-module`

#### Pass Criteria:
- [ ] New module visible to SUPER_ADMIN without explicit configuration
- [ ] New module accessible to SUPER_ADMIN
- [ ] New module correctly restricted for other roles
- [ ] Demonstrates future-proof design

#### Cleanup:
Remove the test module code after verification.

---

## 🔍 Console Checks

During all tests, monitor the browser console for:

### ✅ Good Signs:
- No error messages related to permissions
- No "Access Denied" logs for SUPER_ADMIN
- Navigation renders without warnings
- Route transitions work smoothly

### ❌ Bad Signs:
- Permission errors in console
- "User does not have access" warnings for SUPER_ADMIN
- React rendering errors
- Route protection failures

---

## 📊 Test Results Summary

### Overall Pass Criteria:

#### Navigation (Test 1):
- [ ] All navigation items visible to SUPER_ADMIN
- [ ] Navigation renders without errors

#### Venue Routes (Test 2):
- [ ] `/venue-explorer` accessible
- [ ] `/venue-explorer/:id` accessible
- [ ] `/venue-comparison` accessible
- [ ] `/my-shortlists` accessible

#### Module Access (Test 3):
- [ ] All 9+ core modules accessible
- [ ] No "Access Denied" messages
- [ ] Full functionality available

#### Role Comparison (Test 4):
- [ ] SUPER_ADMIN sees more than SALES_HEAD
- [ ] SUPER_ADMIN sees more than ADMIN
- [ ] Other roles get appropriate restrictions

#### Permission Features (Test 5):
- [ ] All action buttons visible/enabled
- [ ] Forms fully functional
- [ ] No permission-based UI restrictions

#### Future Modules (Test 6):
- [ ] New module auto-accessible to SUPER_ADMIN
- [ ] Governance pattern works for future additions

---

## 🐛 Troubleshooting Failed Tests

### If SUPER_ADMIN can't see a module:
1. Check `src/config/navigation.ts` - Is route defined?
2. Check `getNavigationForRole()` - Is SUPER_ADMIN check present?
3. Clear browser cache and reload
4. Check console for JavaScript errors

### If "Access Denied" appears for SUPER_ADMIN:
1. Verify login role is actually SUPER_ADMIN (check user object)
2. Check `src/contexts/AuthContext.tsx` - Is ProtectedRoute override present?
3. Review route definition in `src/App.tsx`
4. Check if custom access logic was added that bypasses governance

### If navigation items don't appear:
1. Verify navigation component uses `getNavigationForRole()`
2. Check if navigation config was modified
3. Inspect React component tree for filtering logic
4. Check user.role value in AuthContext

---

## 📸 Screenshot Checklist

Required screenshots for verification:

- [ ] SUPER_ADMIN navigation menu (all items visible)
- [ ] Venue Explorer page
- [ ] Venue Details page  
- [ ] Venue Comparison page
- [ ] My Shortlists page
- [ ] 3-4 other module pages (Dashboard, Hotels, Finance, Reports)
- [ ] SALES_HEAD navigation menu (limited items)
- [ ] ADMIN navigation menu (limited items)
- [ ] "Access Denied" for SALES_HEAD on restricted route
- [ ] "Access Denied" for ADMIN on restricted route
- [ ] Test module visible to SUPER_ADMIN
- [ ] Test module access denied for SALES_HEAD

**Total Screenshots Needed:** ~12-15 screenshots

---

## ✅ Sign-Off

Once all tests pass:

1. Compile test results
2. Organize screenshots
3. Document any issues found
4. Confirm implementation meets requirements:
   - ✅ SUPER_ADMIN has global access
   - ✅ Navigation shows all items
   - ✅ Route protection works
   - ✅ Permission helpers implemented
   - ✅ Future-proof governance

5. Approve for deployment

---

## 📅 Testing Metadata

**Test Date:** _____________  
**Tester Name:** _____________  
**Browser Used:** _____________  
**Environment:** Development / Staging / Production  
**Build Version:** _____________  
**Test Result:** ✅ Pass / ❌ Fail  

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Next Steps After Testing:**
1. Review screenshots with stakeholders
2. Address any issues found
3. Update documentation if needed
4. Proceed with deployment if all tests pass
