-- ===================================================================
-- CREATE TEST USERS FOR AVEMS
-- ===================================================================
-- Run this script in Supabase SQL Editor to create test user accounts
-- These users can then be used to login with real Supabase authentication
-- ===================================================================

-- Note: Supabase creates users through the auth.users table
-- User metadata (role, full_name) is stored in raw_user_meta_data
-- Passwords are hashed automatically by Supabase

-- You must create these users through the Supabase Dashboard UI:
-- Dashboard → Authentication → Users → Add User

-- ===================================================================
-- MANUAL USER CREATION INSTRUCTIONS
-- ===================================================================
-- Go to: Supabase Dashboard → Authentication → Users → "Add User"
-- Create each user with the following details:

-- 1. SUPER_ADMIN User
--    Email: superadmin@ajantapharma.com
--    Password: Test@123
--    Auto Confirm User: ✓ (checked)
--    User Metadata (JSON):
--    {
--      "role": "SUPER_ADMIN",
--      "full_name": "Super Admin"
--    }

-- 2. ADMIN User
--    Email: admin@ajantapharma.com
--    Password: Test@123
--    Auto Confirm User: ✓ (checked)
--    User Metadata (JSON):
--    {
--      "role": "ADMIN",
--      "full_name": "Admin User"
--    }

-- 3. SALES_HEAD User
--    Email: saleshead@ajantapharma.com
--    Password: Test@123
--    Auto Confirm User: ✓ (checked)
--    User Metadata (JSON):
--    {
--      "role": "SALES_HEAD",
--      "full_name": "Sales Head"
--    }

-- 4. FINANCE User
--    Email: finance@ajantapharma.com
--    Password: Test@123
--    Auto Confirm User: ✓ (checked)
--    User Metadata (JSON):
--    {
--      "role": "FINANCE",
--      "full_name": "Finance User"
--    }

-- 5. VIEWER User
--    Email: viewer@ajantapharma.com
--    Password: Test@123
--    Auto Confirm User: ✓ (checked)
--    User Metadata (JSON):
--    {
--      "role": "VIEWER",
--      "full_name": "Viewer User"
--    }

-- ===================================================================
-- VERIFY USERS WERE CREATED
-- ===================================================================
-- Run this query to verify users exist:

SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email LIKE '%@ajantapharma.com'
ORDER BY created_at DESC;

-- ===================================================================
-- ALTERNATIVE: Create users programmatically (if you have service_role key)
-- ===================================================================
-- If you want to create users programmatically, use the Supabase Admin API
-- or run this from a secure server with service_role access:

/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // DO NOT expose this in client code!
)

const testUsers = [
  { email: 'superadmin@ajantapharma.com', role: 'SUPER_ADMIN', name: 'Super Admin' },
  { email: 'admin@ajantapharma.com', role: 'ADMIN', name: 'Admin User' },
  { email: 'saleshead@ajantapharma.com', role: 'SALES_HEAD', name: 'Sales Head' },
  { email: 'finance@ajantapharma.com', role: 'FINANCE', name: 'Finance User' },
  { email: 'viewer@ajantapharma.com', role: 'VIEWER', name: 'Viewer User' }
]

for (const user of testUsers) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: 'Test@123',
    email_confirm: true,
    user_metadata: {
      role: user.role,
      full_name: user.name
    }
  })
  
  if (error) {
    console.error(`Failed to create ${user.email}:`, error)
  } else {
    console.log(`Created user: ${user.email}`)
  }
}
*/

-- ===================================================================
-- CLEANUP (if needed)
-- ===================================================================
-- To delete test users, run:
-- DELETE FROM auth.users WHERE email LIKE '%@ajantapharma.com';
-- WARNING: This will permanently delete users and their data!
