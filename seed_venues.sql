-- seed_venues.sql
-- Seed a baseline venue dataset for development verification.
-- This script is rerunnable and resolves category/city IDs dynamically.

-- Hotels
INSERT INTO hotels (
  id,
  hotel_name,
  category_id,
  city_id,
  address,
  gst_number,
  contact_person,
  contact_number,
  email,
  remarks,
  status,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  is_deleted
)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Taj Lands End',
    (SELECT id FROM hotel_categories WHERE category_code = '5STAR'),
    (SELECT id FROM cities WHERE city_name = 'Mumbai'),
    'Bandra, Mumbai, Maharashtra, India',
    '27AAACT1234A1Z5',
    'Ravi Shah',
    '+91 98200 12345',
    'ravi.shah@tajlandsend.com',
    'Iconic luxury waterfront hotel in Mumbai.',
    'ACTIVE',
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    FALSE
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Novotel Juhu',
    (SELECT id FROM hotel_categories WHERE category_code = '4STAR'),
    (SELECT id FROM cities WHERE city_name = 'Mumbai'),
    'Juhu Beach, Mumbai, Maharashtra, India',
    '27AABCN1234F1Z0',
    'Meera Desai',
    '+91 98200 23456',
    'meera.desai@novoteljuhu.com',
    'Modern beachfront hotel with agile meeting spaces.',
    'ACTIVE',
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    FALSE
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'The Leela Palace',
    (SELECT id FROM hotel_categories WHERE category_code = '5STAR'),
    (SELECT id FROM cities WHERE city_name = 'Delhi'),
    'Chanakyapuri, New Delhi, Delhi, India',
    '07AAECL1234A1Z1',
    'Anita Kapoor',
    '+91 98100 34567',
    'anita.kapoor@leelapalace.com',
    'Grand palace hotel with five-star event facilities.',
    'ACTIVE',
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    FALSE
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'JW Marriott Pune',
    (SELECT id FROM hotel_categories WHERE category_code = '5STAR'),
    (SELECT id FROM cities WHERE city_name = 'Pune'),
    'Senapati Bapat Road, Pune, Maharashtra, India',
    '27AAACJ1234Q1Z9',
    'Suresh Nair',
    '+91 99200 45678',
    'suresh.nair@jwmarriottpune.com',
    'Luxury business hotel with convention-grade halls.',
    'ACTIVE',
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    FALSE
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'ITC Gardenia',
    (SELECT id FROM hotel_categories WHERE category_code = '5STAR'),
    (SELECT id FROM cities WHERE city_name = 'Bangalore'),
    'Residency Road, Bangalore, Karnataka, India',
    '29AAACI1234F1Z5',
    'Deepa Reddy',
    '+91 98450 56789',
    'deepa.reddy@itcgardenia.com',
    'Premium luxury hotel with expansive banquet venues.',
    'ACTIVE',
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    FALSE
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'Trident Hyderabad',
    (SELECT id FROM hotel_categories WHERE category_code = '5STAR'),
    (SELECT id FROM cities WHERE city_name = 'Hyderabad'),
    'HITEC City, Hyderabad, Telangana, India',
    '36AAACT1234N1Z5',
    'Naresh Kumar',
    '+91 99500 67890',
    'naresh.kumar@tridenthotels.com',
    'Sophisticated business resort hotel with riverfront halls.',
    'ACTIVE',
    NOW(),
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- Halls
INSERT INTO halls (
  id,
  hotel_id,
  hall_name,
  capacity,
  area,
  floor_name,
  seating_types
)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Grand Ballroom', 500, 22000, 'Ground', 'Theatre, Banquet, Classroom'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sea View Hall', 150, 5200, 'Top', 'U-Shape, Boardroom'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Pearl Ballroom', 320, 14000, 'Ground', 'Banquet, Theatre, Cocktail'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Shoreline Room', 120, 3800, 'First', 'Classroom, Boardroom'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Crystal Ballroom', 450, 18000, 'Ground', 'Theatre, Banquet, U-Shape'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Garden Pavilion', 180, 5200, 'Garden', 'Cabaret, Classroom'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Convention Hall', 400, 16000, 'Ground', 'Theatre, Banquet, Classroom'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Executive Hall', 120, 4200, 'First', 'Boardroom, U-Shape'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Regal Ballroom', 420, 17000, 'Ground', 'Theatre, Banquet, Classroom'),
  ('20000000-0000-0000-0000-00000000000A', '10000000-0000-0000-0000-000000000005', 'Emerald Hall', 140, 4500, 'First', 'Boardroom, U-Shape'),
  ('20000000-0000-0000-0000-00000000000B', '10000000-0000-0000-0000-000000000006', 'Lotus Ballroom', 380, 15200, 'Ground', 'Theatre, Banquet, Classroom'),
  ('20000000-0000-0000-0000-00000000000C', '10000000-0000-0000-0000-000000000006', 'Riverside Room', 130, 4100, 'First', 'U-Shape, Boardroom')
ON CONFLICT (id) DO NOTHING;

-- Venue Photos
INSERT INTO venue_photos (
  id,
  hotel_id,
  hall_id,
  photo_type,
  file_name,
  storage_path,
  display_order
)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'HALL', 'taj_seaview.jpg', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 1),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'HALL', 'novotel_pearl.jpg', 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1200&q=80', 1),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'HALL', 'leela_crystal.jpg', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 1),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 'HALL', 'jw_convention.jpg', 'https://images.unsplash.com/photo-1553514029-8c1bac1d6fd5?auto=format&fit=crop&w=1200&q=80', 1),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000009', 'HALL', 'itc_regal.jpg', 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80', 1),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-00000000000B', 'HALL', 'trident_lotus.jpg', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 1)
ON CONFLICT (id) DO NOTHING;
