-- validation_queries.sql

SELECT COUNT(*) AS hotels_count FROM hotels;
SELECT COUNT(*) AS halls_count FROM halls;
SELECT COUNT(*) AS venue_photos_count FROM venue_photos;

-- Integrity checks
SELECT h.id AS hotel_id, h.hotel_name, c.city_name
FROM hotels h
JOIN cities c ON h.city_id = c.id
ORDER BY h.hotel_name;

SELECT h.id AS hotel_id, h.hotel_name, cat.category_code
FROM hotels h
JOIN hotel_categories cat ON h.category_id = cat.id
ORDER BY h.hotel_name;

SELECT h.id AS hotel_id, h.hotel_name, COUNT(ha.*) AS halls_count
FROM hotels h
LEFT JOIN halls ha ON ha.hotel_id = h.id
GROUP BY h.id, h.hotel_name
ORDER BY h.hotel_name;

SELECT h.id AS hotel_id, h.hotel_name, COUNT(p.*) AS photos_count
FROM hotels h
LEFT JOIN venue_photos p ON p.hotel_id = h.id
GROUP BY h.id, h.hotel_name
ORDER BY h.hotel_name;
