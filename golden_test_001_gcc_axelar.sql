-- ============================================================================
-- AVEMS GOLDEN TEST DATASET #001
-- GCC Hotel & Club  +  AXELAR AP Training Program  (Booking BO-25/6942)
-- Invoice BN-26/1060  (Tax Invoice dated 23-05-2026, IRN ...871f9366)
--
-- Run AFTER these migrations are applied:
--   1. commercial_phase1_approved_commercials.sql
--   2. commercial_phase2_booking_room_inventory.sql   (incl. occupancy_count)
--   (optional) invoice_variances_add_created_at.sql
--
-- Run in: Supabase SQL Editor (service role; bypasses RLS). Idempotent.
-- ============================================================================

DO $$
DECLARE
  v_user_id          uuid;
  v_division_id      uuid;
  v_meeting_type_id  uuid;
  v_category_id      uuid;
  v_city_id          uuid;
  v_hotel_id         uuid;
  v_hall_id          uuid;
  v_mr_id            uuid;
  v_booking_id       uuid;
BEGIN
  -- ── Reference look-ups ────────────────────────────────────────────────────
  SELECT id INTO v_user_id FROM users ORDER BY created_at LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found; created_by is NOT NULL on bookings/meeting_requests.';
  END IF;

  SELECT id INTO v_division_id FROM divisions WHERE division_code = 'AXL' LIMIT 1;
  SELECT id INTO v_category_id FROM hotel_categories WHERE category_code = 'BUSINESS' LIMIT 1;

  -- Thane city (create if missing)
  SELECT id INTO v_city_id FROM cities WHERE lower(city_name) = 'thane' LIMIT 1;
  IF v_city_id IS NULL THEN
    INSERT INTO cities (city_name, state_name, state, active, is_active)
    VALUES ('Thane', 'Maharashtra', 'Maharashtra', true, true)
    RETURNING id INTO v_city_id;
  END IF;

  -- 'Training' meeting type (create if missing)
  SELECT id INTO v_meeting_type_id FROM meeting_types WHERE lower(meeting_type_name) = 'training' LIMIT 1;
  IF v_meeting_type_id IS NULL THEN
    INSERT INTO meeting_types (meeting_type_name) VALUES ('Training') RETURNING id INTO v_meeting_type_id;
  END IF;

  -- ── 1. HOTEL MASTER ───────────────────────────────────────────────────────
  SELECT id INTO v_hotel_id FROM hotels WHERE lower(hotel_name) = lower('GCC Hotel & Club') LIMIT 1;
  IF v_hotel_id IS NULL THEN
    INSERT INTO hotels (
      hotel_name, category_id, city_id, address, gst_number, status,
      blacklisted, total_ajanta_events, last_used_date, last_division_id, created_by
    ) VALUES (
      'GCC Hotel & Club', v_category_id, v_city_id,
      '92/1 Off Mira Bhayander Road, Mira Road East, Thane 401107',
      '27AAHCS8126P1ZN', 'ACTIVE',
      false, 1, '2026-05-23', v_division_id, v_user_id
    ) RETURNING id INTO v_hotel_id;
  END IF;

  -- ── 2. HALL (placeholder; residential conf had no hall charge) ────────────
  SELECT id INTO v_hall_id FROM halls
    WHERE hotel_id = v_hotel_id AND lower(hall_name) = lower('Conference Hall') LIMIT 1;
  IF v_hall_id IS NULL THEN
    INSERT INTO halls (hotel_id, hall_name, capacity, status, created_by)
    VALUES (v_hotel_id, 'Conference Hall', 100, 'ACTIVE', v_user_id)
    RETURNING id INTO v_hall_id;
  END IF;

  -- ── 3. MEETING REQUEST ────────────────────────────────────────────────────
  SELECT id INTO v_mr_id FROM meeting_requests
    WHERE lower(meeting_name) = lower('AXELAR AP Training Program') LIMIT 1;
  IF v_mr_id IS NULL THEN
    INSERT INTO meeting_requests (
      request_number, meeting_name, division_id, meeting_type_id, city_id, zone,
      start_date, end_date, expected_pax, guaranteed_pax, residential_flag,
      rooms_required, halls_required, seating_style, av_requirements,
      food_requirements, transfer_requirements, status, created_by, target_city_name
    ) VALUES (
      'MR-AXL-GCC-MAY2026', 'AXELAR AP Training Program', v_division_id, v_meeting_type_id, v_city_id, 'West',
      '2026-05-13', '2026-05-23', 27, 27, true,
      8, 1, 'CLASSROOM', 'Standard AV', 'Full board (residential)', 'As required',
      'BOOKED', v_user_id, 'Thane'
    ) RETURNING id INTO v_mr_id;
  END IF;

  -- ── 4. BOOKING ────────────────────────────────────────────────────────────
  SELECT id INTO v_booking_id FROM bookings WHERE booking_reference = 'AXELAR-GCC-MAY2026' LIMIT 1;
  IF v_booking_id IS NULL THEN
    INSERT INTO bookings (
      booking_reference, request_id, meeting_request_id, hotel_id, hall_id, status,
      check_in_date, check_out_date, rooms_booked, halls_booked, expected_pax,
      special_requirements, created_by
    ) VALUES (
      'AXELAR-GCC-MAY2026', v_mr_id, v_mr_id, v_hotel_id, v_hall_id, 'COMPLETED',
      '2026-05-13', '2026-05-23', 8, 1, 27,
      'Vendor Booking No BO-25/6942; Bill BN-26/1060. Residential conference 13-23 May 2026.',
      v_user_id
    ) RETURNING id INTO v_booking_id;
  END IF;

  -- ── 5. APPROVED COMMERCIAL (settled rates, per occupant per night) ────────
  IF NOT EXISTS (SELECT 1 FROM approved_commercials WHERE booking_id = v_booking_id) THEN
    INSERT INTO approved_commercials (
      booking_id, meeting_request_id, hotel_id,
      room_rate_single, room_rate_double, room_rate_triple, room_rate_quad,
      food_rate_per_pax, nrc_food_rate_per_pax, hall_rate,
      approved_by, approved_at, remarks, created_by
    ) VALUES (
      v_booking_id, v_mr_id, v_hotel_id,
      3950, 2100, 1450, 975,
      1000, 1300, 0,
      v_user_id, now(),
      'Settled rates (14-May onward). NOTE: 13-May used promo rates (single 3750, double 1900, triple 1250, quad 775) - intended Audit V2 rate-variance signal.',
      v_user_id
    );
  END IF;

  -- ── 6. ROOM INVENTORY (representative peak day 14-17 May) ─────────────────
  -- Rates are per OCCUPANT, so occupancy_count drives expected room charges.
  IF NOT EXISTS (SELECT 1 FROM booking_room_inventory WHERE booking_id = v_booking_id) THEN
    INSERT INTO booking_room_inventory (booking_id, room_type, room_count, occupancy_count, created_by) VALUES
      (v_booking_id, 'QUAD',   5, 20, v_user_id),
      (v_booking_id, 'TRIPLE', 2,  6, v_user_id),
      (v_booking_id, 'SINGLE', 1,  1, v_user_id);
  END IF;

  -- ── 7. INVOICE BN-26/1060 (actual, as billed) ────────────────────────────
  -- Live invoices columns only. Taxable charges: room 294550, food 289800,
  -- other-income 495 (no column yet -> noted in remarks). Tax (CGST+SGST) 66891.50.
  IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = 'BN-26/1060') THEN
    INSERT INTO invoices (
      invoice_number, booking_id, invoice_date,
      room_charges, food_charges, hall_charges, tax_amount,
      invoice_status, remarks, created_by
    ) VALUES (
      'BN-26/1060', v_booking_id, '2026-05-23',
      294550.00, 289800.00, 0.00, 66891.50,
      'RECEIVED',
      'IRN 8ed579cc271e14beafbdb4830f5965a42e2816d3bb45712de7d3deba871f9366. Taxable: room 294550 @5%, food 289800 @18%, other-income 495 @0%. Subtotal 584845, CGST 33445.75, SGST 33445.75, Grand Total 651736.50 (UNPAID).',
      v_user_id
    );
  END IF;

  RAISE NOTICE 'Golden Test #001 seeded. hotel=%, booking=%, mr=%', v_hotel_id, v_booking_id, v_mr_id;
END $$;

-- ── PHASE 3 BACKFILL: financial breakdown for BN-26/1060 ────────────────────
-- New columns: subtotal_amount, other_charges, cgst_amount, sgst_amount,
-- igst_amount, document_url. Reconciles to Grand Total 651,736.50.
UPDATE invoices SET
  subtotal_amount = 584845.00,
  other_charges   = 495.00,
  cgst_amount     = 33445.75,
  sgst_amount     = 33445.75,
  igst_amount     = 0.00,
  tax_amount      = 66891.50,
  food_charges    = 289800.00,   -- food taxable (excludes the 495 other-income)
  room_charges    = 294550.00,
  hall_charges    = 0.00
WHERE invoice_number = 'BN-26/1060';

-- If an invoice_amount column exists in your schema, also set the grand total:
-- UPDATE invoices SET invoice_amount = 651736.50 WHERE invoice_number = 'BN-26/1060';

-- Verification (expect single row, reconciles = true):
-- SELECT invoice_number,
--   subtotal_amount, cgst_amount, sgst_amount, igst_amount,
--   (subtotal_amount + cgst_amount + sgst_amount + igst_amount) AS computed_grand_total,
--   (room_charges + food_charges + hall_charges + other_charges) AS computed_subtotal,
--   ((subtotal_amount + cgst_amount + sgst_amount + igst_amount) = 651736.50) AS reconciles
-- FROM invoices WHERE invoice_number = 'BN-26/1060';
