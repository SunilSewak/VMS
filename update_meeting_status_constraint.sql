-- update_meeting_status_constraint.sql
-- Run this script in the Supabase SQL Editor to update the meeting status check constraint.
-- This allows the database to accept the new workflow statuses: VENUES_SHORTLISTED, SUBMITTED_TO_ADMIN, and AVAILABILITY_CHECK.

-- 1. Drop the existing status constraint if it exists
ALTER TABLE meeting_requests DROP CONSTRAINT IF EXISTS chk_meeting_status;

-- 2. Add the updated check constraint with all legacy and new statuses
ALTER TABLE meeting_requests ADD CONSTRAINT chk_meeting_status CHECK (
  status IN (
    'DRAFT',
    'SUBMITTED',
    'SHORTLISTED',
    'QUOTATION_RECEIVED',
    'VENUE_FINALIZED',
    'BOOKED',
    'COMPLETED',
    'CLOSED',
    'VENUES_SHORTLISTED',
    'SUBMITTED_TO_ADMIN',
    'AVAILABILITY_CHECK'
  )
);
