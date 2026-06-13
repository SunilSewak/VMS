-- ============================================================================
-- INVOICE VARIANCES — OPTIONAL METADATA (APPROVED SCOPE ONLY)
-- Adds ONLY created_at. Per decision: do NOT add severity / status / check_type
-- until the Commercial Management domain stabilises the Audit Engine design.
-- Run in: Supabase SQL Editor. Idempotent.
-- ============================================================================

ALTER TABLE invoice_variances
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- After running, the app's getInvoiceVarianceRecords()/getInvoiceVariances()
-- continue to work unchanged (they select explicit columns and do not depend
-- on created_at). created_at becomes available for future ordering of findings.
