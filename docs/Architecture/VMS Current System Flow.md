## **VMS Discovery Summary (Version 1)** 

This summarizes everything learned so far from the discussions and spreadsheets. 

## **1. What is VMS?** 

VMS is **not a Venue Booking System** . 

VMS is a: 

```
Venue Management & Conference Operations System
```

that manages: 

```
Planning
→ Venue Allocation
→ Booking
→ Rooming
→ Invoice Audit
→ SAP Closure
```

## **2. Current Team Structure** 

## **VMS Team** 

Currently 2 employees. 

Responsibilities: 

- Prepare Annual Calendar 

- Prepare Monthly Plan 

- Maintain Approved Hotel List 

- Allocate Venues 

- Negotiate Commercials 

- Confirm Bookings 

- Coordinate with Hotels 

- Receive Invoices 

- Audit Invoices 

- Maintain SAP Records 

- Maintain Historical Records 

VMS Team is the primary user of the system. 

## **Sales Head** 

Responsibilities: 

- Review Monthly Plan 

- Review Proposed Venue 

- Request Alternative Venue (if required) 

- Submit Final Rooming List 

- Finalize Participant List 

Sales Head does not: 

- Negotiate Hotels 

- Book Hotels 

- Audit Invoices 

## **3. Core Business Flow** 

## **Annual Planning** 

```
VMS
```

```
   ↓
Annual Calendar
   ↓
Cluster Head Approval
```

## **Monthly Planning** 

```
VMS
   ↓
Monthly Plan
   ↓
Sales Head Review
```

Monthly Plan already contains: 

- Meeting 

- Dates 

- City 

- Proposed Venue 

## **Venue Review** 

Sales Head can: 

## **Option 1** 

Accept Venue 

## **Option 2** 

Request Alternate Approved Hotel 

## **Option 3** 

Request Other Venue 

with justification. 

Final decision remains with VMS. 

## **Venue Booking** 

```
VMS
```

```
    ↓
Commercial Negotiation
    ↓
Booking Confirmation
```

Only VMS can book. 

## **4. Event Planning Logic** 

Current planning is based on: 

```
Active Employee Count
```

Example: 

```
CDC South
58 Active Employees
```

This becomes: 

```
Expected PAX
```

used for: 

- Hall planning 

- Room blocking 

- Venue booking 

## **5. Rooming List Process** 

This is the most important discovery. 

## **Current Reality** 

VMS books venue months in advance. 

Final rooming list arrives only a few days before event. 

## **Rooming List Contains** 

- Employee Name 

- Designation 

- Division 

- State 

- Region (Region is group of Cities. Should be kept optional) 

- Occupancy 

- Check-In 

- Check-Out 

- NRC 

## **Rooming List Purpose** 

Acts as: 

```
Participant List
+
Accommodation Plan
+
Attendance Plan
+
Audit Reference
```

## **Future Principle** 

One standard rooming list format across all divisions. 

No division-specific formats. 

## **6. Venue Availability Logic** 

A critical requirement. 

When a venue is proposed: 

System must check: 

```
Hotel
+
Hall
+
Date
```

against existing bookings. 

## **Example** 

Sales Head selects: 

```
Fortune Celestial
6-Aug to 8-Aug
```

System checks: 

```
Existing Bookings
```

If occupied: 

```
Already Booked
Not Available
```

must be displayed. 

## **7. Venue Hierarchy** 

```
Zone
   ↓
State
   ↓
City
   ↓
```

```
Hotel
   ↓
Hall
```

Example: 

```
South
  ↓
Karnataka
  ↓
Bangalore
  ↓
Fortune Celestial
  ↓
Buckingham 1
```

## **8. Masters Identified** 

All should be editable under Admin. 

## **Organization Masters** 

- Cluster Master 

- Division Master 

- Zone Master 

- State Master 

- City Master 

## **Event Masters** 

- Meeting Type Master 

- Seating Style Master 

- Conference Type Master 

- Occupancy Type Master 

## **Venue Masters** 

- Hotel Master 

- Hotel Contact Master 

- Hall Master 

- Hotel Category Master 

## **Commercial Masters** 

- Vendor Master 

- Rate Card Master 

## **Finance Masters** 

- Cost Center Master 

- GL Code Master 

- Payment Status Master 

## **Security** 

- Role Master 

- Permission Matrix 

## **9. Hotel Master Rules** 

Hotels have statuses: 

```
Approved
Under Evaluation
Inactive
Blacklisted
```

Only approved hotels appear for planning. 

## **10. Hall Master** 

Must store: 

- Hall Name 

- Capacity 

- Sq Ft 

- Dimensions 

- Floor 

- Boardroom Flag 

- Terrace Flag 

- Pillar Information 

- Photos 

## **11. Commercial Process** 

Current process: 

```
Hotels
    ↓
Commercial Comparison
    ↓
Negotiation
    ↓
Final Rate
```

Managed entirely by VMS. 

## **12. Invoice Audit Process** 

Audit should use: 

```
Approved Commercial
+
Final Rooming List
+
Invoice
```

to generate variances. 

## **13. SAP Closure Process** 

After audit: 

```
Invoice Approved
       ↓
SAP Reference Number
       ↓
Payment Tracking
       ↓
Closure
```

## **14. Event Lifecycle (Current Draft)** 

```
Annual Calendar
      ↓
Monthly Plan
      ↓
Venue Allocation ( Sales Head can see and request but approval authority is
with admin)
      ↓
Sales Head Review
      ↓
Venue Booking
      ↓
Room Blocking
      ↓
Rooming List Submission
      ↓
Rooming List Finalization
      ↓
Event Execution
      ↓
Invoice Receipt
      ↓
Invoice Audit
      ↓
SAP Upload
      ↓
Closed
```

## **15. Major Modules Identified** 

## **Planning** 

- Annual Calendar 

- Monthly Planning 

## **Event Operations** 

- Event Workspace 

- Venue Allocation 

- Hall Allocation 

- Room Blocking 

## **Rooming** 

- Rooming List Management 

- Occupancy Planning 

## **Venue Management** 

- Hotels 

- Halls 

- Contacts 

- Venue Calendar 

## **Commercial** 

- Rate Comparison 

- Negotiation Tracking 

## **Finance** 

- Invoice Management 

- Invoice Audit 

- SAP Tracking 

## **Reporting** 

- Spend Analytics 

- Savings Analytics 

- Venue Utilization 

- Vendor Performance 

## **16. Biggest Discoveries** 

## **Discovery 1** 

The core entity is: 

```
Event
```

not Hotel. 

## **Discovery 2** 

The most important operational document is: 

```
Rooming List
```

## **Discovery 3** 

Venue availability checking must be built into the system. 

## **Discovery 4** 

The knowledge currently held in spreadsheets and by the two VMS executives should become institutional knowledge inside VMS. 

