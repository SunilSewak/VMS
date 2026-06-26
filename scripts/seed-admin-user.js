/**
 * Seed script to create initial Super Admin user
 * Run this script after setting up the database to create the first admin user
 * 
 * Usage: node scripts/seed-admin-user.js
 */

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
console.log('Loading environment...');
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
console.log('');
if (supabaseUrl) {
  console.log('✓ VITE_SUPABASE_URL found');
} else {
  console.error('✗ VITE_SUPABASE_URL not found');
}

if (supabaseKey) {
  console.log('✓ VITE_SUPABASE_ANON_KEY found');
} else {
  console.error('✗ VITE_SUPABASE_ANON_KEY not found');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('');
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
  console.error('   Please configure your .env file with Supabase credentials.');
  process.exit(1);
}

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Connected successfully.');

async function seedAdminUser() {
  console.log('Checking for ADMIN001...');

  try {
    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', 'ADMIN001')
      .single();

    if (existingUser) {
      console.log('⚠️  Admin user already exists with Employee ID: ADMIN001');
      console.log('   Updating password to default...');
      
      // Hash the default password
      const defaultPassword = 'Admin@123';
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

      // Update the existing user's password
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          force_password_change: true,
          status: 'ACTIVE',
        })
        .eq('employee_id', 'ADMIN001');

      if (updateError) {
        console.error('❌ Error updating admin password:', updateError);
        console.error('   Full error details:', JSON.stringify(updateError, null, 2));
        process.exit(1);
      }

      console.log('✅ Password updated successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('   Employee ID: ADMIN001');
      console.log('   Password: Admin@123');
      console.log('\n⚠️  IMPORTANT:');
      console.log('   - User will be required to change password on first login');
      console.log('   - Please change the default password immediately after first login');
      return;
    }

    console.log('Admin not found.');
    console.log('Creating administrator...');

    // Hash the default password
    const defaultPassword = 'Admin@123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Create the admin user in the custom users table
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
      console.error('   Full error details:', JSON.stringify(insertError, null, 2));
      process.exit(1);
    }

    console.log('Administrator created successfully.');
    console.log('\n✅ Super Admin user created successfully!');
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
    console.error('   Full error details:', error);
    process.exit(1);
  }
}

// Run the seed function
console.log('Done.');
seedAdminUser()
  .then(() => {
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
