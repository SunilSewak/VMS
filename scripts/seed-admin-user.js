/**
 * Seed script to create initial Super Admin user
 * Run this script after setting up the database to create the first admin user
 * 
 * Usage: node scripts/seed-admin-user.js
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdminUser() {
  console.log('🌱 Seeding initial Super Admin user...');

  try {
    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', 'ADMIN001')
      .single();

    if (existingUser) {
      console.log('⚠️  Admin user already exists with Employee ID: ADMIN001');
      console.log('   Skipping creation.');
      return;
    }

    // Hash the default password
    const defaultPassword = 'Admin@123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Create the admin user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        employee_id: 'ADMIN001',
        password_hash: passwordHash,
        employee_name: 'System Administrator',
        designation: 'Super Admin',
        cluster: 'Corporate',
        team: 'IT',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        force_password_change: true, // Force password change on first login
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin user:', insertError);
      process.exit(1);
    }

    console.log('✅ Super Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Employee ID: ADMIN001');
    console.log('   Password: Admin@123');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - User will be required to change password on first login');
    console.log('   - Please change the default password immediately after first login');
    console.log('   - Keep these credentials secure and share only with authorized personnel');
    console.log('   - Delete this script after use in production');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdminUser()
  .then(() => {
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
