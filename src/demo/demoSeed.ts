/**
 * AVEMS Demo Seed Data
 *
 * Realistic corporate venue management records for demo / development use.
 * Call seedDemoData() once on demo enable; guarded against re-seeding if
 * data already exists.
 */

import { DEMO_COLLECTIONS, demoGet, demoSet } from './demoStorage';

// ─── IDs (stable for relational joins) ────────────────────────────────────────
const IDS = {
  // Divisions
  DIV_WEST: 'd1000001-0000-0000-0000-000000000001',
  DIV_NORTH: 'd1000001-0000-0000-0000-000000000002',
  DIV_SOUTH: 'd1000001-0000-0000-0000-000000000003',
  // Meeting Types
  MT_CYCLE: 'm2000001-0000-0000-0000-000000000001',
  MT_CONF: 'm2000001-0000-0000-0000-000000000002',
  MT_TRAINING: 'm2000001-0000-0000-0000-000000000003',
  // Cities
  CITY_MUM: 'c3000001-0000-0000-0000-000000000001',
  CITY_DEL: 'c3000001-0000-0000-0000-000000000002',
  CITY_BLR: 'c3000001-0000-0000-0000-000000000003',
  CITY_HYD: 'c3000001-0000-0000-0000-000000000004',
  CITY_CHE: 'c3000001-0000-0000-0000-000000000005',
  // Hotel categories
  CAT_5STAR: 'cat00001-0000-0000-0000-000000000001',
  CAT_4STAR: 'cat00001-0000-0000-0000-000000000002',
  CAT_RESORT: 'cat00001-0000-0000-0000-000000000003',
  // Hotels
  HOT_MUM1: 'h4000001-0000-0000-0000-000000000001',
  HOT_MUM2: 'h4000001-0000-0000-0000-000000000002',
  HOT_DEL1: 'h4000001-0000-0000-0000-000000000003',
  HOT_BLR1: 'h4000001-0000-0000-0000-000000000004',
  HOT_HYD1: 'h4000001-0000-0000-0000-000000000005',
  // Halls
  HALL_MUM1_A: 'hall0001-0000-0000-0000-000000000001',
  HALL_MUM1_B: 'hall0001-0000-0000-0000-000000000002',
  HALL_MUM2_A: 'hall0001-0000-0000-0000-000000000003',
  HALL_DEL1_A: 'hall0001-0000-0000-0000-000000000004',
  HALL_BLR1_A: 'hall0001-0000-0000-0000-000000000005',
  HALL_HYD1_A: 'hall0001-0000-0000-0000-000000000006',
  // Meetings
  REQ_001: 'req00001-0000-0000-0000-000000000001',
  REQ_002: 'req00001-0000-0000-0000-000000000002',
  REQ_003: 'req00001-0000-0000-0000-000000000003',
  REQ_004: 'req00001-0000-0000-0000-000000000004',
  // Demo user
  USR_ADMIN: 'usr00001-0000-0000-0000-000000000001',
  USR_SALES: 'usr00001-0000-0000-0000-000000000002',
};

export function seedDemoData(force = false): void {
  // Skip if already seeded (unless forced)
  if (!force && demoGet(DEMO_COLLECTIONS.MEETINGS).length > 0) return;

  // ─── Divisions ──────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.DIVISIONS, [
    { id: IDS.DIV_WEST, division_name: 'Western Region', active: true },
    { id: IDS.DIV_NORTH, division_name: 'Northern Region', active: true },
    { id: IDS.DIV_SOUTH, division_name: 'Southern Region', active: true },
  ]);

  // ─── Meeting Types ───────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.MEETING_TYPES, [
    { id: IDS.MT_CYCLE, meeting_type_name: 'Cycle Meeting', active: true },
    { id: IDS.MT_CONF, meeting_type_name: 'National Conference', active: true },
    { id: IDS.MT_TRAINING, meeting_type_name: 'Training Program', active: true },
  ]);

  // ─── Cities ─────────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.CITIES, [
    { id: IDS.CITY_MUM, city_name: 'Mumbai', state: 'Maharashtra', tier: '1' },
    { id: IDS.CITY_DEL, city_name: 'Delhi', state: 'Delhi', tier: '1' },
    { id: IDS.CITY_BLR, city_name: 'Bengaluru', state: 'Karnataka', tier: '1' },
    { id: IDS.CITY_HYD, city_name: 'Hyderabad', state: 'Telangana', tier: '1' },
    { id: IDS.CITY_CHE, city_name: 'Chennai', state: 'Tamil Nadu', tier: '1' },
  ]);

  // ─── Hotel Categories ────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.HOTEL_CATEGORIES, [
    { id: IDS.CAT_5STAR, category_code: '5-STAR', category_name: '5-Star Luxury' },
    { id: IDS.CAT_4STAR, category_code: '4-STAR', category_name: '4-Star Business' },
    { id: IDS.CAT_RESORT, category_code: 'RESORT', category_name: 'Resort & Spa' },
  ]);

  // ─── Halls ──────────────────────────────────────────────────────────────────
  const halls = [
    { id: IDS.HALL_MUM1_A, hotel_id: IDS.HOT_MUM1, hall_name: 'Grand Ballroom', capacity: 500, area: 8000, floor_name: 'Ground Floor', seating_types: 'Theatre, Classroom, Cluster' },
    { id: IDS.HALL_MUM1_B, hotel_id: IDS.HOT_MUM1, hall_name: 'Crystal Hall', capacity: 200, area: 3200, floor_name: '1st Floor', seating_types: 'Theatre, U-Shape, Boardroom' },
    { id: IDS.HALL_MUM2_A, hotel_id: IDS.HOT_MUM2, hall_name: 'Convention Centre', capacity: 800, area: 12000, floor_name: 'Ground Floor', seating_types: 'Theatre, Cluster' },
    { id: IDS.HALL_DEL1_A, hotel_id: IDS.HOT_DEL1, hall_name: 'Imperial Suite', capacity: 350, area: 5500, floor_name: 'Mezzanine', seating_types: 'Theatre, Classroom, Boardroom' },
    { id: IDS.HALL_BLR1_A, hotel_id: IDS.HOT_BLR1, hall_name: 'Tech Hub Auditorium', capacity: 300, area: 4800, floor_name: 'Ground Floor', seating_types: 'Theatre, Classroom' },
    { id: IDS.HALL_HYD1_A, hotel_id: IDS.HOT_HYD1, hall_name: 'Kohinoor Ballroom', capacity: 450, area: 7200, floor_name: 'Ground Floor', seating_types: 'Theatre, Cluster, Classroom' },
  ];
  demoSet(DEMO_COLLECTIONS.HALLS, halls);

  // ─── Hotels ─────────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.HOTELS, [
    {
      id: IDS.HOT_MUM1, hotel_name: 'The Taj Mahal Palace', category_id: IDS.CAT_5STAR,
      city_id: IDS.CITY_MUM, address: 'Apollo Bunder, Colaba, Mumbai 400 001',
      contact_person: 'Rajesh Sharma', contact_number: '9820012345',
      email: 'events@tajmahalpalace.com', status: 'ACTIVE', is_deleted: false,
      largest_hall_capacity: 500,
      hotel_categories: { id: IDS.CAT_5STAR, category_code: '5-STAR', category_name: '5-Star Luxury' },
      cities: { id: IDS.CITY_MUM, city_name: 'Mumbai' },
      halls: halls.filter(h => h.hotel_id === IDS.HOT_MUM1),
      venue_photos: [],
    },
    {
      id: IDS.HOT_MUM2, hotel_name: 'JW Marriott Mumbai', category_id: IDS.CAT_5STAR,
      city_id: IDS.CITY_MUM, address: 'Juhu Tara Road, Juhu, Mumbai 400 049',
      contact_person: 'Priya Menon', contact_number: '9820098765',
      email: 'banquets@jwmarriottmumbai.com', status: 'ACTIVE', is_deleted: false,
      largest_hall_capacity: 800,
      hotel_categories: { id: IDS.CAT_5STAR, category_code: '5-STAR', category_name: '5-Star Luxury' },
      cities: { id: IDS.CITY_MUM, city_name: 'Mumbai' },
      halls: halls.filter(h => h.hotel_id === IDS.HOT_MUM2),
      venue_photos: [],
    },
    {
      id: IDS.HOT_DEL1, hotel_name: 'The Imperial New Delhi', category_id: IDS.CAT_5STAR,
      city_id: IDS.CITY_DEL, address: 'Janpath, New Delhi 110 001',
      contact_person: 'Arun Kapoor', contact_number: '9810055432',
      email: 'events@theimperialindia.com', status: 'ACTIVE', is_deleted: false,
      largest_hall_capacity: 350,
      hotel_categories: { id: IDS.CAT_5STAR, category_code: '5-STAR', category_name: '5-Star Luxury' },
      cities: { id: IDS.CITY_DEL, city_name: 'Delhi' },
      halls: halls.filter(h => h.hotel_id === IDS.HOT_DEL1),
      venue_photos: [],
    },
    {
      id: IDS.HOT_BLR1, hotel_name: 'ITC Gardenia Bengaluru', category_id: IDS.CAT_5STAR,
      city_id: IDS.CITY_BLR, address: '1 Residency Road, Bengaluru 560 025',
      contact_person: 'Sneha Reddy', contact_number: '9900123456',
      email: 'events@itchotels.in', status: 'ACTIVE', is_deleted: false,
      largest_hall_capacity: 300,
      hotel_categories: { id: IDS.CAT_5STAR, category_code: '5-STAR', category_name: '5-Star Luxury' },
      cities: { id: IDS.CITY_BLR, city_name: 'Bengaluru' },
      halls: halls.filter(h => h.hotel_id === IDS.HOT_BLR1),
      venue_photos: [],
    },
    {
      id: IDS.HOT_HYD1, hotel_name: 'Novotel Hyderabad Convention Centre', category_id: IDS.CAT_4STAR,
      city_id: IDS.CITY_HYD, address: 'HICC Complex, Novotel, Hyderabad 500 032',
      contact_person: 'Vikram Rao', contact_number: '9848011234',
      email: 'h5155-sl6@accor.com', status: 'ACTIVE', is_deleted: false,
      largest_hall_capacity: 450,
      hotel_categories: { id: IDS.CAT_4STAR, category_code: '4-STAR', category_name: '4-Star Business' },
      cities: { id: IDS.CITY_HYD, city_name: 'Hyderabad' },
      halls: halls.filter(h => h.hotel_id === IDS.HOT_HYD1),
      venue_photos: [],
    },
  ]);

  // ─── Meeting Requests ────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.MEETINGS, [
    {
      id: IDS.REQ_001, request_number: 'REQ-2024-1001', meeting_name: 'Q1 Western Cycle Meeting',
      division_id: IDS.DIV_WEST, meeting_type_id: IDS.MT_CYCLE, city_id: IDS.CITY_MUM,
      zone: 'West', start_date: '2024-03-10', end_date: '2024-03-12',
      expected_pax: 150, guaranteed_pax: 120, residential_flag: true,
      rooms_required: 60, halls_required: 2, seating_style: 'Theatre',
      av_requirements: 'LCD Projector, PA System, LED Screen', food_requirements: 'Veg & Non-Veg Buffet',
      transfer_requirements: 'Airport pickup for 40 delegates', status: 'SUBMITTED',
      created_at: '2024-01-15T09:30:00Z', created_by: IDS.USR_ADMIN,
      divisions: { division_name: 'Western Region' },
      meeting_types: { meeting_type_name: 'Cycle Meeting' },
      cities: { city_name: 'Mumbai' },
    },
    {
      id: IDS.REQ_002, request_number: 'REQ-2024-1002', meeting_name: 'National Sales Conference 2024',
      division_id: IDS.DIV_NORTH, meeting_type_id: IDS.MT_CONF, city_id: IDS.CITY_DEL,
      zone: 'North', start_date: '2024-04-15', end_date: '2024-04-17',
      expected_pax: 300, guaranteed_pax: 280, residential_flag: true,
      rooms_required: 140, halls_required: 3, seating_style: 'Theatre',
      av_requirements: 'Video Wall, Simultaneous Translation, LED Stage', food_requirements: 'Multi-cuisine Gala Dinner',
      transfer_requirements: 'Coach transfers from 3 airports', status: 'SHORTLISTED',
      created_at: '2024-01-20T11:00:00Z', created_by: IDS.USR_ADMIN,
      divisions: { division_name: 'Northern Region' },
      meeting_types: { meeting_type_name: 'National Conference' },
      cities: { city_name: 'Delhi' },
    },
    {
      id: IDS.REQ_003, request_number: 'REQ-2024-1003', meeting_name: 'South Zone Training — Oncology',
      division_id: IDS.DIV_SOUTH, meeting_type_id: IDS.MT_TRAINING, city_id: IDS.CITY_BLR,
      zone: 'South', start_date: '2024-02-20', end_date: '2024-02-21',
      expected_pax: 80, guaranteed_pax: 75, residential_flag: false,
      rooms_required: 0, halls_required: 1, seating_style: 'Classroom',
      av_requirements: 'Projector, Whiteboard, Flip Charts', food_requirements: 'Working Lunch',
      transfer_requirements: 'None', status: 'VENUE_FINALIZED',
      created_at: '2024-01-08T14:00:00Z', created_by: IDS.USR_SALES,
      divisions: { division_name: 'Southern Region' },
      meeting_types: { meeting_type_name: 'Training Program' },
      cities: { city_name: 'Bengaluru' },
    },
    {
      id: IDS.REQ_004, request_number: 'REQ-2024-1004', meeting_name: 'Hyderabad Cardiology Symposium',
      division_id: IDS.DIV_SOUTH, meeting_type_id: IDS.MT_CONF, city_id: IDS.CITY_HYD,
      zone: 'South', start_date: '2024-05-05', end_date: '2024-05-06',
      expected_pax: 200, guaranteed_pax: 180, residential_flag: true,
      rooms_required: 90, halls_required: 2, seating_style: 'Theatre',
      av_requirements: 'Stage, LED Wall, Wireless Mics', food_requirements: 'Hi-Tea, Gala Dinner',
      transfer_requirements: 'Airport transfers for 30 speakers', status: 'DRAFT',
      created_at: '2024-02-01T16:00:00Z', created_by: IDS.USR_SALES,
      divisions: { division_name: 'Southern Region' },
      meeting_types: { meeting_type_name: 'National Conference' },
      cities: { city_name: 'Hyderabad' },
    },
  ]);

  // ─── Quotations ──────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.QUOTATIONS, [
    { id: 'quot-001', request_id: IDS.REQ_001, hotel_id: IDS.HOT_MUM1, amount: 485000, currency: 'INR', status: 'PENDING', submitted_at: '2024-01-20T10:00:00Z' },
    { id: 'quot-002', request_id: IDS.REQ_001, hotel_id: IDS.HOT_MUM2, amount: 520000, currency: 'INR', status: 'PENDING', submitted_at: '2024-01-21T11:00:00Z' },
    { id: 'quot-003', request_id: IDS.REQ_002, hotel_id: IDS.HOT_DEL1, amount: 1250000, currency: 'INR', status: 'APPROVED', submitted_at: '2024-01-28T09:00:00Z' },
  ]);

  // ─── Bookings ────────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.BOOKINGS, [
    { id: 'bkg-001', meeting_request_id: IDS.REQ_003, hotel_id: IDS.HOT_BLR1, hall_id: IDS.HALL_BLR1_A, check_in: '2024-02-20', check_out: '2024-02-21', rooms: 0, halls_booked: 1, expected_pax: 300, status: 'CONFIRMED', amount: 185000, currency: 'INR', created_by: IDS.USR_ADMIN, confirmed_by: IDS.USR_ADMIN, confirmed_at: '2024-01-26T15:00:00Z', created_at: '2024-01-25T12:00:00Z' },
    { id: 'bkg-002', meeting_request_id: IDS.REQ_001, hotel_id: IDS.HOT_MUM1, hall_id: IDS.HALL_MUM1_A, check_in: '2024-03-10', check_out: '2024-03-12', rooms: 60, halls_booked: 2, expected_pax: 150, special_requirements: 'VIP welcome desk, AV onsite support', status: 'UNDER_REVIEW', amount: 750000, currency: 'INR', created_by: IDS.USR_SALES, created_at: '2024-01-22T10:15:00Z' },
    { id: 'bkg-003', meeting_request_id: IDS.REQ_002, hotel_id: IDS.HOT_DEL1, hall_id: IDS.HALL_DEL1_A, check_in: '2024-04-15', check_out: '2024-04-17', rooms: 140, halls_booked: 3, expected_pax: 300, status: 'CANCELLED', amount: 1200000, currency: 'INR', created_by: IDS.USR_ADMIN, created_at: '2024-01-30T09:45:00Z', updated_at: '2024-02-01T10:00:00Z' },
  ]);

  // ─── Invoices ────────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.INVOICES, [
    { id: 'inv-001', booking_id: 'bkg-001', invoice_number: 'INV-2024-001', amount: 185000, tax: 33300, total: 218300, currency: 'INR', status: 'PENDING', due_date: '2024-03-20', created_at: '2024-02-25T10:00:00Z' },
  ]);

  // ─── Payments ────────────────────────────────────────────────────────────────
  demoSet(DEMO_COLLECTIONS.PAYMENTS, [
    { id: 'pay-001', invoice_id: 'inv-001', amount: 100000, currency: 'INR', payment_mode: 'RTGS', reference: 'RTGS240001234', paid_at: '2024-02-27T14:30:00Z', status: 'CONFIRMED' },
  ]);
}
