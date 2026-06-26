-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS password_reset_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table for Employee ID-based authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  mobile_number VARCHAR(20),
  designation VARCHAR(100),
  cluster VARCHAR(100),
  team VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'SALES_HEAD',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  force_password_change BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create index on employee_id for faster lookups
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Create index on role for filtering
CREATE INDEX idx_users_role ON users(role);

-- Create index on status for filtering
CREATE INDEX idx_users_status ON users(status);

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_role 
  CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SALES_HEAD'));

-- Add check constraint for valid status
ALTER TABLE users ADD CONSTRAINT check_status 
  CHECK (status IN ('ACTIVE', 'DISABLED'));

-- Create audit trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create password reset requests table
CREATE TABLE password_reset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) NOT NULL,
  request_reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for password reset requests
CREATE INDEX idx_password_reset_user_id ON password_reset_requests(user_id);

-- Create index on status for password reset requests
CREATE INDEX idx_password_reset_status ON password_reset_requests(status);

-- Add check constraint for password reset status
ALTER TABLE password_reset_requests ADD CONSTRAINT check_reset_status 
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'));

-- Insert default Super Admin user (password: Admin@123 - will be hashed via application)
-- This is a placeholder - the actual password hash should be generated using bcrypt
INSERT INTO users (employee_id, password_hash, employee_name, designation, cluster, team, role, status, force_password_change)
VALUES ('ADMIN001', '$2b$12$placeholder_hash_will_be_replaced', 'System Administrator', 'Super Admin', 'Corporate', 'IT', 'SUPER_ADMIN', 'ACTIVE', true)
ON CONFLICT (employee_id) DO NOTHING;

-- Note: Row Level Security (RLS) is disabled for this custom authentication system
-- Authorization is handled at the application layer via AuthService and ProtectedRoute
-- If using Supabase Auth in the future, enable RLS and add appropriate policies
