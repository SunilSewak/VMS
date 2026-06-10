-- remove_commercials_schema.sql
-- Run this in Supabase SQL editor to drop quotation, negotiation, and commercial tables and columns.

-- 1. Remove references and foreign key constraints on bookings table
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_approved_commercial_fkey;
ALTER TABLE bookings DROP COLUMN IF EXISTS approved_commercial_id;

-- 2. Drop the tables completely
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS negotiation_history CASCADE;
DROP TABLE IF EXISTS approved_commercials CASCADE;
