# Step 6: Venue Upload Template Specification

## Overview
Multi-sheet Excel template for structured venue data import supporting the complete venue hierarchy.

**Hierarchy**: Zone → City → Hotel → Halls → Inventory → Occupancy

---

## Upload Template Structure

### Excel File: `AVEMS_Venue_Upload_Template.xlsx`

**5 Sheets**:
1. Hotel Master
2. Hall Master
3. Accommodation Inventory
4. Occupancy Matrix
5. Photo Mapping

---

## SHEET 1: HOTEL MASTER

### Purpose
Primary hotel information with contact details and operational status.

### Columns (27 fields)

| Column | Field Name | Type | Required | Validation | Example |
|--------|-----------|------|----------|------------|---------|
| A | hotel_name | Text | **Yes** | Unique within city | "ITC Maurya" |
| B | hotel_brand | Text | No | Max 100 chars | "ITC Hotels" |
| C | hotel_category | Dropdown | No | 5_STAR, 4_STAR, 3_STAR, BUSINESS, BUDGET, RESORT, BOUTIQUE | "5_STAR" |
| D | zone | Dropdown | **Yes** | NORTH, SOUTH, EAST, WEST, HO | "NORTH" |
| E | city | Text | **Yes** | Must exist in city master | "Delhi" |
| F | address | Text | No | Max 500 chars | "Diplomatic Enclave, New Delhi" |
| G | gst_number | Text | No | Format: 99AAAAA9999A9Z9 | "07AAAAA0000A1Z5" |
| H | website | Text | No | Valid URL | "https://www.itchotels.com" |
| I | latitude | Number | No | -90 to 90 | 28.5969 |
| J | longitude | Number | No | -180 to 180 | 77.1625 |
| K | sales_contact_name | Text | No | Max 100 chars | "Rajesh Kumar" |
| L | sales_contact_designation | Text | No | Max 100 chars | "Sales Manager" |
| M | sales_contact_mobile | Text | No | 10 digits | "9876543210" |
| N | sales_contact_email | Email | No | Valid email | "rajesh@itchotels.com" |
| O | preferred_vendor | Boolean | No | TRUE/FALSE | "TRUE" |
| P | blacklisted | Boolean | No | TRUE/FALSE | "FALSE" |
| Q | status | Dropdown | No | ACTIVE, INACTIVE, UNDER_REVIEW | "ACTIVE" |
| R | remarks | Text | No | Max 1000 chars | "Preferred for National Meetings" |

### Validation Rules
1. `hotel_name` + `city` combination must be unique
2. `zone` must match one of the 5 standard zones
3. `city` must exist in database
4. If `latitude` provided, must have `longitude` (and vice versa)
5. `gst_number` format validation (if provided)
6. `hotel_category` must be one of allowed values
7. `preferred_vendor` and `blacklisted` cannot both be TRUE

### Sample Rows

```
hotel_name         | hotel_brand  | hotel_category | zone  | city      | address                    | status
ITC Maurya         | ITC Hotels   | 5_STAR        | NORTH | Delhi     | Diplomatic Enclave, Delhi  | ACTIVE
Taj Lands End      | Taj Hotels   | 5_STAR        | WEST  | Mumbai    | Band Stand, Bandra West    | ACTIVE
Leela Palace       | Leela Hotels | 5_STAR        | SOUTH | Bangalore | Old Airport Road, Bangalore| ACTIVE
```

---

## SHEET 2: HALL MASTER

### Purpose
Meeting hall/banquet hall details with multi-capacity seating configurations.

### Columns (13 fields)

| Column | Field Name | Type | Required | Validation | Example |
|--------|-----------|------|----------|------------|---------|
| A | hotel_name | Text | **Yes** | Must exist in Sheet 1 | "ITC Maurya" |
| B | hall_name | Text | **Yes** | Unique within hotel | "Grand Ballroom" |
| C | floor | Text | No | Max 50 chars | "Ground Floor" |
| D | area_sqft | Number | No | > 0 | 5000 |
| E | indoor_outdoor | Dropdown | No | INDOOR, OUTDOOR, BOTH | "INDOOR" |
| F | theatre_capacity | Number | **Yes** | >= 0 | 500 |
| G | classroom_capacity | Number | No | >= 0 | 300 |
| H | u_shape_capacity | Number | No | >= 0 | 80 |
| I | cluster_capacity | Number | No | >= 0 | 250 |
| J | boardroom_capacity | Number | No | >= 0 | 40 |
| K | round_table_capacity | Number | No | >= 0 | 350 |
| L | status | Dropdown | No | ACTIVE, INACTIVE, UNDER_RENOVATION | "ACTIVE" |

### Validation Rules
1. `hotel_name` must exist in Sheet 1 (Hotel Master)
2. `hall_name` + `hotel_name` combination must be unique
3. At least one capacity must be > 0
4. All capacities must be non-negative
5. Theatre capacity typically largest (warning if not)

### Sample Rows

```
hotel_name   | hall_name      | floor  | area_sqft | indoor_outdoor | theatre | classroom | u_shape | cluster | boardroom
ITC Maurya   | Grand Ballroom | Ground | 5000      | INDOOR         | 500     | 300       | 80      | 250     | 40
ITC Maurya   | Durbar Hall    | First  | 3000      | INDOOR         | 300     | 180       | 60      | 150     | 30
Taj Lands End| Crystal Hall   | Second | 4000      | INDOOR         | 400     | 250       | 70      | 200     | 35
```

---

## SHEET 3: ACCOMMODATION INVENTORY

### Purpose
Room inventory by occupancy type for residential meetings.

### Columns (8 fields)

| Column | Field Name | Type | Required | Validation | Example |
|--------|-----------|------|----------|------------|---------|
| A | hotel_name | Text | **Yes** | Must exist in Sheet 1 | "ITC Maurya" |
| B | total_rooms | Number | **Yes** | > 0 | 438 |
| C | single_rooms | Number | No | >= 0 | 100 |
| D | double_rooms | Number | No | >= 0 | 250 |
| E | triple_rooms | Number | No | >= 0 | 50 |
| F | quad_rooms | Number | No | >= 0 | 20 |
| G | suite_rooms | Number | No | >= 0 | 18 |
| H | remarks | Text | No | Max 500 chars | "Includes 18 luxury suites" |

### Validation Rules
1. `hotel_name` must exist in Sheet 1
2. `total_rooms` must be > 0
3. Sum of typed rooms should ≤ total_rooms (warning if exceeds)
4. All room counts must be non-negative
5. One hotel can have only one inventory row

### Sample Rows

```
hotel_name   | total_rooms | single | double | triple | quad | suite | remarks
ITC Maurya   | 438         | 100    | 250    | 50     | 20   | 18    | Includes 18 luxury suites
Taj Lands End| 565         | 150    | 350    | 40     | 15   | 10    | Premium ocean view rooms
```

---

## SHEET 4: OCCUPANCY MATRIX

### Purpose
Hotel-specific occupancy rules for participant designations.

### Columns (7 fields)

| Column | Field Name | Type | Required | Validation | Example |
|--------|-----------|------|----------|------------|---------|
| A | hotel_name | Text | **Yes** | Must exist in Sheet 1 | "ITC Maurya" |
| B | so_occupancy | Dropdown | No | SINGLE, DOUBLE, TRIPLE, QUAD | "TRIPLE" |
| C | dm_occupancy | Dropdown | No | SINGLE, DOUBLE, TRIPLE, QUAD | "DOUBLE" |
| D | rsm_occupancy | Dropdown | No | SINGLE, DOUBLE, TRIPLE, QUAD | "SINGLE" |
| E | ch_occupancy | Dropdown | No | SINGLE, DOUBLE, TRIPLE, QUAD | "SINGLE" |
| F | ibh_occupancy | Dropdown | No | SINGLE, DOUBLE, TRIPLE, QUAD | "SINGLE" |
| G | others_occupancy | Dropdown | No | SINGLE, DOUBLE, TRIPLE, QUAD | "SINGLE" |

### Validation Rules
1. `hotel_name` must exist in Sheet 1
2. All occupancy values must be valid dropdown options
3. If all empty, system uses default occupancy rules
4. One hotel can have only one occupancy matrix row

### Default Rules (if not specified)
- SO: TRIPLE
- DM: DOUBLE
- RSM: SINGLE
- CH: SINGLE
- IBH: SINGLE
- OTHERS: SINGLE

### Sample Rows

```
hotel_name   | so_occupancy | dm_occupancy | rsm_occupancy | ch_occupancy | ibh_occupancy | others_occupancy
ITC Maurya   | TRIPLE       | DOUBLE       | SINGLE        | SINGLE       | SINGLE        | SINGLE
Taj Lands End| QUAD         | TRIPLE       | DOUBLE        | SINGLE       | SINGLE        | SINGLE
```

---

## SHEET 5: PHOTO MAPPING

### Purpose
Link photos to hotels or halls with categorization.

### Columns (7 fields)

| Column | Field Name | Type | Required | Validation | Example |
|--------|-----------|------|----------|------------|---------|
| A | hotel_name | Text | **Yes*** | Must exist in Sheet 1 | "ITC Maurya" |
| B | hall_name | Text | No | Must exist for hotel in Sheet 2 | "Grand Ballroom" |
| C | photo_type | Dropdown | **Yes** | See Photo Types below | "HOTEL_EXTERIOR" |
| D | photo_url | Text | **Yes** | Valid URL or path | "https://cdn.example.com/itc-maurya-exterior.jpg" |
| E | caption | Text | No | Max 200 chars | "Main entrance view" |
| F | display_order | Number | No | >= 0 | 1 |
| G | is_primary | Boolean | No | TRUE/FALSE | "TRUE" |

**Note**: Either `hotel_name` alone (for hotel photos) OR `hotel_name` + `hall_name` (for hall photos)

### Photo Types (Dropdown)

**Hotel Photos**:
- HOTEL_EXTERIOR
- HOTEL_LOBBY
- HOTEL_GUEST_ROOM
- HOTEL_RESTAURANT
- HOTEL_AMENITY
- OTHER

**Hall Photos**:
- HALL_EMPTY
- HALL_THEATRE
- HALL_CLASSROOM
- HALL_CLUSTER
- HALL_U_SHAPE
- HALL_BOARDROOM
- HALL_SETUP
- OTHER

### Validation Rules
1. Either `hotel_name` alone OR `hotel_name` + `hall_name` (not both empty)
2. If `hall_name` provided, must exist for that hotel in Sheet 2
3. `photo_type` must match context (hotel vs hall photo types)
4. `photo_url` must be valid URL or accessible path
5. Only one photo per hotel/hall can have `is_primary = TRUE`

### Recommended Photo Minimums
- **Per Hotel**: Minimum 5 photos (exterior, lobby, guest room, restaurant, amenity)
- **Per Hall**: Minimum 3 photos (empty, theatre setup, one other setup)

### Sample Rows

```
hotel_name   | hall_name      | photo_type      | photo_url                              | caption            | display_order | is_primary
ITC Maurya   |                | HOTEL_EXTERIOR  | https://cdn.example.com/itc-ext.jpg   | Main entrance      | 1             | TRUE
ITC Maurya   |                | HOTEL_LOBBY     | https://cdn.example.com/itc-lobby.jpg | Grand lobby        | 2             | FALSE
ITC Maurya   | Grand Ballroom | HALL_THEATRE    | https://cdn.example.com/hall1.jpg     | Theatre setup      | 1             | TRUE
```

---

## Upload Process Flow

### Step 1: File Validation
- Verify all 5 sheets present
- Check column headers match specification
- Validate data types

### Step 2: Cross-Sheet Validation
- Verify hotels in Sheet 2 exist in Sheet 1
- Verify hotels in Sheet 3 exist in Sheet 1
- Verify hotels in Sheet 4 exist in Sheet 1
- Verify hotels in Sheet 5 exist in Sheet 1
- Verify halls in Sheet 5 exist in Sheet 2

### Step 3: Data Import (Transactional)
```
BEGIN TRANSACTION

1. Import Hotels (Sheet 1)
   - Create or update hotel records
   - Auto-populate zone_id from zone name

2. Import Halls (Sheet 2)
   - Link to hotel_id
   - Create or update hall records

3. Import Accommodation Inventory (Sheet 3)
   - Link to hotel_id
   - Create or update inventory records

4. Import Occupancy Matrix (Sheet 4)
   - Link to hotel_id
   - Create occupancy rule records

5. Import Photos (Sheet 5)
   - Link to hotel_id and/or hall_id
   - Create photo records

6. Update Hotel Suitability
   - Call update_hotel_suitability() for each hotel
   - Calculate derived fields

COMMIT TRANSACTION
```

### Step 4: Post-Import Summary
```json
{
  "success": true,
  "hotels_created": 25,
  "hotels_updated": 10,
  "halls_created": 87,
  "halls_updated": 15,
  "inventory_created": 35,
  "occupancy_rules_created": 140,
  "photos_created": 312,
  "errors": [],
  "warnings": [
    "Hotel 'ABC Hotel': Sum of room types (300) exceeds total_rooms (280)"
  ]
}
```

---

## Error Handling

### Validation Errors (Prevent Import)
- Missing required fields
- Invalid zone code
- City not found in master
- Hotel referenced in Sheet 2-5 not found in Sheet 1
- Hall referenced in Sheet 5 not found in Sheet 2
- Invalid dropdown values
- Duplicate hotel_name + city combination
- Duplicate hall_name within hotel

### Warnings (Allow Import, Log)
- Sum of room types > total_rooms
- No photos provided for hotel
- Less than 3 photos for hall
- Theatre capacity not largest
- Missing contact information
- Latitude without longitude (or vice versa)

---

## Template Download

### Excel File Structure
```
AVEMS_Venue_Upload_Template.xlsx
├── Instructions (Sheet 0) - How to use template
├── Hotel Master (Sheet 1)
├── Hall Master (Sheet 2)
├── Accommodation Inventory (Sheet 3)
├── Occupancy Matrix (Sheet 4)
├── Photo Mapping (Sheet 5)
└── Reference Data (Sheet 6) - Dropdown values, examples
```

### Reference Data Sheet
Contains:
- Valid zones
- Valid hotel categories
- Valid photo types
- Valid occupancy types
- Sample data for each sheet
- Validation rules summary

---

## API Endpoint

### Upload Venue Data
```
POST /api/venues/upload

Content-Type: multipart/form-data

Body:
- file: Excel file (.xlsx)

Response:
{
  "success": boolean,
  "import_session_id": UUID,
  "hotels_created": number,
  "hotels_updated": number,
  "halls_created": number,
  "halls_updated": number,
  "inventory_created": number,
  "occupancy_rules_created": number,
  "photos_created": number,
  "errors": string[],
  "warnings": string[]
}
```

---

## Sample Template Data

### Complete Example: ITC Maurya, Delhi

**Hotel Master (Sheet 1)**:
```
hotel_name: ITC Maurya
hotel_brand: ITC Hotels
hotel_category: 5_STAR
zone: NORTH
city: Delhi
address: Diplomatic Enclave, Sardar Patel Marg, New Delhi
gst_number: 07AAAAA0000A1Z5
website: https://www.itchotels.com/in/en/itcmaurya-newdelhi
latitude: 28.5969
longitude: 77.1625
sales_contact_name: Rajesh Kumar
sales_contact_designation: Sales Manager
sales_contact_mobile: 9876543210
sales_contact_email: rajesh@itchotels.com
preferred_vendor: TRUE
blacklisted: FALSE
status: ACTIVE
remarks: Preferred venue for National Meetings
```

**Hall Master (Sheet 2)**:
```
Row 1:
hotel_name: ITC Maurya
hall_name: Grand Ballroom
floor: Ground Floor
area_sqft: 5000
indoor_outdoor: INDOOR
theatre_capacity: 500
classroom_capacity: 300
u_shape_capacity: 80
cluster_capacity: 250
boardroom_capacity: 40
round_table_capacity: 350
status: ACTIVE

Row 2:
hotel_name: ITC Maurya
hall_name: Durbar Hall
floor: First Floor
area_sqft: 3000
indoor_outdoor: INDOOR
theatre_capacity: 300
classroom_capacity: 180
u_shape_capacity: 60
cluster_capacity: 150
boardroom_capacity: 30
round_table_capacity: 200
status: ACTIVE
```

**Accommodation Inventory (Sheet 3)**:
```
hotel_name: ITC Maurya
total_rooms: 438
single_rooms: 100
double_rooms: 250
triple_rooms: 50
quad_rooms: 20
suite_rooms: 18
remarks: Includes 18 luxury suites with separate living areas
```

**Occupancy Matrix (Sheet 4)**:
```
hotel_name: ITC Maurya
so_occupancy: TRIPLE
dm_occupancy: DOUBLE
rsm_occupancy: SINGLE
ch_occupancy: SINGLE
ibh_occupancy: SINGLE
others_occupancy: SINGLE
```

**Photo Mapping (Sheet 5)**:
```
Row 1:
hotel_name: ITC Maurya
hall_name: (empty)
photo_type: HOTEL_EXTERIOR
photo_url: https://cdn.itchotels.com/maurya-exterior.jpg
caption: Main entrance with fountain
display_order: 1
is_primary: TRUE

Row 2:
hotel_name: ITC Maurya
hall_name: (empty)
photo_type: HOTEL_LOBBY
photo_url: https://cdn.itchotels.com/maurya-lobby.jpg
caption: Grand lobby area
display_order: 2
is_primary: FALSE

Row 3:
hotel_name: ITC Maurya
hall_name: Grand Ballroom
photo_type: HALL_THEATRE
photo_url: https://cdn.itchotels.com/ballroom-theatre.jpg
caption: Theatre-style setup for 500 pax
display_order: 1
is_primary: TRUE
```

---

## Benefits

### For Admins
- ✅ Structured data entry
- ✅ Bulk upload capability
- ✅ Validation before import
- ✅ Single transaction (all or nothing)
- ✅ Error reporting
- ✅ Audit trail

### For System
- ✅ Complete venue hierarchy
- ✅ Multi-capacity hall support
- ✅ Room estimation data
- ✅ Historical intelligence foundation
- ✅ Photo repository
- ✅ Occupancy rules per hotel

### For Sales Heads
- ✅ Comprehensive venue information
- ✅ Capacity-based search
- ✅ Visual venue selection (photos)
- ✅ Historical usage visibility
- ✅ Suitability indicators

---

**Template Version**: 1.0  
**Last Updated**: Step 6 Implementation  
**Status**: Ready for Development

